// Módulo de Lectura de PDFs
const pdfjsLib = require('pdfjs-dist/legacy/build/pdf');
const pdfParse = require('pdf-parse');

class PDFReader {
    constructor() {
        this.currentPdf = null;
        this.currentPage = 1;
        this.totalPages = 0;
        this.scale = 1.5;
        this.pdfData = null;
        this.formFields = [];
    }

    // Cargar PDF desde bytes
    async loadPDF(arrayBuffer) {
        try {
            // Configurar worker de PDF.js
            if (typeof window !== 'undefined') {
                pdfjsLib.GlobalWorkerOptions.workerSrc = 
                    'node_modules/pdfjs-dist/legacy/build/pdf.worker.js';
            }

            this.pdfData = new Uint8Array(arrayBuffer);
            
            // Cargar con PDF.js para renderizado
            const loadingTask = pdfjsLib.getDocument({ data: this.pdfData });
            this.currentPdf = await loadingTask.promise;
            this.totalPages = this.currentPdf.numPages;

            // Extraer información con pdf-parse
            const dataBuffer = Buffer.from(arrayBuffer);
            const parsedData = await pdfParse(dataBuffer);

            return {
                success: true,
                pageCount: this.totalPages,
                text: parsedData.text,
                info: parsedData.info,
                metadata: parsedData.metadata
            };
        } catch (error) {
            console.error('Error loading PDF:', error);
            return { success: false, error: error.message };
        }
    }

    // Renderizar página en canvas
    async renderPage(pageNumber, canvas) {
        try {
            if (!this.currentPdf) {
                throw new Error('No hay PDF cargado');
            }

            if (pageNumber < 1 || pageNumber > this.totalPages) {
                throw new Error('Número de página inválido');
            }

            const page = await this.currentPdf.getPage(pageNumber);
            const viewport = page.getViewport({ scale: this.scale });

            const context = canvas.getContext('2d');
            canvas.width = viewport.width;
            canvas.height = viewport.height;

            const renderContext = {
                canvasContext: context,
                viewport: viewport
            };

            await page.render(renderContext).promise;

            this.currentPage = pageNumber;

            return {
                success: true,
                width: viewport.width,
                height: viewport.height
            };
        } catch (error) {
            console.error('Error rendering page:', error);
            return { success: false, error: error.message };
        }
    }

    // Extraer texto de una página específica
    async extractTextFromPage(pageNumber) {
        try {
            if (!this.currentPdf) {
                throw new Error('No hay PDF cargado');
            }

            const page = await this.currentPdf.getPage(pageNumber);
            const textContent = await page.getTextContent();
            
            const text = textContent.items
                .map(item => item.str)
                .join(' ');

            return { success: true, text };
        } catch (error) {
            console.error('Error extracting text:', error);
            return { success: false, error: error.message };
        }
    }

    // Extraer todo el texto del PDF
    async extractAllText() {
        try {
            if (!this.currentPdf) {
                throw new Error('No hay PDF cargado');
            }

            let fullText = '';

            for (let i = 1; i <= this.totalPages; i++) {
                const result = await this.extractTextFromPage(i);
                if (result.success) {
                    fullText += `\n--- Página ${i} ---\n${result.text}\n`;
                }
            }

            return { success: true, text: fullText };
        } catch (error) {
            console.error('Error extracting all text:', error);
            return { success: false, error: error.message };
        }
    }

    // Detectar campos de formulario
    async detectFormFields() {
        try {
            if (!this.currentPdf) {
                throw new Error('No hay PDF cargado');
            }

            this.formFields = [];

            for (let i = 1; i <= this.totalPages; i++) {
                const page = await this.currentPdf.getPage(i);
                const annotations = await page.getAnnotations();

                annotations.forEach((annotation, index) => {
                    if (annotation.subtype === 'Widget') {
                        this.formFields.push({
                            id: `field_${i}_${index}`,
                            page: i,
                            name: annotation.fieldName || `Campo ${index + 1}`,
                            type: annotation.fieldType || 'text',
                            value: annotation.fieldValue || '',
                            rect: annotation.rect,
                            options: annotation.options || []
                        });
                    }
                });
            }

            return {
                success: true,
                fields: this.formFields,
                count: this.formFields.length
            };
        } catch (error) {
            console.error('Error detecting form fields:', error);
            return { success: false, error: error.message };
        }
    }

    // Extraer imágenes del PDF
    async extractImages(pageNumber) {
        try {
            if (!this.currentPdf) {
                throw new Error('No hay PDF cargado');
            }

            const page = await this.currentPdf.getPage(pageNumber);
            const operatorList = await page.getOperatorList();
            const images = [];

            for (let i = 0; i < operatorList.fnArray.length; i++) {
                if (operatorList.fnArray[i] === pdfjsLib.OPS.paintImageXObject) {
                    const imageName = operatorList.argsArray[i][0];
                    try {
                        const image = await page.objs.get(imageName);
                        images.push({
                            name: imageName,
                            width: image.width,
                            height: image.height,
                            data: image.data
                        });
                    } catch (err) {
                        console.warn('No se pudo extraer imagen:', imageName);
                    }
                }
            }

            return { success: true, images, count: images.length };
        } catch (error) {
            console.error('Error extracting images:', error);
            return { success: false, error: error.message };
        }
    }

    // Obtener metadatos del PDF
    async getMetadata() {
        try {
            if (!this.currentPdf) {
                throw new Error('No hay PDF cargado');
            }

            const metadata = await this.currentPdf.getMetadata();
            
            return {
                success: true,
                info: metadata.info,
                metadata: metadata.metadata ? metadata.metadata.getAll() : null
            };
        } catch (error) {
            console.error('Error getting metadata:', error);
            return { success: false, error: error.message };
        }
    }

    // Buscar texto en el PDF
    async searchText(searchTerm) {
        try {
            if (!this.currentPdf) {
                throw new Error('No hay PDF cargado');
            }

            const results = [];

            for (let i = 1; i <= this.totalPages; i++) {
                const page = await this.currentPdf.getPage(i);
                const textContent = await page.getTextContent();
                
                textContent.items.forEach((item, index) => {
                    if (item.str.toLowerCase().includes(searchTerm.toLowerCase())) {
                        results.push({
                            page: i,
                            text: item.str,
                            position: {
                                x: item.transform[4],
                                y: item.transform[5]
                            }
                        });
                    }
                });
            }

            return {
                success: true,
                results,
                count: results.length
            };
        } catch (error) {
            console.error('Error searching text:', error);
            return { success: false, error: error.message };
        }
    }

    // Obtener estructura del documento (índice/marcadores)
    async getOutline() {
        try {
            if (!this.currentPdf) {
                throw new Error('No hay PDF cargado');
            }

            const outline = await this.currentPdf.getOutline();
            
            return {
                success: true,
                outline: outline || [],
                hasOutline: outline && outline.length > 0
            };
        } catch (error) {
            console.error('Error getting outline:', error);
            return { success: false, error: error.message };
        }
    }

    // Obtener información de la página
    async getPageInfo(pageNumber) {
        try {
            if (!this.currentPdf) {
                throw new Error('No hay PDF cargado');
            }

            const page = await this.currentPdf.getPage(pageNumber);
            const viewport = page.getViewport({ scale: 1.0 });

            return {
                success: true,
                pageNumber,
                width: viewport.width,
                height: viewport.height,
                rotation: viewport.rotation
            };
        } catch (error) {
            console.error('Error getting page info:', error);
            return { success: false, error: error.message };
        }
    }

    // Cambiar escala de zoom
    setScale(scale) {
        this.scale = scale;
        return { success: true, scale: this.scale };
    }

    // Obtener escala actual
    getScale() {
        return this.scale;
    }

    // Navegar a página anterior
    previousPage() {
        if (this.currentPage > 1) {
            this.currentPage--;
            return { success: true, page: this.currentPage };
        }
        return { success: false, error: 'Ya estás en la primera página' };
    }

    // Navegar a página siguiente
    nextPage() {
        if (this.currentPage < this.totalPages) {
            this.currentPage++;
            return { success: true, page: this.currentPage };
        }
        return { success: false, error: 'Ya estás en la última página' };
    }

    // Ir a página específica
    goToPage(pageNumber) {
        if (pageNumber >= 1 && pageNumber <= this.totalPages) {
            this.currentPage = pageNumber;
            return { success: true, page: this.currentPage };
        }
        return { success: false, error: 'Número de página inválido' };
    }

    // Obtener página actual
    getCurrentPage() {
        return this.currentPage;
    }

    // Obtener total de páginas
    getTotalPages() {
        return this.totalPages;
    }

    // Obtener bytes del PDF
    getPDFData() {
        return this.pdfData;
    }

    // Analizar estructura del documento (para IA)
    async analyzeStructure() {
        try {
            if (!this.currentPdf) {
                throw new Error('No hay PDF cargado');
            }

            const structure = {
                totalPages: this.totalPages,
                pages: []
            };

            for (let i = 1; i <= Math.min(this.totalPages, 10); i++) { // Limitar a 10 páginas
                const textResult = await this.extractTextFromPage(i);
                const pageInfo = await this.getPageInfo(i);
                
                structure.pages.push({
                    number: i,
                    text: textResult.text || '',
                    dimensions: {
                        width: pageInfo.width,
                        height: pageInfo.height
                    }
                });
            }

            const metadata = await this.getMetadata();
            structure.metadata = metadata.info;

            const formFields = await this.detectFormFields();
            structure.formFields = formFields.fields || [];

            return {
                success: true,
                structure
            };
        } catch (error) {
            console.error('Error analyzing structure:', error);
            return { success: false, error: error.message };
        }
    }

    // Cerrar PDF
    close() {
        if (this.currentPdf) {
            this.currentPdf.destroy();
            this.currentPdf = null;
            this.currentPage = 1;
            this.totalPages = 0;
            this.pdfData = null;
            this.formFields = [];
        }
        return { success: true };
    }
}

// Export para uso en navegador y Node.js
if (typeof module !== 'undefined' && module.exports) {
    module.exports = PDFReader;
}
