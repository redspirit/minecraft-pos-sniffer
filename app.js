const proxy = require("node-tcp-proxy");
const mc = require('minecraft-protocol');
const packetNames = require('./packet-names.js').packets;

const snifferPort = 9000;
// const remoteServer = 'dog.satoko.org';
const remoteServer = 'localhost';
const remotePort = 25565;
const version = '1.16.4';

const states = mc.states;

//return console.log(mc.supportedVersions);
// HANDSHAKING: 'handshaking',
// STATUS: 'status',
// LOGIN: 'login',
// PLAY: 'play'


proxy.createProxy(snifferPort, remoteServer, remotePort, {
    upstream: (context, data) => {

        //console.log('To server:', data);
        handleData(true, data);

        return data;
    },
    downstream: (context, data) => {

        //console.log('To client:', data);
        //handleData(false, data);

        return data;
    }
});
console.log(`Proxy started on ${snifferPort}`);


let handleData = (toServer, buffer) => {

    let parser = mc.createDeserializer({
        state: states.PLAY,
        isServer: toServer,
        //packetsToParse: {"packet": true},
        version
    });


    try {
        let result = parser.parsePacketBuffer(buffer).data;
        console.log(result);
    } catch (e) {
        console.log('oops');
    }

    // parser.on('error', (err) => {
    //     console.log('err', err);
    // });
    //
    // parser.on('data', (result) => {
    //     console.log('data', result);
    // });

};
