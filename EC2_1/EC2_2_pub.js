var express =  require('express');
var request = require('request')
var app = express();
var http = require('http');
const mqtt = require('mqtt');
const WebSocket = require('ws');
//var logger = require('fluent-logger')
var path = require('path');
var fs = require('fs'); // 파일 읽기, 쓰기 등 을 할 수 있는 모듈
app.use(express.static(path.join(__dirname, 'public')));
const wss = new WebSocket.Server({ port: 8000 });
var state = 0;
var st;
const options = {
        host: '15.164.233.165',
        port: 1883,
        protocol: 'mqtt',
        username:"chanyoung",
        password:"chanyoung"
    }
      
const client = mqtt.connect(options);

client.on("connect", () => {	
        console.log("connected : "+ client.connected);
})
    
client.on("error", (error) => { 
        console.log("Can't connect : " + error);
})


wss.on("connection", function (ws) {
        var temp_status = null
        setInterval(() => {
                if (temp_status != st) {
                        console.log("temp_status : ", st)
                        ws.send(st.toString());
                   /*
        index.html에서  
                ws.onmessage = function (event) {
                        console.log("Server message: ", event.data); //
                }
        위의 코드로 가는데 event로 받게 되고 event.data가 temp가 된다.
      */
                        temp_status = st;
                }
        }, 500);
      
});

app.get("/", function(req, res){
        res.writeHead(200,{"Content-Type":"text/html"});
        fs.createReadStream("./index.html").pipe(res);
})

app.post("/on", function(req, res){
        console.log('on')
        client.publish("philips", "on")
        res.redirect('/');
})

app.post("/off", function(req, res){
        console.log('off')
        client.publish("philips", "off")
        res.redirect('/');
})

app.post("/weather", function(req, res){
        console.log('온도')
        client.publish("temp")
        res.redirect('/');
})

client.subscribe("weather");

client.on('message', (topic, message, packet) => {
        //console.log("message1 is "+ message);
        console.log("topic is "+ topic);
        state =message;
        st = message.toString().split(',');
        console.log("message2 is "+ state);
})


http.createServer(app).listen(8080);
console.log("Server Created...");

