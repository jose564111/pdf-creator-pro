// Módulo de Anotaciones para PDFs
const { PDFDocument, rgb, StandardFonts, degrees, PDFName, PDFArray, PDFDict, PDFString } = require('pdf-lib');

class PDFAnnotations {
    constructor() {
        this.pdfDoc = null;
        this.annotations = [];
    }

    /**
     * Cargar PDF para agregar anotaciones
     */
    async loadPDF(pdfBytes) {
        try {
            this.pdfDoc = await PDFDocument.load(pdfBytes);
            this.annotations = [];

            return {
                success: true,
                pageCount: this.pdfDoc.getPageCount()
            };
        } catch (error) {
            console.error('Error loading PDF for annotations:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * Añadir nota adhesiva (Sticky Note)
     * @param {Number} pageIndex - Índice de página
     * @param {Object} options - Opciones de la nota
     */
    async addStickyNote(pageIndex, options = {}) {
        try {
            const {
                x = 100,
                y = 100,
                content = 'Nota',
                author = 'Usuario',
                color = { r: 1, g: 1, b: 0 }, // Amarillo por defecto
                icon = 'Comment' // Comment, Key, Note, Help, NewParagraph, Paragraph, Insert
            } = options;

            const page = this.pdfDoc.getPages()[pageIndex];

            // Crear anotación de texto
            const annotation = {
                type: 'StickyNote',
                pageIndex,
                x, y,
                content,
                author,
                color,
                icon,
                created: new Date().toISOString(),
                id: this._generateId()
            };

            this.annotations.push(annotation);

            // Dibujar indicador visual
            page.drawCircle({
                x: x + 10,
                y: y + 10,
                size: 10,
                color: rgb(color.r, color.g, color.b),
                borderColor: rgb(0, 0, 0),
                borderWidth: 1
            });

            return {
                success: true,
                annotation,
                message: 'Nota adhesiva añadida'
            };
        } catch (error) {
            console.error('Error adding sticky note:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * Resaltar texto
     */
    async highlightText(pageIndex, area, options = {}) {
        try {
            const {
                color = { r: 1, g: 1, b: 0 },
                opacity = 0.3,
                author = 'Usuario',
                note = ''
            } = options;

            const page = this.pdfDoc.getPages()[pageIndex];
            const { x, y, width, height } = area;

            // Dibujar rectángulo de resaltado
            page.drawRectangle({
                x, y, width, height,
                color: rgb(color.r, color.g, color.b),
                opacity,
                borderWidth: 0
            });

            const annotation = {
                type: 'Highlight',
                pageIndex,
                area,
                color,
                opacity,
                author,
                note,
                created: new Date().toISOString(),
                id: this._generateId()
            };

            this.annotations.push(annotation);

            return {
                success: true,
                annotation,
                message: 'Texto resaltado'
            };
        } catch (error) {
            console.error('Error highlighting text:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * Subrayar texto
     */
    async underlineText(pageIndex, area, options = {}) {
        try {
            const {
                color = { r: 0, g: 0, b: 1 },
                thickness = 2,
                author = 'Usuario'
            } = options;

            const page = this.pdfDoc.getPages()[pageIndex];
            const { x, y, width } = area;

            // Dibujar línea de subrayado
            page.drawLine({
                start: { x, y },
                end: { x: x + width, y },
                thickness,
                color: rgb(color.r, color.g, color.b)
            });

            const annotation = {
                type: 'Underline',
                pageIndex,
                area,
                color,
                thickness,
                author,
                created: new Date().toISOString(),
                id: this._generateId()
            };

            this.annotations.push(annotation);

            return {
                success: true,
                annotation,
                message: 'Texto subrayado'
            };
        } catch (error) {
            console.error('Error underlining text:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * Tachar texto (Strikethrough)
     */
    async strikethroughText(pageIndex, area, options = {}) {
        try {
            const {
                color = { r: 1, g: 0, b: 0 },
                thickness = 2,
                author = 'Usuario'
            } = options;

            const page = this.pdfDoc.getPages()[pageIndex];
            const { x, y, width, height } = area;

            // Dibujar línea tachando
            const centerY = y + (height / 2);
            page.drawLine({
                start: { x, y: centerY },
                end: { x: x + width, y: centerY },
                thickness,
                color: rgb(color.r, color.g, color.b)
            });

            const annotation = {
                type: 'Strikethrough',
                pageIndex,
                area,
                color,
                thickness,
                author,
                created: new Date().toISOString(),
                id: this._generateId()
            };

            this.annotations.push(annotation);

            return {
                success: true,
                annotation,
                message: 'Texto tachado'
            };
        } catch (error) {
            console.error('Error striking through text:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * Añadir anotación de texto libre
     */
    async addFreeTextAnnotation(pageIndex, options = {}) {
        try {
            const {
                x = 100,
                y = 100,
                text = 'Texto',
                fontSize = 12,
                color = { r: 0, g: 0, b: 0 },
                backgroundColor = { r: 1, g: 1, b: 0.8 },
                author = 'Usuario',
                width = 200,
                height = 100
            } = options;

            const page = this.pdfDoc.getPages()[pageIndex];
            const font = await this.pdfDoc.embedFont(StandardFonts.Helvetica);

            // Dibujar fondo
            page.drawRectangle({
                x, y, width, height,
                color: rgb(backgroundColor.r, backgroundColor.g, backgroundColor.b),
                borderColor: rgb(0, 0, 0),
                borderWidth: 1
            });

            // Dibujar texto
            page.drawText(text, {
                x: x + 5,
                y: y + height - fontSize - 5,
                size: fontSize,
                font,
                color: rgb(color.r, color.g, color.b),
                maxWidth: width - 10
            });

            const annotation = {
                type: 'FreeText',
                pageIndex,
                x, y, width, height,
                text,
                fontSize,
                color,
                backgroundColor,
                author,
                created: new Date().toISOString(),
                id: this._generateId()
            };

            this.annotations.push(annotation);

            return {
                success: true,
                annotation,
                message: 'Anotación de texto libre añadida'
            };
        } catch (error) {
            console.error('Error adding free text annotation:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * Añadir forma geométrica con comentario
     */
    async addShapeAnnotation(pageIndex, shapeType, options = {}) {
        try {
            const {
                x = 100,
                y = 100,
                width = 100,
                height = 100,
                color = { r: 1, g: 0, b: 0 },
                borderColor = { r: 0, g: 0, b: 0 },
                borderWidth = 2,
                filled = false,
                comment = '',
                author = 'Usuario'
            } = options;

            const page = this.pdfDoc.getPages()[pageIndex];

            // Dibujar forma según tipo
            switch (shapeType) {
                case 'rectangle':
                    page.drawRectangle({
                        x, y, width, height,
                        borderColor: rgb(borderColor.r, borderColor.g, borderColor.b),
                        borderWidth,
                        color: filled ? rgb(color.r, color.g, color.b) : undefined,
                        opacity: filled ? 0.3 : 1
                    });
                    break;

                case 'circle':
                    page.drawCircle({
                        x: x + width / 2,
                        y: y + height / 2,
                        size: Math.min(width, height) / 2,
                        borderColor: rgb(borderColor.r, borderColor.g, borderColor.b),
                        borderWidth,
                        color: filled ? rgb(color.r, color.g, color.b) : undefined,
                        opacity: filled ? 0.3 : 1
                    });
                    break;

                case 'arrow':
                    // Dibujar línea con punta de flecha
                    page.drawLine({
                        start: { x, y },
                        end: { x: x + width, y: y + height },
                        thickness: borderWidth,
                        color: rgb(borderColor.r, borderColor.g, borderColor.b)
                    });
                    // Añadir punta de flecha
                    const arrowSize = 10;
                    const angle = Math.atan2(height, width);
                    page.drawLine({
                        start: { x: x + width, y: y + height },
                        end: { 
                            x: x + width - arrowSize * Math.cos(angle - Math.PI / 6),
                            y: y + height - arrowSize * Math.sin(angle - Math.PI / 6)
                        },
                        thickness: borderWidth,
                        color: rgb(borderColor.r, borderColor.g, borderColor.b)
                    });
                    break;
            }

            const annotation = {
                type: 'Shape',
                shapeType,
                pageIndex,
                x, y, width, height,
                color,
                borderColor,
                borderWidth,
                filled,
                comment,
                author,
                created: new Date().toISOString(),
                id: this._generateId()
            };

            this.annotations.push(annotation);

            return {
                success: true,
                annotation,
                message: `Forma ${shapeType} añadida`
            };
        } catch (error) {
            console.error('Error adding shape annotation:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * Añadir sello (Stamp)
     */
    async addStamp(pageIndex, stampType, options = {}) {
        try {
            const {
                x = 100,
                y = 100,
                width = 150,
                height = 50,
                customText = null
            } = options;

            const page = this.pdfDoc.getPages()[pageIndex];
            const font = await this.pdfDoc.embedFont(StandardFonts.HelveticaBold);

            // Definir estilos de sellos predefinidos
            const stamps = {
                'APPROVED': { text: 'APROBADO', color: { r: 0, g: 0.8, b: 0 } },
                'REJECTED': { text: 'RECHAZADO', color: { r: 1, g: 0, b: 0 } },
                'CONFIDENTIAL': { text: 'CONFIDENCIAL', color: { r: 1, g: 0, b: 0 } },
                'DRAFT': { text: 'BORRADOR', color: { r: 0.5, g: 0.5, b: 0.5 } },
                'FINAL': { text: 'FINAL', color: { r: 0, g: 0, b: 1 } },
                'REVIEWED': { text: 'REVISADO', color: { r: 0, g: 0.5, b: 1 } },
                'SIGNED': { text: 'FIRMADO', color: { r: 0, g: 0.8, b: 0 } }
            };

            const stamp = stamps[stampType] || stamps['DRAFT'];
            const stampText = customText || stamp.text;

            // Dibujar sello
            const rotation = -15; // Ángulo de inclinación

            // Fondo
            page.drawRectangle({
                x, y, width, height,
                borderColor: rgb(stamp.color.r, stamp.color.g, stamp.color.b),
                borderWidth: 3,
                opacity: 0.8
            });

            // Texto
            const fontSize = 24;
            const textWidth = font.widthOfTextAtSize(stampText, fontSize);
            page.drawText(stampText, {
                x: x + (width - textWidth) / 2,
                y: y + (height - fontSize) / 2,
                size: fontSize,
                font,
                color: rgb(stamp.color.r, stamp.color.g, stamp.color.b),
                opacity: 0.5
            });

            const annotation = {
                type: 'Stamp',
                stampType,
                pageIndex,
                x, y, width, height,
                text: stampText,
                color: stamp.color,
                created: new Date().toISOString(),
                id: this._generateId()
            };

            this.annotations.push(annotation);

            return {
                success: true,
                annotation,
                message: `Sello ${stampType} añadido`
            };
        } catch (error) {
            console.error('Error adding stamp:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * Añadir comentario/respuesta a una anotación
     */
    addReply(annotationId, replyText, author = 'Usuario') {
        try {
            const annotation = this.annotations.find(a => a.id === annotationId);
            
            if (!annotation) {
                return { success: false, error: 'Anotación no encontrada' };
            }

            if (!annotation.replies) {
                annotation.replies = [];
            }

            const reply = {
                id: this._generateId(),
                text: replyText,
                author,
                created: new Date().toISOString()
            };

            annotation.replies.push(reply);

            return {
                success: true,
                reply,
                message: 'Respuesta añadida'
            };
        } catch (error) {
            console.error('Error adding reply:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * Obtener todas las anotaciones
     */
    getAllAnnotations() {
        return {
            success: true,
            count: this.annotations.length,
            annotations: this.annotations
        };
    }

    /**
     * Obtener anotaciones de una página específica
     */
    getAnnotationsByPage(pageIndex) {
        const pageAnnotations = this.annotations.filter(a => a.pageIndex === pageIndex);
        
        return {
            success: true,
            pageIndex,
            count: pageAnnotations.length,
            annotations: pageAnnotations
        };
    }

    /**
     * Filtrar anotaciones por autor
     */
    getAnnotationsByAuthor(author) {
        const authorAnnotations = this.annotations.filter(a => a.author === author);
        
        return {
            success: true,
            author,
            count: authorAnnotations.length,
            annotations: authorAnnotations
        };
    }

    /**
     * Eliminar una anotación
     */
    deleteAnnotation(annotationId) {
        try {
            const index = this.annotations.findIndex(a => a.id === annotationId);
            
            if (index === -1) {
                return { success: false, error: 'Anotación no encontrada' };
            }

            const deleted = this.annotations.splice(index, 1)[0];

            return {
                success: true,
                deleted,
                message: 'Anotación eliminada'
            };
        } catch (error) {
            console.error('Error deleting annotation:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * Exportar anotaciones a formato XFDF
     */
    exportToXFDF() {
        try {
            // Crear documento XFDF (XML Forms Data Format)
            const xfdf = {
                '?xml': { '@version': '1.0', '@encoding': 'UTF-8' },
                xfdf: {
                    '@xmlns': 'http://ns.adobe.com/xfdf/',
                    annots: {
                        annotation: this.annotations.map(a => this._annotationToXFDF(a))
                    }
                }
            };

            return {
                success: true,
                xfdf: JSON.stringify(xfdf, null, 2),
                format: 'XFDF',
                message: 'Anotaciones exportadas a XFDF'
            };
        } catch (error) {
            console.error('Error exporting to XFDF:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * Generar reporte de anotaciones
     */
    generateAnnotationReport() {
        try {
            const report = {
                totalAnnotations: this.annotations.length,
                byType: {},
                byAuthor: {},
                byPage: {},
                timeline: []
            };

            // Agrupar por tipo
            for (const ann of this.annotations) {
                report.byType[ann.type] = (report.byType[ann.type] || 0) + 1;
                report.byAuthor[ann.author] = (report.byAuthor[ann.author] || 0) + 1;
                report.byPage[ann.pageIndex] = (report.byPage[ann.pageIndex] || 0) + 1;
                
                report.timeline.push({
                    id: ann.id,
                    type: ann.type,
                    author: ann.author,
                    created: ann.created,
                    page: ann.pageIndex + 1
                });
            }

            // Ordenar timeline por fecha
            report.timeline.sort((a, b) => new Date(a.created) - new Date(b.created));

            return {
                success: true,
                report
            };
        } catch (error) {
            console.error('Error generating annotation report:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * Guardar PDF con anotaciones
     */
    async save() {
        try {
            if (!this.pdfDoc) {
                return { success: false, error: 'No hay PDF cargado' };
            }

            const pdfBytes = await this.pdfDoc.save();

            return {
                success: true,
                pdfBytes,
                annotationCount: this.annotations.length,
                message: `PDF guardado con ${this.annotations.length} anotaciones`
            };
        } catch (error) {
            console.error('Error saving PDF with annotations:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * Convertir anotación a formato XFDF
     */
    _annotationToXFDF(annotation) {
        return {
            '@type': annotation.type,
            '@page': annotation.pageIndex,
            '@date': annotation.created,
            '@name': annotation.id,
            '@color': this._colorToHex(annotation.color),
            '@subject': annotation.type,
            '@title': annotation.author,
            contents: annotation.content || annotation.text || annotation.comment || ''
        };
    }

    /**
     * Convertir color RGB a hexadecimal
     */
    _colorToHex(color) {
        if (!color) return '#000000';
        const r = Math.round((color.r || 0) * 255).toString(16).padStart(2, '0');
        const g = Math.round((color.g || 0) * 255).toString(16).padStart(2, '0');
        const b = Math.round((color.b || 0) * 255).toString(16).padStart(2, '0');
        return `#${r}${g}${b}`;
    }

    /**
     * Generar ID único
     */
    _generateId() {
        return `ann_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }
}

module.exports = PDFAnnotations;
