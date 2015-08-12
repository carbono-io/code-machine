'use strict';
var CM = require('../lib/code-manipulator');

module.exports = function (app) {

    var cm = new CM(app.options.codeDir);

    this.editAttribute = function (socket){
        socket.on('command:editAttribute',
            function (data) {
                if(!data){
                    socket.emit('error', {at: 'editAtt'});
                } else {
                    try{
                        var ok = cm.editAttribute(data);
                    }catch(e){
                        console.log('Failed at manipulator.' + e.msg);
                        socket.emit('error', {at: 'editAtt'});
                    }
                }
                if(ok){
                    socket.emit('edited', {result: 'ok'});
                }
            }
        );
    };

    this.insertElementAtXPath = function (socket){
        socket.on('command:insertElementAtXPath',
            function (data) {
                if(!data){
                    socket.emit('error', {at: 'editAtt'});
                } else {
                    try{
                        var ok = cm.insertElementAtXPath(
                            data.file,
                            data.xpath,
                            data.element
                        );
                    }catch(e){
                        console.log('Failed at manipulator.' + e.msg);
                        socket.emit('error', {at: 'editAtt'});
                    }
                }
                if(ok){
                    socket.emit('edited', {result: 'ok'});
                }
            }
        );
    };

    return this;
};