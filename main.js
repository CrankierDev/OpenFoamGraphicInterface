const { app, BrowserWindow, ipcMain, shell } = require('electron');
const path = require('path');
const api = require('./app/backend/api');

/**
 * Creates the sandbox for the main windows of the app
 */
function createWindow() {
    const mainWindow = new BrowserWindow({
        width: 800,
        height: 600,
        webPreferences: {
            preload: path.join(__dirname, 'app/preload.js'),
            nodeIntegration: true,
            contextIsolation: true,
            enableRemoteModule: true,
        }
    });

    // Handling APIs
    ipcMain.handle('dialog:openDirectory', api.handleFileOpen);
    ipcMain.handle('versionNumber', api.getVersion);
    ipcMain.handle('startDB', api.startDB);
    ipcMain.handle('getTurbulenceModelsInfo', api.getTurbulenceModelsInfo);
    ipcMain.handle('getAllSimulationsInfo', api.getAllSimulationsInfo);
    ipcMain.handle('foldersData', (event, mesh) => {
        return api.foldersData(mesh);
    });
    ipcMain.handle('getTurbulenceModelVariables', (event, model) => {
        return api.getTurbulenceModelVariables(model)
    });
    ipcMain.handle('getSimulationData', (event, simulationID) => {
        return api.getSimulationData(simulationID);
    });
    ipcMain.handle('getSimulationInfo', (event, simulationID) => {
        return api.getSimulationInfo(simulationID);
    });
    ipcMain.handle('getConstantData', (event, simulationID) => {
        return api.getConstantData(simulationID);
    });
    ipcMain.handle('getZeroData', (event, simulationID) => {
        return api.getZeroData(simulationID);
    });
    ipcMain.handle('getControlDictData', (event, simulationID) => {
        return api.getControlDictData(simulationID);
    });
    ipcMain.handle('getForcesData', (event, simulationID) => {
        return api.getForcesData(simulationID);
    });
    ipcMain.handle('getSolutionData', (event, simulationID) => {
        return api.getSolutionData(simulationID);
    });
    ipcMain.handle('getSchemasData', (event, simulationID) => {
        return api.getSchemasData(simulationID);
    });
    ipcMain.handle('getSimulationBoundariesData', (event, simulationID) => {
        return api.getSimulationBoundariesData(simulationID);
    });
    ipcMain.handle('getSimulationFiles', async (event, body) => {
        return await api.getSimulationFiles(body);
    });
    ipcMain.handle('deleteSimulation', (event, simulationID) => {
        return api.deleteSimulation(simulationID);
    });
    ipcMain.handle('executeSimulation', async (event, simulationID) => {
        return await api.executeSimulation(simulationID);
    });

    mainWindow.loadFile('app/index.html');
    mainWindow.webContents.openDevTools();
    mainWindow.webContents.setWindowOpenHandler(({ url }) => {
        if (url.startsWith('https:')) {
            shell.openExternal(url);
        }
        return { action: 'deny' };
    });
    mainWindow.maximize();

    require('electron-reload')(__dirname, {
        electron: path.join(__dirname, 'node_modules', '.bin', 'electron')
    });
}

/**
 * Invokes the app
 */
app.whenReady().then( () => {
    // Start the express back end app
    createWindow();
    api.startDB();
    
    app.on('activate', () => {
        if( BrowserWindow.getAllWindows().length === 0){
            createWindow();
        }
    })
});

/**
 * Ensure the app closes completely when we close the windows
 */
app.on('window-all-closed', () => {
    // In a macOS (darwin) is prefereable not to completely quit the app
    if( process.platform !== 'darwin') {
        app.quit();
    }
});