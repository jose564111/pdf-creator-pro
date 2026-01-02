require('dotenv').config();
const { app, BrowserWindow, ipcMain, dialog } = require('electron');
const path = require('path');
const fs = require('fs').promises;

let mainWindow;

function createWindow() {
    mainWindow = new BrowserWindow({
        width: 1400,
        height: 900,
        minWidth: 1000,
        minHeight: 700,
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false,
            enableRemoteModule: true,
            preload: path.join(__dirname, 'preload.js')
        },
        icon: path.join(__dirname, 'build', 'icon.ico'),
        show: false,
        backgroundColor: '#ecf0f1'
    });

    mainWindow.loadFile('index.html');

    // Mostrar ventana cuando esté lista
    mainWindow.once('ready-to-show', () => {
        mainWindow.show();
    });

    // DevTools en desarrollo
    if (process.argv.includes('--dev')) {
        mainWindow.webContents.openDevTools();
    }

    mainWindow.on('closed', () => {
        mainWindow = null;
    });
}

app.whenReady().then(() => {
    createWindow();

    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) {
            createWindow();
        }
    });
});

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

// IPC Handlers

// Abrir diálogo de archivo
ipcMain.handle('open-file-dialog', async () => {
    const result = await dialog.showOpenDialog(mainWindow, {
        properties: ['openFile'],
        filters: [
            { name: 'PDF Files', extensions: ['pdf'] },
            { name: 'All Files', extensions: ['*'] }
        ]
    });
    return result;
});

// Guardar diálogo de archivo
ipcMain.handle('save-file-dialog', async (event, options = {}) => {
    const result = await dialog.showSaveDialog(mainWindow, {
        defaultPath: 'documento.pdf',
        filters: options.filters || [
            { name: 'PDF Files', extensions: ['pdf'] }
        ]
    });
    return result;
});

// Leer archivo
ipcMain.handle('read-file', async (event, filePath) => {
    try {
        const data = await fs.readFile(filePath);
        return data.buffer;
    } catch (error) {
        console.error('Error reading file:', error);
        throw error;
    }
});

// Escribir archivo
ipcMain.handle('write-file', async (event, filePath, data) => {
    try {
        await fs.writeFile(filePath, Buffer.from(data));
        return { success: true };
    } catch (error) {
        console.error('Error writing file:', error);
        throw error;
    }
});

// Mostrar mensaje
ipcMain.handle('show-message', async (event, options) => {
    const result = await dialog.showMessageBox(mainWindow, options);
    return result;
});

// Obtener ruta de la aplicación
ipcMain.handle('get-app-path', () => {
    return app.getPath('userData');
});

// Obtener API key de OpenAI desde variables de entorno
ipcMain.handle('get-openai-api-key', () => {
    return process.env.OPENAI_API_KEY || '';
});

// Handle de errores no capturados
process.on('uncaughtException', (error) => {
    console.error('Uncaught Exception:', error);
});

process.on('unhandledRejection', (error) => {
    console.error('Unhandled Rejection:', error);
});

