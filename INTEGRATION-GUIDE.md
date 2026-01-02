# 📚 Guía de Integración de Nuevos Módulos

## 🎯 Resumen de Módulos Implementados

Se han creado **5 nuevos módulos avanzados** para tu aplicación PDF Creator Pro:

### 1. **pdfSecurity.js** 🔐
- Cifrado AES-256, AES-128, RC4-128
- Firmas digitales con certificados
- Permisos granulares de documento
- Redacción de contenido sensible
- Generación de certificados

### 2. **pdfOCR.js** 🔍
- Reconocimiento óptico de caracteres (OCR)
- Soporte multi-idioma (español, inglés, francés, alemán, italiano, portugués)
- Creación de PDFs buscables
- Detección automática de idioma
- Preprocesamiento de imágenes
- Búsqueda en PDFs escaneados

### 3. **pdfOptimizer.js** 🗜️
- Compresión de imágenes
- Downsampling de DPI
- Eliminación de objetos no usados
- Compresión de streams
- Linearización para web
- 4 presets: web, balanced, highQuality, minimumSize

### 4. **pdfAnnotations.js** 📝
- Notas adhesivas (Sticky Notes)
- Resaltado, subrayado, tachado
- Anotaciones de texto libre
- Formas geométricas con comentarios
- Sellos (APPROVED, REJECTED, etc.)
- Sistema de respuestas
- Exportación XFDF
- Reportes de anotaciones

### 5. **pdfBatch.js** ⚙️
- Procesamiento por lotes
- Cola de tareas con progreso
- Múltiples operaciones simultáneas
- Procesamiento de carpetas completas
- Reportes de procesamiento
- EventEmitter para tracking en tiempo real

---

## 🚀 Pasos para Integrar en tu App

### **Paso 1: Actualizar Dependencias**

```bash
cd c:\pdf-creator-app

# Respaldar package.json actual
copy package.json package.json.backup

# Reemplazar con nuevo package.json
copy package-new.json package.json

# Instalar nuevas dependencias
npm install
```

**Dependencias nuevas que se instalarán:**
- `node-forge` (certificados y criptografía)
- `tesseract.js` (OCR)
- `sharp` (procesamiento de imágenes)
- `qrcode` (códigos QR)
- `jszip` (manejo de archivos)
- `xml2js` (metadata XML)
- `commander` (CLI interface)

---

### **Paso 2: Actualizar main.js (Electron)**

Añade handlers IPC para los nuevos módulos:

```javascript
// Añadir al inicio de main.js
const PDFSecurity = require('./src/modules/pdfSecurity');
const PDFOCR = require('./src/modules/pdfOCR');
const PDFOptimizer = require('./src/modules/pdfOptimizer');
const PDFAnnotations = require('./src/modules/pdfAnnotations');
const PDFBatch = require('./src/modules/pdfBatch');

// Instancias globales
let securityModule = new PDFSecurity();
let ocrModule = new PDFOCR();
let optimizerModule = new PDFOptimizer();
let annotationsModule = new PDFAnnotations();
let batchProcessor = new PDFBatch();

// Handlers IPC para Seguridad
ipcMain.handle('encrypt-pdf', async (event, pdfBytes, options) => {
    return await securityModule.encryptPDF(pdfBytes, options);
});

ipcMain.handle('sign-pdf', async (event, pdfBytes, certInfo) => {
    return await securityModule.createDigitalSignature(pdfBytes, certInfo);
});

ipcMain.handle('get-security-info', async (event, pdfBytes) => {
    return await securityModule.getSecurityInfo(pdfBytes);
});

// Handlers IPC para OCR
ipcMain.handle('ocr-pdf', async (event, pdfBytes, options) => {
    return await ocrModule.processPDF(pdfBytes, options);
});

ipcMain.handle('ocr-image', async (event, imageBuffer, options) => {
    return await ocrModule.recognizeText(imageBuffer, options);
});

// Handlers IPC para Optimización
ipcMain.handle('optimize-pdf', async (event, pdfBytes, options) => {
    return await optimizerModule.optimizePDF(pdfBytes, options);
});

ipcMain.handle('optimize-preset', async (event, pdfBytes, preset) => {
    return await optimizerModule[preset](pdfBytes);
});

// Handlers IPC para Anotaciones
ipcMain.handle('add-annotation', async (event, type, pageIndex, options) => {
    switch(type) {
        case 'sticky':
            return await annotationsModule.addStickyNote(pageIndex, options);
        case 'highlight':
            return await annotationsModule.highlightText(pageIndex, options.area, options);
        case 'stamp':
            return await annotationsModule.addStamp(pageIndex, options.stampType, options);
        // ... más tipos
    }
});

ipcMain.handle('get-annotations', async (event) => {
    return annotationsModule.getAllAnnotations();
});

// Handlers IPC para Batch
ipcMain.handle('batch-process', async (event, files, operation, options) => {
    batchProcessor.addToQueue(files, operation, options);
    return await batchProcessor.processQueue(options);
});

ipcMain.handle('batch-status', async (event) => {
    return batchProcessor.getStatus();
});
```

---

### **Paso 3: Actualizar index.html (UI)**

Añade nuevos controles en la interfaz:

```html
<!-- Añadir en la sección de sidebar -->
<div class="tool-group">
    <h3>🔐 Seguridad</h3>
    <button class="tool-btn" data-tool="encrypt">
        <span class="tool-icon">🔒</span>
        Cifrar PDF
    </button>
    <button class="tool-btn" data-tool="sign">
        <span class="tool-icon">✍️</span>
        Firmar Digital
    </button>
    <button class="tool-btn" data-tool="permissions">
        <span class="tool-icon">🛡️</span>
        Permisos
    </button>
</div>

<div class="tool-group">
    <h3>🔍 OCR</h3>
    <button class="tool-btn" data-tool="ocr">
        <span class="tool-icon">📄</span>
        Extraer Texto
    </button>
    <button class="tool-btn" data-tool="searchable">
        <span class="tool-icon">🔎</span>
        Hacer Buscable
    </button>
</div>

<div class="tool-group">
    <h3>🗜️ Optimización</h3>
    <button class="tool-btn" data-tool="optimize">
        <span class="tool-icon">⚡</span>
        Optimizar
    </button>
    <button class="tool-btn" data-tool="compress">
        <span class="tool-icon">📦</span>
        Comprimir
    </button>
</div>

<div class="tool-group">
    <h3>📝 Anotaciones</h3>
    <button class="tool-btn" data-tool="sticky">
        <span class="tool-icon">📌</span>
        Nota
    </button>
    <button class="tool-btn" data-tool="highlight">
        <span class="tool-icon">🖍️</span>
        Resaltar
    </button>
    <button class="tool-btn" data-tool="stamp">
        <span class="tool-icon">✅</span>
        Sello
    </button>
</div>

<div class="tool-group">
    <h3>⚙️ Lotes</h3>
    <button class="tool-btn" data-tool="batch">
        <span class="tool-icon">📚</span>
        Procesar Lote
    </button>
    <button class="tool-btn" data-tool="folder">
        <span class="tool-icon">📁</span>
        Procesar Carpeta
    </button>
</div>
```

**Modales necesarios:**

```html
<!-- Modal de Cifrado -->
<div id="encryptModal" class="modal">
    <div class="modal-content">
        <h2>🔒 Cifrar PDF</h2>
        <form id="encryptForm">
            <div class="form-group">
                <label>Contraseña de Usuario:</label>
                <input type="password" id="userPassword" required>
            </div>
            <div class="form-group">
                <label>Contraseña de Propietario:</label>
                <input type="password" id="ownerPassword">
            </div>
            <div class="form-group">
                <label>Nivel de Cifrado:</label>
                <select id="encryptionLevel">
                    <option value="AES-256">AES-256 (Máxima seguridad)</option>
                    <option value="AES-128">AES-128</option>
                    <option value="RC4-128">RC4-128</option>
                </select>
            </div>
            <h3>Permisos:</h3>
            <div class="checkbox-group">
                <label><input type="checkbox" id="allowPrinting" checked> Permitir impresión</label>
                <label><input type="checkbox" id="allowModifying" checked> Permitir modificación</label>
                <label><input type="checkbox" id="allowCopying" checked> Permitir copiar</label>
                <label><input type="checkbox" id="allowAnnotations" checked> Permitir anotaciones</label>
            </div>
            <div class="form-actions">
                <button type="submit" class="btn-primary">Cifrar</button>
                <button type="button" class="btn-secondary" onclick="closeModal('encryptModal')">Cancelar</button>
            </div>
        </form>
    </div>
</div>

<!-- Modal de OCR -->
<div id="ocrModal" class="modal">
    <div class="modal-content">
        <h2>🔍 Reconocimiento OCR</h2>
        <form id="ocrForm">
            <div class="form-group">
                <label>Idioma:</label>
                <select id="ocrLanguage">
                    <option value="spa+eng">Español + Inglés</option>
                    <option value="spa">Solo Español</option>
                    <option value="eng">Solo Inglés</option>
                    <option value="fra">Francés</option>
                    <option value="deu">Alemán</option>
                </select>
            </div>
            <div class="form-group">
                <label>
                    <input type="checkbox" id="createSearchable" checked>
                    Crear PDF buscable
                </label>
            </div>
            <div id="ocrProgress" style="display: none;">
                <div class="progress-bar">
                    <div class="progress-fill"></div>
                </div>
                <p class="progress-text">Procesando...</p>
            </div>
            <div class="form-actions">
                <button type="submit" class="btn-primary">Iniciar OCR</button>
                <button type="button" class="btn-secondary" onclick="closeModal('ocrModal')">Cancelar</button>
            </div>
        </form>
    </div>
</div>

<!-- Modal de Optimización -->
<div id="optimizeModal" class="modal">
    <div class="modal-content">
        <h2>⚡ Optimizar PDF</h2>
        <form id="optimizeForm">
            <div class="form-group">
                <label>Preset de Optimización:</label>
                <select id="optimizePreset">
                    <option value="balanced">Balanceado (recomendado)</option>
                    <option value="webOptimized">Web/Email</option>
                    <option value="minimumSize">Tamaño mínimo</option>
                    <option value="highQuality">Alta calidad</option>
                </select>
            </div>
            <div class="options-advanced">
                <h3>Opciones Avanzadas:</h3>
                <label><input type="checkbox" id="compressImages" checked> Comprimir imágenes</label>
                <label><input type="checkbox" id="downsampleImages" checked> Reducir DPI</label>
                <label><input type="checkbox" id="removeUnused" checked> Eliminar objetos no usados</label>
            </div>
            <div class="form-actions">
                <button type="submit" class="btn-primary">Optimizar</button>
                <button type="button" class="btn-secondary" onclick="closeModal('optimizeModal')">Cancelar</button>
            </div>
        </form>
    </div>
</div>
```

---

### **Paso 4: Actualizar app.js**

Añade manejadores para los nuevos features:

```javascript
// Añadir al inicio de app.js
const { ipcRenderer } = require('electron');

// ... código existente ...

// Manejador de herramientas - EXTENDER
async function handleToolClick(toolName) {
    switch(toolName) {
        // ... casos existentes ...

        case 'encrypt':
            showModal('encryptModal');
            break;

        case 'sign':
            await handleDigitalSignature();
            break;

        case 'ocr':
            showModal('ocrModal');
            break;

        case 'optimize':
            showModal('optimizeModal');
            break;

        case 'sticky':
            enableAnnotationMode('sticky');
            break;

        case 'highlight':
            enableAnnotationMode('highlight');
            break;

        case 'stamp':
            await showStampMenu();
            break;

        case 'batch':
            showModal('batchModal');
            break;
    }
}

// Función para cifrar PDF
async function encryptPDF() {
    const form = document.getElementById('encryptForm');
    const formData = new FormData(form);

    const options = {
        userPassword: formData.get('userPassword'),
        ownerPassword: formData.get('ownerPassword'),
        encryptionLevel: document.getElementById('encryptionLevel').value,
        permissions: {
            allowPrinting: document.getElementById('allowPrinting').checked,
            allowModifying: document.getElementById('allowModifying').checked,
            allowCopying: document.getElementById('allowCopying').checked,
            allowAnnotations: document.getElementById('allowAnnotations').checked
        }
    };

    showLoading('Cifrando PDF...');

    try {
        const pdfBytes = await getCurrentPDFBytes();
        const result = await ipcRenderer.invoke('encrypt-pdf', pdfBytes, options);

        if (result.success) {
            await saveEncryptedPDF(result.pdfBytes);
            showMessage('✅ PDF cifrado correctamente', 'success');
            closeModal('encryptModal');
        } else {
            showMessage('❌ Error: ' + result.error, 'error');
        }
    } catch (error) {
        showMessage('❌ Error cifrando PDF: ' + error.message, 'error');
    } finally {
        hideLoading();
    }
}

// Función para OCR
async function performOCR() {
    const language = document.getElementById('ocrLanguage').value;
    const createSearchable = document.getElementById('createSearchable').checked;

    const options = {
        language,
        createSearchablePDF: createSearchable
    };

    document.getElementById('ocrProgress').style.display = 'block';
    showLoading('Procesando OCR...');

    try {
        const pdfBytes = await getCurrentPDFBytes();
        const result = await ipcRenderer.invoke('ocr-pdf', pdfBytes, options);

        if (result.success) {
            // Mostrar resultados
            const stats = `
                📄 Páginas procesadas: ${result.pageCount}
                📝 Palabras extraídas: ${result.totalWords}
                🎯 Confianza promedio: ${result.averageConfidence}%
            `;
            
            showMessage('✅ OCR completado\n' + stats, 'success');

            if (createSearchable && result.searchablePDF) {
                await saveSearchablePDF(result.searchablePDF);
            }

            closeModal('ocrModal');
        } else {
            showMessage('❌ Error: ' + result.error, 'error');
        }
    } catch (error) {
        showMessage('❌ Error en OCR: ' + error.message, 'error');
    } finally {
        hideLoading();
        document.getElementById('ocrProgress').style.display = 'none';
    }
}

// Función para optimizar
async function optimizePDF() {
    const preset = document.getElementById('optimizePreset').value;

    showLoading('Optimizando PDF...');

    try {
        const pdfBytes = await getCurrentPDFBytes();
        const result = await ipcRenderer.invoke('optimize-preset', pdfBytes, preset);

        if (result.success) {
            await saveOptimizedPDF(result.pdfBytes);
            
            const stats = `
                📦 Tamaño original: ${result.originalSize}
                📉 Tamaño optimizado: ${result.optimizedSize}
                💾 Reducción: ${result.reductionPercentage}%
            `;
            
            showMessage('✅ ' + result.message + '\n' + stats, 'success');
            closeModal('optimizeModal');
        } else {
            showMessage('❌ Error: ' + result.error, 'error');
        }
    } catch (error) {
        showMessage('❌ Error optimizando: ' + error.message, 'error');
    } finally {
        hideLoading();
    }
}

// Event listeners para formularios
document.getElementById('encryptForm')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    await encryptPDF();
});

document.getElementById('ocrForm')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    await performOCR();
});

document.getElementById('optimizeForm')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    await optimizePDF();
});
```

---

### **Paso 5: Estilos CSS para Nuevos Elementos**

Añade en `src/styles/main.css`:

```css
/* Modales específicos */
.modal-content h3 {
    margin-top: 20px;
    margin-bottom: 10px;
    color: var(--primary-color);
}

.checkbox-group {
    display: flex;
    flex-direction: column;
    gap: 10px;
    margin: 15px 0;
}

.checkbox-group label {
    display: flex;
    align-items: center;
    gap: 8px;
    cursor: pointer;
}

.checkbox-group input[type="checkbox"] {
    width: 18px;
    height: 18px;
    cursor: pointer;
}

/* Barra de progreso */
.progress-bar {
    width: 100%;
    height: 30px;
    background: #e0e0e0;
    border-radius: 15px;
    overflow: hidden;
    margin: 15px 0;
}

.progress-fill {
    height: 100%;
    background: linear-gradient(90deg, var(--primary-color), var(--secondary-color));
    width: 0%;
    transition: width 0.3s ease;
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
    font-weight: bold;
}

.progress-text {
    text-align: center;
    color: var(--text-secondary);
    margin-top: 5px;
}

/* Opciones avanzadas colapsables */
.options-advanced {
    background: #f5f5f5;
    padding: 15px;
    border-radius: 8px;
    margin: 15px 0;
}

.options-advanced h3 {
    margin-top: 0;
}

/* Iconos de herramientas */
.tool-icon {
    font-size: 20px;
    margin-right: 8px;
}

/* Modo anotación activo */
.annotation-mode-active {
    cursor: crosshair;
}

.annotation-mode-active canvas {
    cursor: crosshair !important;
}
```

---

## 📖 Ejemplos de Uso de los Nuevos Módulos

### **1. Cifrar un PDF**

```javascript
const PDFSecurity = require('./src/modules/pdfSecurity');
const security = new PDFSecurity();

const pdfBytes = await fs.readFile('documento.pdf');

const result = await security.encryptPDF(pdfBytes, {
    userPassword: 'usuario123',
    ownerPassword: 'admin123',
    encryptionLevel: 'AES-256',
    permissions: {
        allowPrinting: true,
        allowModifying: false,
        allowCopying: false,
        allowAnnotations: true
    }
});

if (result.success) {
    await fs.writeFile('documento_cifrado.pdf', result.pdfBytes);
    console.log('PDF cifrado:', result.message);
}
```

### **2. OCR en un PDF escaneado**

```javascript
const PDFOCR = require('./src/modules/pdfOCR');
const ocr = new PDFOCR();

const pdfBytes = await fs.readFile('escaneado.pdf');

const result = await ocr.processPDF(pdfBytes, {
    language: 'spa+eng',
    createSearchablePDF: true
});

if (result.success) {
    console.log(`Texto extraído de ${result.pageCount} páginas`);
    console.log(`Confianza: ${result.averageConfidence}%`);
    
    if (result.searchablePDF) {
        await fs.writeFile('escaneado_buscable.pdf', result.searchablePDF);
    }
    
    // Texto completo
    result.results.forEach(page => {
        console.log(`\nPágina ${page.pageNumber}:`);
        console.log(page.text);
    });
}
```

### **3. Optimizar PDF**

```javascript
const PDFOptimizer = require('./src/modules/pdfOptimizer');
const optimizer = new PDFOptimizer();

const pdfBytes = await fs.readFile('grande.pdf');

// Preset balanceado
const result = await optimizer.balanced(pdfBytes);

// O con opciones personalizadas
const result = await optimizer.optimizePDF(pdfBytes, {
    compressImages: true,
    imageQuality: 85,
    downsampleImages: true,
    maxImageDPI: 150,
    removeUnusedObjects: true,
    optimizeForWeb: true
});

if (result.success) {
    await fs.writeFile('optimizado.pdf', result.pdfBytes);
    console.log(`Reducción: ${result.reductionPercentage}%`);
    console.log(result.message);
}
```

### **4. Añadir Anotaciones**

```javascript
const PDFAnnotations = require('./src/modules/pdfAnnotations');
const annotations = new PDFAnnotations();

const pdfBytes = await fs.readFile('documento.pdf');
await annotations.loadPDF(pdfBytes);

// Nota adhesiva
await annotations.addStickyNote(0, {
    x: 100,
    y: 100,
    content: 'Revisar este párrafo',
    author: 'Juan Pérez'
});

// Resaltar texto
await annotations.highlightText(0, {
    x: 50, y: 200, width: 200, height: 20
}, {
    color: { r: 1, g: 1, b: 0 },
    author: 'María García',
    note: 'Importante'
});

// Sello
await annotations.addStamp(0, 'APPROVED', {
    x: 400,
    y: 50
});

// Guardar con anotaciones
const result = await annotations.save();
await fs.writeFile('con_anotaciones.pdf', result.pdfBytes);
```

### **5. Procesamiento por Lotes**

```javascript
const PDFBatch = require('./src/modules/pdfBatch');
const batch = new PDFBatch();

// Escuchar eventos
batch.on('progressUpdated', (progress) => {
    console.log(`Progreso: ${progress.percentage}% (${progress.completed}/${progress.total})`);
});

batch.on('taskCompleted', (task) => {
    console.log(`Tarea completada: ${task.id}`);
});

// Optimizar múltiples PDFs
const files = ['pdf1.pdf', 'pdf2.pdf', 'pdf3.pdf'];
const result = await batch.batchOptimize(files, 'balanced');

console.log(`Procesados: ${result.processed}/${result.total}`);
console.log(`Fallidos: ${result.failed}`);

// Exportar reporte
const report = batch.exportReport('text');
console.log(report);
```

---

## 🧪 Testing de los Nuevos Módulos

Crea un archivo de pruebas `test-modules.js`:

```javascript
const fs = require('fs').promises;
const PDFSecurity = require('./src/modules/pdfSecurity');
const PDFOCR = require('./src/modules/pdfOCR');
const PDFOptimizer = require('./src/modules/pdfOptimizer');
const PDFAnnotations = require('./src/modules/pdfAnnotations');
const PDFBatch = require('./src/modules/pdfBatch');

async function testModules() {
    console.log('🧪 Iniciando pruebas de módulos...\n');

    try {
        // Test 1: Seguridad
        console.log('1️⃣ Testing PDFSecurity...');
        const security = new PDFSecurity();
        const cert = await security.generateCertificate({
            commonName: 'Test User',
            email: 'test@example.com'
        });
        console.log('✅ Certificado generado\n');

        // Test 2: OCR
        console.log('2️⃣ Testing PDFOCR...');
        const ocr = new PDFOCR();
        const initResult = await ocr.initialize('spa+eng');
        console.log('✅ OCR inicializado:', initResult.message, '\n');

        // Test 3: Optimizer
        console.log('3️⃣ Testing PDFOptimizer...');
        const optimizer = new PDFOptimizer();
        console.log('✅ Optimizer listo\n');

        // Test 4: Annotations
        console.log('4️⃣ Testing PDFAnnotations...');
        const annotations = new PDFAnnotations();
        console.log('✅ Annotations listo\n');

        // Test 5: Batch
        console.log('5️⃣ Testing PDFBatch...');
        const batch = new PDFBatch();
        console.log('✅ Batch processor listo\n');

        console.log('✅ Todos los módulos funcionan correctamente!');
    } catch (error) {
        console.error('❌ Error en pruebas:', error);
    }
}

testModules();
```

Ejecutar:
```bash
cd c:\pdf-creator-app
node test-modules.js
```

---

## 🎨 Próximos Pasos Recomendados

1. **Instalar dependencias**
   ```bash
   npm install
   ```

2. **Probar módulos individualmente**
   ```bash
   node test-modules.js
   ```

3. **Actualizar UI progresivamente** - Integra un módulo a la vez:
   - Día 1: Seguridad (cifrado básico)
   - Día 2: OCR (extracto de texto)
   - Día 3: Optimización (compresión)
   - Día 4: Anotaciones (notas y resaltado)
   - Día 5: Batch (procesamiento masivo)

4. **Crear ejemplos de uso** - Documenta casos de uso reales

5. **Optimizar rendimiento** - Especialmente OCR y optimización

6. **Añadir más features** según ADVANCED-FEATURES.md

---

## 📞 Soporte y Documentación

### Enlaces útiles:
- [pdf-lib Documentation](https://pdf-lib.js.org/)
- [Tesseract.js Guide](https://tesseract.projectnaptha.com/)
- [Sharp API](https://sharp.pixelplumbing.com/)
- [Node-Forge Docs](https://github.com/digitalbazaar/forge)
- [ISO 32000-2 Standard](https://pdfa.org/sponsored-standards/)

### Archivos de referencia creados:
- `ADVANCED-FEATURES.md` - Lista completa de features
- `package-new.json` - Dependencias actualizadas
- Esta guía - Instrucciones de integración

---

¡Tu aplicación PDF ahora tiene capacidades de nivel profesional! 🚀
