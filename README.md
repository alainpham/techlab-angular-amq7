# Connecting to AMQ 7 Broker (Artemis) in an Angular 5 Application with AMQP over websockets

This project shows how you can use the AMQP javascript client [rhea](https://github.com/grs/rhea) provided with AMQ 7 within an Angular 5 application.

## Prerequisites

* Have npm installed (node)
* Install [angular-cli](https://angular.io/guide/quickstart) : `npm install -g @angular/cli`

* Have AMQ 7 installed and running
	* [Download AMQ version 7.0.0+ here](https://developers.redhat.com/products/amq/download/)
	* unzip package `unzip jboss-amq-7.0.0.redhat-1-bin.zip`
	* create a test instance

			cd jboss-amq-7.0.0.redhat-1/bin
			./artemis create  --user admin --password admin --allow-anonymous Y ./../instances/eventbrk
			cd ./../instances/eventbrk/bin
			./artemis run

## Tutorial steps

* Create a new angular project : `ng new techlab-angular-amq7`
* Go to project root : `cd techlab-angular-amq7`
* Install rhea node module : `npm install rhea --save`
* Edit src/tsconfig.app.json

* Create a dummy component : `ng generate component dummy`
* Edit the file src/app/dummy/dummy.component.ts as follows:
	```
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
	```

* To enable the `require('rhea')` used in the dummy component instructions edit the file as src/tsconfig.app.json (add node to the types):
	```
	{
	  "extends": "../tsconfig.json",
	  "compilerOptions": {
	    "outDir": "../out-tsc/app",
	    "baseUrl": "./",
	    "module": "es2015",
	    "types": ["node"]
	  },
	  "exclude": [
	    "test.ts",
	    "**/*.spec.ts"
	  ]
	}
	```

* Edit the src/app/dummy/dummy.component.html with the following content

	```
	<h2>Sending message</h2>
	<input [(ngModel)]="tobeSentMsg">
	<button (click)="sendMsg()">Send Message</button>

	<h2>Received message</h2>
	<pre>{{receivedMsg | json}}</pre>
	```

* Edit the file src/app/app.component.html with the following content
```
<app-dummy></app-dummy>
```


* In order for the angular form bindings to work edit the file src/app/app.module.ts as follows

	```
	import { BrowserModule } from '@angular/platform-browser';
	import { NgModule } from '@angular/core';

	import { FormsModule } from '@angular/forms';

	import { AppComponent } from './app.component';
	import { DummyComponent } from './dummy/dummy.component';

	@NgModule({
	  declarations: [
	    AppComponent,
	    DummyComponent
	  ],
	  imports: [
	    BrowserModule, FormsModule
	  ],
	  providers: [],
	  bootstrap: [AppComponent]
	})
	export class AppModule { }
	```

* Run the application : `ng serve`
* Open your browser at http://localhost:4200/ and start sending messages
* You can also try to send message from the AMQ Hawto console and see how the page updates in real time

![Screenshot](/src//assets/screen.png)
