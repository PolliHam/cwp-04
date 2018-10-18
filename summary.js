const fs = require('fs');
const files = [];

function analysis(object_name) {
    fs.stat(object_name, (err, stats) => {
        if (stats.isDirectory()) {
            parser(object_name);
        } else {
            files.push(object_name);
        }
    })
};
function parser(dir_path){
        fs.readdir(dir_path, function (err, files) {
            for (let i = 0; i < files.length; i++) {
                analysis(dir_path + '\\' + files[i]);
            }

        });
};
module.exports = files;
module.exports.parser_file = parser;