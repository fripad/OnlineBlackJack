import { currentUser, getUsers, saveUsers } from "./auth.js";

const balanceDisplay = document.getElementById("balance");
const balanceDepositAmount = document.getElementById("balance-deposit-amount");
const balanceDepositBtn = document.getElementById("balance-deposit-btn");
const betInput = document.getElementById("bet-input");
const placeBetBtn = document.getElementById("place-bet-btn");
const startGameBtn = document.getElementById("start-game-btn");
const hitBtn = document.getElementById("hit-btn");
const standBtn = document.getElementById("stand-btn");
const gameMessage = document.getElementById("game-message");
const playerCardsContainer = document.getElementById("player-cards");
const dealerCardsContainer = document.getElementById("dealer-cards");

let playerScore = 0;
let dealerScore = 0;

let currentBet = 0;

let playerHand = [];
let dealerHand = [];

let deck = [];

let gameActive = false;

const ranks = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13];
const suits = ["s", "h", "d", "c"];

//for reference: https://medium.com/@khaledhassan45/how-to-shuffle-an-array-in-javascript-6ca30d53f772
const shuffle = (deck) => {
      for (let i = deck.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [deck[i], deck[j]] = [deck[j], deck[i]];
      }
};

const createDeck = () => {
    deck = [];
    for (const suit of suits) {
        for (const rank of ranks) {
            deck.push({rank, suit});
        }
    }
    shuffle(deck);
};

const updateBalance = () => {
    balanceDisplay.textContent = currentUser.balance;
    const users = getUsers();
    const user = users.find(u => u.username === currentUser.username);
    user.balance = currentUser.balance;
    saveUsers(users);
    localStorage.setItem("currentUser", JSON.stringify(currentUser));
};

const deposit = () => {
    const amount = parseInt(balanceDepositAmount.value);
    if (!amount || amount < 1) return;

    currentUser.balance += amount;
    balanceDepositAmount.value = "";
    updateBalance();
};

const drawCard = () => {
    return deck.pop();
}; 

const getCardValue = (card) => {
    if (card.rank === 1) {
        return 11;
    }

    else if (card.rank >= 10) {
        return 10;
    }

    else {
        return card.rank;  
    }
};

const calculateScore = (hand) => {
    let score = 0;
    let aceCount = 0;

    hand.forEach(card => {
        score += getCardValue(card);

        if(card.rank === 1) {
            aceCount++;
        }
    });

    while (score > 21 && aceCount > 0) {
        score -= 10;
        aceCount--;
    }

    return score;
};

const renderHand = (hand, container, hideSecondCard = false) => {
    container.innerHTML = "";
    hand.forEach((card, index) => {
        const img = document.createElement("img");
        
        if (hideSecondCard && index === 1) {
            img.src = "images/cards/face_down.png";
        }
        else {
            img.src = `images/cards/${card.rank}_${card.suit}.png`;
        }

        container.appendChild(img);
    });
};

const playerWins = () => {
    currentUser.balance += currentBet;
    updateBalance();
    gameMessage.textContent = `You win $${currentBet}`;
};

const dealerWins = () => {
    currentUser.balance -= currentBet;
    updateBalance();
    gameMessage.textContent = `Dealer won, you lose $${currentBet}`;
};

const pushGame = () => {
    gameMessage.textContent = "Push! You keep your bet";
};

const setGameBtns = (disabled) => {
    hitBtn.disabled = disabled;
    standBtn.disabled = disabled;
};

balanceDepositBtn.addEventListener("click", deposit);

placeBetBtn.addEventListener("click", () => {
    const bet = parseInt(betInput.value);

    if (!bet || bet <= 19) {
        gameMessage.textContent = "Bets must be at least $20.";
    }
    else if (bet > currentUser.balance) {
        gameMessage.textContent = "Not enough balance";
    }
    else {
        currentBet = bet;
        betInput.value = "";
        gameMessage.textContent = `Bet placed: $${currentBet}`;
    } 
});

startGameBtn.addEventListener("click", () => {
    gameMessage.textContent = "";

    if (!currentBet) {
        gameMessage.textContent = "Place your bet before starting game";
        return;
    }

    gameActive = true;
    setGameBtns(false);
    
    playerHand = [];
    dealerHand = [];

    playerCardsContainer.innerHTML = "";
    dealerCardsContainer.innerHTML = "";

    createDeck();

    playerHand.push(drawCard());
    dealerHand.push(drawCard());
    
    playerHand.push(drawCard());
    dealerHand.push(drawCard());

    renderHand(playerHand, playerCardsContainer);
    renderHand(dealerHand, dealerCardsContainer, true);

    playerScore = calculateScore(playerHand);
    dealerScore = calculateScore(dealerHand);
});

hitBtn.addEventListener("click", () => {
    
    if (!gameActive) {
        return;
    }

    playerHand.push(drawCard());
    renderHand(playerHand, playerCardsContainer);
    playerScore = calculateScore(playerHand);

    if (playerScore > 21) {
        renderHand(dealerHand, dealerCardsContainer);
        dealerWins();
        gameActive = false;
        currentBet = 0;
        setGameBtns(true);
    }
    else if (playerScore === 21) {
        gameMessage.textContent = "21! Press stand.";
    }
});

standBtn.addEventListener("click", () => {
    
    if (!gameActive) {
        return;
    }

    dealerScore = calculateScore(dealerHand);
    renderHand(dealerHand, dealerCardsContainer);

    while (dealerScore < 17) {
        dealerHand.push(drawCard());
        dealerScore = calculateScore(dealerHand);
        renderHand(dealerHand, dealerCardsContainer);
    }

    if (dealerScore > 21) {
        playerWins();
    }
    else if (playerScore > dealerScore) {
        playerWins();
    }
    else if (dealerScore > playerScore) {
        dealerWins();
    }
    else {
        pushGame();
    }

    gameActive = false;
    currentBet = 0;
    setGameBtns(true);
});

setGameBtns(true);