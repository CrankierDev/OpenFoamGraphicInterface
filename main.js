const { app, BrowserWindow, dialog, ipcMain, shell } = require('electron');
const path = require('path');
const backEndApp = require('./app/backend/expressMain');

async function handleFileOpen() {
    const { canceled, filePaths } = await dialog.showOpenDialog({
        properties: ['openDirectory']
    });
    if (canceled) {
        return null;
    } else {
        return filePaths[0] != null ? filePaths[0] : null;
    }
}

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

    ipcMain.handle('dialog:openDirectory', handleFileOpen);

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

app.on('window-all-closed', () => {
    if( process.platform !== 'darwin') {
        app.quit();
    }
});