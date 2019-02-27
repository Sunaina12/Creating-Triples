var size, name, start, end = 10;
class Client {
    createUi() {
        var form = document.createElement('form');
        form.id = 'myform';
        form.enctype = 'multipart/form-data';
        form.method = 'POST';
        form.action = '/';
        document.body.appendChild(form);

        var l1 = document.createElement('Label');
        l1.innerHTML = "Graph Name : ";
        form.appendChild(l1);

        var t1 = document.createElement('input');
        t1.type = 'text';
        t1.id = 'mytextbox';
        t1.name = 'graph';
        form.appendChild(t1);

        var br = document.createElement('br');
        form.appendChild(br);

        var file = document.createElement('input');
        file.type = 'file';
        file.id = 'myfile';
        form.appendChild(file);

        var b1 = document.createElement('input');
        b1.type = 'button';
        b1.id = 'submit';
        b1.value = 'submit';
        form.appendChild(b1);
    }
    validateFile() {
        var _this = this;
        var uploadid = document.getElementById("submit");
        var fileInput = document.getElementById("myfile");


        uploadid.addEventListener('click', function (e) {
            var ofile = fileInput.files[0];
            var regex = /^([a-zA-Z0-9\s_\\.\-:])+(.csv|.txt)$/;
            if (regex.test(fileInput.value)) {
                var reader = new FileReader();
                reader.onload = function (e) {

                    var rows = e.target.result.split("\n");
                    var cells = rows[0].split(",");
                    var arr = [];
                    for (var j = 0; j < cells.length; j++) {
                        arr.push(cells[j]);
                    }
                    //console.log(arr);
                    _this.responseUi(arr);
                    _this.sendGraph('/', $("#myform"));
                    var socket = io.connect('http://localhost:4000');
                    socket.emit('sendData', {
                        arr: arr
                    });

                    socket.on('start', function (e) {
                        //console.log(e);
                        socket.emit('metaData', {
                            size: rows.length,
                            name: ofile.name,
                            start: 0
                        })
                    });

                    socket.on('data', obj => {
                        let start = obj['start'];
                        socket.emit('sendingChunk', {
                            data: (rows.slice(start, start + end)).join('\n'),
                            start: start + end
                        });
                        start += end;
                    });

                    socket.on('complted', function (d) {});

                }
                reader.readAsBinaryString(ofile);
            } else {
                alert('please upload a valid csv or tsv file');

            }

        });
    }

    responseUi(a) {
        var option, pre, ob;
        var _this = this;
        var parent_div = document.getElementById("print");
        var div = document.createElement('form');
        div.setAttribute('id', 'tripleForm');
        parent_div.appendChild(div);
        document.body.appendChild(div);

        function breakElement(div) {
            var br = document.createElement('br');
            div.append(br);
        }
        breakElement(div);

        var l1 = document.createTextNode('Subject : ');
        div.append(l1);

        var sub = document.createElement("select");
        sub.name = "subject";
        sub.id = "sel"
        div.append(sub);
        //console.log(sub);

        a.forEach(name => {
            option = new Option(name, name, false, false);
            sub.append(option);
        })
        breakElement(div);

        var l2 = document.createTextNode('Predicate : ');
        div.append(l2);
        breakElement(div);
        a.forEach(name => {
            div.append(name)
            pre = document.createElement("input");
            pre.type = "text";
            pre.id = "pre";
            pre.name = 'predicate';
            div.append(pre);
            breakElement(div);
        });
        var l3 = document.createTextNode('Object : ');
        div.append(l3);
        breakElement(div);
        breakElement(div);
        a.forEach(name => {
            div.append(name);
            ob = document.createElement("input");
            ob.type = "text";
            ob.id = "ob";
            ob.name = 'object';
            div.append(ob);
            breakElement(div);
        });
        breakElement(div);

        var button1 = document.createElement("input");
        button1.type = "button";
        button1.id = "button1";
        button1.value = "Get Triples";
        div.append(button1);
        document.getElementById('button1').addEventListener('click', function () {
            _this.sendTriples('/getTriples', $("#tripleForm"));
        })


    }
    sendGraph(url, id) {
        $(document).ready(() => {
            var form = id;
            $.ajax({
                method: 'post',
                url: '/',
                data: form.serialize()
            }).done(function (data) {
                //console.log(data);
                console.log("Request End")
            });

        });
    }
    sendTriples(url, id) {
        $(document).ready(() => {
            var form = id;
            $.ajax({
                method: 'post',
                url: '/getTriples',
                data: form.serialize()
            }).done(function (data) {
                //console.log(data);
                console.log("Request End")
            });

        });

    }

    

}
var c = new Client();
c.createUi();
c.validateFile();