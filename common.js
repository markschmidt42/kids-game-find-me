var kids = [
	{
		name: 'Ava',
		img: "ava.png",
		winSound: "ava-winner.mp3",
		nopeSound: "ava-nope.mp3"
	},
	{
		name: 'Mya',
		img: "mya.png",
		winSound: "mya-winner.mp3",
		nopeSound: "mya-nope.mp3"
	},
	{
		name: 'Addison',
		img: "addison.png",
		winSound: "addison-winner.mp3",
		nopeSound: "addison-nope.mp3"
	}
];

$(function() {
	var gameSize = 21;
	var startingPoints = gameSize;

	var randomWinner = 0;

	var $game = $("#game");
	var $score = $("#score");
	var $allCards;

	var $warmerColder = $("#warmer-colder");

	var clicks = 0;
	var points = startingPoints;

	var winner = {};
	var nopes = [];

	var prevGuess = 0; 

	var tileSize = 100;

	var setWinner = function(winnerName) {
		// expect 1 object returned
		winner = kids.filter(function(kid) { return kid.name.toLowerCase() == winnerName })[0];

		// expect array of objects returned
		nopes = kids.filter(function(kid) { return kid.name.toLowerCase() != winnerName });
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

	var setTileSize = function($card, tileSize) {
		$card.css({"height": tileSize, "width": tileSize});
	}

	var layoutBoard = function(boardSize) {
		for (var x = 0; x < boardSize; x++) {
			var cardNum = x+1;
			var card = getRandomItemFromArray(cardCover);

			card = card.replace("[ITEM]", cardNum);
			$card = $(card);

			// set height/width;
			setTileSize($card, tileSize);

			$card.append('<label>'+ cardNum +'</label>')

			$game.append($card);
			
			$card.fadeIn(x * (1000/gameSize));
		}
	}

	var putCardUnderThisCard = function($card, cardToPutUnder) {
		$cardUnder = $('<div class="under card"></div>');

		var cardPos = $card.offset();
		console.log(cardPos);

		var $underCardImg = $('<img src="images/'+ cardToPutUnder.img +'" />');
		setTileSize($underCardImg, tileSize);

		$cardUnder.css({"top": cardPos.top, "left":cardPos.left});
		$cardUnder.append($underCardImg);
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

				$warmerColder.text("FOUND ME");

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
					playSound(thisNope.nopeSound);
				}, 500);

				points = parseInt(points - (startingPoints/gameSize));
			}

			clicks++;

			prevGuess = cardNum;

			
			updateScore();

			$card.animate({"top": (tileSize * -0.90)}, 500, afterSlideUp);

		});
	}

	var updateScore = function() {
		$score.text("Clicks: "+ clicks);
	}

	var resetGameConfig = function() {
		location.href = location.origin + location.pathname
			+ '?findme='+ $("#game-find-me").val()
			+ '&size='+ $("#game-size").val()
			;
	}

	var initEvents = function() {
		initCardClickEvents();

		$("#try-again").on("click", function() {
			window.location.reload();
		});

		$("#game-find-me,#game-size").on('change', function() {
			resetGameConfig();
		})

	}		

	var loadPullDowns = function() {
		kids.forEach(function(kid) {
			$("#game-find-me").append('<option value="'+ kid.name.toLowerCase() +'">'+ kid.name +'</option>');
		});

		for (var x = 1; x <= 500; x++) {
			$("#game-size").append('<option value="'+ x +'">'+ x +'</option>');
		}
	}

	var getValueAndSetPullDown = function(queryStringName, defaultValue, selectIdSelector) {
		var val = getParameterByName(queryStringName);
		if (val == '') val = defaultValue;
		$(selectIdSelector).val(val);
		return val;
	}

	var initialize = function() {
		loadPullDowns();

		var gameMode = getValueAndSetPullDown('findme', 'ava', "#game-find-me").toLowerCase();
		gameSize = parseInt(getValueAndSetPullDown('size', gameSize, "#game-size"));

		setWinner(gameMode);

		randomWinner = getRandom(1, gameSize);
		// - 15 for scroll bars
		tileSize = GetTileSize($(window).width()-15, $(window).height()-$("#game").position().top-20, gameSize);
		//tileSize = tileSize - 20;

		layoutBoard(gameSize);

		$allCards = $game.find(".card");

		updateScore();
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


function GetTileSize(unscaledWidth, unscaledHeight, numberOfSlides)
{
	//total number of tiles
	var tile_count = numberOfSlides;
	//height of rectangle
	var b  = unscaledHeight;
	//width of rectanlge
	var a  = unscaledWidth;

	//divide the area but the number of tiles to get the max area a tile could cover
	//this optimal size for a tile will more often than not make the tiles overlap, but
	//a tile can never be bigger than this size
	var maxSize = Math.sqrt((b * a) / tile_count);
	//find the number of whole tiles that can fit into the height
	var numberOfPossibleWholeTilesH  = Math.floor(b / maxSize);
	//find the number of whole tiles that can fit into the width
	var numberOfPossibleWholeTilesW  = Math.floor(a / maxSize);
	//works out how many whole tiles this configuration can hold
	var total  = numberOfPossibleWholeTilesH * numberOfPossibleWholeTilesW;

	//if the number of number of whole tiles that the max size tile ends up with is less than the require number of 
	//tiles, make the maxSize smaller and recaluate
	while(total < tile_count){
		maxSize--;
		numberOfPossibleWholeTilesH = Math.floor(b / maxSize);
		numberOfPossibleWholeTilesW = Math.floor(a / maxSize);
		total = numberOfPossibleWholeTilesH * numberOfPossibleWholeTilesW;
	}

	return maxSize;    
}