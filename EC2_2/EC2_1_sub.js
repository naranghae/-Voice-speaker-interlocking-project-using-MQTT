var mqtt = require('mqtt');
const request = require('request')

var urll = 'http://210.107.205.200:8080/api/wkcBD-lTULsGrCJ2hqZZqgeQsfathjs6zc3Rul1O/lights/16/state'

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
    
client.subscribe("philips");
    
client.on('message', (topic, message, packet) => {
    console.log("message is "+ message);
    console.log("topic is "+ topic);
    if(message=="on"){
        console.log('on')
        request({   
            url: urll,    //16번 그룹 전등 제어
            method: 'PUT',
            body: JSON.stringify({"on":true})  //on : ture 켜기, on : false 끄기
        })
    }
    else if(message=="off"){
        console.log('off')
        request({   
            url: urll,    //16번 그룹 전등 제어
            method: 'PUT',
            body: JSON.stringify({"on":false})  //on : ture 켜기, on : false 끄기
        })
    }
    //client.end()
})


console.log("Server Created...");

