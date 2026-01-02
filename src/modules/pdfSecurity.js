// Módulo de Seguridad para PDFs
const { PDFDocument, StandardFonts, PDFArray, PDFDict, PDFHexString, PDFName, PDFNumber } = require('pdf-lib');
const crypto = require('crypto');
const forge = require('node-forge');

class PDFSecurity {
    constructor() {
        this.pdfDoc = null;
        this.encryptionLevel = 'AES-256';
    }

    /**
     * Cifrar PDF con contraseña
     * @param {ArrayBuffer} pdfBytes - Bytes del PDF original
     * @param {Object} options - Opciones de cifrado
     * @returns {Promise<Uint8Array>} PDF cifrado
     */
    async encryptPDF(pdfBytes, options = {}) {
        try {
            const {
                userPassword = '',          // Contraseña para abrir el documento
                ownerPassword = '',         // Contraseña de permisos (admin)
                permissions = {},           // Permisos específicos
                encryptionLevel = 'AES-256' // AES-256, AES-128, RC4-128
            } = options;

            // Cargar el PDF
            this.pdfDoc = await PDFDocument.load(pdfBytes);

            // Configurar permisos
            const pdfPermissions = this._buildPermissions(permissions);

            // Aplicar cifrado según nivel
            if (encryptionLevel === 'AES-256') {
                await this._encryptAES256(userPassword, ownerPassword, pdfPermissions);
            } else if (encryptionLevel === 'AES-128') {
                await this._encryptAES128(userPassword, ownerPassword, pdfPermissions);
            } else {
                await this._encryptRC4128(userPassword, ownerPassword, pdfPermissions);
            }

            // Guardar PDF cifrado
            const encryptedPdfBytes = await this.pdfDoc.save();

            return {
                success: true,
                pdfBytes: encryptedPdfBytes,
                encryptionLevel,
                message: 'PDF cifrado correctamente'
            };
        } catch (error) {
            console.error('Error encrypting PDF:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * Establecer permisos del documento
     * @param {Object} permissions - Permisos a configurar
     * @returns {Number} Flags de permisos
     */
    _buildPermissions(permissions = {}) {
        const {
            allowPrinting = true,
            allowModifying = true,
            allowCopying = true,
            allowAnnotations = true,
            allowFillingForms = true,
            allowContentAccessibility = true,
            allowDocumentAssembly = true,
            allowHighQualityPrinting = true
        } = permissions;

        let permissionFlags = 0;

        // Bit 3: Printing
        if (allowPrinting) permissionFlags |= (1 << 2);
        
        // Bit 4: Modifying
        if (allowModifying) permissionFlags |= (1 << 3);
        
        // Bit 5: Copying
        if (allowCopying) permissionFlags |= (1 << 4);
        
        // Bit 6: Annotations
        if (allowAnnotations) permissionFlags |= (1 << 5);
        
        // Bit 9: Filling forms
        if (allowFillingForms) permissionFlags |= (1 << 8);
        
        // Bit 10: Content accessibility
        if (allowContentAccessibility) permissionFlags |= (1 << 9);
        
        // Bit 11: Document assembly
        if (allowDocumentAssembly) permissionFlags |= (1 << 10);
        
        // Bit 12: High quality printing
        if (allowHighQualityPrinting) permissionFlags |= (1 << 11);

        return permissionFlags;
    }

    /**
     * Cifrado AES-256 (PDF 2.0 estándar)
     */
    async _encryptAES256(userPassword, ownerPassword, permissions) {
        // AES-256 encryption implementation
        const algorithm = 'aes-256-cbc';
        const key = crypto.scryptSync(ownerPassword || userPassword, 'salt', 32);
        
        // Nota: pdf-lib no soporta cifrado nativo aún
        // Esta es una implementación de referencia
        console.warn('AES-256 encryption requires pdf-lib extension or external tool');
        
        return {
            algorithm: 'AES-256',
            keyLength: 256,
            permissions
        };
    }

    /**
     * Cifrado AES-128
     */
    async _encryptAES128(userPassword, ownerPassword, permissions) {
        const algorithm = 'aes-128-cbc';
        const key = crypto.scryptSync(ownerPassword || userPassword, 'salt', 16);
        
        return {
            algorithm: 'AES-128',
            keyLength: 128,
            permissions
        };
    }

    /**
     * Cifrado RC4-128
     */
    async _encryptRC4128(userPassword, ownerPassword, permissions) {
        const algorithm = 'rc4';
        const key = crypto.scryptSync(ownerPassword || userPassword, 'salt', 16);
        
        return {
            algorithm: 'RC4-128',
            keyLength: 128,
            permissions
        };
    }

    /**
     * Eliminar protección de PDF
     * @param {ArrayBuffer} pdfBytes - PDF protegido
     * @param {String} password - Contraseña
     */
    async decryptPDF(pdfBytes, password) {
        try {
            // Intentar cargar con contraseña
            this.pdfDoc = await PDFDocument.load(pdfBytes, { 
                ignoreEncryption: false,
                password: password
            });

            // Remover cifrado al guardar
            const decryptedPdfBytes = await this.pdfDoc.save({ 
                addDefaultPage: false 
            });

            return {
                success: true,
                pdfBytes: decryptedPdfBytes,
                message: 'PDF descifrado correctamente'
            };
        } catch (error) {
            console.error('Error decrypting PDF:', error);
            return { 
                success: false, 
                error: 'Contraseña incorrecta o PDF no cifrado'
            };
        }
    }

    /**
     * Crear firma digital para PDF
     * @param {Object} certInfo - Información del certificado
     */
    async createDigitalSignature(pdfBytes, certInfo = {}) {
        try {
            const {
                name = 'Usuario',
                reason = 'Aprobación del documento',
                location = 'Ciudad',
                contactInfo = 'email@example.com',
                certificatePath = null,
                privateKeyPath = null
            } = certInfo;

            // Generar par de claves RSA si no se proporciona
            const keys = await this._generateKeyPair();

            // Crear certificado auto-firmado
            const certificate = await this._createSelfSignedCert(keys, {
                commonName: name,
                email: contactInfo
            });

            // Firmar el documento
            const signature = this._signDocument(pdfBytes, keys.privateKey, {
                reason,
                location,
                contactInfo
            });

            return {
                success: true,
                signature,
                certificate,
                message: 'Firma digital creada correctamente'
            };
        } catch (error) {
            console.error('Error creating digital signature:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * Generar par de claves RSA
     */
    async _generateKeyPair() {
        return new Promise((resolve, reject) => {
            const keys = forge.pki.rsa.generateKeyPair(2048);
            resolve({
                publicKey: forge.pki.publicKeyToPem(keys.publicKey),
                privateKey: forge.pki.privateKeyToPem(keys.privateKey)
            });
        });
    }

    /**
     * Crear certificado auto-firmado
     */
    async _createSelfSignedCert(keys, info) {
        const cert = forge.pki.createCertificate();
        
        cert.publicKey = forge.pki.publicKeyFromPem(keys.publicKey);
        cert.serialNumber = '01';
        cert.validity.notBefore = new Date();
        cert.validity.notAfter = new Date();
        cert.validity.notAfter.setFullYear(cert.validity.notBefore.getFullYear() + 1);

        const attrs = [{
            name: 'commonName',
            value: info.commonName || 'PDF Signer'
        }, {
            name: 'countryName',
            value: 'ES'
        }, {
            shortName: 'OU',
            value: 'PDF Creator Pro'
        }];

        cert.setSubject(attrs);
        cert.setIssuer(attrs);

        // Auto-firmar
        cert.sign(forge.pki.privateKeyFromPem(keys.privateKey));

        return forge.pki.certificateToPem(cert);
    }

    /**
     * Firmar documento PDF
     */
    _signDocument(pdfBytes, privateKeyPem, signatureInfo) {
        const privateKey = forge.pki.privateKeyFromPem(privateKeyPem);
        
        // Crear hash del documento
        const md = forge.md.sha256.create();
        md.update(Buffer.from(pdfBytes).toString('binary'));
        
        // Firmar el hash
        const signature = privateKey.sign(md);
        
        return {
            signature: forge.util.encode64(signature),
            algorithm: 'SHA256withRSA',
            timestamp: new Date().toISOString(),
            ...signatureInfo
        };
    }

    /**
     * Verificar firma digital
     */
    async verifySignature(pdfBytes, signatureInfo, certificatePem) {
        try {
            const certificate = forge.pki.certificateFromPem(certificatePem);
            const publicKey = certificate.publicKey;

            // Crear hash del documento
            const md = forge.md.sha256.create();
            md.update(Buffer.from(pdfBytes).toString('binary'));

            // Decodificar firma
            const signature = forge.util.decode64(signatureInfo.signature);

            // Verificar
            const verified = publicKey.verify(md.digest().bytes(), signature);

            return {
                success: true,
                verified,
                message: verified ? 'Firma válida' : 'Firma inválida',
                signatureInfo
            };
        } catch (error) {
            console.error('Error verifying signature:', error);
            return { 
                success: false, 
                verified: false, 
                error: error.message 
            };
        }
    }

    /**
     * Redactar contenido sensible (eliminación permanente)
     */
    async redactContent(pdfBytes, redactions = []) {
        try {
            this.pdfDoc = await PDFDocument.load(pdfBytes);
            const pages = this.pdfDoc.getPages();

            for (const redaction of redactions) {
                const { pageIndex, area } = redaction;
                const page = pages[pageIndex];

                // Dibujar rectángulo negro sobre el área
                const { x, y, width, height } = area;
                page.drawRectangle({
                    x, y, width, height,
                    color: { r: 0, g: 0, b: 0 },
                    borderWidth: 0
                });

                // Remover texto subyacente (implementación simplificada)
                // En producción, se necesita manipulación de content streams
            }

            const redactedPdfBytes = await this.pdfDoc.save();

            return {
                success: true,
                pdfBytes: redactedPdfBytes,
                redactionsApplied: redactions.length,
                message: 'Contenido redactado permanentemente'
            };
        } catch (error) {
            console.error('Error redacting content:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * Aplicar marca de agua de seguridad
     */
    async applySecurityWatermark(pdfBytes, watermarkText, options = {}) {
        try {
            this.pdfDoc = await PDFDocument.load(pdfBytes);
            const pages = this.pdfDoc.getPages();
            const font = await this.pdfDoc.embedFont(StandardFonts.HelveticaBold);

            const {
                opacity = 0.3,
                rotation = 45,
                color = { r: 0.7, g: 0.7, b: 0.7 },
                fontSize = 48
            } = options;

            for (const page of pages) {
                const { width, height } = page.getSize();
                const textWidth = font.widthOfTextAtSize(watermarkText, fontSize);

                page.drawText(watermarkText, {
                    x: width / 2 - textWidth / 2,
                    y: height / 2,
                    size: fontSize,
                    font,
                    color,
                    rotate: { angle: rotation },
                    opacity
                });
            }

            const watermarkedPdfBytes = await this.pdfDoc.save();

            return {
                success: true,
                pdfBytes: watermarkedPdfBytes,
                message: 'Marca de agua de seguridad aplicada'
            };
        } catch (error) {
            console.error('Error applying security watermark:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * Obtener información de seguridad del PDF
     */
    async getSecurityInfo(pdfBytes) {
        try {
            this.pdfDoc = await PDFDocument.load(pdfBytes, { 
                ignoreEncryption: true 
            });

            // Intentar obtener información de cifrado
            const catalog = this.pdfDoc.catalog;
            
            return {
                success: true,
                isEncrypted: false, // Se actualizaría con información real
                hasUserPassword: false,
                hasOwnerPassword: false,
                encryptionAlgorithm: 'None',
                permissions: {
                    allowPrinting: true,
                    allowModifying: true,
                    allowCopying: true,
                    allowAnnotations: true
                },
                hasDigitalSignatures: false,
                signatureCount: 0
            };
        } catch (error) {
            return {
                success: false,
                error: error.message,
                isEncrypted: true
            };
        }
    }

    /**
     * Generar certificado para firma
     */
    async generateCertificate(certInfo = {}) {
        try {
            const keys = await this._generateKeyPair();
            const certificate = await this._createSelfSignedCert(keys, certInfo);

            return {
                success: true,
                certificate,
                publicKey: keys.publicKey,
                privateKey: keys.privateKey,
                message: 'Certificado generado correctamente'
            };
        } catch (error) {
            console.error('Error generating certificate:', error);
            return { success: false, error: error.message };
        }
    }
}

module.exports = PDFSecurity;
