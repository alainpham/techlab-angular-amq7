import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-dummy',
  templateUrl: './dummy.component.html',
  styleUrls: ['./dummy.component.css']
})
export class DummyComponent implements OnInit {

  constructor() { }

  receivedMsg = [];
  tobeSentMsg = 'toBeSent';
  amqpclient = require('rhea');
  amqpsender = null;

  onMsg(context) {
    this.receivedMsg.push(context.message.body);
    console.log(context.message.body);
  }

  sendMsg() {
    this.amqpsender.send({'body': this.tobeSentMsg});
  }

  ngOnInit() {
    const server = 'ws://localhost:5672';
    this.amqpclient.on('message', this.onMsg.bind(this));
    const ws = this.amqpclient.websocket_connect(WebSocket);
    const connection = this.amqpclient.connect({'connection_details': ws(server, ['binary', 'AMQPWSB10', 'amqp']), 'reconnect': true});
    connection.open_receiver('examples');
    this.amqpsender = connection.open_sender('examples');
  }

}
