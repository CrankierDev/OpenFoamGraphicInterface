const {contextBridge, ipcRenderer} = require('electron');

contextBridge.exposeInMainWorld('fileAPI', {
    selectFolder: () => ipcRenderer.invoke('dialog:openDirectory')
});

contextBridge.exposeInMainWorld('variablesAPI', {
    getVersion: () => ipcRenderer.invoke('versionNumber')
});

window.addEventListener('DOMContentLoaded', () => {
    const replaceText = (selector, text) => {
        const element = document.getElementById(selector)
        if (element) element.innerText = text
    }

    for (const type of ['chrome', 'node', 'electron']) {
        replaceText(`${type}-version`, process.versions[type])
    }
})