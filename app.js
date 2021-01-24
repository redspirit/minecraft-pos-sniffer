const proxy = require("node-tcp-proxy");
const mc = require('minecraft-protocol');

const snifferPort = 9000;
// const remoteServer = 'dog.satoko.org';
const remoteServer = 'localhost';
const remotePort = 25565;
const version = '1.16.5';

proxy.createProxy(snifferPort, remoteServer, remotePort, {
    upstream: (context, data) => {
        handleData(true, data);
        return data;
    },
    downstream: (context, data) => {
        return data;
    }
});
console.log(`Proxy started on ${snifferPort}`);

let parser = mc.createDeserializer({
    state: mc.states.PLAY,
    isServer: true,
    version
});

let oldPos = '';

function handleData(toServer, buffer) {

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
                console.log(`X=${p[0]}, Y=${p[1]}, Z=${p[2]}`);
                oldPos = strPos;
            }

        }

    } catch (e) {

    }

}
