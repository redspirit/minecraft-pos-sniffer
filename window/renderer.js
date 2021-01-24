const { ipcRenderer } = require('electron');
const $ = jQuery = require("jquery");


ipcRenderer.on('update-position', (e, params) => {

    $('#pos-x').html(params.position[0]);
    $('#pos-y').html(params.position[1]);
    $('#pos-z').html(params.position[2]);

});

$('#start-proxy').on('click', function () {

    let port = +$('#form-port').val();
    let server = $('#form-server').val();
    let remoteHost = server.split(':')[0];
    let remotePort = +server.split(':')[1];

    ipcRenderer.invoke('start-proxy', {port, remoteHost, remotePort}).then((params) => {
        alert('Прокси запущен');
    });

});

