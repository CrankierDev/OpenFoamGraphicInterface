var { app, BrowserWindow } = require('electron');
var { PythonShell } = require('python-shell');
var path = require('path');

var dirname = __dirname;

function createWindow() {
    const window = new BrowserWindow({
        width: 1200,
        height: 600,
        webPreferences: {
          preload: path.join(__dirname, 'preload.js'),
          nodeIntegration: true,
          contextIsolation: false
        }
        // Here we can indicate some other options like a preloader 
    });

    window.loadFile('index.html');
    window.webContents.openDevTools();
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
