// Módulo de Procesamiento por Lotes (Batch Processing) para PDFs
const fs = require('fs').promises;
const path = require('path');
const { EventEmitter } = require('events');

// Importar otros módulos
const PDFCreator = require('./pdfCreator');
const PDFEditor = require('./pdfEditor');
const PDFOptimizer = require('./pdfOptimizer');
const PDFSecurity = require('./pdfSecurity');
const PDFOCR = require('./pdfOCR');

class PDFBatchProcessor extends EventEmitter {
    constructor() {
        super();
        this.queue = [];
        this.processing = false;
        this.results = [];
        this.errors = [];
        this.progress = {
            total: 0,
            completed: 0,
            failed: 0,
            percentage: 0
        };
    }

    /**
     * Añadir archivos a la cola de procesamiento
     * @param {Array} files - Array de rutas de archivos o buffers
     * @param {String} operation - Operación a realizar
     * @param {Object} options - Opciones de la operación
     */
    addToQueue(files, operation, options = {}) {
        try {
            const tasks = files.map(file => ({
                id: this._generateTaskId(),
                file,
                operation,
                options,
                status: 'pending',
                addedAt: new Date().toISOString()
            }));

            this.queue.push(...tasks);
            this.progress.total += tasks.length;

            this.emit('tasksAdded', { count: tasks.length, total: this.progress.total });

            return {
                success: true,
                tasksAdded: tasks.length,
                queueLength: this.queue.length,
                message: `${tasks.length} tareas añadidas a la cola`
            };
        } catch (error) {
            console.error('Error adding to queue:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * Procesar toda la cola
     * @param {Object} config - Configuración de procesamiento
     */
    async processQueue(config = {}) {
        try {
            const {
                maxConcurrent = 1, // Procesos simultáneos
                stopOnError = false,
                saveResults = true,
                outputDir = './output'
            } = config;

            if (this.processing) {
                return { success: false, error: 'Ya hay un procesamiento en curso' };
            }

            if (this.queue.length === 0) {
                return { success: false, error: 'La cola está vacía' };
            }

            this.processing = true;
            this.results = [];
            this.errors = [];
            this.progress.completed = 0;
            this.progress.failed = 0;

            this.emit('processingStarted', { total: this.queue.length });

            console.log(`Iniciando procesamiento de ${this.queue.length} tareas...`);

            // Crear directorio de salida si no existe
            if (saveResults) {
                await this._ensureDirectory(outputDir);
            }

            // Procesar en lotes según maxConcurrent
            while (this.queue.length > 0 && this.processing) {
                const batch = this.queue.splice(0, maxConcurrent);
                const promises = batch.map(task => this._processTask(task, outputDir, saveResults));
                
                const batchResults = await Promise.allSettled(promises);

                for (const result of batchResults) {
                    if (result.status === 'fulfilled') {
                        this.results.push(result.value);
                        if (result.value.success) {
                            this.progress.completed++;
                        } else {
                            this.progress.failed++;
                            this.errors.push(result.value);
                            
                            if (stopOnError) {
                                this.processing = false;
                                break;
                            }
                        }
                    } else {
                        this.progress.failed++;
                        this.errors.push({
                            success: false,
                            error: result.reason?.message || 'Error desconocido'
                        });
                    }
                }

                // Actualizar progreso
                this._updateProgress();
            }

            this.processing = false;
            this.emit('processingCompleted', {
                total: this.progress.total,
                completed: this.progress.completed,
                failed: this.progress.failed
            });

            return {
                success: true,
                processed: this.progress.completed,
                failed: this.progress.failed,
                total: this.progress.total,
                results: this.results,
                errors: this.errors,
                message: `Procesamiento completado: ${this.progress.completed}/${this.progress.total} exitosos`
            };
        } catch (error) {
            this.processing = false;
            console.error('Error processing queue:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * Procesar una tarea individual
     */
    async _processTask(task, outputDir, saveResults) {
        try {
            task.status = 'processing';
            task.startedAt = new Date().toISOString();

            this.emit('taskStarted', { id: task.id, operation: task.operation });

            // Cargar archivo
            let pdfBytes;
            if (typeof task.file === 'string') {
                pdfBytes = await fs.readFile(task.file);
            } else {
                pdfBytes = task.file;
            }

            // Ejecutar operación
            let result;
            switch (task.operation) {
                case 'optimize':
                    result = await this._optimizeTask(pdfBytes, task.options);
                    break;
                
                case 'encrypt':
                    result = await this._encryptTask(pdfBytes, task.options);
                    break;
                
                case 'ocr':
                    result = await this._ocrTask(pdfBytes, task.options);
                    break;
                
                case 'watermark':
                    result = await this._watermarkTask(pdfBytes, task.options);
                    break;
                
                case 'merge':
                    result = await this._mergeTask(task.options.files);
                    break;
                
                case 'split':
                    result = await this._splitTask(pdfBytes, task.options);
                    break;
                
                case 'convert':
                    result = await this._convertTask(pdfBytes, task.options);
                    break;
                
                default:
                    throw new Error(`Operación no soportada: ${task.operation}`);
            }

            // Guardar resultado si es necesario
            if (saveResults && result.success && result.pdfBytes) {
                const fileName = this._generateOutputFilename(task);
                const outputPath = path.join(outputDir, fileName);
                await fs.writeFile(outputPath, result.pdfBytes);
                result.outputPath = outputPath;
            }

            task.status = 'completed';
            task.completedAt = new Date().toISOString();
            task.result = result;

            this.emit('taskCompleted', { id: task.id, success: true });

            return {
                success: true,
                taskId: task.id,
                operation: task.operation,
                result
            };
        } catch (error) {
            task.status = 'failed';
            task.error = error.message;
            task.completedAt = new Date().toISOString();

            this.emit('taskFailed', { id: task.id, error: error.message });

            return {
                success: false,
                taskId: task.id,
                operation: task.operation,
                error: error.message
            };
        }
    }

    /**
     * Tarea de optimización
     */
    async _optimizeTask(pdfBytes, options) {
        const optimizer = new PDFOptimizer();
        return await optimizer.optimizePDF(pdfBytes, options);
    }

    /**
     * Tarea de cifrado
     */
    async _encryptTask(pdfBytes, options) {
        const security = new PDFSecurity();
        return await security.encryptPDF(pdfBytes, options);
    }

    /**
     * Tarea de OCR
     */
    async _ocrTask(pdfBytes, options) {
        const ocr = new PDFOCR();
        return await ocr.processPDF(pdfBytes, options);
    }

    /**
     * Tarea de marca de agua
     */
    async _watermarkTask(pdfBytes, options) {
        const editor = new PDFEditor();
        await editor.loadPDF(pdfBytes);
        return await editor.addWatermark(options.text, options);
    }

    /**
     * Tarea de combinar PDFs
     */
    async _mergeTask(files) {
        const creator = new PDFCreator();
        const pdfBuffers = [];
        
        for (const file of files) {
            if (typeof file === 'string') {
                const buffer = await fs.readFile(file);
                pdfBuffers.push(buffer);
            } else {
                pdfBuffers.push(file);
            }
        }

        return await creator.mergePDFs(pdfBuffers);
    }

    /**
     * Tarea de dividir PDF
     */
    async _splitTask(pdfBytes, options) {
        const editor = new PDFEditor();
        await editor.loadPDF(pdfBytes);
        
        // Implementar lógica de división
        return {
            success: true,
            message: 'PDF dividido (implementar lógica específica)'
        };
    }

    /**
     * Tarea de conversión
     */
    async _convertTask(pdfBytes, options) {
        // Implementar conversión según formato destino
        return {
            success: true,
            message: `Conversión a ${options.format} (implementar)`
        };
    }

    /**
     * Operaciones por lotes predefinidas
     */
    async batchOptimize(files, preset = 'balanced') {
        const presets = {
            'web': { imageQuality: 70, maxImageDPI: 96 },
            'balanced': { imageQuality: 85, maxImageDPI: 150 },
            'highQuality': { imageQuality: 95, maxImageDPI: 300 }
        };

        this.addToQueue(files, 'optimize', presets[preset] || presets.balanced);
        return await this.processQueue();
    }

    async batchEncrypt(files, password, permissions = {}) {
        this.addToQueue(files, 'encrypt', { userPassword: password, permissions });
        return await this.processQueue();
    }

    async batchOCR(files, language = 'spa+eng') {
        this.addToQueue(files, 'ocr', { language, createSearchablePDF: true });
        return await this.processQueue();
    }

    async batchWatermark(files, watermarkText, options = {}) {
        this.addToQueue(files, 'watermark', { text: watermarkText, ...options });
        return await this.processQueue();
    }

    /**
     * Procesar carpeta completa
     */
    async processFolder(folderPath, operation, options = {}) {
        try {
            const files = await fs.readdir(folderPath);
            const pdfFiles = files
                .filter(f => f.toLowerCase().endsWith('.pdf'))
                .map(f => path.join(folderPath, f));

            if (pdfFiles.length === 0) {
                return { success: false, error: 'No se encontraron archivos PDF' };
            }

            this.addToQueue(pdfFiles, operation, options);
            return await this.processQueue(options);
        } catch (error) {
            console.error('Error processing folder:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * Detener procesamiento
     */
    stop() {
        if (this.processing) {
            this.processing = false;
            this.emit('processingStopped');
            
            return {
                success: true,
                message: 'Procesamiento detenido',
                completed: this.progress.completed,
                remaining: this.queue.length
            };
        }
        
        return { success: false, error: 'No hay procesamiento activo' };
    }

    /**
     * Limpiar cola
     */
    clearQueue() {
        const cleared = this.queue.length;
        this.queue = [];
        this.progress.total = 0;
        this.progress.completed = 0;
        this.progress.failed = 0;
        this.progress.percentage = 0;

        return {
            success: true,
            cleared,
            message: `${cleared} tareas eliminadas de la cola`
        };
    }

    /**
     * Obtener estado actual
     */
    getStatus() {
        return {
            processing: this.processing,
            queueLength: this.queue.length,
            progress: this.progress,
            results: this.results.length,
            errors: this.errors.length
        };
    }

    /**
     * Obtener progreso
     */
    getProgress() {
        return this.progress;
    }

    /**
     * Actualizar progreso
     */
    _updateProgress() {
        const total = this.progress.total;
        const completed = this.progress.completed + this.progress.failed;
        this.progress.percentage = total > 0 ? Math.round((completed / total) * 100) : 0;

        this.emit('progressUpdated', this.progress);
    }

    /**
     * Generar nombre de archivo de salida
     */
    _generateOutputFilename(task) {
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const operation = task.operation;
        
        if (typeof task.file === 'string') {
            const basename = path.basename(task.file, '.pdf');
            return `${basename}_${operation}_${timestamp}.pdf`;
        }
        
        return `output_${operation}_${timestamp}.pdf`;
    }

    /**
     * Asegurar que el directorio existe
     */
    async _ensureDirectory(dirPath) {
        try {
            await fs.access(dirPath);
        } catch {
            await fs.mkdir(dirPath, { recursive: true });
        }
    }

    /**
     * Generar ID de tarea
     */
    _generateTaskId() {
        return `task_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }

    /**
     * Exportar reporte de procesamiento
     */
    exportReport(format = 'json') {
        try {
            const report = {
                timestamp: new Date().toISOString(),
                summary: {
                    total: this.progress.total,
                    completed: this.progress.completed,
                    failed: this.progress.failed,
                    successRate: this.progress.total > 0 
                        ? Math.round((this.progress.completed / this.progress.total) * 100) 
                        : 0
                },
                results: this.results,
                errors: this.errors
            };

            switch (format) {
                case 'json':
                    return JSON.stringify(report, null, 2);
                
                case 'csv':
                    const csv = ['TaskID,Operation,Status,Error'];
                    for (const result of this.results) {
                        csv.push(`${result.taskId},${result.operation},${result.success ? 'Success' : 'Failed'},"${result.error || ''}"`);
                    }
                    return csv.join('\n');
                
                case 'text':
                    let text = `=== REPORTE DE PROCESAMIENTO POR LOTES ===\n\n`;
                    text += `Fecha: ${report.timestamp}\n`;
                    text += `Total procesados: ${report.summary.total}\n`;
                    text += `Exitosos: ${report.summary.completed}\n`;
                    text += `Fallidos: ${report.summary.failed}\n`;
                    text += `Tasa de éxito: ${report.summary.successRate}%\n\n`;
                    
                    if (this.errors.length > 0) {
                        text += `=== ERRORES ===\n`;
                        for (const error of this.errors) {
                            text += `- ${error.operation}: ${error.error}\n`;
                        }
                    }
                    
                    return text;
                
                default:
                    return report;
            }
        } catch (error) {
            console.error('Error exporting report:', error);
            return null;
        }
    }
}

module.exports = PDFBatchProcessor;
