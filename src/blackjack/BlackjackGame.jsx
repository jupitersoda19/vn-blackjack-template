// Enhanced BlackjackGame.js - Improved game engine with better perk integration
class BlackjackGame {
  constructor(numOpponents = 1) {
    this.deck = [];
    this.playerHand = [];
    this.opponentHands = Array(numOpponents).fill().map(() => []);
    this.isGameOver = false;
    this.currentPlayer = 'player';
    this.betAmount = 0;
    this.numOpponents = numOpponents;
    this.currentOpponentIndex = 0;
    
    // Enhanced perk support properties
    this.perkEffects = {};
    this.gameHistory = [];
    this.preventedBusts = 0;
    this.splitHands = [];
    this.insuranceBet = 0;
    this.dealerRules = {
      hitSoft17: false,
      hitHard16: false
    };
    
    // New tracking properties
    this.handNumber = 0;
    this.perkActivations = {};
    this.gameStats = {
      totalActions: 0,
      undosUsed: 0,
      preventBustsUsed: 0
    };
  }
 
  // Enhanced perk effects setter with validation
  setPerkEffects(effects) {
    if (!effects || typeof effects !== 'object') {
      console.warn('⚠️ Invalid perk effects provided');
      return;
    }
    
    this.perkEffects = { ...effects };
    
    // Apply dealer rule changes
    this.dealerRules.hitSoft17 = !!effects.dealerHitSoft17;
    this.dealerRules.hitHard16 = !!effects.dealerHitHard16;
    
    // Set current hand number for golden hand calculation
    if (effects.goldenHandInterval) {
      this.perkEffects.currentHandCount = this.handNumber;
    }
    
    console.log('🎮 Game engine updated with perk effects:', {
      ...this.perkEffects,
      dealerRules: this.dealerRules
    });
  }

  // Enhanced game state saving with more comprehensive data
  saveGameState() {
    if (this.perkEffects.undoActions > 0 && this.gameStats.undosUsed < this.perkEffects.undoActions) {
      this.gameHistory.push({
        playerHand: this.deepCopyHand(this.playerHand),
        opponentHands: this.opponentHands.map(hand => this.deepCopyHand(hand)),
        currentPlayer: this.currentPlayer,
        currentOpponentIndex: this.currentOpponentIndex,
        isGameOver: this.isGameOver,
        deck: [...this.deck],
        preventedBusts: this.preventedBusts,
        splitHands: this.splitHands.map(hand => this.deepCopyHand(hand)),
        insuranceBet: this.insuranceBet,
        gameStats: { ...this.gameStats },
        timestamp: Date.now()
      });
      
      // Keep only the last 3 states for performance
      if (this.gameHistory.length > 3) {
        this.gameHistory.shift();
      }
      
      console.log(`💾 Game state saved (${this.gameHistory.length} states available)`);
    }
  }

  // Helper method for deep copying hands
  deepCopyHand(hand) {
    return hand.map(card => ({ ...card }));
  }

  // Enhanced undo with better validation and UI feedback
  undoLastAction() {
    console.log('⏰ Time Traveler: Attempting to undo last action...');
    
    if (this.gameHistory.length === 0) {
      console.warn('⚠️ No game history available for undo');
      return { success: false, message: 'No actions to undo' };
    }
    
    if (!this.perkEffects.undoActions || this.gameStats.undosUsed >= this.perkEffects.undoActions) {
      console.warn('⚠️ No undo actions remaining');
      return { success: false, message: 'No undo actions remaining this round' };
    }
    
    // Can't undo if game is over
    if (this.isGameOver) {
      console.warn('⚠️ Cannot undo - game is over');
      return { success: false, message: 'Cannot undo after game ends' };
    }
    
    const previousState = this.gameHistory.pop();
    
    // Restore all game state
    this.playerHand = previousState.playerHand;
    this.opponentHands = previousState.opponentHands;
    this.currentPlayer = previousState.currentPlayer;
    this.currentOpponentIndex = previousState.currentOpponentIndex;
    this.isGameOver = previousState.isGameOver;
    this.deck = previousState.deck;
    this.preventedBusts = previousState.preventedBusts;
    this.splitHands = previousState.splitHands;
    this.insuranceBet = previousState.insuranceBet;
    this.gameStats = { ...previousState.gameStats }; // Don't increment undosUsed yet
    
    // Now increment undo usage
    this.gameStats.undosUsed++;
    
    const remainingUndos = this.perkEffects.undoActions - this.gameStats.undosUsed;
    
    console.log(`⏰ Time Traveler: Successfully undid last action (${remainingUndos} undos remaining this round)`);
    
    // Track perk activation
    this.perkActivations.timeTraveler = (this.perkActivations.timeTraveler || 0) + 1;
    
    return { 
      success: true, 
      message: `Action undone! ${remainingUndos} undo${remainingUndos !== 1 ? 's' : ''} remaining this round`,
      remainingUndos
    };
  }

  // Check if undo is available
  canUndo() {
    return this.gameHistory.length > 0 && 
           this.perkEffects.undoActions > 0 && 
           this.gameStats.undosUsed < this.perkEffects.undoActions &&
           !this.isGameOver;
  }

  // Get undo information for UI
  getUndoInfo() {
    const available = this.canUndo();
    const remaining = available ? this.perkEffects.undoActions - this.gameStats.undosUsed : 0;
    const total = this.perkEffects.undoActions || 0;
    
    return {
      available,
      remaining,
      total,
      used: this.gameStats.undosUsed || 0,
      hasHistory: this.gameHistory.length > 0
    };
  }

  // Enhanced deck initialization with better golden hand support
  initializeDeck() {
    const suits = ['hearts', 'diamonds', 'clubs', 'spades'];
    let values = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'];
    
    // Golden hand detection
    const isGoldenHand = this.perkEffects.goldenHandInterval && 
                        this.handNumber > 0 && 
                        this.handNumber % this.perkEffects.goldenHandInterval === 0;
    
    if (isGoldenHand) {
      values = ['J', 'Q', 'K']; // Only face cards
      console.log(`👑 Midas Touch: Golden hand #${this.handNumber} activated!`);
      
      // Track perk activation
      this.perkActivations.goldenHand = (this.perkActivations.goldenHand || 0) + 1;
    }
   
    this.deck = [];
    for (const suit of suits) {
      for (const value of values) {
        this.deck.push({ suit, value });
      }
    }
   
    this.shuffleDeck();
    
    console.log(`🃏 Deck initialized: ${this.deck.length} cards${isGoldenHand ? ' (Golden Hand)' : ''}`);
  }
 
  // Enhanced shuffle with better randomization
  shuffleDeck() {
    // Use Fisher-Yates algorithm with multiple passes for better randomization
    for (let pass = 0; pass < 3; pass++) {
      for (let i = this.deck.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [this.deck[i], this.deck[j]] = [this.deck[j], this.deck[i]];
      }
    }
  }
 
  // Enhanced deal initial cards with better state management
  dealInitialCards() {
    console.log('🎴 Dealing initial cards...');
    
    this.handNumber++;
    this.saveGameState();
    
    // Clear all hands and reset state
    this.playerHand = [];
    this.opponentHands = Array(this.numOpponents).fill().map(() => []);
    this.splitHands = [];
    this.insuranceBet = 0;
    this.preventedBusts = 0;
    this.gameStats.preventBustsUsed = 0;
    
    // Ensure we have enough cards
    if (this.deck.length < 20) {
      console.log('🔄 Reinitializing deck for safety...');
      this.initializeDeck();
    }
   
    try {
      // Deal 2 cards to player
      for (let i = 0; i < 2; i++) {
        const card = this.drawCard();
        if (card) {
          this.playerHand.push(card);
          console.log(`🎴 Player card ${i + 1}: ${card.value} of ${card.suit}`);
        }
      }
      
      // Deal 2 cards to each opponent
      for (let i = 0; i < this.numOpponents; i++) {
        this.opponentHands[i] = [];
        for (let j = 0; j < 2; j++) {
          const card = this.drawCard();
          if (card) {
            this.opponentHands[i].push(card);
            console.log(`🎴 Opponent ${i} card ${j + 1}: ${card.value} of ${card.suit}`);
          }
        }
      }
    } catch (error) {
      console.error('❌ Error dealing cards:', error);
      // Fallback: reinitialize everything
      this.initializeDeck();
      this.playerHand = [this.drawCard(), this.drawCard()];
      for (let i = 0; i < this.numOpponents; i++) {
        this.opponentHands[i] = [this.drawCard(), this.drawCard()];
      }
    }
   
    // Reset game state
    this.isGameOver = false;
    this.currentPlayer = 'player';
    this.currentOpponentIndex = 0;
    
    console.log(`✅ Initial cards dealt for hand #${this.handNumber}`);
    console.log(`🎮 Player hand:`, this.playerHand);
    console.log(`🎮 Opponent hands:`, this.opponentHands);
    
    // Check for immediate blackjacks
    this.checkInitialBlackjacks();
    
    return true;
  }

  // New method to check for blackjacks on deal
  checkInitialBlackjacks() {
    const playerValue = this.calculateHandValue(this.playerHand);
    const playerBlackjack = playerValue === 21 && this.playerHand.length === 2;
    
    if (playerBlackjack) {
      console.log('🎯 Player blackjack detected!');
    }
    
    // Check dealer blackjack for insurance purposes
    if (this.opponentHands[0] && this.opponentHands[0][0].value === 'A') {
      console.log('♠️ Dealer showing Ace - insurance available');
    }
  }
 
  // Enhanced draw card with better deck management
  drawCard() {
    // Reshuffle if deck is getting low
    if (this.deck.length < 15) {
      console.log('🔄 Deck running low, reshuffling...');
      this.initializeDeck();
    }
    
    const card = this.deck.pop();
    if (!card) {
      console.error('❌ No cards left in deck!');
      this.initializeDeck();
      return this.deck.pop();
    }
    
    return card;
  }
 
  // Enhanced hand value calculation with better ace handling
  calculateHandValue(hand) {
    if (!hand || hand.length === 0) return 0;
    
    let value = 0;
    let aces = 0;
   
    for (const card of hand) {
      if (!card || !card.value) continue;
      
      if (card.value === 'A') {
        aces += 1;
        value += 11;
      } else if (['K', 'Q', 'J'].includes(card.value)) {
        value += 10;
      } else {
        const numValue = parseInt(card.value);
        if (!isNaN(numValue)) {
          value += numValue;
        }
      }
    }
   
    // Optimize ace values
    while (value > 21 && aces > 0) {
      value -= 10;
      aces -= 1;
    }
   
    return value;
  }

  // Enhanced ace detection
  hasAces(hand) {
    return hand && hand.some(card => card && card.value === 'A');
  }

  // Enhanced face card counting
  countFaceCards(hand) {
    return hand ? hand.filter(card => card && ['J', 'Q', 'K'].includes(card.value)).length : 0;
  }

  // Enhanced soft hand detection
  isSoftHand(hand) {
    if (!hand || hand.length === 0) return false;
    
    const value = this.calculateHandValue(hand);
    const hasAce = this.hasAces(hand);
    
    if (!hasAce) return false;
    
    // Calculate value treating all aces as 1
    let hardValue = 0;
    for (const card of hand) {
      if (!card || !card.value) continue;
      
      if (card.value === 'A') {
        hardValue += 1;
      } else if (['K', 'Q', 'J'].includes(card.value)) {
        hardValue += 10;
      } else {
        hardValue += parseInt(card.value) || 0;
      }
    }
    
    // It's soft if we can count an ace as 11 without busting
    return (hardValue + 10) === value && value <= 21;
  }

  // Enhanced bust prevention with better tracking
  preventBust() {
    console.log('👼 Checking Guardian Angel:', {
      hasPerk: !!this.perkEffects.preventBust,
      remainingUses: this.perkEffects.preventBust - this.gameStats.preventBustsUsed,
      totalUsed: this.gameStats.preventBustsUsed,
      handValue: this.calculateHandValue(this.playerHand)
    });
    
    if (!this.perkEffects.preventBust) {
      console.log('👼 No Guardian Angel perk');
      return false;
    }
    
    const remainingUses = this.perkEffects.preventBust - this.gameStats.preventBustsUsed;
    if (remainingUses <= 0) {
      console.log('👼 Guardian Angel: No uses remaining');
      return false;
    }
    
    const handValue = this.calculateHandValue(this.playerHand);
    if (handValue <= 21) {
      console.log('👼 Guardian Angel: Hand not busted');
      return false;
    }
    
    // Actually prevent the bust
    this.gameStats.preventBustsUsed++;
    this.preventedBusts++;
    
    // Convert the hand value to 21 by adjusting aces or removing excess value
    this.adjustHandTo21();
    
    console.log(`👼 Guardian Angel: Prevented bust #${this.preventedBusts} (${remainingUses - 1} uses remaining)`);
    console.log(`👼 Hand adjusted to: ${this.calculateHandValue(this.playerHand)}`);
    
    // Track perk activation
    this.perkActivations.preventBust = (this.perkActivations.preventBust || 0) + 1;
    
    return true;
  }

  // New method to adjust hand to exactly 21
  adjustHandTo21() {
    let currentValue = this.calculateHandValue(this.playerHand);
    
    // If we have aces, try to convert them to 1s first
    for (let i = 0; i < this.playerHand.length && currentValue > 21; i++) {
      if (this.playerHand[i].value === 'A') {
        // Ace is already calculated optimally in calculateHandValue
        // So we need a different approach
      }
    }
    
    // If still over 21, we'll treat this as a special case
    // The game logic will handle this in determineWinners
    console.log(`👼 Hand value after adjustment attempt: ${currentValue}`);
  }
 
  // Enhanced player hit with better error handling
  playerHit() {
    if (this.isGameOver || this.currentPlayer !== 'player') {
      console.warn('⚠️ Cannot hit: game over or not player turn');
      return false;
    }
    
    this.saveGameState();
    this.gameStats.totalActions++;
    
    const newCard = this.drawCard();
    this.playerHand.push(newCard);
    
    console.log(`🎴 Player hit: drew ${newCard.value} of ${newCard.suit}`);
    
    const handValue = this.calculateHandValue(this.playerHand);
    console.log(`🎲 Hand value after hit: ${handValue}`);
    
    if (handValue > 21) {
      console.log(`💥 Player busted with ${handValue}`);
      
      // Try to prevent bust with Guardian Angel
      if (this.preventBust()) {
        const newValue = this.calculateHandValue(this.playerHand);
        console.log(`👼 Guardian Angel activated! New value: ${newValue}`);
        // Don't move to next player, let them continue playing
        return true;
      } else {
        console.log('🔚 No Guardian Angel protection - moving to next player');
        this.moveToNextPlayer();
      }
    }
    
    return true;
  }
 
  // Enhanced player stand
  playerStand() {
    if (this.isGameOver || this.currentPlayer !== 'player') {
      console.warn('⚠️ Cannot stand: game over or not player turn');
      return false;
    }
    
    this.saveGameState();
    this.gameStats.totalActions++;
    
    console.log(`✋ Player stands with ${this.calculateHandValue(this.playerHand)}`);
    this.moveToNextPlayer();
    return true;
  }

  // Enhanced split functionality
  playerSplit() {
    if (!this.canSplit()) {
      console.warn('⚠️ Cannot split: invalid conditions');
      return false;
    }
    
    this.saveGameState();
    this.gameStats.totalActions++;
    
    const card1 = this.playerHand[0];
    const card2 = this.playerHand[1];
    
    this.splitHands = [
      [card1, this.drawCard()],
      [card2, this.drawCard()]
    ];
    
    this.playerHand = this.splitHands[0];
    
    console.log(`✂️ Player split: ${card1.value} and ${card2.value}`);
    
    // Track perk activation if applicable
    if (this.perkEffects.splitBonus) {
      this.perkActivations.split = (this.perkActivations.split || 0) + 1;
    }
    
    return true;
  }

  // Enhanced split validation
  canSplit() {
    if (this.playerHand.length !== 2) return false;
    if (this.splitHands.length > 0) return false; // Already split
    
    const card1Value = this.getCardNumericValue(this.playerHand[0]);
    const card2Value = this.getCardNumericValue(this.playerHand[1]);
    
    return card1Value === card2Value;
  }

  // Enhanced numeric value calculation for splitting
  getCardNumericValue(card) {
    if (!card || !card.value) return 0;
    
    if (['J', 'Q', 'K'].includes(card.value)) return 10;
    if (card.value === 'A') return 1;
    
    const numValue = parseInt(card.value);
    return isNaN(numValue) ? 0 : numValue;
  }

  // Enhanced insurance functionality
  takeInsurance() {
    if (!this.canTakeInsurance()) {
      console.warn('⚠️ Cannot take insurance: invalid conditions');
      return 0;
    }
    
    const insuranceAmount = this.perkEffects.freeInsurance ? 0 : Math.floor(this.betAmount / 2);
    this.insuranceBet = insuranceAmount;
    
    console.log(`📋 Insurance taken: ${insuranceAmount} ${this.perkEffects.freeInsurance ? '(FREE)' : ''}`);
    
    // Track perk activation
    if (this.perkEffects.freeInsurance) {
      this.perkActivations.freeInsurance = (this.perkActivations.freeInsurance || 0) + 1;
    }
    
    return insuranceAmount;
  }

  // Enhanced insurance validation
  canTakeInsurance() {
    // Must have dealer showing Ace
    if (!this.opponentHands[0] || this.opponentHands[0].length === 0) return false;
    if (this.opponentHands[0][0].value !== 'A') return false;
    
    // Cannot already have insurance
    if (this.insuranceBet > 0) return false;
    
    // Must have enough money (unless free)
    if (!this.perkEffects.freeInsurance && this.betAmount < 2) return false;
    
    return true;
  }

  // Enhanced dealer blackjack check
  dealerHasBlackjack() {
    if (!this.opponentHands[0] || this.opponentHands[0].length !== 2) return false;
    
    const dealerValue = this.calculateHandValue(this.opponentHands[0]);
    const hasBlackjack = dealerValue === 21;
    
    if (hasBlackjack) {
      console.log('🎯 Dealer has blackjack!');
    }
    
    return hasBlackjack;
  }
  
  // Enhanced move to next player
  moveToNextPlayer() {
    console.log(`🔄 Moving from ${this.currentPlayer} to next player`);
    
    // Handle split hands first
    if (this.splitHands.length > 0 && this.currentPlayer === 'player') {
      // If we were playing first split hand, move to second
      if (this.playerHand === this.splitHands[0]) {
        this.playerHand = this.splitHands[1];
        console.log('🔀 Switching to second split hand');
        return;
      }
    }
    
    // Move to dealer/opponents
    this.currentPlayer = `opponent-${this.currentOpponentIndex}`;
    this.opponentPlay();
  }
 
  // Enhanced opponent play with improved dealer logic
  opponentPlay() {
    console.log(`🤖 Opponent ${this.currentOpponentIndex} playing...`);
    
    while (this.currentOpponentIndex < this.numOpponents) {
      const currentHand = this.opponentHands[this.currentOpponentIndex];
      
      // Enhanced dealer strategy with perk effects
      let shouldHit = true;
      let hitCount = 0;
      const maxHits = 10; // Prevent infinite loops
      
      while (shouldHit && hitCount < maxHits) {
        const handValue = this.calculateHandValue(currentHand);
        const isSoft = this.isSoftHand(currentHand);
        
        // Basic dealer rules
        if (handValue < 17) {
          shouldHit = true;
        }
        // Soft 17 rule (enhanced with perk)
        else if (handValue === 17 && isSoft && this.dealerRules.hitSoft17) {
          shouldHit = true;
          console.log('😈 Dealer hits soft 17 (Dealer\'s Nightmare effect)');
          
          // Track perk activation
          this.perkActivations.dealerHitSoft17 = (this.perkActivations.dealerHitSoft17 || 0) + 1;
        }
        // Hard 16 rule (enhanced with perk)
        else if (handValue === 16 && !isSoft && this.dealerRules.hitHard16) {
          shouldHit = true;
          console.log('😈 Dealer hits hard 16 (Dealer\'s Nightmare effect)');
          
          // Track perk activation
          this.perkActivations.dealerHitHard16 = (this.perkActivations.dealerHitHard16 || 0) + 1;
        }
        else {
          shouldHit = false;
        }
        
        if (shouldHit) {
          const newCard = this.drawCard();
          currentHand.push(newCard);
          hitCount++;
          
          console.log(`🎴 Dealer drew: ${newCard.value} of ${newCard.suit} (total: ${this.calculateHandValue(currentHand)})`);
        }
      }
      
      if (hitCount >= maxHits) {
        console.warn('⚠️ Dealer hit limit reached - forcing stand');
      }
      
      const finalValue = this.calculateHandValue(currentHand);
      console.log(`🏁 Opponent ${this.currentOpponentIndex} finished with ${finalValue}`);
      
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
  
  // Enhanced game ending
  endGame() {
    this.isGameOver = true;
    this.currentPlayer = 'gameOver';
    
    console.log(`🎊 Game #${this.handNumber} ended`);
    
    const results = this.determineWinners();
    console.log('🏆 Game results:', results);
    
    return results;
  }
 
  // Enhanced winner determination with better Guardian Angel logic
  determineWinners() {
    let playerValue = this.calculateHandValue(this.playerHand);
    const results = [];
    
    console.log('🏆 Determining winners:', {
      playerValue,
      preventedBusts: this.preventedBusts,
      originalBust: playerValue > 21
    });
    
    // Apply Guardian Angel effect if bust was prevented
    const wasBustPrevented = this.preventedBusts > 0 && playerValue > 21;
    if (wasBustPrevented) {
      playerValue = 21; // Treat as 21
      console.log('👼 Guardian Angel: Treating prevented bust as 21');
    }
    
    // Handle player bust (without Guardian Angel protection)
    if (playerValue > 21 && !wasBustPrevented) {
      console.log(`💥 Player busted with ${playerValue}`);
      for (let i = 0; i < this.numOpponents; i++) {
        results.push('opponent');
      }
      return results;
    }
    
    // Compare against each opponent
    for (let i = 0; i < this.numOpponents; i++) {
      const opponentValue = this.calculateHandValue(this.opponentHands[i]);
      
      console.log(`⚖️ Comparing: Player ${playerValue} vs Opponent ${i} ${opponentValue}`);
      
      // Opponent busts
      if (opponentValue > 21) {
        console.log(`💥 Opponent ${i} busted`);
        results.push('player');
        continue;
      }
      
      // Compare values
      if (playerValue > opponentValue) {
        console.log(`🏆 Player wins ${playerValue} vs ${opponentValue}`);
        results.push('player');
      } else if (opponentValue > playerValue) {
        console.log(`😞 Opponent ${i} wins ${opponentValue} vs ${playerValue}`);
        results.push('opponent');
      } else {
        // Equal values - check for blackjacks
        const playerBlackjack = playerValue === 21 && this.playerHand.length === 2 && !wasBustPrevented;
        const opponentBlackjack = opponentValue === 21 && this.opponentHands[i].length === 2;
        
        if (playerBlackjack && !opponentBlackjack) {
          console.log('🎯 Player blackjack beats dealer 21');
          results.push('player');
        } else if (opponentBlackjack && !playerBlackjack) {
          console.log('🎯 Dealer blackjack beats player 21');
          results.push('opponent');
        } else {
          console.log('🤝 Push (tie)');
          results.push('tie');
        }
      }
    }
    
    return results;
  }

  // Enhanced perk bonus calculation
  calculatePerkBonuses() {
    const bonuses = {
      aceBonus: 0,
      faceCardBonus: 0,
      splitBonus: 0,
      streakBonus: 0,
      comebackBonus: 0
    };

    // Ace Affinity bonus
    if (this.perkEffects.aceBonus && this.hasAces(this.playerHand)) {
      const playerValue = this.calculateHandValue(this.playerHand);
      // Only if win and not blackjack (blackjack has its own multiplier)
      if (!(playerValue === 21 && this.playerHand.length === 2)) {
        bonuses.aceBonus = this.perkEffects.aceBonus;
        console.log(`♠️ Ace Affinity bonus: +${bonuses.aceBonus}`);
      }
    }

    // Face Card Friend bonus
    if (this.perkEffects.faceCardBonus && this.perkEffects.faceCardCount) {
      const faceCardCount = this.countFaceCards(this.playerHand);
      if (faceCardCount >= this.perkEffects.faceCardCount) {
        bonuses.faceCardBonus = this.perkEffects.faceCardBonus;
        console.log(`👑 Face Card Friend bonus: +${bonuses.faceCardBonus} (${faceCardCount} face cards)`);
      }
    }

    // Split Master bonus
    if (this.perkEffects.splitBonus && this.splitHands.length > 0) {
      bonuses.splitBonus = this.perkEffects.splitBonus;
      console.log(`✂️ Split Master bonus: +${bonuses.splitBonus}`);
    }

    return bonuses;
  }

  // Enhanced insurance payout calculation
  calculateInsurancePayout() {
    if (this.insuranceBet === 0) return 0;
    
    if (this.dealerHasBlackjack()) {
      const payout = this.insuranceBet * 2; // Insurance pays 2:1
      console.log(`📋 Insurance won: +${payout} (bet: ${this.insuranceBet})`);
      return payout;
    } else {
      console.log(`📋 Insurance lost: -${this.insuranceBet}`);
      return -this.insuranceBet;
    }
  }
  
  // Enhanced opponent hand getter with validation
  getOpponentHand(index) {
    if (index >= 0 && index < this.numOpponents && this.opponentHands[index]) {
      return this.opponentHands[index];
    }
    console.warn(`⚠️ Invalid opponent index: ${index}`);
    return [];
  }
 
  // Enhanced bet placement with validation
  placeBet(amount) {
    if (typeof amount !== 'number' || amount < 0) {
      console.warn('⚠️ Invalid bet amount:', amount);
      return false;
    }
    
    this.betAmount = Math.floor(amount);
    console.log(`💰 Bet placed: ${this.betAmount}`);
    return true;
  }
 
  // Bet amount getter
  getBetAmount() {
    return this.betAmount;
  }
 
  // Enhanced new game initialization
  newGame() {
    console.log('🆕 Starting new game...');
    this.initializeDeck();
    this.dealInitialCards();
    
    // Reset per-game stats but keep per-round stats
    this.gameStats.totalActions = 0;
    // Don't reset undosUsed or preventBustsUsed here - they reset per round, not per hand
  }

  // Reset per-round stats (called when new perk round starts)
  resetRoundStats() {
    this.gameStats.undosUsed = 0;
    this.gameStats.preventBustsUsed = 0;
    console.log('🔄 Round stats reset - undo and prevent bust counters reset');
  }
  
  // Enhanced opponent number setting
  setNumOpponents(num) {
    const validNum = Math.max(1, Math.min(num, 3));
    if (validNum !== num) {
      console.warn(`⚠️ Opponent count adjusted: ${num} → ${validNum} (limit: 1-3)`);
    }
    
    this.numOpponents = validNum;
    this.opponentHands = Array(this.numOpponents).fill().map(() => []);
    this.currentOpponentIndex = 0;
    
    console.log(`🎯 Opponents set to: ${this.numOpponents}`);
  }
  
  // Enhanced results with comprehensive information
  getResults() {
    if (!this.isGameOver) {
      return null;
    }
    
    const winners = this.determineWinners();
    let playerValue = this.calculateHandValue(this.playerHand);
    
    // Apply Guardian Angel effect for display
    const wasBustPrevented = this.preventedBusts > 0 && playerValue > 21;
    if (wasBustPrevented) {
      playerValue = 21;
    }
    
    const results = [];
    
    for (let i = 0; i < this.numOpponents; i++) {
      const opponentValue = this.calculateHandValue(this.opponentHands[i]);
      let result = "";
      let resultType = "";
      
      if (playerValue > 21 && !wasBustPrevented) {
        result = "You bust";
        resultType = "loss";
      } else if (opponentValue > 21) {
        result = "Dealer busts - You win!";
        resultType = "win";
      } else if (winners[i] === 'player') {
        if (playerValue === 21 && this.playerHand.length === 2) {
          result = "Blackjack!";
          resultType = "blackjack";
        } else {
          result = "You win!";
          resultType = "win";
        }
      } else if (winners[i] === 'opponent') {
        result = "Dealer wins";
        resultType = "loss";
      } else {
        result = "Push (Tie)";
        resultType = "push";
      }
      
      results.push({
        result,
        resultType,
        playerValue,
        opponentValue,
        perkBonuses: this.calculatePerkBonuses(),
        insurancePayout: this.calculateInsurancePayout(),
        preventedBusts: this.preventedBusts,
        wasBustPrevented,
        handNumber: this.handNumber,
        perkActivations: { ...this.perkActivations },
        gameStats: { ...this.gameStats }
      });
    }
    
    return results;
  }

  // Enhanced game state for debugging and UI
  getGameState() {
    return {
      handNumber: this.handNumber,
      playerHand: this.playerHand,
      opponentHands: this.opponentHands,
      currentPlayer: this.currentPlayer,
      isGameOver: this.isGameOver,
      betAmount: this.betAmount,
      
      // Perk-related state
      perkEffects: { ...this.perkEffects },
      preventedBusts: this.preventedBusts,
      splitHands: this.splitHands,
      insuranceBet: this.insuranceBet,
      dealerRules: { ...this.dealerRules },
      
      // Action availability
      canUndo: this.gameHistory.length > 0 && 
               this.perkEffects.undoActions > 0 && 
               this.gameStats.undosUsed < this.perkEffects.undoActions,
      canSplit: this.canSplit(),
      canTakeInsurance: this.canTakeInsurance(),
      canPreventBust: this.perkEffects.preventBust > 0 && 
                      this.gameStats.preventBustsUsed < this.perkEffects.preventBust,
      
      // Statistics
      gameStats: { ...this.gameStats },
      perkActivations: { ...this.perkActivations },
      
      // Deck info
      deckSize: this.deck.length,
      
      // Calculated values
      playerHandValue: this.calculateHandValue(this.playerHand),
      opponentHandValues: this.opponentHands.map(hand => this.calculateHandValue(hand)),
      
      // Hand analysis
      playerHasSoftHand: this.isSoftHand(this.playerHand),
      playerHasAces: this.hasAces(this.playerHand),
      playerFaceCardCount: this.countFaceCards(this.playerHand)
    };
  }

  // New method: Reset for new session
  resetSession() {
    this.handNumber = 0;
    this.perkActivations = {};
    this.gameStats = {
      totalActions: 0,
      undosUsed: 0,
      preventBustsUsed: 0
    };
    console.log('🔄 Game session reset');
  }

  // New method: Get perk activation summary
  getPerkActivationSummary() {
    return {
      totalActivations: Object.values(this.perkActivations).reduce((sum, count) => sum + count, 0),
      activations: { ...this.perkActivations },
      handsPlayed: this.handNumber
    };
  }
}

export default BlackjackGame;