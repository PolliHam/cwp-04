const net = require('net');
const fs = require('fs');
const crypto = require('crypto');
require('dotenv').config();
const port = 8124;
const MAX_CONNECTIONS = parseInt(process.env.MAX_CONNECTIONS);
let connections = 0;

process.on('uncaughtException', function (err)
{
    console.log('close');
});

const server = net.createServer((client) => {
    connections++;

    console.log('Client connected');
    client.setEncoding('utf8');

    client.id = Date.now();
    client.log = fs.createWriteStream('client'+client.id+'.txt');
    client.ACK = false;
    client.FILES = false;
    client.REMOTE = false;
    client.dir = process.env.DEFAULT_DIR + client.id+"\\";
    check_connection(client);
    client.on('data', (data) => {
        if (data === 'FILES')
        {
            fs.mkdir(client.dir, ()=>{});
            print(client, data+'\n');
            client.FILES= true;
            client.write('ACK');
        }
        else if(data === 'REMOTE'){
            print(client, data+'\n');
            client.REMOTE= true;
            client.write('ACK');
        }
        else if (data === 'QA') {
            print(client, data + '\n');
            client.ACK = true;
            client.write('ACK');
        }


        else if(client.FILES){
            print(client,'Client: '+ data+'\n');
            let parts = data.split('|CONTENT_FILE|');
            let file = fs.createWriteStream(client.dir+parts[0]);
            file.write(parts[1]);
            file.close();
            client.write('NEXT');
            print(client, 'Server: NEXT \n');
        }
        else if(client.REMOTE)
        {
            const arg = data.split(' ');
            switch (arg[0]) {
                case 'COPY':
                    console.log('COPY');
                    fs.createReadStream(arg[1]).pipe( fs.createWriteStream(arg[2]));
                    print(client, 'COPY OK');
                    client.write('OK');
                    break;

                case 'ENCODE':
                    const cipher = crypto.createCipher('aes192', arg[3]);
                    fs.createReadStream(arg[1]).pipe(cipher).pipe(fs.createWriteStream(arg[2]));
                    print(client, 'ENCODE OK');
                    client.write("OK");
                    break;

                case 'DECODE':
                    const decipher = crypto.createDecipher('aes192', arg[3]);
                    fs.createReadStream(arg[1]).pipe(decipher).pipe(fs.createWriteStream(arg[2]));
                    print(client, 'DECODE OK');
                    client.write("OK");
                    break;
            }
        }
        else if(client.ACK){
            print(client,'Client: '+ data+'\n');
            let rand = Math.random()*4;
            rand = Math.ceil(rand);
            client.write(rand.toString());
            print(client, 'Server: '+rand+'\n');
        }
        else
        {
            client.write('DEC');
        }
    });

    client.on('close', () => {
        console.log('Client ' + client.id + ' disconnected');
        connections--;
    });

});

server.listen(port, () => {
    console.log('Server listening on localhost:'+port);
});

function print(client,data) {
    client.log.write(data);
    console.log(data);
}

function check_connection(client) {
    if(connections>MAX_CONNECTIONS){
        print(client, 'connection limit exceeded');
        client.write('DEC');
    }
}