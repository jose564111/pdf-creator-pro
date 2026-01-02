// Módulo de Creación de PDFs
const { PDFDocument, rgb, StandardFonts } = require('pdf-lib');

class PDFCreator {
    constructor() {
        this.currentDoc = null;
        this.currentPage = null;
    }

    // Crear PDF en blanco
    async createBlankPDF(options = {}) {
        try {
            const { 
                width = 595.28, // A4 width in points
                height = 841.89, // A4 height in points
                pages = 1 
            } = options;

            this.currentDoc = await PDFDocument.create();
            
            for (let i = 0; i < pages; i++) {
                const page = this.currentDoc.addPage([width, height]);
                if (i === 0) this.currentPage = page;
            }

            return { success: true, pageCount: pages };
        } catch (error) {
            console.error('Error creating blank PDF:', error);
            return { success: false, error: error.message };
        }
    }

    // Crear PDF desde plantilla
    async createFromTemplate(templateType) {
        try {
            this.currentDoc = await PDFDocument.create();
            const page = this.currentDoc.addPage([595.28, 841.89]);
            this.currentPage = page;

            const font = await this.currentDoc.embedFont(StandardFonts.Helvetica);
            const boldFont = await this.currentDoc.embedFont(StandardFonts.HelveticaBold);

            switch (templateType) {
                case 'invoice':
                    await this.createInvoiceTemplate(page, font, boldFont);
                    break;
                case 'contract':
                    await this.createContractTemplate(page, font, boldFont);
                    break;
                case 'resume':
                    await this.createResumeTemplate(page, font, boldFont);
                    break;
                case 'form':
                    await this.createFormTemplate(page, font, boldFont);
                    break;
                default:
                    await this.createBasicTemplate(page, font);
            }

            return { success: true };
        } catch (error) {
            console.error('Error creating template:', error);
            return { success: false, error: error.message };
        }
    }

    // Plantilla de Factura
    async createInvoiceTemplate(page, font, boldFont) {
        const { width, height } = page.getSize();
        
        // Header
        page.drawText('FACTURA', {
            x: 50,
            y: height - 50,
            size: 24,
            font: boldFont,
            color: rgb(0, 0, 0.5)
        });

        page.drawText('N° Factura: __________', {
            x: width - 200,
            y: height - 50,
            size: 12,
            font: font
        });

        page.drawText('Fecha: __________', {
            x: width - 200,
            y: height - 70,
            size: 12,
            font: font
        });

        // Emisor
        page.drawText('EMISOR', {
            x: 50,
            y: height - 120,
            size: 14,
            font: boldFont
        });

        page.drawText('Nombre: _____________________________', { x: 50, y: height - 145, size: 11, font: font });
        page.drawText('Dirección: _____________________________', { x: 50, y: height - 165, size: 11, font: font });
        page.drawText('NIF/CIF: _____________________________', { x: 50, y: height - 185, size: 11, font: font });

        // Cliente
        page.drawText('CLIENTE', {
            x: 50,
            y: height - 230,
            size: 14,
            font: boldFont
        });

        page.drawText('Nombre: _____________________________', { x: 50, y: height - 255, size: 11, font: font });
        page.drawText('Dirección: _____________________________', { x: 50, y: height - 275, size: 11, font: font });
        page.drawText('NIF/CIF: _____________________________', { x: 50, y: height - 295, size: 11, font: font });

        // Tabla de conceptos
        const tableY = height - 350;
        page.drawRectangle({
            x: 50,
            y: tableY - 30,
            width: width - 100,
            height: 30,
            color: rgb(0.9, 0.9, 0.9)
        });

        page.drawText('Concepto', { x: 60, y: tableY - 20, size: 11, font: boldFont });
        page.drawText('Cantidad', { x: 250, y: tableY - 20, size: 11, font: boldFont });
        page.drawText('Precio', { x: 350, y: tableY - 20, size: 11, font: boldFont });
        page.drawText('Total', { x: 450, y: tableY - 20, size: 11, font: boldFont });

        // Líneas para items
        for (let i = 0; i < 5; i++) {
            const y = tableY - 60 - (i * 30);
            page.drawText(`_____________`, { x: 60, y, size: 10, font: font });
            page.drawText(`_____`, { x: 250, y, size: 10, font: font });
            page.drawText(`_____€`, { x: 350, y, size: 10, font: font });
            page.drawText(`_____€`, { x: 450, y, size: 10, font: font });
        }

        // Totales
        const totalY = 150;
        page.drawText('Subtotal: _________€', { x: width - 200, y: totalY + 60, size: 12, font: font });
        page.drawText('IVA (21%): _________€', { x: width - 200, y: totalY + 40, size: 12, font: font });
        page.drawRectangle({
            x: width - 210,
            y: totalY - 5,
            width: 150,
            height: 35,
            borderColor: rgb(0, 0, 0.5),
            borderWidth: 2
        });
        page.drawText('TOTAL: _________€', { x: width - 200, y: totalY + 10, size: 14, font: boldFont });
    }

    // Plantilla de Contrato
    async createContractTemplate(page, font, boldFont) {
        const { width, height } = page.getSize();
        
        page.drawText('CONTRATO DE SERVICIOS', {
            x: (width - 300) / 2,
            y: height - 50,
            size: 18,
            font: boldFont
        });

        const lines = [
            '',
            'En __________, a ____ de __________ de 20____',
            '',
            'REUNIDOS',
            '',
            'De una parte, D./Dña. __________________________________, mayor de edad,',
            'con DNI nº ________________, y domicilio en ________________________________',
            '',
            'Y de otra parte, D./Dña. __________________________________, mayor de edad,',
            'con DNI nº ________________, y domicilio en ________________________________',
            '',
            'EXPONEN',
            '',
            'Que ambas partes acuerdan celebrar el presente contrato de ________________',
            'conforme a las siguientes:',
            '',
            'CLÁUSULAS',
            '',
            'PRIMERA. - Objeto del contrato:',
            '_________________________________________________________________',
            '_________________________________________________________________',
            '',
            'SEGUNDA. - Precio y forma de pago:',
            '_________________________________________________________________',
            '_________________________________________________________________',
            '',
            'TERCERA. - Duración:',
            '_________________________________________________________________',
            '',
            '',
            'Firma Parte 1                                    Firma Parte 2',
            '',
            '________________                                ________________'
        ];

        let y = height - 100;
        lines.forEach(line => {
            page.drawText(line, {
                x: 50,
                y: y,
                size: 11,
                font: line.includes('REUNIDOS') || line.includes('EXPONEN') || line.includes('CLÁUSULAS') ? boldFont : font
            });
            y -= 20;
        });
    }

    // Plantilla de Curriculum
    async createResumeTemplate(page, font, boldFont) {
        const { width, height } = page.getSize();
        
        // Header con nombre
        page.drawRectangle({
            x: 0,
            y: height - 100,
            width: width,
            height: 100,
            color: rgb(0.2, 0.4, 0.7)
        });

        page.drawText('NOMBRE COMPLETO', {
            x: 50,
            y: height - 50,
            size: 28,
            font: boldFont,
            color: rgb(1, 1, 1)
        });

        page.drawText('Profesión / Cargo', {
            x: 50,
            y: height - 75,
            size: 14,
            font: font,
            color: rgb(0.9, 0.9, 0.9)
        });

        // Información de contacto
        let y = height - 130;
        page.drawText('📧 email@ejemplo.com    📱 +34 600 000 000    📍 Ciudad, País', {
            x: 50,
            y: y,
            size: 10,
            font: font
        });

        // Secciones
        y -= 40;
        const sections = [
            { title: 'PERFIL PROFESIONAL', content: 3 },
            { title: 'EXPERIENCIA LABORAL', content: 4 },
            { title: 'FORMACIÓN ACADÉMICA', content: 3 },
            { title: 'HABILIDADES', content: 2 }
        ];

        sections.forEach(section => {
            page.drawText(section.title, {
                x: 50,
                y: y,
                size: 14,
                font: boldFont,
                color: rgb(0.2, 0.4, 0.7)
            });
            page.drawLine({
                start: { x: 50, y: y - 5 },
                end: { x: width - 50, y: y - 5 },
                thickness: 2,
                color: rgb(0.2, 0.4, 0.7)
            });

            y -= 25;
            for (let i = 0; i < section.content; i++) {
                page.drawText('_'.repeat(80), {
                    x: 50,
                    y: y,
                    size: 10,
                    font: font
                });
                y -= 20;
            }
            y -= 15;
        });
    }

    // Plantilla de Formulario
    async createFormTemplate(page, font, boldFont) {
        const { width, height } = page.getSize();
        
        page.drawText('FORMULARIO', {
            x: (width - 150) / 2,
            y: height - 50,
            size: 20,
            font: boldFont
        });

        const fields = [
            { label: 'Nombre completo:', type: 'long' },
            { label: 'DNI/NIF:', type: 'short' },
            { label: 'Fecha de nacimiento:', type: 'short' },
            { label: 'Dirección:', type: 'long' },
            { label: 'Ciudad:', type: 'short' },
            { label: 'Código Postal:', type: 'short' },
            { label: 'Teléfono:', type: 'short' },
            { label: 'Email:', type: 'long' },
            { label: 'Comentarios:', type: 'multi' }
        ];

        let y = height - 100;
        fields.forEach(field => {
            page.drawText(field.label, {
                x: 50,
                y: y,
                size: 12,
                font: boldFont
            });

            if (field.type === 'multi') {
                for (let i = 0; i < 4; i++) {
                    page.drawLine({
                        start: { x: 50, y: y - 25 - (i * 20) },
                        end: { x: width - 50, y: y - 25 - (i * 20) },
                        thickness: 1,
                        color: rgb(0.7, 0.7, 0.7)
                    });
                }
                y -= 100;
            } else {
                page.drawLine({
                    start: { x: 50, y: y - 25 },
                    end: { x: field.type === 'long' ? width - 50 : 300, y: y - 25 },
                    thickness: 1,
                    color: rgb(0.7, 0.7, 0.7)
                });
                y -= 45;
            }
        });

        // Checkbox section
        y -= 20;
        page.drawText('Acepto los términos y condiciones', {
            x: 80,
            y: y,
            size: 10,
            font: font
        });
        page.drawRectangle({
            x: 50,
            y: y - 5,
            width: 15,
            height: 15,
            borderColor: rgb(0, 0, 0),
            borderWidth: 1
        });

        // Firma
        y -= 60;
        page.drawText('Firma:', { x: 50, y: y, size: 12, font: boldFont });
        page.drawLine({
            start: { x: 110, y: y - 5 },
            end: { x: 300, y: y - 5 },
            thickness: 1,
            color: rgb(0, 0, 0)
        });
    }

    // Plantilla básica
    async createBasicTemplate(page, font) {
        const { width, height } = page.getSize();
        
        page.drawText('Documento', {
            x: 50,
            y: height - 50,
            size: 20,
            font: font
        });

        page.drawText('_'.repeat(100), {
            x: 50,
            y: height - 100,
            size: 10,
            font: font
        });
    }

    // Añadir texto al PDF
    async addText(text, options = {}) {
        try {
            if (!this.currentPage) {
                throw new Error('No hay página activa');
            }

            const {
                x = 50,
                y = 50,
                size = 12,
                color = rgb(0, 0, 0),
                fontType = 'Helvetica'
            } = options;

            const fontMap = {
                'Helvetica': StandardFonts.Helvetica,
                'HelveticaBold': StandardFonts.HelveticaBold,
                'TimesRoman': StandardFonts.TimesRoman,
                'Courier': StandardFonts.Courier
            };

            const font = await this.currentDoc.embedFont(fontMap[fontType] || StandardFonts.Helvetica);

            this.currentPage.drawText(text, { x, y, size, font, color });

            return { success: true };
        } catch (error) {
            console.error('Error adding text:', error);
            return { success: false, error: error.message };
        }
    }

    // Añadir imagen
    async addImage(imageBytes, options = {}) {
        try {
            if (!this.currentPage) {
                throw new Error('No hay página activa');
            }

            const { x = 50, y = 50, width = 100, height = 100, type = 'png' } = options;

            let image;
            if (type === 'png') {
                image = await this.currentDoc.embedPng(imageBytes);
            } else if (type === 'jpg' || type === 'jpeg') {
                image = await this.currentDoc.embedJpg(imageBytes);
            }

            this.currentPage.drawImage(image, { x, y, width, height });

            return { success: true };
        } catch (error) {
            console.error('Error adding image:', error);
            return { success: false, error: error.message };
        }
    }

    // Añadir forma
    async addShape(shapeType, options = {}) {
        try {
            if (!this.currentPage) {
                throw new Error('No hay página activa');
            }

            const {
                x = 50,
                y = 50,
                width = 100,
                height = 100,
                color = rgb(0.5, 0.5, 0.5),
                borderColor = rgb(0, 0, 0),
                borderWidth = 1
            } = options;

            switch (shapeType) {
                case 'rectangle':
                    this.currentPage.drawRectangle({
                        x, y, width, height,
                        borderColor,
                        borderWidth,
                        color: options.filled ? color : undefined
                    });
                    break;
                case 'circle':
                    this.currentPage.drawCircle({
                        x: x + width / 2,
                        y: y + height / 2,
                        size: Math.min(width, height) / 2,
                        borderColor,
                        borderWidth,
                        color: options.filled ? color : undefined
                    });
                    break;
                case 'line':
                    this.currentPage.drawLine({
                        start: { x, y },
                        end: { x: x + width, y: y + height },
                        thickness: borderWidth,
                        color: borderColor
                    });
                    break;
            }

            return { success: true };
        } catch (error) {
            console.error('Error adding shape:', error);
            return { success: false, error: error.message };
        }
    }

    // Añadir nueva página
    addPage(options = {}) {
        try {
            const { width = 595.28, height = 841.89 } = options;
            const page = this.currentDoc.addPage([width, height]);
            this.currentPage = page;
            return { success: true, pageCount: this.currentDoc.getPageCount() };
        } catch (error) {
            return { success: false, error: error.message };
        }
    }

    // Guardar PDF
    async savePDF() {
        try {
            if (!this.currentDoc) {
                throw new Error('No hay documento para guardar');
            }

            const pdfBytes = await this.currentDoc.save();
            return { success: true, bytes: pdfBytes };
        } catch (error) {
            console.error('Error saving PDF:', error);
            return { success: false, error: error.message };
        }
    }

    // Obtener número de páginas
    getPageCount() {
        return this.currentDoc ? this.currentDoc.getPageCount() : 0;
    }

    // Cambiar a página específica
    setCurrentPage(pageIndex) {
        try {
            const pages = this.currentDoc.getPages();
            if (pageIndex >= 0 && pageIndex < pages.length) {
                this.currentPage = pages[pageIndex];
                return { success: true };
            }
            return { success: false, error: 'Índice de página inválido' };
        } catch (error) {
            return { success: false, error: error.message };
        }
    }
}

// Export para uso en navegador y Node.js
if (typeof module !== 'undefined' && module.exports) {
    module.exports = PDFCreator;
}
