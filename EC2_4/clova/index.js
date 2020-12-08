const uuid = require('uuid').v4
const _ = require('lodash')
var mqtt = require('mqtt');
const { DOMAIN } = require('../config')
var state;
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
client.subscribe("tempsub");

client.on('message', (topic, message, packet) => {
  console.log("topic is "+ topic);
  state =message;
  st = message.toString().split(',');
  console.log("message1 is "+ state);
  console.log("message2 is "+ st);
})


class Directive {
  constructor({namespace, name, payload}) {
    this.header = {
      messageId: uuid(),
      namespace: namespace,
      name: name,
    }
    this.payload = payload
  }
}

class CEKRequest {
  constructor (httpReq) {
    this.request = httpReq.body.request
    this.context = httpReq.body.context
    this.session = httpReq.body.session
    console.log(`CEK Request: ${JSON.stringify(this.context)}, ${JSON.stringify(this.session)}`)
  }

  do(cekResponse) {
    switch (this.request.type) {
      case 'LaunchRequest':
        return this.launchRequest(cekResponse)
      case 'IntentRequest':
        return this.intentRequest(cekResponse)
      case 'SessionEndedRequest':
        return this.sessionEndedRequest(cekResponse)
    }
  }

  launchRequest(cekResponse) {
    console.log('launchRequest')
    client.publish("tempclover")
    cekResponse.setSimpleSpeechText('조명을 켤까요? 끌까요? 아니면 날씨를 원하시나요?')
    cekResponse.setMultiturn({
      intent: 'philipscontrol',
    })
  }

  intentRequest(cekResponse) {
    console.log('intentRequest')
    console.dir(this.request)
    const intent = this.request.intent.name
    const slots = this.request.intent.slots

    switch (intent) {
    case 'philipson':
      client.publish("philips", "on")
      cekResponse.appendSpeechText('조명을 켜겠습니다.')
      break
    case 'philipsoff':
      client.publish("philips", "off")
      cekResponse.appendSpeechText('조명을 끄겠습니다.')
      break
    case 'weather':
      cekResponse.appendSpeechText('날씨를 알려드리겠습니다.')
      cekResponse.appendSpeechText('오늘의 날씨는 '+st[0]+'도, 하늘'+st[1]+', 강수확률'+st[2]+' 입니다.')
      cekResponse.setSimpleSpeechText('오늘의 날씨는 '+st[0]+'도, 하늘'+st[1]+', 강수확률'+st[2]+'% 입니다.')
      
      break
    default:
      break
    }
    if (this.session.new == false) {
      cekResponse.setMultiturn()
    }
  }

  sessionEndedRequest(cekResponse) {
    console.log('sessionEndedRequest')
    cekResponse.setSimpleSpeechText('필립스 익스텐션을 종료합니다.')
    cekResponse.clearMultiturn()
  }
}


class CEKResponse {
  constructor () {
    console.log('CEKResponse constructor')
    this.response = {
      directives: [],
      shouldEndSession: true,
      outputSpeech: {},
      card: {},
    }
    this.version = '0.1.0'
    this.sessionAttributes = {}
  }

  setMultiturn(sessionAttributes) {
    this.response.shouldEndSession = false
    this.sessionAttributes = _.assign(this.sessionAttributes, sessionAttributes)
  }

  clearMultiturn() {
    this.response.shouldEndSession = true
    this.sessionAttributes = {}
  }

  setSimpleSpeechText(outputText) {
    this.response.outputSpeech = {
      type: 'SimpleSpeech',
      values: {
          type: 'PlainText',
          lang: 'ko',
          value: outputText,
      },
    }
  }

  appendSpeechText(outputText) {
    const outputSpeech = this.response.outputSpeech
    if (outputSpeech.type != 'SpeechList') {
      outputSpeech.type = 'SpeechList'
      outputSpeech.values = []
    }
    if (typeof(outputText) == 'string') {
      outputSpeech.values.push({
        type: 'PlainText',
        lang: 'ko',
        value: outputText,
      })
    } else {
      outputSpeech.values.push(outputText)
    }
  }
}

const clovaReq = function (httpReq, httpRes, next) {
  cekResponse = new CEKResponse()
  cekRequest = new CEKRequest(httpReq)
  cekRequest.do(cekResponse)
  console.log(`CEKResponse: ${JSON.stringify(cekResponse)}`)
  return httpRes.send(cekResponse)
};

module.exports = clovaReq;
