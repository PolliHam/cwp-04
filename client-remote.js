const net = require('net');
const port = 8124;
let command = "";
let origAddress = "";
let copyAddress = "";
let key = "";

process.on('uncaughtException', function (err)
{
    console.log(err);
});

const client = new net.Socket();
client.setEncoding('utf8');

client.connect(port, function()
{
    command = process.argv[2];
    origAddress = process.argv[3];
    copyAddress = process.argv[4];
    key = process.argv[5];

    client.write('REMOTE');
    console.log('Connected');
});

client.on('data', function(data) {
    if(data === 'ACK' )
    {
        console.log('ACK');
        client.write(command+' '+origAddress+' '+copyAddress+' '+key);
    }
    else if(data === 'OK')
    {
        console.log('OK');
        client.destroy();
    }
    else
    {
        console.log(data);
        client.destroy();
    }
});

client.on('close', function()
{
    console.log('Connection closed');
});