const mc = require('minecraft-protocol')

const states = mc.states

const args = process.argv.slice(2)
let host = 'localhost'
let port = 25565
let version = '1.16.5'


if (host.indexOf(':') !== -1) {
    port = host.substring(host.indexOf(':') + 1)
    host = host.substring(0, host.indexOf(':'))
}

const srv = mc.createServer({
    'online-mode': false,
    port: 9000,
    keepAlive: false,
    version: version
})
srv.on('login', function (client) {
    const addr = client.socket.remoteAddress
    console.log('Incoming connection', '(' + addr + ')')
    let endedClient = false
    let endedTargetClient = false
    client.on('end', function () {
        endedClient = true
        console.log('Connection closed by client', '(' + addr + ')')
        if (!endedTargetClient) { targetClient.end('End') }
    })
    client.on('error', function (err) {
        endedClient = true
        console.log('Connection error by client', '(' + addr + ')')
        console.log(err.stack)
        if (!endedTargetClient) { targetClient.end('Error') }
    })
    const targetClient = mc.createClient({
        host: host,
        port: port,
        username: client.username,
        keepAlive: false,
        version: version
    })
    client.on('packet', function (data, meta) {
        if (targetClient.state === states.PLAY && meta.state === states.PLAY) {

            if(meta.name === 'position') {

                //console.log('meta', meta);

                //console.log('client->server:', client.state + '.' + meta.name + ' :', data)

            }

            if (!endedTargetClient) { targetClient.write(meta.name, data) }
        }
    })
    targetClient.on('packet', function (data, meta) {
        if (meta.state === states.PLAY && client.state === states.PLAY) {

            // console.log('client<-server:',
            //     targetClient.state + '.' + meta.name + ' :' +
            //     JSON.stringify(data))

            if (!endedClient) {
                client.write(meta.name, data)
                if (meta.name === 'set_compression') {
                    client.compressionThreshold = data.threshold
                } // Set compression
            }
        }
    })
    const bufferEqual = require('buffer-equal')
    targetClient.on('raw', function (buffer, meta) {
        if (client.state !== states.PLAY || meta.state !== states.PLAY) { return }
        const packetData = targetClient.deserializer.parsePacketBuffer(buffer).data.params
        const packetBuff = client.serializer.createPacketBuffer({ name: meta.name, params: packetData })
        if (!bufferEqual(buffer, packetBuff)) {
            console.log('client<-server: Error in packet ' + meta.state + '.' + meta.name)
            console.log('received buffer', buffer.toString('hex'))
            console.log('produced buffer', packetBuff.toString('hex'))
            console.log('received length', buffer.length)
            console.log('produced length', packetBuff.length)
        }
        /* if (client.state === states.PLAY && brokenPackets.indexOf(packetId.value) !=== -1)
         {
         console.log(`client<-server: raw packet);
         console.log(packetData);
         if (!endedClient)
         client.writeRaw(buffer);
         } */
    })
    client.on('raw', function (buffer, meta) {
        if (meta.state !== states.PLAY || targetClient.state !== states.PLAY) { return }

        console.log('>>>', buffer);
        const packetData = client.deserializer.parsePacketBuffer(buffer).data.params;
        console.log('>>>', packetData);

        const packetBuff = targetClient.serializer.createPacketBuffer({ name: meta.name, params: packetData });
        if (!bufferEqual(buffer, packetBuff)) {
            console.log('client->server: Error in packet ' + meta.state + '.' + meta.name)
            console.log('received buffer', buffer.toString('hex'))
            console.log('produced buffer', packetBuff.toString('hex'))
            console.log('received length', buffer.length)
            console.log('produced length', packetBuff.length)
        }
    })
    targetClient.on('end', function () {
        endedTargetClient = true
        console.log('Connection closed by server', '(' + addr + ')')
        if (!endedClient) { client.end('End') }
    })
    targetClient.on('error', function (err) {
        endedTargetClient = true
        console.log('Connection error by server', '(' + addr + ') ', err)
        console.log(err.stack)
        if (!endedClient) { client.end('Error') }
    })
})
