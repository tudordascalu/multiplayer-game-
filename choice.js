var jMatch={};
jMatch.setChoiceOne = function( choice ){
	jMatch.choiceOne = choice;
}
jMatch.setChoiceTwo = function( choice ){
	jMatch.choiceTwo = choice;
}

jMatch.getResult = function(){
	var choiceOne = jMatch.choiceOne;
	var choiceTwo = jMatch.choiceTwo;

	switch( choiceOne ){
		case "rock":
			if(choiceTwo == "rock") return 0;
			if(choiceTwo == "paper") return 2;
			if(choiceTwo == "scissor") return 1;
		break;
		
		case "paper":
			if(choiceTwo == "rock") return 1;
			if(choiceTwo == "paper") return 0;
			if(choiceTwo == "scissor") return 2;
		break;

		case "scissor":
			if(choiceTwo == "rock") return 2;
			if(choiceTwo == "paper") return 1;
			if(choiceTwo == "scissor") return 0;
		break;
		default:
		console.log("something's wrong");
		break;
	}
}

module.exports = jMatch;