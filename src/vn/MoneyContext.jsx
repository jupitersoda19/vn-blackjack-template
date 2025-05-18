import React, { createContext, useState, useContext, useEffect } from 'react';

export const MoneyContext = createContext();
export const useMoney = () => useContext(MoneyContext);

export const MoneyProvider = ({ children, initialMoney = 5000 }) => {
  const getSavedMoney = () => {
    try {
      const saved = localStorage.getItem('playerMoney');
      return saved ? JSON.parse(saved) : initialMoney;
    } catch (error) {
      console.error("Error retrieving saved money:", error);
      return initialMoney;
    }
  };

  const [playerMoney, setPlayerMoney] = useState(getSavedMoney());
  const [startingMoney, setStartingMoney] = useState(initialMoney);
  
  useEffect(() => {
    try {
      localStorage.setItem('playerMoney', JSON.stringify(playerMoney));
    } catch (error) {
      console.error("Error saving money:", error);
    }
  }, [playerMoney]);
  
  const updateMoney = (amount) => {
    setPlayerMoney(prevMoney => {
      const newAmount = prevMoney + amount;
      return Math.max(0, newAmount);
    });
  };
  
  const setMoney = (amount) => {
    const newAmount = Math.max(0, amount);
    setPlayerMoney(newAmount);
  };
  
  const resetMoney = () => {
    setPlayerMoney(initialMoney);
    setStartingMoney(initialMoney);
  };
  
  const initializeWithAmount = (amount) => {
    const validAmount = Math.max(0, amount);
    setPlayerMoney(validAmount);
    setStartingMoney(validAmount);
  };

  return (
    <MoneyContext.Provider 
      value={{ 
        playerMoney, 
        updateMoney, 
        setMoney, 
        resetMoney,
        startingMoney,
        initializeWithAmount
      }}
    >
      {children}
    </MoneyContext.Provider>
  );
};