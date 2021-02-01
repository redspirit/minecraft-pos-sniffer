const { ipcRenderer } = require('electron');
const $ = jQuery = require("jquery");

let px = 0;
let py = 0;
let pz = 0;


let getClass = (p1, p2) => {
    if(p1 > p2) return 'color-green';
    if(p1 < p2) return 'color-red';
    return '';
};

ipcRenderer.on('update-position', (e, p) => {

    $('#pos-x').html(p.x).removeClass(['color-red', 'color-green']).addClass(getClass(p.x, px));
    $('#pos-y').html(p.y).removeClass(['color-red', 'color-green']).addClass(getClass(p.y, py));
    $('#pos-z').html(p.z).removeClass(['color-red', 'color-green']).addClass(getClass(p.z, pz));

    if(p.x !== px) px = p.x;
    if(p.y !== py) py = p.y;
    if(p.z !== pz) pz = p.z;

});

ipcRenderer.on('update-time', (e, time) => {

    let text = '';
    if(time > 0 && time < 60) text = 'утро';
    if(time > 60 && time < 120) text = 'день';
    if(time > 120 && time < 180) text = 'вечер';
    if(time > 180) text = 'ночь';


    let num = ((time + 60) % 240) / 10;

    let hours = Math.trunc(num);
    let mins = Math.round((num - hours) * 60 - 1);

    if(hours < 10) hours = `0${hours}`;
    if(mins < 10) mins = `0${mins}`;

    $('#time-num').html(`${hours}:${mins}`);
    $('#time-text').html(text);


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

