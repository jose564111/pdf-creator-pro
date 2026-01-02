// Módulo de OCR (Optical Character Recognition) para PDFs
const Tesseract = require('tesseract.js');
const { PDFDocument, rgb, StandardFonts } = require('pdf-lib');
const { createCanvas, loadImage } = require('canvas');
const fs = require('fs').promises;
const path = require('path');

class PDFOCR {
    constructor() {
        this.worker = null;
        this.supportedLanguages = ['spa', 'eng', 'fra', 'deu', 'ita', 'por'];
        this.isInitialized = false;
    }

    /**
     * Inicializar worker de Tesseract
     */
    async initialize(language = 'spa+eng') {
        try {
            if (this.isInitialized && this.worker) {
                return { success: true, message: 'OCR ya inicializado' };
            }

            this.worker = await Tesseract.createWorker(language, 1, {
                logger: m => console.log('OCR Progress:', m)
            });

            this.isInitialized = true;

            return {
                success: true,
                language,
                message: 'OCR inicializado correctamente'
            };
        } catch (error) {
            console.error('Error initializing OCR:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * Extraer texto de una imagen usando OCR
     * @param {Buffer} imageBuffer - Buffer de la imagen
     * @param {Object} options - Opciones de OCR
     */
    async recognizeText(imageBuffer, options = {}) {
        try {
            if (!this.isInitialized) {
                await this.initialize(options.language || 'spa+eng');
            }

            const {
                language = 'spa+eng',
                psm = 3, // Page segmentation mode
                oem = 3  // OCR Engine mode
            } = options;

            // Configurar parámetros de Tesseract
            await this.worker.setParameters({
                tessedit_pageseg_mode: psm,
                tessedit_ocr_engine_mode: oem
            });

            // Reconocer texto
            const { data } = await this.worker.recognize(imageBuffer);

            return {
                success: true,
                text: data.text,
                confidence: data.confidence,
                words: data.words.map(w => ({
                    text: w.text,
                    confidence: w.confidence,
                    bbox: w.bbox
                })),
                lines: data.lines.map(l => ({
                    text: l.text,
                    confidence: l.confidence,
                    bbox: l.bbox
                })),
                blocks: data.blocks.map(b => ({
                    text: b.text,
                    confidence: b.confidence,
                    bbox: b.bbox
                }))
            };
        } catch (error) {
            console.error('Error recognizing text:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * Procesar PDF escaneado con OCR
     * @param {ArrayBuffer} pdfBytes - PDF de entrada
     * @param {Object} options - Opciones de procesamiento
     */
    async processPDF(pdfBytes, options = {}) {
        try {
            const {
                language = 'spa+eng',
                createSearchablePDF = true,
                outputFormat = 'text', // 'text', 'json', 'searchable-pdf'
                dpi = 300
            } = options;

            // Inicializar OCR
            if (!this.isInitialized) {
                await this.initialize(language);
            }

            // Cargar PDF
            const pdfDoc = await PDFDocument.load(pdfBytes);
            const pages = pdfDoc.getPages();
            const results = [];

            console.log(`Procesando ${pages.length} páginas con OCR...`);

            // Procesar cada página
            for (let i = 0; i < pages.length; i++) {
                console.log(`Procesando página ${i + 1}/${pages.length}`);
                
                // Renderizar página a imagen
                const imageBuffer = await this._renderPageToImage(pdfDoc, i, dpi);
                
                // Aplicar OCR
                const ocrResult = await this.recognizeText(imageBuffer, { language });
                
                results.push({
                    pageNumber: i + 1,
                    text: ocrResult.text,
                    confidence: ocrResult.confidence,
                    words: ocrResult.words,
                    lines: ocrResult.lines
                });
            }

            // Crear PDF buscable si se solicita
            let searchablePdfBytes = null;
            if (createSearchablePDF) {
                searchablePdfBytes = await this._createSearchablePDF(
                    pdfBytes,
                    results,
                    options
                );
            }

            return {
                success: true,
                pageCount: pages.length,
                results,
                searchablePDF: searchablePdfBytes,
                averageConfidence: this._calculateAverageConfidence(results),
                totalWords: results.reduce((sum, r) => sum + r.words.length, 0)
            };
        } catch (error) {
            console.error('Error processing PDF with OCR:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * Renderizar página de PDF a imagen
     */
    async _renderPageToImage(pdfDoc, pageIndex, dpi = 300) {
        try {
            const page = pdfDoc.getPages()[pageIndex];
            const { width, height } = page.getSize();
            
            // Calcular dimensiones según DPI
            const scale = dpi / 72; // 72 DPI es el estándar PDF
            const canvasWidth = Math.floor(width * scale);
            const canvasHeight = Math.floor(height * scale);

            // Crear canvas
            const canvas = createCanvas(canvasWidth, canvasHeight);
            const context = canvas.getContext('2d');

            // Fondo blanco
            context.fillStyle = 'white';
            context.fillRect(0, 0, canvasWidth, canvasHeight);

            // Nota: Renderizado simplificado
            // En producción usar pdf.js para renderizado real
            
            return canvas.toBuffer('image/png');
        } catch (error) {
            console.error('Error rendering page to image:', error);
            throw error;
        }
    }

    /**
     * Crear PDF buscable con capa de texto invisible
     */
    async _createSearchablePDF(originalPdfBytes, ocrResults, options = {}) {
        try {
            const pdfDoc = await PDFDocument.load(originalPdfBytes);
            const pages = pdfDoc.getPages();
            const font = await pdfDoc.embedFont(StandardFonts.Helvetica);

            for (let i = 0; i < ocrResults.length; i++) {
                const page = pages[i];
                const result = ocrResults[i];
                const { width, height } = page.getSize();

                // Añadir texto invisible en posiciones detectadas
                for (const word of result.words) {
                    const { text, bbox } = word;
                    
                    // Calcular posición y tamaño
                    const x = (bbox.x0 / 100) * width;
                    const y = height - ((bbox.y0 / 100) * height);
                    const fontSize = Math.max(8, (bbox.y1 - bbox.y0) / 2);

                    // Dibujar texto invisible (opacity = 0)
                    page.drawText(text, {
                        x,
                        y,
                        size: fontSize,
                        font,
                        color: rgb(0, 0, 0),
                        opacity: 0 // Invisible pero buscable
                    });
                }
            }

            return await pdfDoc.save();
        } catch (error) {
            console.error('Error creating searchable PDF:', error);
            return null;
        }
    }

    /**
     * Calcular confianza promedio
     */
    _calculateAverageConfidence(results) {
        if (results.length === 0) return 0;
        
        const totalConfidence = results.reduce((sum, r) => sum + r.confidence, 0);
        return Math.round(totalConfidence / results.length);
    }

    /**
     * Extraer texto de imagen específica en PDF
     */
    async extractTextFromImage(imageBuffer, options = {}) {
        try {
            const result = await this.recognizeText(imageBuffer, options);
            
            return {
                success: true,
                text: result.text,
                confidence: result.confidence,
                wordCount: result.words.length
            };
        } catch (error) {
            console.error('Error extracting text from image:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * Detectar idioma del texto en imagen
     */
    async detectLanguage(imageBuffer) {
        try {
            // Intentar OCR con múltiples idiomas
            const languages = ['eng', 'spa', 'fra', 'deu', 'ita'];
            const results = [];

            for (const lang of languages) {
                const worker = await Tesseract.createWorker(lang);
                const { data } = await worker.recognize(imageBuffer);
                await worker.terminate();

                results.push({
                    language: lang,
                    confidence: data.confidence
                });
            }

            // Ordenar por confianza
            results.sort((a, b) => b.confidence - a.confidence);

            return {
                success: true,
                detectedLanguage: results[0].language,
                confidence: results[0].confidence,
                allResults: results
            };
        } catch (error) {
            console.error('Error detecting language:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * Mejorar calidad de imagen para mejor OCR
     */
    async preprocessImage(imageBuffer, options = {}) {
        try {
            const {
                denoise = true,
                sharpen = true,
                contrast = true,
                threshold = false
            } = options;

            // Cargar imagen
            const image = await loadImage(imageBuffer);
            const canvas = createCanvas(image.width, image.height);
            const ctx = canvas.getContext('2d');

            ctx.drawImage(image, 0, 0);

            // Aplicar filtros
            if (contrast) {
                this._applyContrast(ctx, image.width, image.height, 1.5);
            }

            if (sharpen) {
                this._applySharpen(ctx, image.width, image.height);
            }

            if (threshold) {
                this._applyThreshold(ctx, image.width, image.height, 128);
            }

            return canvas.toBuffer('image/png');
        } catch (error) {
            console.error('Error preprocessing image:', error);
            return imageBuffer; // Retornar original si falla
        }
    }

    /**
     * Aplicar contraste
     */
    _applyContrast(ctx, width, height, factor) {
        const imageData = ctx.getImageData(0, 0, width, height);
        const data = imageData.data;

        for (let i = 0; i < data.length; i += 4) {
            data[i] = ((data[i] - 128) * factor) + 128;     // R
            data[i + 1] = ((data[i + 1] - 128) * factor) + 128; // G
            data[i + 2] = ((data[i + 2] - 128) * factor) + 128; // B
        }

        ctx.putImageData(imageData, 0, 0);
    }

    /**
     * Aplicar sharpening
     */
    _applySharpen(ctx, width, height) {
        const imageData = ctx.getImageData(0, 0, width, height);
        const data = imageData.data;
        const weights = [0, -1, 0, -1, 5, -1, 0, -1, 0];

        // Implementación simplificada de convolución
        // En producción usar librería de procesamiento de imágenes
        
        ctx.putImageData(imageData, 0, 0);
    }

    /**
     * Aplicar threshold (binarización)
     */
    _applyThreshold(ctx, width, height, threshold) {
        const imageData = ctx.getImageData(0, 0, width, height);
        const data = imageData.data;

        for (let i = 0; i < data.length; i += 4) {
            const gray = (data[i] + data[i + 1] + data[i + 2]) / 3;
            const value = gray > threshold ? 255 : 0;
            
            data[i] = value;     // R
            data[i + 1] = value; // G
            data[i + 2] = value; // B
        }

        ctx.putImageData(imageData, 0, 0);
    }

    /**
     * Buscar texto específico en PDF escaneado
     */
    async searchInScannedPDF(pdfBytes, searchText, options = {}) {
        try {
            const ocrResults = await this.processPDF(pdfBytes, options);
            
            if (!ocrResults.success) {
                return ocrResults;
            }

            const matches = [];

            for (const result of ocrResults.results) {
                const text = result.text.toLowerCase();
                const search = searchText.toLowerCase();

                if (text.includes(search)) {
                    // Encontrar posiciones exactas
                    let index = text.indexOf(search);
                    while (index !== -1) {
                        matches.push({
                            pageNumber: result.pageNumber,
                            text: searchText,
                            context: this._getContext(text, index, 50),
                            confidence: result.confidence
                        });
                        index = text.indexOf(search, index + 1);
                    }
                }
            }

            return {
                success: true,
                searchText,
                matchCount: matches.length,
                matches
            };
        } catch (error) {
            console.error('Error searching in scanned PDF:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * Obtener contexto alrededor de coincidencia
     */
    _getContext(text, index, contextLength) {
        const start = Math.max(0, index - contextLength);
        const end = Math.min(text.length, index + contextLength);
        return '...' + text.substring(start, end) + '...';
    }

    /**
     * Exportar resultados de OCR en diferentes formatos
     */
    async exportOCRResults(results, format = 'json') {
        try {
            switch (format) {
                case 'json':
                    return JSON.stringify(results, null, 2);
                
                case 'text':
                    return results.results.map(r => 
                        `=== Página ${r.pageNumber} ===\n${r.text}\n`
                    ).join('\n');
                
                case 'csv':
                    const csv = ['Page,Text,Confidence'];
                    for (const result of results.results) {
                        csv.push(`${result.pageNumber},"${result.text.replace(/"/g, '""')}",${result.confidence}`);
                    }
                    return csv.join('\n');
                
                default:
                    return results;
            }
        } catch (error) {
            console.error('Error exporting OCR results:', error);
            return null;
        }
    }

    /**
     * Terminar worker
     */
    async terminate() {
        if (this.worker) {
            await this.worker.terminate();
            this.worker = null;
            this.isInitialized = false;
        }
    }

    /**
     * Obtener estadísticas de OCR
     */
    getStatistics(results) {
        const totalWords = results.results.reduce((sum, r) => sum + r.words.length, 0);
        const totalChars = results.results.reduce((sum, r) => sum + r.text.length, 0);
        const avgConfidence = this._calculateAverageConfidence(results.results);

        return {
            pageCount: results.results.length,
            totalWords,
            totalCharacters: totalChars,
            averageConfidence: avgConfidence,
            averageWordsPerPage: Math.round(totalWords / results.results.length),
            highConfidencePages: results.results.filter(r => r.confidence > 80).length,
            lowConfidencePages: results.results.filter(r => r.confidence < 60).length
        };
    }
}

module.exports = PDFOCR;
