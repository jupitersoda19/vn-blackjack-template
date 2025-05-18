class BlackjackGame {
  constructor(numOpponents = 1) {
    this.deck = [];
    this.playerHand = [];
    this.opponentHands = Array(numOpponents).fill().map(() => []); // Array of opponent hands
    this.isGameOver = false;
    this.currentPlayer = 'player'; // player, opponent-0, opponent-1, etc.
    this.betAmount = 0;
    this.numOpponents = numOpponents;
    this.currentOpponentIndex = 0; // Track which opponent is currently playing
  }
 
  // Initialize a new deck of cards
  initializeDeck() {
    const suits = ['hearts', 'diamonds', 'clubs', 'spades'];
    const values = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'];
   
    this.deck = [];
    for (const suit of suits) {
      for (const value of values) {
        this.deck.push({ suit, value });
      }
    }
   
    // Shuffle the deck
    this.shuffleDeck();
  }
 
  // Shuffle the deck using Fisher-Yates algorithm
  shuffleDeck() {
    for (let i = this.deck.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [this.deck[i], this.deck[j]] = [this.deck[j], this.deck[i]];
    }
  }
 
  // Deal initial cards
  dealInitialCards() {
    // Clear all hands
    this.playerHand = [];
    this.opponentHands = Array(this.numOpponents).fill().map(() => []);
   
    // Deal 2 cards to player
    this.playerHand.push(this.drawCard(), this.drawCard());
    
    // Deal 2 cards to each opponent
    for (let i = 0; i < this.numOpponents; i++) {
      this.opponentHands[i].push(this.drawCard(), this.drawCard());
    }
   
    this.isGameOver = false;
    this.currentPlayer = 'player';
    this.currentOpponentIndex = 0;
  }
 
  // Draw a card from the deck
  drawCard() {
    // If deck is running low, reinitialize
    if (this.deck.length < 10) {
      this.initializeDeck();
    }
    return this.deck.pop();
  }
 
  // Calculate the value of a hand
  calculateHandValue(hand) {
    let value = 0;
    let aces = 0;
   
    for (const card of hand) {
      if (card.value === 'A') {
        aces += 1;
        value += 11;
      } else if (['K', 'Q', 'J'].includes(card.value)) {
        value += 10;
      } else {
        value += parseInt(card.value);
      }
    }
   
    // Adjust for aces
    while (value > 21 && aces > 0) {
      value -= 10;
      aces -= 1;
    }
   
    return value;
  }
 
  // Player hits
  playerHit() {
    this.playerHand.push(this.drawCard());
    if (this.calculateHandValue(this.playerHand) > 21) {
      this.moveToNextPlayer();
    }
  }
 
  // Player stands
  playerStand() {
    this.moveToNextPlayer();
  }
  
  // Move to next player or opponent
  moveToNextPlayer() {
    // Move to first opponent
    this.currentPlayer = `opponent-${this.currentOpponentIndex}`;
    this.opponentPlay();
  }
 
  // Opponent plays
  opponentPlay() {
    // Play for current opponent
    while (this.currentOpponentIndex < this.numOpponents) {
      const currentHand = this.opponentHands[this.currentOpponentIndex];
      
      // House rules: hit until 17 or higher
      while (this.calculateHandValue(currentHand) < 17) {
        currentHand.push(this.drawCard());
      }
      
      // Move to next opponent or end game
      this.currentOpponentIndex++;
      if (this.currentOpponentIndex < this.numOpponents) {
        this.currentPlayer = `opponent-${this.currentOpponentIndex}`;
      } else {
        this.endGame();
        break;
      }
    }
  }
  
  // End the game and determine winners
  endGame() {
    this.isGameOver = true;
    this.currentPlayer = 'gameOver';
    return this.determineWinners();
  }
 
  // Determine winners against each opponent
  determineWinners() {
    const playerValue = this.calculateHandValue(this.playerHand);
    const results = [];
    
    // Player busts
    if (playerValue > 21) {
      for (let i = 0; i < this.numOpponents; i++) {
        results.push('opponent');
      }
      return results;
    }
    
    // Compare against each opponent
    for (let i = 0; i < this.numOpponents; i++) {
      const opponentValue = this.calculateHandValue(this.opponentHands[i]);
      
      // Opponent busts
      if (opponentValue > 21) {
        results.push('player');
        continue;
      }
      
      // Compare values
      if (playerValue > opponentValue) {
        results.push('player');
      } else if (opponentValue > playerValue) {
        results.push('opponent');
      } else {
        // Check for player blackjack (21 with exactly 2 cards)
        if (playerValue === 21 && this.playerHand.length === 2 && 
            !(opponentValue === 21 && this.opponentHands[i].length === 2)) {
          results.push('player');
        } else {
          results.push('tie');
        }
      }
    }
    
    return results;
  }
  
  // Get a specific opponent hand
  getOpponentHand(index) {
    if (index >= 0 && index < this.numOpponents) {
      return this.opponentHands[index];
    }
    return [];
  }
 
  // Set bet amount
  placeBet(amount) {
    this.betAmount = amount;
  }
 
  // Get bet amount
  getBetAmount() {
    return this.betAmount;
  }
 
  // Start a new game
  newGame() {
    this.initializeDeck();
    this.dealInitialCards();
    // Don't reset bet amount here, it will be set separately
  }
  
  // Change number of opponents
  setNumOpponents(num) {
    this.numOpponents = Math.max(1, Math.min(num, 3)); // Limit to 1-3 opponents
    this.opponentHands = Array(this.numOpponents).fill().map(() => []);
    this.currentOpponentIndex = 0;
  }
  
  // Get all results in readable format
  getResults() {
    if (!this.isGameOver) {
      return null;
    }
    
    const winners = this.determineWinners();
    const playerValue = this.calculateHandValue(this.playerHand);
    const results = [];
    
    for (let i = 0; i < this.numOpponents; i++) {
      const opponentValue = this.calculateHandValue(this.opponentHands[i]);
      let result = "";
      
      if (playerValue > 21) {
        result = "You bust";
      } else if (opponentValue > 21) {
        result = "Dealer busts";
      } else if (winners[i] === 'player') {
        if (playerValue === 21 && this.playerHand.length === 2) {
          result = "Blackjack!";
        } else {
          result = "You win";
        }
      } else if (winners[i] === 'opponent') {
        result = "Dealer wins";
      } else {
        result = "Push";
      }
      
      results.push({
        result,
        playerValue,
        opponentValue
      });
    }
    
    return results;
  }
}

export default BlackjackGame;