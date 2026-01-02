// Módulo de Edición de PDFs
const { PDFDocument, rgb, StandardFonts, degrees } = require('pdf-lib');

class PDFEditor {
    constructor() {
        this.pdfDoc = null;
        this.originalBytes = null;
        this.modifications = [];
    }

    // Cargar PDF existente para editar
    async loadPDF(arrayBuffer) {
        try {
            this.originalBytes = arrayBuffer;
            this.pdfDoc = await PDFDocument.load(arrayBuffer);
            this.modifications = [];

            return {
                success: true,
                pageCount: this.pdfDoc.getPageCount()
            };
        } catch (error) {
            console.error('Error loading PDF for editing:', error);
            return { success: false, error: error.message };
        }
    }

    // Añadir texto a una página existente
    async addTextToPage(pageIndex, text, options = {}) {
        try {
            if (!this.pdfDoc) {
                throw new Error('No hay PDF cargado');
            }

            const pages = this.pdfDoc.getPages();
            if (pageIndex < 0 || pageIndex >= pages.length) {
                throw new Error('Índice de página inválido');
            }

            const page = pages[pageIndex];
            const {
                x = 50,
                y = 50,
                size = 12,
                color = rgb(0, 0, 0),
                fontType = 'Helvetica',
                rotation = 0
            } = options;

            const fontMap = {
                'Helvetica': StandardFonts.Helvetica,
                'HelveticaBold': StandardFonts.HelveticaBold,
                'TimesRoman': StandardFonts.TimesRoman,
                'Courier': StandardFonts.Courier
            };

            const font = await this.pdfDoc.embedFont(fontMap[fontType] || StandardFonts.Helvetica);

            page.drawText(text, {
                x,
                y,
                size,
                font,
                color,
                rotate: degrees(rotation)
            });

            this.modifications.push({
                type: 'addText',
                pageIndex,
                text,
                options
            });

            return { success: true };
        } catch (error) {
            console.error('Error adding text to page:', error);
            return { success: false, error: error.message };
        }
    }

    // Añadir imagen a una página
    async addImageToPage(pageIndex, imageBytes, imageType, options = {}) {
        try {
            if (!this.pdfDoc) {
                throw new Error('No hay PDF cargado');
            }

            const pages = this.pdfDoc.getPages();
            if (pageIndex < 0 || pageIndex >= pages.length) {
                throw new Error('Índice de página inválido');
            }

            const page = pages[pageIndex];
            const { x = 50, y = 50, width = 100, height = 100, rotation = 0 } = options;

            let image;
            if (imageType === 'png') {
                image = await this.pdfDoc.embedPng(imageBytes);
            } else if (imageType === 'jpg' || imageType === 'jpeg') {
                image = await this.pdfDoc.embedJpg(imageBytes);
            } else {
                throw new Error('Tipo de imagen no soportado');
            }

            page.drawImage(image, {
                x,
                y,
                width,
                height,
                rotate: degrees(rotation)
            });

            this.modifications.push({
                type: 'addImage',
                pageIndex,
                imageType,
                options
            });

            return { success: true };
        } catch (error) {
            console.error('Error adding image to page:', error);
            return { success: false, error: error.message };
        }
    }

    // Añadir forma a una página
    async addShapeToPage(pageIndex, shapeType, options = {}) {
        try {
            if (!this.pdfDoc) {
                throw new Error('No hay PDF cargado');
            }

            const pages = this.pdfDoc.getPages();
            if (pageIndex < 0 || pageIndex >= pages.length) {
                throw new Error('Índice de página inválido');
            }

            const page = pages[pageIndex];
            const {
                x = 50,
                y = 50,
                width = 100,
                height = 100,
                color = rgb(0.5, 0.5, 0.5),
                borderColor = rgb(0, 0, 0),
                borderWidth = 1,
                filled = false
            } = options;

            switch (shapeType) {
                case 'rectangle':
                    page.drawRectangle({
                        x, y, width, height,
                        borderColor,
                        borderWidth,
                        color: filled ? color : undefined
                    });
                    break;
                case 'circle':
                    page.drawCircle({
                        x: x + width / 2,
                        y: y + height / 2,
                        size: Math.min(width, height) / 2,
                        borderColor,
                        borderWidth,
                        color: filled ? color : undefined
                    });
                    break;
                case 'line':
                    page.drawLine({
                        start: { x, y },
                        end: { x: x + width, y: y + height },
                        thickness: borderWidth,
                        color: borderColor
                    });
                    break;
                case 'square':
                    const size = Math.min(width, height);
                    page.drawSquare({
                        x, y, size,
                        borderColor,
                        borderWidth,
                        color: filled ? color : undefined
                    });
                    break;
                case 'ellipse':
                    page.drawEllipse({
                        x: x + width / 2,
                        y: y + height / 2,
                        xScale: width / 2,
                        yScale: height / 2,
                        borderColor,
                        borderWidth,
                        color: filled ? color : undefined
                    });
                    break;
            }

            this.modifications.push({
                type: 'addShape',
                pageIndex,
                shapeType,
                options
            });

            return { success: true };
        } catch (error) {
            console.error('Error adding shape to page:', error);
            return { success: false, error: error.message };
        }
    }

    // Rellenar campo de formulario
    async fillFormField(fieldName, value) {
        try {
            if (!this.pdfDoc) {
                throw new Error('No hay PDF cargado');
            }

            const form = this.pdfDoc.getForm();
            const fields = form.getFields();

            const field = fields.find(f => f.getName() === fieldName);
            
            if (!field) {
                throw new Error(`Campo '${fieldName}' no encontrado`);
            }

            const fieldType = field.constructor.name;

            switch (fieldType) {
                case 'PDFTextField':
                    field.setText(value);
                    break;
                case 'PDFCheckBox':
                    if (value === true || value === 'true' || value === 'checked') {
                        field.check();
                    } else {
                        field.uncheck();
                    }
                    break;
                case 'PDFRadioGroup':
                    field.select(value);
                    break;
                case 'PDFDropdown':
                    field.select(value);
                    break;
                default:
                    throw new Error(`Tipo de campo no soportado: ${fieldType}`);
            }

            this.modifications.push({
                type: 'fillFormField',
                fieldName,
                value
            });

            return { success: true };
        } catch (error) {
            console.error('Error filling form field:', error);
            return { success: false, error: error.message };
        }
    }

    // Rellenar múltiples campos de formulario
    async fillFormFields(fieldValues) {
        try {
            const results = [];

            for (const [fieldName, value] of Object.entries(fieldValues)) {
                const result = await this.fillFormField(fieldName, value);
                results.push({ fieldName, ...result });
            }

            const allSuccess = results.every(r => r.success);

            return {
                success: allSuccess,
                results
            };
        } catch (error) {
            console.error('Error filling form fields:', error);
            return { success: false, error: error.message };
        }
    }

    // Obtener campos de formulario
    getFormFields() {
        try {
            if (!this.pdfDoc) {
                throw new Error('No hay PDF cargado');
            }

            const form = this.pdfDoc.getForm();
            const fields = form.getFields();

            const fieldInfo = fields.map(field => ({
                name: field.getName(),
                type: field.constructor.name,
                value: this.getFieldValue(field)
            }));

            return {
                success: true,
                fields: fieldInfo,
                count: fieldInfo.length
            };
        } catch (error) {
            console.error('Error getting form fields:', error);
            return { success: false, error: error.message };
        }
    }

    // Obtener valor de un campo
    getFieldValue(field) {
        const fieldType = field.constructor.name;
        
        try {
            switch (fieldType) {
                case 'PDFTextField':
                    return field.getText() || '';
                case 'PDFCheckBox':
                    return field.isChecked();
                case 'PDFRadioGroup':
                    return field.getSelected() || '';
                case 'PDFDropdown':
                    return field.getSelected() || [];
                default:
                    return '';
            }
        } catch (error) {
            return '';
        }
    }

    // Aplanar formulario (hacer campos no editables)
    flattenForm() {
        try {
            if (!this.pdfDoc) {
                throw new Error('No hay PDF cargado');
            }

            const form = this.pdfDoc.getForm();
            form.flatten();

            this.modifications.push({
                type: 'flattenForm'
            });

            return { success: true };
        } catch (error) {
            console.error('Error flattening form:', error);
            return { success: false, error: error.message };
        }
    }

    // Añadir nueva página
    addPage(options = {}) {
        try {
            if (!this.pdfDoc) {
                throw new Error('No hay PDF cargado');
            }

            const { width = 595.28, height = 841.89, index = -1 } = options;

            let page;
            if (index === -1) {
                page = this.pdfDoc.addPage([width, height]);
            } else {
                page = this.pdfDoc.insertPage(index, [width, height]);
            }

            this.modifications.push({
                type: 'addPage',
                options
            });

            return {
                success: true,
                pageCount: this.pdfDoc.getPageCount()
            };
        } catch (error) {
            console.error('Error adding page:', error);
            return { success: false, error: error.message };
        }
    }

    // Eliminar página
    removePage(pageIndex) {
        try {
            if (!this.pdfDoc) {
                throw new Error('No hay PDF cargado');
            }

            const pageCount = this.pdfDoc.getPageCount();
            if (pageIndex < 0 || pageIndex >= pageCount) {
                throw new Error('Índice de página inválido');
            }

            this.pdfDoc.removePage(pageIndex);

            this.modifications.push({
                type: 'removePage',
                pageIndex
            });

            return {
                success: true,
                pageCount: this.pdfDoc.getPageCount()
            };
        } catch (error) {
            console.error('Error removing page:', error);
            return { success: false, error: error.message };
        }
    }

    // Rotar página
    rotatePage(pageIndex, rotation) {
        try {
            if (!this.pdfDoc) {
                throw new Error('No hay PDF cargado');
            }

            const pages = this.pdfDoc.getPages();
            if (pageIndex < 0 || pageIndex >= pages.length) {
                throw new Error('Índice de página inválido');
            }

            const page = pages[pageIndex];
            const currentRotation = page.getRotation().angle;
            const newRotation = (currentRotation + rotation) % 360;
            page.setRotation(degrees(newRotation));

            this.modifications.push({
                type: 'rotatePage',
                pageIndex,
                rotation
            });

            return { success: true, newRotation };
        } catch (error) {
            console.error('Error rotating page:', error);
            return { success: false, error: error.message };
        }
    }

    // Copiar página
    async copyPage(sourceIndex, targetIndex = -1) {
        try {
            if (!this.pdfDoc) {
                throw new Error('No hay PDF cargado');
            }

            const pages = this.pdfDoc.getPages();
            if (sourceIndex < 0 || sourceIndex >= pages.length) {
                throw new Error('Índice de página inválido');
            }

            const [copiedPage] = await this.pdfDoc.copyPages(this.pdfDoc, [sourceIndex]);
            
            if (targetIndex === -1) {
                this.pdfDoc.addPage(copiedPage);
            } else {
                this.pdfDoc.insertPage(targetIndex, copiedPage);
            }

            this.modifications.push({
                type: 'copyPage',
                sourceIndex,
                targetIndex
            });

            return {
                success: true,
                pageCount: this.pdfDoc.getPageCount()
            };
        } catch (error) {
            console.error('Error copying page:', error);
            return { success: false, error: error.message };
        }
    }

    // Añadir marca de agua
    async addWatermark(text, options = {}) {
        try {
            if (!this.pdfDoc) {
                throw new Error('No hay PDF cargado');
            }

            const {
                size = 50,
                color = rgb(0.8, 0.8, 0.8),
                rotation = 45,
                opacity = 0.3,
                fontType = 'HelveticaBold'
            } = options;

            const fontMap = {
                'Helvetica': StandardFonts.Helvetica,
                'HelveticaBold': StandardFonts.HelveticaBold,
                'TimesRoman': StandardFonts.TimesRoman
            };

            const font = await this.pdfDoc.embedFont(fontMap[fontType] || StandardFonts.HelveticaBold);
            const pages = this.pdfDoc.getPages();

            for (const page of pages) {
                const { width, height } = page.getSize();
                const textWidth = font.widthOfTextAtSize(text, size);
                
                page.drawText(text, {
                    x: (width - textWidth) / 2,
                    y: height / 2,
                    size,
                    font,
                    color,
                    rotate: degrees(rotation),
                    opacity
                });
            }

            this.modifications.push({
                type: 'addWatermark',
                text,
                options
            });

            return { success: true };
        } catch (error) {
            console.error('Error adding watermark:', error);
            return { success: false, error: error.message };
        }
    }

    // Añadir numeración de páginas
    async addPageNumbers(options = {}) {
        try {
            if (!this.pdfDoc) {
                throw new Error('No hay PDF cargado');
            }

            const {
                position = 'bottom-center', // 'bottom-center', 'bottom-right', 'bottom-left'
                size = 12,
                color = rgb(0, 0, 0),
                format = 'Page {n} of {total}'
            } = options;

            const font = await this.pdfDoc.embedFont(StandardFonts.Helvetica);
            const pages = this.pdfDoc.getPages();
            const totalPages = pages.length;

            pages.forEach((page, index) => {
                const { width, height } = page.getSize();
                const pageNum = index + 1;
                const text = format
                    .replace('{n}', pageNum)
                    .replace('{total}', totalPages);
                
                const textWidth = font.widthOfTextAtSize(text, size);
                
                let x, y;
                switch (position) {
                    case 'bottom-left':
                        x = 50;
                        y = 30;
                        break;
                    case 'bottom-right':
                        x = width - textWidth - 50;
                        y = 30;
                        break;
                    case 'bottom-center':
                    default:
                        x = (width - textWidth) / 2;
                        y = 30;
                        break;
                }

                page.drawText(text, { x, y, size, font, color });
            });

            this.modifications.push({
                type: 'addPageNumbers',
                options
            });

            return { success: true };
        } catch (error) {
            console.error('Error adding page numbers:', error);
            return { success: false, error: error.message };
        }
    }

    // Modificar metadatos
    setMetadata(metadata) {
        try {
            if (!this.pdfDoc) {
                throw new Error('No hay PDF cargado');
            }

            const { title, author, subject, keywords, creator, producer } = metadata;

            if (title) this.pdfDoc.setTitle(title);
            if (author) this.pdfDoc.setAuthor(author);
            if (subject) this.pdfDoc.setSubject(subject);
            if (keywords) this.pdfDoc.setKeywords(keywords);
            if (creator) this.pdfDoc.setCreator(creator);
            if (producer) this.pdfDoc.setProducer(producer);

            this.modifications.push({
                type: 'setMetadata',
                metadata
            });

            return { success: true };
        } catch (error) {
            console.error('Error setting metadata:', error);
            return { success: false, error: error.message };
        }
    }

    // Guardar PDF editado
    async save() {
        try {
            if (!this.pdfDoc) {
                throw new Error('No hay PDF para guardar');
            }

            const pdfBytes = await this.pdfDoc.save();

            return {
                success: true,
                bytes: pdfBytes,
                modificationsCount: this.modifications.length
            };
        } catch (error) {
            console.error('Error saving edited PDF:', error);
            return { success: false, error: error.message };
        }
    }

    // Obtener lista de modificaciones
    getModifications() {
        return this.modifications;
    }

    // Deshacer todas las modificaciones (recargar original)
    async reset() {
        try {
            if (!this.originalBytes) {
                throw new Error('No hay PDF original para restaurar');
            }

            this.pdfDoc = await PDFDocument.load(this.originalBytes);
            this.modifications = [];

            return { success: true };
        } catch (error) {
            console.error('Error resetting PDF:', error);
            return { success: false, error: error.message };
        }
    }

    // Obtener información del documento
    getInfo() {
        try {
            if (!this.pdfDoc) {
                return { success: false, error: 'No hay PDF cargado' };
            }

            return {
                success: true,
                pageCount: this.pdfDoc.getPageCount(),
                title: this.pdfDoc.getTitle(),
                author: this.pdfDoc.getAuthor(),
                subject: this.pdfDoc.getSubject(),
                creator: this.pdfDoc.getCreator(),
                producer: this.pdfDoc.getProducer(),
                keywords: this.pdfDoc.getKeywords(),
                modificationsCount: this.modifications.length
            };
        } catch (error) {
            return { success: false, error: error.message };
        }
    }
}

// Export para uso en navegador y Node.js
if (typeof module !== 'undefined' && module.exports) {
    module.exports = PDFEditor;
}
