const { app, BrowserWindow, ipcMain, shell } = require('electron');
const path = require('path');
const backEndApp = require('./app/backend/expressMain');
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
    backEndApp.start();
    createWindow();
    
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