const { app, BrowserWindow, ipcMain } = require('electron');

const mcProxy = require('./mc_proxy');

let win = null;

function createWindow () {
    win = new BrowserWindow({
        width: 800,
        height: 600,
        webPreferences: {
            nodeIntegration: true
        }
    });

    win.loadFile('window/index.html');

    win.webContents.openDevTools();

}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit()
    }
})

app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
        createWindow()
    }
});

ipcMain.handle('start-proxy', (event, params) => {

    mcProxy.start(params.port, params.remoteHost, params.remotePort, '1.16.5',(err, position) => {
        win.webContents.send('update-position', {position});
    });

});

