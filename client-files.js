const net = require('net');
const fs = require('fs');
const path = require('path');
const files = require('./summary.js');
const port = 8124;

process.argv.slice(2).forEach((dir)=>{
    files.parser_file(dir.toString());
});


const client = new net.Socket();

client.setEncoding('utf8');

client.connect(port, function() {
    client.write('FILES');
});


client.on('data', function(data) {

    if(data === 'ACK' || data === 'NEXT'){
        if (!files.length<1){
            let file_name = files.pop();
            console.log(file_name);
            fs.readFile(file_name, (err, data) => {
                if (err) {
                    console.log(err);
                } else {
                    client.write(path.basename(file_name)+ '|CONTENT_FILE|' +data );
                }
            });
        }else{
            client.destroy();
        }

    }
    else if (data === 'DEC'){
        client.destroy();
    }

});

client.on('close', function() {
    console.log('Connection closed');
});

