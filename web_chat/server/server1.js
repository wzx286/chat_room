var fs = require('fs');
// var http = require('http');
// var request = require('request');
var bodyParser = require('body-parser');
var express = require("express");
var io = require('socket.io');
var app = express();

app.use(bodyParser.urlencoded({extended:true,limit:'20mb'}));
app.use(express.static(__dirname+'/..'));
// app.all('*',function(req,res,next){
// 	res.header('Access-Control-Allow-Origin','*');
// 	next();
// });
app.post('/upload1', function(req, res) {
    console.log(req.body);
    console.log(req.params);
    console.log(req.query);
   
});

var server = app.listen(8081,function(){
	var host = server.address().address;
    var port = server.address().port;
    console.log(" http://%s:%s", host, port);
});

var socket = io.listen(server);
var clientArr = [];
// 添加一个连接监听器
socket.on('connection', function(client){ 
	//将所有在线用户添加进聊天室数组
	var cl = {
		usr:client.handshake.query.usr,
		client:client
	}
	clientArr.push(cl);
	sendMSG('msg1',client.handshake.query.usr,'','');
	// type: msg1~~~发送欢迎
	// 		 msg2~~~发送对话内容
	// 		 msg3~~~发送离开通知
	function sendMSG(type,usr,msg,img){
		var sendMsg = {
	    		type:type,
	    		usr:usr,
	    		msg:msg,
	    		img:img
	    	}
	    clientArr.forEach(function(clientI){//向每个聊天室对象发送新消息	    	
	    	clientI.client.send(JSON.stringify(sendMsg));//+' ' + new Date().getTime());
	    })
	}
  // 成功！现在开始监听接收到的消息
	client.on('message',function(data){ 
	    var list = JSON.parse(data);
	    switch(list.type){
	    	case 'msg1': sendMSG('msg1',list.usr,'','');break;
	    	case 'msg2': sendMSG('msg2',list.usr,list.msg,list.img);break;
	    	case 'msg3': sendMSG('msg3',list.usr,'','');break;
	    }
	}); 
	client.on('disconnect',function(){ 
	    var index;
	    clientArr.forEach(function(cli,i){
	    	console.log(cli.client == client);
	    	if (cli.client == client) 
	    		index = i;
	    });
	    var user = clientArr[index].usr;
	    clientArr.splice(index,1);
	    sendMSG('msg3',user,'');	    
	}); 
});


