var jEmit = {};

jEmit.emitResult = function(result){
	
	if(result == 0){
		jEmit.socketOne.emit("status", {"status": "even"});
		jEmit.socketTwo.emit("status", {"status": "even"});
	}

	if(result == 1){
		jEmit.socketOne.emit("status", {"status":"won"});
		jEmit.socketTwo.emit("status", {"status":"lost"});
		
	}

	if(result == 2){
		jEmit.socketOne.emit("status", {"status":"lost"});
		jEmit.socketTwo.emit("status", {"status":"won"});
		
	}



}


jEmit.setSocketOne = function(socket){
	jEmit.socketOne = socket;
	jEmit.socketOne.emit("tudo",{"bine":"bine"});
}

jEmit.setSocketTwo= function(socket){
	jEmit.socketTwo = socket;
}





module.exports = jEmit;