const {contextBridge, ipcRenderer} = require('electron');

contextBridge.exposeInMainWorld('fileAPI', {
    selectFolder: () => ipcRenderer.invoke('dialog:openDirectory')
});

contextBridge.exposeInMainWorld('variablesAPI', {
    getVersion: () => ipcRenderer.invoke('versionNumber')
});

contextBridge.exposeInMainWorld('functionsAPI', {
    getTurbulenceModelsInfo: () => ipcRenderer.invoke('getTurbulenceModelsInfo'),
    getAllSimulationsInfo: () => ipcRenderer.invoke('getAllSimulationsInfo'),
    foldersData: (mesh) => ipcRenderer.invoke('foldersData', mesh ),
    getTurbulenceModelVariables: (model) => ipcRenderer.invoke('getTurbulenceModelVariables', model ),
    getSimulationData: (simulationID) => ipcRenderer.invoke('getSimulationData', simulationID ),
    getSimulationInfo: (simulationID) => ipcRenderer.invoke('getSimulationInfo', simulationID ),
    getConstantData: (simulationID) => ipcRenderer.invoke('getConstantData', simulationID ),
    getZeroData: (simulationID) => ipcRenderer.invoke('getZeroData', simulationID ),
    getControlDictData: (simulationID) => ipcRenderer.invoke('getControlDictData', simulationID ),
    getForcesData: (simulationID) => ipcRenderer.invoke('getForcesData', simulationID ),
    getSolutionData: (simulationID) => ipcRenderer.invoke('getSolutionData', simulationID ),
    getSchemasData: (simulationID) => ipcRenderer.invoke('getSchemasData', simulationID ),
    getSimulationBoundariesData: (simulationID) => ipcRenderer.invoke('getSimulationBoundariesData', simulationID ),
    getSimulationFiles: (body) => ipcRenderer.invoke('getSimulationFiles', body ),
    deleteSimulation: (simulationID) => ipcRenderer.invoke('deleteSimulation', simulationID ),
    executeSimulation: (simulationID) => ipcRenderer.invoke('executeSimulation', simulationID ),
    plotData: (simulationID) => ipcRenderer.invoke('plotSimulationData', simulationID ),
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