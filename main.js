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
          contextIsolation: true,
          enableRemoteModule: true,
        }
    });

    ipcMain.handle('dialog:openDirectory', handleFileOpen);

    mainWindow.loadFile('app/index.html');
    mainWindow.webContents.openDevTools();
    mainWindow.maximize();
    require('electron-reload')(__dirname, {
        electron: path.join(__dirname, 'node_modules', '.bin', 'electron')
    });
}

app.whenReady().then( () => {
    startBackend();
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


function startBackend() {
    const backEndApp = require('child_process')
        .spawn('node',[path.join(__dirname, './app/backend/expressMain.js')])

    console.log('Executing Express backend');

    backEndApp.stdout.on('data', (msg) => {
        console.log('Express response: ', msg.toString('utf8'));
    });

    backEndApp.stderr.on('data', (data) => {
        console.error(`stderr: ${data}`);
    });

    backEndApp.on('close', (code) => {
        console.log(`child process exited with code ${code}`);
    });
}
