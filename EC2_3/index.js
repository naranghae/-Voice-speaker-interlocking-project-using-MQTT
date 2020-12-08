/* NodeJs 샘플 코드 */
var request = require('request');
const convert = require('xml-js');
var express = require('express'); // 웹 서버 사용 
var fs = require('fs') // 파일 로드 사용
var app = express(); 
var port = 8080;
var bodyparser = require('body-parser');
var path = require('path');
const mqtt = require('mqtt');
var qs = require('querystring');
var moment = require('moment');
require('moment-timezone');
moment.tz.setDefault("Asia/Seoul");
var date = moment().format('YYYYMMDD');
var hm = moment().format('HHmm');
console.log(date);
console.log(hm);
hm = hm/100;
hm = hm*100;
if(hm>=200 && hm<500) hm=0200;
if(hm>=500 && hm<800) hm=0500;
if(hm>=800 && hm<1100) hm=0800;
if(hm>=1100 && hm<1400) hm=1100;
if(hm>=1400 && hm<1700) hm=1400;
if(hm>=1700 && hm<2000) hm=1700;
if(hm>=2300 && hm<=2400 || hm>=0 && hm<200) hm=2300;
console.log(hm);
var url = 'http://apis.data.go.kr/1360000/VilageFcstInfoService/getVilageFcst';
var queryParams = '?' + encodeURIComponent('ServiceKey') + '=iP8yA3m4LgQoUV2yy%2FjVSYpxOHkdJY0M7z8sORq5iJTH9VYzkUhsSLaxqUtRKMhiloq8zvnYOvMeezGGLlfTyA%3D%3D'; /* Service Key*/
queryParams += '&' + encodeURIComponent('ServiceKey') + '=' + encodeURIComponent('-'); /* 공공데이터포털에서 받은 인증키 */
queryParams += '&' + encodeURIComponent('pageNo') + '=' + encodeURIComponent('1'); /* 페이지번호 */
queryParams += '&' + encodeURIComponent('numOfRows') + '=' + encodeURIComponent('10'); /* 한 페이지 결과 수 */
queryParams += '&' + encodeURIComponent('dataType') + '=' + encodeURIComponent('JSON'); /* 요청자료형식(XML/JSON)Default: XML */
queryParams += '&' + encodeURIComponent('base_date') + '=' + encodeURIComponent(date); /* 15년 12월 1일발표 */
queryParams += '&' + encodeURIComponent('base_time') + '=' + encodeURIComponent(hm); /* 05시 발표 */
queryParams += '&' + encodeURIComponent('nx') + '=' + encodeURIComponent('61'); /* 예보지점 X 좌표값 */
queryParams += '&' + encodeURIComponent('ny') + '=' + encodeURIComponent('120'); /* 예보지점의 Y 좌표값 */

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

client.subscribe("temp");
client.subscribe("tempclover");
client.on('message', (topic, message, packet) => {
    //console.log("message1 is "+ message);
    request({
        url: url + queryParams,
        method: 'GET'
    }, function (error, response, body) {
        let data = JSON.parse(body)
        //console.log(data.response.body.items);
        var realdata= data.response.body.items.item;
        var sol;
        var temp;
        var pop;
        var sky;
        var reh;
        realdata.forEach((element) => {
            if(element.category =='T3H') {temp= element.fcstValue;}
            if(element.category =='POP') {pop= element.fcstValue;}
            if(element.category =='SKY') {sky = element.fcstValue;}
            if(element.category =='REH') {reh= element.fcstValue;}
        });
        if(0<sky && 6> sky){sol ='맑음';}
        else if(6<sky && 9> sky){sol ='구름많음';}
        else if(9<sky && 11> sky){sol ='흐림';}
        
        //console.log(temp) 
        //console.log(status)

        var context=[temp,sol,pop,reh,date,hm]
        if(topic =="temp"){
            console.log(context)
            client.publish("weather", context.toString())
        }
        else if(topic=="tempclover"){
            client.publish("tempsub", context.toString())
        }
    });
})


app.use(express.static('public'));
app.use(bodyparser.urlencoded({extended:true}));


app.listen(port, function(){ 
    console.log('Server Start, Port : ' + port); 
});
