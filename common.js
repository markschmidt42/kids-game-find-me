var kids = {
	'ava': {
		img: "ava.png",
		winSound: "ava-winner.mp3",
		loseSound: "ava-nope.mp3"
	},
	'mya': {
		img: "mya.png",
		winSound: "mya-winner.mp3",
		loseSound: "mya-nope.mp3"
	},
	'addison': {
		img: "addison.png",
		winSound: "addison-winner.mp3",
		loseSound: "addison-nope.mp3"
	}
};

$(function() {
	var gameSize = 21;
	var startingPoints = 1000;

	var randomWinner = 0;

	var $game = $("#game");
	var $score = $("#score");
	var $allCards;

	var $warmerColder = $("#warmer-colder");

	var points = startingPoints;

	var winner = kids['ava'];
	var nopes = [kids['mya'],kids['addison']];

	var prevGuess = 0; 

	var setWinner = function(winnerName) {
		// I know there is a better way
		if (winnerName == 'ava') {
			winner = kids['ava'];
			nopes = [kids['mya'],kids['addison']];
		} else if (winnerName == 'mya') {
			winner = kids['mya'];
			nopes = [kids['ava'],kids['addison']];
		} else if (winnerName == 'addison') {
			winner = kids['addison'];
			nopes = [kids['mya'],kids['ava']];
		} 
	}

	var cardCover = [
		 '<div class="card" data-item="[ITEM]"><img src="images/turtle.jpg" />'
		,'<div class="card" data-item="[ITEM]"><img src="images/grass.png" />'
		,'<div class="card" data-item="[ITEM]"><img src="images/rock.png" />'
	] 

	var playSound = function(sound) {
		// playSound('winner.mp3')
		var audio = new Audio('sounds/'+ sound);
		audio.play();
	}

	var getRandom = function(from, to) {
		min = Math.ceil(from);
		max = Math.floor(to);
		result = Math.floor(Math.random() * (max - min + 1)) + min;
		console.log("getRandom()", from, to, result);
		return result;
	}

	var getRandomItemFromArray = function(array) {
		return array[getRandom(0, array.length-1)]
	}

	var layoutBoard = function(boardSize) {
		for (var x = 0; x < boardSize; x++) {
			var cardNum = x+1;
			var card = getRandomItemFromArray(cardCover);

			card = card.replace("[ITEM]", cardNum);
			$card = $(card);

			$card.append('<label>'+ cardNum +'</label>')

			$game.append($card);
			
			$card.fadeIn(x * 100);
		}
	}

	var putCardUnderThisCard = function($card, cardToPutUnder) {
		$cardUnder = $('<div class="under card"></div>');

		var cardPos = $card.offset();
		console.log(cardPos);

		$cardUnder.css({"top": cardPos.top-50, "left":cardPos.left-10});
		$cardUnder.append('<img src="images/'+ cardToPutUnder.img +'" />');
		$card.after($cardUnder);
	}

	var initCardClickEvents = function() {
		$allCards.on("click", function() {
			$card = $(this);
			var cardNum = parseInt($card.data("item"));
			console.log(cardNum, randomWinner)

			playSound('up-short-ava.mp3')

			var afterSlideUp = function() {
				$(this).animate({"top": 0}, 2000);
			};


			if (randomWinner > cardNum) {
				$warmerColder.text("^^^ HIGHER ^^^");
			} else {
				$warmerColder.text("vvv LOWER vvv");
			}

			// you found it
			if (cardNum == randomWinner) {

				$warmerColder.text("FOUND IT");

				$game.find(".card").unbind();

				putCardUnderThisCard($card, winner);

				setTimeout(function() { 
					playSound(winner.winSound);
				}, 1000);

				afterSlideUp = function() {

					$("#try-again").show();

				} // do nothing
			} 
			else 
			{

				thisNope = getRandomItemFromArray(nopes);
				// you did not find it
				putCardUnderThisCard($card, thisNope);

				setTimeout(function() { 
					playSound(thisNope.loseSound);
				}, 500);

				points = parseInt(points - (startingPoints/gameSize));
			}


			prevGuess = cardNum;

			$score.text(points);

			$card.animate({"top": -90}, 500, afterSlideUp);

		});
	}

	var initEvents = function() {
		initCardClickEvents();

		$("#try-again").on("click", function() {
			window.location.reload();
		});

		$("#game-find-me").on('change', function() {
			location.href = location.origin + location.pathname + '?findme='+ $(this).val();
		})

	}		

	var initialize = function() {
		var gameMode = getParameterByName('findme');
		randomWinner = getRandom(1, gameSize);
		if (gameMode == '') gameMode = 'ava';
		$("#game-find-me").val(gameMode);
		setWinner(gameMode);

		layoutBoard(gameSize);

		$allCards = $game.find(".card");

		initEvents();
	}

	initialize();

});


function getParameterByName(name, url) {
    if (!url) url = window.location.href;
    name = name.replace(/[\[\]]/g, "\\$&");
    var regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)"),
        results = regex.exec(url);
    if (!results) return '';
    if (!results[2]) return '';
    return decodeURIComponent(results[2].replace(/\+/g, " "));
}