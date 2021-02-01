const { app, BrowserWindow, ipcMain } = require('electron');

const mcProxy = require('./mc_proxy');

let win = null;

function createWindow () {
    win = new BrowserWindow({
        width: 300,
        height: 300,
        webPreferences: {
            nodeIntegration: true
        },
        //frame: false
    });

    win.loadFile('window/index.html');

    win.setMenu(null);

    //win.webContents.openDevTools();

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

    mcProxy.start(params.port, params.remoteHost, params.remotePort, '1.16.5',(err, data) => {
        win.webContents.send(data.name, data.data);
    });

});

