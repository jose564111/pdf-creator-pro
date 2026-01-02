// Aplicación principal - Orquestación de módulos
const { ipcRenderer } = require('electron');

// Estado de la aplicación
const AppState = {
    currentPDF: null,
    currentMode: 'none', // 'create', 'edit', 'view'
    currentPage: 1,
    totalPages: 0,
    zoom: 1.5,
    unsavedChanges: false,
    pdfCreator: null,
    pdfReader: null,
    pdfEditor: null,
    aiIntegration: null
};

// Inicialización
document.addEventListener('DOMContentLoaded', async () => {
    console.log('PDF Creator Pro - Inicializando...');
    
    // Inicializar IA automáticamente al inicio
    try {
        if (!window.AIIntegration) {
            await loadModule('aiIntegration');
        }
        AppState.aiIntegration = new AIIntegration();
        console.log('✅ Sistema de IA inicializado automáticamente');
    } catch (error) {
        console.error('Error inicializando IA:', error);
    }
    
    // Setup event listeners
    setupEventListeners();
    
    // Mostrar pantalla de bienvenida
    showWelcomeScreen();
});

// Setup de event listeners
function setupEventListeners() {
    // Header buttons
    document.getElementById('newPdfBtn').addEventListener('click', showNewPDFOptions);
    document.getElementById('openPdfBtn').addEventListener('click', openExistingPDF);
    
    // Tool buttons
    document.querySelectorAll('.tool-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const tool = e.target.dataset.tool;
            handleToolClick(tool);
        });
    });
    
    // Page controls
    document.getElementById('prevPage').addEventListener('click', previousPage);
    document.getElementById('nextPage').addEventListener('click', nextPage);
    document.getElementById('zoomIn').addEventListener('click', zoomIn);
    document.getElementById('zoomOut').addEventListener('click', zoomOut);
    
    // Export buttons
    document.getElementById('savePdfBtn').addEventListener('click', savePDF);
    document.getElementById('exportPdfBtn').addEventListener('click', exportPDF);
    
    // Modal controls
    setupModalControls();
}

// Configurar controles de modales
function setupModalControls() {
    // AI Modal
    const aiModal = document.getElementById('aiModal');
    const aiCloseBtn = aiModal.querySelector('.close');
    aiCloseBtn.addEventListener('click', () => closeModal('aiModal'));
    
    document.getElementById('generateAiBtn').addEventListener('click', generateWithAI);
    
    // Form Modal
    const formModal = document.getElementById('formModal');
    const formCloseBtn = formModal.querySelector('.close');
    formCloseBtn.addEventListener('click', () => closeModal('formModal'));
    
    document.getElementById('fillFormBtn').addEventListener('click', fillFormFields);
    document.getElementById('aiAutoFillBtn').addEventListener('click', autoFillWithAI);
    
    // Close modal on outside click
    window.addEventListener('click', (e) => {
        if (e.target.classList.contains('modal')) {
            e.target.classList.remove('active');
        }
    });
}

// Pantalla de bienvenida
function showWelcomeScreen() {
    const viewer = document.getElementById('pdfViewer');
    viewer.innerHTML = `
        <div style="display: flex; flex-direction: column; justify-content: center; align-items: center; height: 100%; text-align: center; color: #7f8c8d;">
            <h2 style="font-size: 2rem; margin-bottom: 1rem;">📄 Bienvenido a PDF Creator Pro</h2>
            <p style="font-size: 1.1rem; margin-bottom: 2rem;">Crea, edita y personaliza PDFs con el poder de la IA</p>
            <div style="display: flex; gap: 1rem;">
                <button class="btn btn-primary" onclick="showNewPDFOptions()">
                    ➕ Crear Nuevo PDF
                </button>
                <button class="btn btn-secondary" onclick="openExistingPDF()">
                    📂 Abrir PDF Existente
                </button>
            </div>
        </div>
    `;
}

// Mostrar opciones de nuevo PDF
function showNewPDFOptions() {
    const templates = [
        { id: 'blank', name: 'PDF en Blanco', icon: '📄' },
        { id: 'invoice', name: 'Factura', icon: '🧾' },
        { id: 'contract', name: 'Contrato', icon: '📝' },
        { id: 'resume', name: 'Curriculum', icon: '👤' },
        { id: 'form', name: 'Formulario', icon: '📋' },
        { id: 'ai', name: 'Generar con IA', icon: '🤖' }
    ];
    
    const viewer = document.getElementById('pdfViewer');
    viewer.innerHTML = `
        <div style="padding: 2rem;">
            <h2 style="margin-bottom: 2rem;">Selecciona un tipo de documento</h2>
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1rem;">
                ${templates.map(t => `
                    <div class="template-card" onclick="createPDFFromTemplate('${t.id}')" 
                         style="padding: 2rem; background: white; border-radius: 8px; text-align: center; cursor: pointer; transition: transform 0.2s; border: 2px solid #ecf0f1;">
                        <div style="font-size: 3rem; margin-bottom: 1rem;">${t.icon}</div>
                        <h3 style="font-size: 1rem; color: #2c3e50;">${t.name}</h3>
                    </div>
                `).join('')}
            </div>
        </div>
    `;
    
    // Hover effect
    document.querySelectorAll('.template-card').forEach(card => {
        card.addEventListener('mouseenter', (e) => {
            e.target.style.transform = 'translateY(-5px)';
            e.target.style.borderColor = '#4a90e2';
        });
        card.addEventListener('mouseleave', (e) => {
            e.target.style.transform = 'translateY(0)';
            e.target.style.borderColor = '#ecf0f1';
        });
    });
}

// Crear PDF desde plantilla
async function createPDFFromTemplate(templateId) {
    showLoading('Creando documento...');
    
    try {
        if (templateId === 'ai') {
            hideLoading();
            openModal('aiModal');
            return;
        }
        
        // Importar PDFCreator si no está cargado
        if (!window.PDFCreator) {
            await loadModule('pdfCreator');
        }
        
        AppState.pdfCreator = new PDFCreator();
        
        if (templateId === 'blank') {
            await AppState.pdfCreator.createBlankPDF({ pages: 1 });
        } else {
            await AppState.pdfCreator.createFromTemplate(templateId);
        }
        
        AppState.currentMode = 'create';
        AppState.currentPage = 1;
        AppState.totalPages = AppState.pdfCreator.getPageCount();
        
        await renderCurrentPDF();
        updatePageInfo();
        showToast('Documento creado exitosamente', 'success');
        
    } catch (error) {
        console.error('Error creating PDF:', error);
        showToast('Error al crear el documento', 'error');
    } finally {
        hideLoading();
    }
}

// Abrir PDF existente
async function openExistingPDF() {
    try {
        const result = await ipcRenderer.invoke('open-file-dialog');
        
        if (result.canceled || !result.filePaths || result.filePaths.length === 0) {
            return;
        }
        
        showLoading('Cargando PDF...');
        
        const filePath = result.filePaths[0];
        const fileData = await ipcRenderer.invoke('read-file', filePath);
        
        // Cargar con PDFReader
        if (!window.PDFReader) {
            await loadModule('pdfReader');
        }
        
        AppState.pdfReader = new PDFReader();
        const loadResult = await AppState.pdfReader.loadPDF(fileData);
        
        if (!loadResult.success) {
            throw new Error(loadResult.error);
        }
        
        AppState.currentMode = 'view';
        AppState.currentPage = 1;
        AppState.totalPages = loadResult.pageCount;
        
        await renderCurrentPage();
        updatePageInfo();
        
        // Detectar campos de formulario
        const formResult = await AppState.pdfReader.detectFormFields();
        if (formResult.success && formResult.count > 0) {
            showToast(`PDF cargado. ${formResult.count} campos de formulario detectados.`, 'success');
        } else {
            showToast('PDF cargado exitosamente', 'success');
        }
        
    } catch (error) {
        console.error('Error opening PDF:', error);
        showToast('Error al abrir el PDF', 'error');
    } finally {
        hideLoading();
    }
}

// Renderizar PDF actual
async function renderCurrentPDF() {
    try {
        if (AppState.currentMode === 'create') {
            // Guardar temporalmente y renderizar
            const saveResult = await AppState.pdfCreator.savePDF();
            if (saveResult.success) {
                // Cargar con reader para visualizar
                if (!AppState.pdfReader) {
                    AppState.pdfReader = new PDFReader();
                }
                await AppState.pdfReader.loadPDF(saveResult.bytes.buffer);
                await renderCurrentPage();
            }
        } else if (AppState.currentMode === 'view' || AppState.currentMode === 'edit') {
            await renderCurrentPage();
        }
    } catch (error) {
        console.error('Error rendering PDF:', error);
        showToast('Error al renderizar el PDF', 'error');
    }
}

// Renderizar página actual
async function renderCurrentPage() {
    const canvas = document.getElementById('pdfCanvas');
    if (!AppState.pdfReader) return;
    
    const result = await AppState.pdfReader.renderPage(AppState.currentPage, canvas);
    
    if (!result.success) {
        showToast('Error al renderizar la página', 'error');
    }
}

// Navegación de páginas
async function previousPage() {
    if (AppState.currentPage > 1) {
        AppState.currentPage--;
        await renderCurrentPage();
        updatePageInfo();
    }
}

async function nextPage() {
    if (AppState.currentPage < AppState.totalPages) {
        AppState.currentPage++;
        await renderCurrentPage();
        updatePageInfo();
    }
}

// Zoom
function zoomIn() {
    AppState.zoom = Math.min(AppState.zoom + 0.25, 3.0);
    if (AppState.pdfReader) {
        AppState.pdfReader.setScale(AppState.zoom);
        renderCurrentPage();
    }
    updateZoomLevel();
}

function zoomOut() {
    AppState.zoom = Math.max(AppState.zoom - 0.25, 0.5);
    if (AppState.pdfReader) {
        AppState.pdfReader.setScale(AppState.zoom);
        renderCurrentPage();
    }
    updateZoomLevel();
}

function updateZoomLevel() {
    document.getElementById('zoomLevel').textContent = `${Math.round(AppState.zoom * 100)}%`;
}

function updatePageInfo() {
    document.getElementById('pageInfo').textContent = `Página ${AppState.currentPage} de ${AppState.totalPages}`;
}

// Manejo de herramientas
async function handleToolClick(tool) {
    switch (tool) {
        case 'create-blank':
            await createPDFFromTemplate('blank');
            break;
        case 'create-template':
            showNewPDFOptions();
            break;
        case 'create-ai':
            openModal('aiModal');
            break;
        case 'fill-form':
            await showFormFillDialog();
            break;
        case 'ai-fill':
            await showFormFillDialog();
            break;
        case 'ai-generate':
            openModal('aiModal');
            break;
        case 'ai-extract':
            await extractDataWithAI();
            break;
        case 'add-text':
            await addTextTool();
            break;
        case 'add-image':
            await addImageTool();
            break;
        case 'add-shape':
            await addShapeTool();
            break;
        case 'add-page':
            await addNewPage();
            break;
        case 'delete-page':
            await deleteCurrentPage();
            break;
        default:
            showToast(`Herramienta "${tool}" disponible`, 'info');
    }
}

// Función para extraer datos con IA
async function extractDataWithAI() {
    if (!AppState.pdfReader) {
        showToast('Primero debes abrir un PDF', 'warning');
        return;
    }
    
    showLoading('Extrayendo datos con IA...');
    
    try {
        // Inicializar IA si no existe
        if (!AppState.aiIntegration) {
            if (!window.AIIntegration) {
                await loadModule('aiIntegration');
            }
            AppState.aiIntegration = new AIIntegration();
        }
        
        const textResult = await AppState.pdfReader.extractAllText();
        
        if (!textResult.success) {
            throw new Error('No se pudo extraer el texto del PDF');
        }
        
        const extractResult = await AppState.aiIntegration.extractDataFromPDF(
            textResult.text,
            'extrae toda la información relevante como nombres, fechas, montos, direcciones, etc.'
        );
        
        if (extractResult.success) {
            const resultHtml = `
                <div style="padding: 1rem; background: white; border-radius: 8px;">
                    <h3>Datos Extraídos con IA</h3>
                    <pre style="white-space: pre-wrap; max-height: 400px; overflow-y: auto;">${JSON.stringify(extractResult.data, null, 2)}</pre>
                </div>
            `;
            
            const viewer = document.getElementById('pdfViewer');
            viewer.innerHTML = resultHtml;
            
            showToast('Datos extraídos exitosamente', 'success');
        }
    } catch (error) {
        console.error('Error extracting data:', error);
        showToast('Error al extraer datos: ' + error.message, 'error');
    } finally {
        hideLoading();
    }
}

// Herramientas de edición básicas
async function addTextTool() {
    showToast('Selecciona la posición donde quieres añadir texto', 'info');
    // Implementación básica - puede expandirse
}

async function addImageTool() {
    showToast('Selecciona una imagen para añadir al PDF', 'info');
    // Implementación básica - puede expandirse
}

async function addShapeTool() {
    showToast('Selecciona el tipo de forma a añadir', 'info');
    // Implementación básica - puede expandirse
}

async function addNewPage() {
    if (!AppState.pdfCreator && !AppState.pdfEditor) {
        showToast('Primero crea o abre un PDF', 'warning');
        return;
    }
    
    const creator = AppState.pdfCreator || AppState.pdfEditor;
    const result = creator.addPage();
    
    if (result.success) {
        AppState.totalPages = result.pageCount;
        updatePageInfo();
        showToast('Página añadida', 'success');
    }
}

async function deleteCurrentPage() {
    if (!AppState.pdfEditor) {
        showToast('Primero debes abrir un PDF para editar', 'warning');
        return;
    }
    
    if (AppState.totalPages <= 1) {
        showToast('No puedes eliminar la única página', 'warning');
        return;
    }
    
    const result = AppState.pdfEditor.removePage(AppState.currentPage - 1);
    
    if (result.success) {
        AppState.totalPages = result.pageCount;
        if (AppState.currentPage > AppState.totalPages) {
            AppState.currentPage = AppState.totalPages;
        }
        await renderCurrentPage();
        updatePageInfo();
        showToast('Página eliminada', 'success');
    }
}

// Formularios
async function showFormFillDialog() {
    if (!AppState.pdfReader) {
        showToast('Primero debes abrir un PDF', 'warning');
        return;
    }
    
    const formResult = await AppState.pdfReader.detectFormFields();
    
    if (!formResult.success || formResult.count === 0) {
        showToast('No se encontraron campos de formulario en este PDF', 'warning');
        return;
    }
    
    const formFields = document.getElementById('formFields');
    formFields.innerHTML = formResult.fields.map(field => `
        <div class="form-field">
            <label>${field.name}</label>
            <input type="text" id="field_${field.id}" data-field-name="${field.name}" value="${field.value}">
        </div>
    `).join('');
    
    openModal('formModal');
}

async function fillFormFields() {
    // Implementar relleno de formulario
    showToast('Rellenando formulario...', 'success');
    closeModal('formModal');
}

async function autoFillWithAI() {
    if (!AppState.pdfReader) {
        showToast('Primero debes abrir un PDF con formulario', 'warning');
        return;
    }
    
    showLoading('Auto-rellenando con IA...');
    
    try {
        // Inicializar IA si no existe
        if (!AppState.aiIntegration) {
            if (!window.AIIntegration) {
                await loadModule('aiIntegration');
            }
            AppState.aiIntegration = new AIIntegration();
        }
        
        const formResult = await AppState.pdfReader.detectFormFields();
        
        if (!formResult.success || formResult.count === 0) {
            showToast('No se encontraron campos de formulario', 'warning');
            hideLoading();
            return;
        }
        
        const fillResult = await AppState.aiIntegration.autoFillForm(formResult.fields);
        
        if (fillResult.success) {
            // Aplicar los valores sugeridos por la IA a los campos
            for (const [fieldName, value] of Object.entries(fillResult.fieldValues)) {
                const input = document.querySelector(`input[data-field-name="${fieldName}"]`);
                if (input) {
                    input.value = value;
                }
            }
            showToast('Campos rellenados con IA exitosamente', 'success');
        } else {
            throw new Error(fillResult.error);
        }
    } catch (error) {
        console.error('Error auto-filling with AI:', error);
        showToast('Error al auto-rellenar con IA: ' + error.message, 'error');
    } finally {
        hideLoading();
    }
}

// IA
function loadAIConfig() {
    // API Key ya integrada en el módulo, no necesita configuración manual
    console.log('ℹ️ API Key de IA ya está integrada en el sistema');
}

async function saveAPIKey() {
    const apiKey = document.getElementById('openaiKey').value.trim();
    
    if (!apiKey) {
        showToast('Por favor ingresa una API Key', 'warning');
        return;
    }
    
    if (!AppState.aiIntegration) {
        AppState.aiIntegration = new AIIntegration();
    }
    
    AppState.aiIntegration.setAPIKey(apiKey);
    showToast('API Key actualizada correctamente', 'success');
}

async function generateWithAI() {
    const prompt = document.getElementById('aiPrompt').value.trim();
    
    if (!prompt) {
        showToast('Por favor describe lo que quieres crear', 'warning');
        return;
    }
    
    // Inicializar IA si no existe
    if (!AppState.aiIntegration) {
        try {
            if (!window.AIIntegration) {
                await loadModule('aiIntegration');
            }
            AppState.aiIntegration = new AIIntegration();
        } catch (error) {
            showToast('Error inicializando IA', 'error');
            return;
        }
    }
    
    showLoading('Generando con IA...');
    
    try {
        const result = await AppState.aiIntegration.generatePDFContent(prompt);
        
        if (result.success) {
            document.getElementById('aiResult').innerHTML = `
                <h4>Contenido Generado:</h4>
                <pre style="white-space: pre-wrap;">${JSON.stringify(result.content, null, 2)}</pre>
            `;
            showToast('Contenido generado exitosamente', 'success');
        } else {
            throw new Error(result.error);
        }
    } catch (error) {
        console.error('Error generating with AI:', error);
        showToast('Error al generar con IA: ' + error.message, 'error');
    } finally {
        hideLoading();
    }
}

// Guardar y exportar
async function savePDF() {
    if (!AppState.pdfCreator && !AppState.pdfEditor) {
        showToast('No hay documento para guardar', 'warning');
        return;
    }
    
    showLoading('Guardando PDF...');
    
    try {
        let pdfBytes;
        
        if (AppState.currentMode === 'create') {
            const result = await AppState.pdfCreator.savePDF();
            pdfBytes = result.bytes;
        } else if (AppState.currentMode === 'edit') {
            const result = await AppState.pdfEditor.save();
            pdfBytes = result.bytes;
        }
        
        const saveResult = await ipcRenderer.invoke('save-file-dialog', {
            filters: [{ name: 'PDF', extensions: ['pdf'] }]
        });
        
        if (!saveResult.canceled && saveResult.filePath) {
            await ipcRenderer.invoke('write-file', saveResult.filePath, pdfBytes);
            AppState.unsavedChanges = false;
            showToast('PDF guardado exitosamente', 'success');
        }
    } catch (error) {
        console.error('Error saving PDF:', error);
        showToast('Error al guardar el PDF', 'error');
    } finally {
        hideLoading();
    }
}

async function exportPDF() {
    await savePDF();
}

// Utilidades UI
function openModal(modalId) {
    document.getElementById(modalId).classList.add('active');
}

function closeModal(modalId) {
    document.getElementById(modalId).classList.remove('active');
}

function showLoading(message = 'Cargando...') {
    const overlay = document.getElementById('loadingOverlay');
    overlay.querySelector('p').textContent = message;
    overlay.classList.remove('hidden');
}

function hideLoading() {
    document.getElementById('loadingOverlay').classList.add('hidden');
}

function showToast(message, type = 'info') {
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.textContent = message;
    document.body.appendChild(toast);
    
    setTimeout(() => {
        toast.remove();
    }, 3000);
}

// Cargar módulos dinámicamente
async function loadModule(moduleName) {
    return new Promise((resolve, reject) => {
        const script = document.createElement('script');
        script.src = `src/modules/${moduleName}.js`;
        script.onload = () => resolve();
        script.onerror = () => reject(new Error(`Failed to load ${moduleName}`));
        document.body.appendChild(script);
    });
}

// Exponer funciones globales necesarias
window.showNewPDFOptions = showNewPDFOptions;
window.openExistingPDF = openExistingPDF;
window.createPDFFromTemplate = createPDFFromTemplate;
