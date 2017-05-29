//
var jM = require(__dirname + "/choice.js");
var jEmit = require(__dirname+"/emitStatus.js");
//create the normal server
var express = require("express");
var app = express();

//create the socket server
var server = require("http").Server(app);
var io = require("socket.io")(server);

var jPlayers = [];
var jNicknames = [];
/*********************/
var jMatches = [];			
io.on("connection", function( oSocket ){
	oSocket.on("send players and matches", function(jData){
		var players = [];
		for(var i=0; i<jNicknames.length; i++){
			players.push(jNicknames[i]);
		}
		console.log(players);

		var matches =[];
		for(var i=0;i<jMatches.length;i++){
			var match = jMatches[i].jPlayerOne.nickname+" ("+jMatches[i].jPlayerOne.won+") "+
			" - "+jMatches[i].jPlayerTwo.nickname+" ("+jMatches[i].jPlayerTwo.won+") ";
			matches.push(match);
		}

		oSocket.emit("players and matches",{"players": players,"matches":matches});
	})
	oSocket.on("window closed", function(jData){
		var iRemove = -1;
		for(var i = 0; i < jMatches.length; i++){
			if(jMatches[i].jPlayerOne.socket.id == oSocket.id){
				jMatches[i].jPlayerTwo.socket.emit("oponent left",{});
				jMatches[i].jPlayerTwo.won = 0;
				iRemove = i;
				jPlayers.push(jMatches[i].jPlayerTwo);
				jNicknames.splice(jNicknames.indexOf(jMatches[i].jPlayerOne.nickname), 1);
			}
			else if(jMatches[i].jPlayerTwo.socket.id == oSocket.id){
				jMatches[i].jPlayerOne.socket.emit("oponent left", {});
				jMatches[i].jPlayerOne.won = 0;
				iRemove = i;
				jPlayers.push(jMatches[i].jPlayerOne);
				jNicknames.splice(jNicknames.indexOf(jMatches[i].jPlayerTwo.nickname), 1);
				
			}
		}

		if(iRemove > -1){
			jMatches.splice(iRemove, 1);
		if(jPlayers.length%2 == 0 && jPlayers.length > 0){
			for(var i = 0; i < jPlayers.length-1; i+=2){
				var jMatch = {"jPlayerOne": jPlayers[i], "jPlayerTwo": jPlayers[i+1]};
				jMatches.push(jMatch);

				jPlayers[i].socket.emit("finding oponent", {"nickname": jPlayers[i+1].nickname});

				jPlayers[i+1].socket.emit("finding oponent", {"nickname": jPlayers[i].nickname});
			}
		}
	}
	})

	oSocket.on("player wants to join", function(jData){
		jPlayer = {"nickname": jData.nickname, "socket": oSocket,"choice":"","won":0};
		var ok=1;
		for(var i = 0; i < jNicknames.length; i++){
			if(jNicknames[i]	 == jPlayer.nickname)
				ok = 0;
		}
		if(ok == 1){
			jPlayers.push(jPlayer);
			jNicknames.push(jPlayer.nickname);
			console.log(jPlayers);
			oSocket.emit("player joining", {"status": "ok"});
		}
		else oSocket.emit("player joining", {"status": "err"});

		if(jPlayers.length%2 == 0 && jPlayers.length > 0){
			for(var i = 0; i < jPlayers.length-1; i+=2){
				var jMatch = {"jPlayerOne": jPlayers[i], "jPlayerTwo": jPlayers[i+1]};
				jMatches.push(jMatch);

				jPlayers[i].socket.emit("finding oponent", {"nickname": jPlayers[i+1].nickname});

				jPlayers[i+1].socket.emit("finding oponent", {"nickname": jPlayers[i].nickname});
			}
			jPlayers = [];
		}

	});

	oSocket.on("player choice", function(jData){
		console.log(jData);
		console.log(oSocket.id);
		for(var i = 0; i < jMatches.length; i++){
			if(jMatches[i].jPlayerOne.socket.id == oSocket.id){
				jMatches[i].jPlayerOne.choice = jData.choice;

				if(jMatches[i].jPlayerTwo.choice == ""){
					oSocket.emit("status",{"status":"waiting for oponent"});	
					jMatches[i].jPlayerTwo.socket.emit("status", {"status":"waiting for your answer"});
				}
				else{
					
					jEmit.setSocketOne(jMatches[i].jPlayerOne.socket);
					jEmit.setSocketTwo(jMatches[i].jPlayerTwo.socket);

					jM.setChoiceOne(jMatches[i].jPlayerOne.choice);
					jM.setChoiceTwo(jMatches[i].jPlayerTwo.choice);

					jMatches[i].jPlayerOne.choice = "";
					jMatches[i].jPlayerTwo.choice = "";
					var result = jM.getResult();
					if(result == 1) {
						jMatches[i].jPlayerOne.won++;
						jMatches[i].jPlayerOne.socket.emit("won",{"won":jMatches[i].jPlayerOne.won});		
					}
					if(result == 2) {
						jMatches[i].jPlayerTwo.won++;
						jMatches[i].jPlayerTwo.socket.emit("won",{"won":jMatches[i].jPlayerTwo.won});
					}
					jEmit.emitResult(result);

				}
			}
			else if(jMatches[i].jPlayerTwo.socket.id == oSocket.id){
				jMatches[i].jPlayerTwo.choice = jData.choice;

				if(jMatches[i].jPlayerOne.choice == ""){
					oSocket.emit("status",{"status":"waiting for oponent"});	
					jMatches[i].jPlayerOne.socket.emit("status", {"status":"waiting for your answer"});
				}
				else{
				
					jEmit.setSocketOne(jMatches[i].jPlayerOne.socket);
					jEmit.setSocketTwo(jMatches[i].jPlayerTwo.socket);

					jM.setChoiceOne(jMatches[i].jPlayerOne.choice);
					jM.setChoiceTwo(jMatches[i].jPlayerTwo.choice);
					var result = jM.getResult();
					jMatches[i].jPlayerOne.choice = "";
					jMatches[i].jPlayerTwo.choice = "";

					if(result == 1) {
						jMatches[i].jPlayerOne.won++;
						jMatches[i].jPlayerOne.socket.emit("won",{"won":jMatches[i].jPlayerOne.won});		
					}
					if(result == 2) {
						jMatches[i].jPlayerTwo.won++;
						jMatches[i].jPlayerTwo.socket.emit("won",{"won":jMatches[i].jPlayerTwo.won});
					}

					jEmit.emitResult(result);

				}

			}
		}
	})
})

app.get("/", function(req, res){
	res.sendFile(__dirname + "/index.html");
})
/*

app.listen(8080, function(){
	console.log("App is listening on port 8080");
})
*/
server.listen(8000, function(){
	console.log("Server is listening on port 8000");
})
