const { app, dialog } = require('electron');

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

function getVersion() {
	return app.getVersion();
}

module.exports = {
	handleFileOpen: handleFileOpen,
	getVersion: getVersion
}