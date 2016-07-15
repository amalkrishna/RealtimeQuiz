var express = require('express');
var app = express();
var server = require('http').createServer(app);
var io = require('socket.io').listen(server);
var fs = require('fs');

app.use('/', express.static(__dirname + '/public'));

var usernames = {};
var pairCount = 0, id, clientsno, pgmstart=0,varCounter;
var scores = {};

server.listen(4444);
console.log("Listening to 4444")
console.log("Connection Established !")

//Route
app.get('/',function (req,res){
	res.sendFile(__dirname + '/index.html');
});

io.sockets.on('connection', function(socket){
	console.log("New Client Arrived!");

	socket.on('addClient', function(username){
		socket.username = username;
		usernames[username] = username;
		scores[socket.username] = 0;
		varCounter = 0
		//var id = Math.round((Math.random() * 1000000));
		pairCount++;
		if(pairCount === 1 || pairCount >=3){
			id = Math.round((Math.random() * 1000000));
			socket.room = id;
			pairCount = 1;
			console.log(pairCount + " " + id);
			socket.join(id);
			pgmstart = 1;
		} else if (pairCount === 2){
        	console.log(pairCount + " " + id);
        	socket.join(id);
        	pgmstart = 2;
    	}
		
		console.log(username + " joined to "+ id);

		socket.emit('updatechat', 'SERVER', 'You are connected! <br> Waiting for other player to connect...');
		
		socket.broadcast.to(id).emit('updatechat', 'SERVER', username + ' has joined to this game !');

		
		if(pgmstart ==2){
			fs.readFile(__dirname + "/lib/questions.json", "Utf-8", function(err, data){
				jsoncontent = JSON.parse(data);
				io.sockets.in(id).emit('sendQuestions',jsoncontent);
				
			});
		console.log("hooooooooooooo");
			//io.sockets.in(id).emit('game', "haaaaai");
		} else {
			console.log("Heeeeeeeeeeeeee");

		}




  
	});


	socket.on('result', function (usr) {
		
		//console.log(data);
		//if(data=="success"){
			
				//scores[socket.username] += 10;
				//console.log(scores[socket.username]); 
				//io.sockets.in(socket.room).emit('viewresult', scores);
				io.sockets.in(socket.room).emit('viewresult',usr);


		//}
		//io.sockets.in(socket.room).emit('updatechat', socket.username, data);
		
		//io.sockets.in(socket.room).emit('game', "second......",pgmstart);

		

	});


	
	
	socket.on('disconnect', function(){
		
		delete usernames[socket.username];
		io.sockets.emit('updateusers', usernames);
		io.sockets.in(id).emit('updatechat', 'SERVER', socket.username + ' has disconnected');
		socket.leave(socket.room);
	});
});


