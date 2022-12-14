var { app, BrowserWindow, dialog, ipcMain} = require('electron');
var path = require('path');

async function handleFileOpen() {
    const { canceled, filePaths } = await dialog.showOpenDialog({
        properties: ['openDirectory']
    });
    if (canceled) {
        return ;
    } else {
        return filePaths[0];
    }
}

function createWindow() {
    const mainWindow = new BrowserWindow({
        width: 800,
        height: 600,
        webPreferences: {
          preload: path.join(__dirname, 'app/preload.js'),
          nodeIntegration: true,
          contextIsolation: true
        }
    });

    ipcMain.handle('dialog:openDirectory', handleFileOpen);

    mainWindow.loadFile('app/index.html');
    // window.webContents.openDevTools();
    require('electron-reload')(__dirname, {
        electron: path.join(__dirname, 'node_modules', '.bin', 'electron')
    });
}

app.whenReady().then( () => {
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
