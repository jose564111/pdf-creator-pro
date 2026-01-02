const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
    getOpenAIKey: () => ipcRenderer.invoke('get-openai-api-key'),
    openFileDialog: () => ipcRenderer.invoke('open-file-dialog'),
    saveFileDialog: (options) => ipcRenderer.invoke('save-file-dialog', options),
    readFile: (filePath) => ipcRenderer.invoke('read-file', filePath),
    writeFile: (filePath, data) => ipcRenderer.invoke('write-file', filePath, data),
    showMessage: (options) => ipcRenderer.invoke('show-message', options),
    getAppPath: () => ipcRenderer.invoke('get-app-path')
});
