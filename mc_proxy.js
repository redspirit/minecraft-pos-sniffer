const proxy = require("node-tcp-proxy");
const mc = require('minecraft-protocol');

// const remoteServer = 'dog.satoko.org';

let parser = null;
let oldPos = '';

module.exports.start = (port = 9000, remoteServer = 'localhost', remotePort = 25565, version = '1.16.5', callback) => {

    proxy.createProxy(port, remoteServer, remotePort, {
        upstream: (context, data) => {
            handleData(true, data, callback);
            return data;
        },
        downstream: (context, data) => {
            return data;
        }
    });

    parser = mc.createDeserializer({
        state: mc.states.PLAY,
        isServer: true,
        version
    });

    console.log(`Proxy started...`);

};
module.exports.stop = () => {


};

function handleData(toServer, buffer, callback) {

    try {
        let result = parser.parsePacketBuffer(buffer.slice(2)).data;
        //console.log(result);
        if(result.name === 'position') {

            let p = [
                Math.round(result.params.x),
                Math.round(result.params.y),
                Math.round(result.params.z),
            ];

            let strPos = p.join(',');
            if(strPos !== oldPos) {
                //console.log(`X=${p[0]}, Y=${p[1]}, Z=${p[2]}`);
                callback(null, p);
                oldPos = strPos;
            }

        }

    } catch (e) {

    }

}
