const child_process = require('child_process');
const count = process.argv[2];
for(let i = 0; i<count; i++) {
    child_process.exec('node client-files.js D:\\Важно\\ПСКП\\git_tutorial\\work\\cwp-04\\1111 D:\\Важно\\ПСКП\\git_tutorial\\work\\cwp-04\\2222', (error, stdout, stderr) => {
        if (error) {
            console.error('exec error: '+error);
        }
        console.log('stdout: '+stdout);
    });
}