// hooks/useGameSetup.js
import { useState, useEffect } from 'react';

export const useGameSetup = (initialEvent, numOpponents) => {
  const [gameData, setGameData] = useState({
    player: null,
    dealers: [],
    playerEvent: null,
    gameRules: {}
  });
  const [isGameSetup, setIsGameSetup] = useState(false);

  const setupGame = useEffect(() => {
    if (initialEvent && initialEvent.action === 'startGame' && initialEvent.eventParams) {
      try {
        const eventParams = initialEvent.eventParams;
        
        const playerData = eventParams.player || {
          name: "Player",
          image: "/assets/characters/default.png",
          startingMoney: eventParams.playerCost || 1000
        };
        
        const dealersData = eventParams.dealers || [{
          name: "Dealer",
          image: "/assets/characters/default.png", 
          startingMoney: 5000,
          eventName: "Default Table"
        }];
        
        const gameRules = {
          deckCount: eventParams.deckCount || 1,
          blackjackPayout: eventParams.blackjackPayout || 1.5,
          specialRules: eventParams.specialRules || null
        };
        
        setGameData({
          player: playerData,
          dealers: dealersData,
          playerEvent: {
            name: eventParams.playerEvent || "Blackjack Game",
            cost: eventParams.playerCost || 1000
          },
          gameRules: gameRules
        });
        
        setIsGameSetup(true);
      } catch (error) {
        console.error("Error setting up game from JSON:", error);
        
        // Fallback setup
        setGameData({
          player: { name: "Player", image: "/assets/characters/default.png", startingMoney: 1000 },
          dealers: [{ name: "Dealer", image: "/assets/characters/default.png", startingMoney: 5000, eventName: "Default Table" }],
          playerEvent: { name: "Default Game", cost: 1000 },
          gameRules: { deckCount: 1, blackjackPayout: 1.5, specialRules: null }
        });
        setIsGameSetup(true);
      }
    }
  }, [initialEvent]);

  return { gameData, isGameSetup, setupGame };
};