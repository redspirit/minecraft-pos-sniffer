const proxy = require("node-tcp-proxy");
const mc = require('minecraft-protocol');

// const remoteServer = 'dog.satoko.org';

let parser = null;
let parser2 = null;
let oldPos = '';

module.exports.start = (port = 9000, remoteServer = 'localhost', remotePort = 25565, version = '1.16.5', callback) => {

    proxy.createProxy(port, remoteServer, remotePort, {
        upstream: (context, data) => {
            handleDataToServer(data, callback);
            return data;
        },
        downstream: (context, data) => {
            handleDataToClient(data, callback);
            return data;
        }
    });

    parser = mc.createDeserializer({
        state: mc.states.PLAY,
        isServer: true,
        version
    });

    parser2 = mc.createDeserializer({
        state: mc.states.PLAY,
        isServer: false,
        version
    });

    console.log(`Proxy started...`);

};
module.exports.stop = () => {


};

function handleDataToClient(buffer, callback) {

    try {
        let result = parser2.parsePacketBuffer(buffer.slice(2)).data;

        //console.log(result.name);

        if(result.name === 'update_time') {
            let time = (result.params.time[1] % 24000) / 100;
            callback(null, {name: 'update-time', data: time});
        }

        // if(result.name.indexOf('spawn') > -1) {
        //     console.log(result);
        // }


    } catch (e) {

    }

};

function handleDataToServer(buffer, callback) {

    try {
        let result = parser.parsePacketBuffer(buffer.slice(2)).data;
        //console.log(result.name);

        if(result.name = 'vehicle_move') {

            if(!result.params.x)
                return false;

            let p = {
                x: Math.round(result.params.x),
                y: Math.round(result.params.y),
                z: Math.round(result.params.z)
            }

            let strPos = Object.values(p).join(',');
            if(strPos !== oldPos) {
                callback(null, {name: 'update-position', data: p});
                oldPos = strPos;
            }

        }

        if(result.name === 'position') {

            let p = {
                x: Math.round(result.params.x),
                y: Math.round(result.params.y),
                z: Math.round(result.params.z)
            }

            let strPos = Object.values(p).join(',');
            if(strPos !== oldPos) {
                callback(null, {name: 'update-position', data: p});
                oldPos = strPos;
            }

        }

    } catch (e) {

    }

}
