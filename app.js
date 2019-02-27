var express = require('express');
var app = express();
var fs = require("fs");
const csv = require('fast-csv');
const bodyParser = require('body-parser');
var server = app.listen(4000, function () {
    console.log("listening to port 4000");
});
var io = require('socket.io').listen(server);
var path = require("path");
app.use(express.static(__dirname + '/public'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended: true
}));
var arr;
var end, name, size;
var sub, pre, obj;
var graphname;
class Server {
    receiveData() {
        var _this = this;
        io.on('connection', function (socket) {
            console.log("connection established");
            socket.on('sendData', obj => {
                arr = obj['arr'];
                //console.log(arr);

            });

            socket.emit('start', {
                response: 'iam ready to accept'
            });
            socket.on('metaData', obj => {
                size = obj['size'];
                name = obj['name'];
                var start = obj['start'];
                socket.emit('data', {
                    start: start
                });
                socket.on('sendingChunk', obj => {
                    let data = obj['data'];
                    var start = obj['start'];
                    fs.appendFile(path.join(__dirname + "/server/upload/" + name), data, err => {});

                    if (start >= size) {
                        socket.emit('complted', {
                            'msg': "completed"
                        });
                        //socket.end();
                    } else {
                        socket.emit("data", {
                            start: start
                        });
                    }

                    _this.createTriple(name);

                });
            });
        });
    }
    createTriple(name) {
        app.post("/", (req, res) => {
            graphname = req.body.graph;
            console.log(graphname);
            res.json({
                ok: false
            });
        })
        app.post('/getTriples', (req, res) => {
            //var graphname = req.body.graph;
            var subject = req.body.subject;
            var predicate = req.body.predicate;
            var object = req.body.object;
            console.log(subject);
            console.log(predicate);
            console.log(object);
            res.json({
                ok: false
            });

            var arr1 = new Array();
            var arr2 = new Array();
            csv.fromPath('./server/upload/' + name).on("data", function (data) {
                var len = data.length;
                arr2 = data.map(function (v) {
                    return v.split('\n');

                })
                arr1.push(arr2);
            }).on("end", function () {
                //console.log(arr1);
                for (var j = 0; j < arr2.length; j++) {
                    if (subject == arr1[0][j]) {
                        var subval = j;
                        console.log("Subject column : " + subval);
                    }

                }
                var subTriple, preTriple, objTriple, writeStream;
                var triplefile = name.replace('.csv', '');
                if (graphname == '') {
                    writeStream = fs.createWriteStream('./server/' + triplefile + '.nt');
                } else {
                    writeStream = fs.createWriteStream('./server/' + triplefile + '.nq');
                }


                for (var i = 1; i < arr1.length; i++) {
                    console.log("Subject Triple");
                    subTriple = object[subval] + '/' + subject + '#' + arr1[i][subval];
                    console.log(subTriple);

                    for (var k = 0; k < predicate.length; k++) {
                        if (predicate[k] == '') {
                            preTriple = 'http:www.DefaultSunaina.com/' + arr1[0][k];
                        } else {
                            preTriple = predicate[k];
                        }

                        console.log("Predicate triple : " + preTriple);
                        if (object[k] == '') {
                            objTriple = '\"' + arr1[i][k] + '\"';
                        } else {
                            objTriple = object[k] + '/' + encodeURIComponent(arr1[i][k]);
                        }

                        console.log("Object triples : " + objTriple);
                        console.log("     ");
                        if (graphname == '') {
                            if (object[k] == '') {
                                var output = '<' + subTriple + '>' + ' ' + '<' + preTriple + '>' + ' ' + objTriple + '.';
                            } else {
                                var output = '<' + subTriple + '>' + ' ' + '<' + preTriple + '>' + ' ' +
                                    '<' + objTriple + '>' + '.';
                            }

                        } else {
                            if (object[k] == '') {
                                var output = '<' + subTriple + '>' + ' ' + '<' + preTriple + '>' + ' ' + objTriple +
                                    ' ' + '<' + graphname + '>' + '.';
                            } else {
                                var output = '<' + subTriple + '>' + ' ' + '<' + preTriple + '>' + ' ' + '<' + objTriple + '>' +
                                    ' ' + '<' + graphname + '>' + '.';
                            }

                        }
                        //writeStream.end();
                        writeStream.write(output);
                        writeStream.write("\n");
                    }
                    writeStream.write("\n");
                }
                writeStream.end();
                console.log("Triples created successfully");
            });
        });

    }
}
var s = new Server();
s.receiveData();