var dealerSum = 0;
var yourSum = 0;

var dealerAceCount = 0;
var yourAceCount = 0;

var hidden;
var deck;

var canHit = false; 
var canStay = false;
var canNewGame = false;
var canPlaceBet = true;

var balance = 1000; 
var currentBet = 0;

var result;

window.onload = function() {
    buildDeck();
    shuffleDeck();
    startGame();
}

function buildDeck() {
    let values = ["A", "2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K"];
    let types = ["C", "D", "H", "S"]; // Club, Diamond, Heart, Spade
    deck = [];
    for (let i = 0; i < types.length; i++) {
        for (let j = 0; j < values.length; j++) {
            deck.push(values[j] + "-" + types[i]);
        }
    }
}

function shuffleDeck() {
    for (let i = 0; i < deck.length; i++) {
        let j = Math.floor(Math.random() * deck.length); // (0-1) * 52 -> (0-51.9999)
        let temp = deck[i];
        deck[i] = deck[j];
        deck[j] = temp;
    }
    console.log(deck);
}

function startGame() {
    hidden = deck.pop();
    dealerSum += getValue(hidden);
    dealerAceCount += checkAce(hidden);

    getDealerCard();

    console.log("DealerSum " + dealerSum);
    console.log("hidden " + hidden);

    for (let i = 0; i < 2; i++) {
        getYourCard(); 
    }
    console.log("my current Sum " + yourSum);

    result = reduceAce(dealerSum, dealerAceCount);
    dealerSum = result.playerSum;
    dealerAceCount = result.playerAceCount;
    
    result = reduceAce(yourSum, yourAceCount);
    yourSum = result.playerSum;
    yourAceCount = result.playerAceCount;

    console.log("Dealeracecount start game after reduce ace " + dealerAceCount); 
    console.log("Youracecount start game after reduce ace " + yourAceCount);

    document.getElementById("dealer-sum").innerText = dealerSum - getValue(hidden);
    document.getElementById("your-sum").innerText = yourSum;

    document.getElementById("hit").addEventListener("click", hit);
    document.getElementById("stay").addEventListener("click", stay);
    document.getElementById("newGame").addEventListener("click", newGame);



    // Add event listeners to bet buttons
    const betButtons = document.querySelectorAll('.bet-button');
    betButtons.forEach(button => {
        button.addEventListener('click', function() {
            placeBet(parseInt(this.getAttribute('data-amount')));
        });
    });
}




function stay() {
    if (!canStay) {
        return;
    }

    result = reduceAce(dealerSum, dealerAceCount);
    dealerSum = result.playerSum;
    dealerAceCount = result.playerAceCount;
    
    result = reduceAce(yourSum, yourAceCount);
    yourSum = result.playerSum;
    yourAceCount = result.playerAceCount;

    while (dealerSum < yourSum) {
        getDealerCard();
        result = reduceAce(dealerSum, dealerAceCount);
        dealerSum = result.playerSum;
        dealerAceCount = result.playerAceCount;
    }

    console.log("Dealeracecount stay" + dealerAceCount); 
    console.log("Youracecount stay" + yourAceCount);

    winOrLose();
    canStay = false;
}

function hit() { 
    if (!canHit) {
        return;
    }
    getYourCard();

    result = reduceAce(dealerSum, dealerAceCount);
    dealerSum = result.playerSum;
    dealerAceCount = result.playerAceCount;
    
    result = reduceAce(yourSum, yourAceCount);
    yourSum = result.playerSum;
    yourAceCount = result.playerAceCount;

    if ((yourSum > 21) && (yourAceCount < 1)) {
        canHit = false;
        winOrLose();
        return;
    }

    console.log("new sum after hit " + yourSum);

    document.getElementById("dealer-sum").innerText = dealerSum - getValue(hidden);
    document.getElementById("your-sum").innerText = yourSum;
}

function newGame() {
    if (!canNewGame) {
        return;
    }

    dealerSum = 0;
    yourSum = 0;
    dealerAceCount = 0;
    yourAceCount = 0;

    document.getElementById("dealer-cards").innerHTML = '<img id="hidden" src="./cards/BACK.png">';
    document.getElementById("your-cards").innerHTML = '';

    document.getElementById("dealer-sum").innerText = '';
    document.getElementById("your-sum").innerText = '';
    document.getElementById("results").innerText = '';

    buildDeck();
    shuffleDeck();
    startGame();

    console.log("New game started");

    canNewGame = false;
    canHit = false;
    canStay = false;
    canPlaceBet = true;
}

function winOrLose() {
    document.getElementById("hidden").src = "./cards/" + hidden + ".png";
    let message = "";
    if (yourSum > 21) {
        message = "You Lose!";
        balance -= currentBet;
    } else if (dealerSum > 21) {
        message = "You Win!";
        balance += currentBet;
    } else if (yourSum == dealerSum) {
        message = "Tie -> You Lose!";
        balance -= currentBet;
    } else if (yourSum > dealerSum) {
        message = "You Win!";
        balance += currentBet;
    } else if (dealerSum > yourSum) {
        message = "You Lose!";
        balance -= currentBet;
    }

    document.getElementById("dealer-sum").innerText = dealerSum;
    document.getElementById("your-sum").innerText = yourSum;
    document.getElementById("results").innerText = message;
    document.getElementById("balance").innerText = balance;

    canHit = false;
    canStay = false;
    canNewGame = true;
}

function reduceAce(playerSum, playerAceCount) {
    while (playerSum > 21 && playerAceCount > 0) {
        playerSum -= 10;
        playerAceCount -= 1;
    }
    console.log("reduceAce Funktion playerSum" + playerSum);
    console.log("reduceAce Funktion playerAceCount: " + playerAceCount);
    return { playerSum, playerAceCount };
}

function getYourCard() {
    let cardImg = document.createElement("img");
    let card = deck.pop();
    cardImg.src = "./cards/" + card + ".png";
    yourSum += getValue(card);
    yourAceCount += checkAce(card);
    document.getElementById("your-cards").append(cardImg);
}

function getDealerCard() {
    let cardImg = document.createElement("img");
    let card = deck.pop();
    cardImg.src = "./cards/" + card + ".png";
    dealerSum += getValue(card);
    dealerAceCount += checkAce(card);
    document.getElementById("dealer-cards").append(cardImg);
}

function getValue(card) {
    let data = card.split("-"); //"4-C" -> ["4", "C"]
    let value = data[0];

    if (isNaN(value)) { // A J Q K
        if (value == "A") {
            return 11;
        }
        return 10;
    }
    return parseInt(value);
}

function checkAce(card) {
    if (card[0] == "A") {
        return 1;
    }
    return 0;
}

function placeBet(amount) {
    if (!canPlaceBet) {
        return;
    }
    if (balance >= amount) {
        currentBet = amount;
        document.getElementById("results").innerText = "Bet placed: " + amount + " €";
        document.getElementById("balance").innerText = balance - amount;
        canHit = true;
        canStay = true;
        canNewGame = false;
        canPlaceBet = false;
    } else {
        document.getElementById("results").innerText = "Not enough balance to place this bet.";
        canPlaceBet = true;
    }
}