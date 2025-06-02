import React, { useRef, useEffect, useState, useCallback } from 'react';

const DartGame = ({ 
  initialEvent = {},
  onGameComplete,
  gameState = {}
}) => {
  // Extract parameters from initialEvent
  const eventParams = initialEvent.eventParams || {};
  const opponentName = eventParams.opponentName || "Opponent";
  const opponentSkill = eventParams.opponentSkill || "medium"; // "easy", "medium", "hard"
  const dartsPerPlayer = eventParams.dartsPerPlayer || 9;
  const gameMode = eventParams.gameMode || "highest_score"; // "highest_score", "501", etc.
  
  const canvasRef = useRef(null);
  const [localGameState, setLocalGameState] = useState({
    playerScore: 0,
    opponentScore: 0,
    dartsThrown: 0,
    power: 0,
    isAiming: false,
    isCharging: false,
    gameStatus: 'Your turn! Ready to throw!',
    currentPlayer: 'human', // 'human' or 'opponent'
    gameComplete: false
  });
  
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [tremor, setTremor] = useState({ x: 0, y: 0 });
  const [darts, setDarts] = useState([]);
  
  // Dartboard configuration
  const DARTBOARD = {
    center: { x: 300, y: 225 },
    radius: 150,
    bullseyeRadius: 12,
    innerBullRadius: 30,
    innerRingStart: 80,
    innerRingEnd: 100,
    outerRingStart: 120,
    outerRingEnd: 140
  };
  
  const DART_SCORES = [20, 1, 18, 4, 13, 6, 10, 15, 2, 17, 3, 19, 7, 16, 8, 11, 14, 9, 12, 5];
  
  // Draw dartboard
  const drawDartboard = (ctx) => {
    const { center, radius } = DARTBOARD;
    
    // Outer black border
    ctx.fillStyle = '#000000';
    ctx.beginPath();
    ctx.arc(center.x, center.y, radius + 10, 0, 2 * Math.PI);
    ctx.fill();
    
    // Main dartboard segments
    for (let i = 0; i < 20; i++) {
      const angle = (i * 18 - 9) * Math.PI / 180;
      const nextAngle = ((i + 1) * 18 - 9) * Math.PI / 180;
      
      // Alternate colors for segments (cream and black)
      const isLight = i % 2 === 0;
      
      // Outer segments (single scoring area)
      ctx.fillStyle = isLight ? '#F5F5DC' : '#000000';
      ctx.beginPath();
      ctx.moveTo(center.x, center.y);
      ctx.arc(center.x, center.y, radius, angle, nextAngle);
      ctx.closePath();
      ctx.fill();
      
      // Fill area between triple and double (single scoring)
      ctx.fillStyle = isLight ? '#F5F5DC' : '#000000';
      ctx.beginPath();
      ctx.arc(center.x, center.y, DARTBOARD.outerRingStart, angle, nextAngle);
      ctx.arc(center.x, center.y, DARTBOARD.innerRingEnd, nextAngle, angle, true);
      ctx.closePath();
      ctx.fill();
      
      // Fill inner area (single scoring)
      ctx.fillStyle = isLight ? '#F5F5DC' : '#000000';
      ctx.beginPath();
      ctx.arc(center.x, center.y, DARTBOARD.innerRingStart, angle, nextAngle);
      ctx.arc(center.x, center.y, DARTBOARD.innerBullRadius, nextAngle, angle, true);
      ctx.closePath();
      ctx.fill();
    }
    
    // Scoring rings
    for (let i = 0; i < 20; i++) {
      const angle = (i * 18 - 9) * Math.PI / 180;
      const nextAngle = ((i + 1) * 18 - 9) * Math.PI / 180;
      
      // Double ring (outer) - alternating red and green
      ctx.fillStyle = i % 2 === 0 ? '#DC143C' : '#228B22';
      ctx.beginPath();
      ctx.arc(center.x, center.y, DARTBOARD.outerRingEnd, angle, nextAngle);
      ctx.arc(center.x, center.y, DARTBOARD.outerRingStart, nextAngle, angle, true);
      ctx.closePath();
      ctx.fill();
      
      // Triple ring (inner) - alternating red and green
      ctx.fillStyle = i % 2 === 0 ? '#DC143C' : '#228B22';
      ctx.beginPath();
      ctx.arc(center.x, center.y, DARTBOARD.innerRingEnd, angle, nextAngle);
      ctx.arc(center.x, center.y, DARTBOARD.innerRingStart, nextAngle, angle, true);
      ctx.closePath();
      ctx.fill();
    }
    
    // Outer bull (25 points) - green
    ctx.fillStyle = '#228B22';
    ctx.beginPath();
    ctx.arc(center.x, center.y, DARTBOARD.innerBullRadius, 0, 2 * Math.PI);
    ctx.fill();
    
    // Inner bull/bullseye (50 points) - red
    ctx.fillStyle = '#DC143C';
    ctx.beginPath();
    ctx.arc(center.x, center.y, DARTBOARD.bullseyeRadius, 0, 2 * Math.PI);
    ctx.fill();
    
    // Wire frame (thin black lines for segments)
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 1;
    for (let i = 0; i < 20; i++) {
      const angle = i * 18 * Math.PI / 180;
      ctx.beginPath();
      ctx.moveTo(center.x, center.y);
      ctx.lineTo(
        center.x + Math.cos(angle - Math.PI / 2) * radius,
        center.y + Math.sin(angle - Math.PI / 2) * radius
      );
      ctx.stroke();
    }
    
    // Ring outlines
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 2;
    [DARTBOARD.innerBullRadius, DARTBOARD.bullseyeRadius, DARTBOARD.innerRingStart, 
     DARTBOARD.innerRingEnd, DARTBOARD.outerRingStart, DARTBOARD.outerRingEnd, radius].forEach(r => {
      ctx.beginPath();
      ctx.arc(center.x, center.y, r, 0, 2 * Math.PI);
      ctx.stroke();
    });
    
    // Draw numbers
    ctx.fillStyle = '#FFFFFF';
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 1;
    ctx.font = 'bold 18px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    
    for (let i = 0; i < 20; i++) {
      const angle = i * 18 * Math.PI / 180;
      const x = center.x + Math.cos(angle - Math.PI / 2) * (radius - 15);
      const y = center.y + Math.sin(angle - Math.PI / 2) * (radius - 15);
      
      // White text with black outline for visibility
      ctx.strokeText(DART_SCORES[i].toString(), x, y);
      ctx.fillText(DART_SCORES[i].toString(), x, y);
    }
  };
  
  // Draw crosshair for aiming
  const drawCrosshair = (ctx, x, y) => {
    if (!localGameState.isAiming) return;
    
    // Add hand tremor for realism
    const finalX = x + tremor.x;
    const finalY = y + tremor.y;
    
    ctx.strokeStyle = '#ff0000';
    ctx.lineWidth = 2;
    ctx.setLineDash([5, 5]);
    
    ctx.beginPath();
    ctx.moveTo(finalX - 20, finalY);
    ctx.lineTo(finalX + 20, finalY);
    ctx.moveTo(finalX, finalY - 20);
    ctx.lineTo(finalX, finalY + 20);
    ctx.stroke();
    ctx.setLineDash([]);
    
    // Draw center dot
    ctx.fillStyle = '#ff0000';
    ctx.beginPath();
    ctx.arc(finalX, finalY, 2, 0, 2 * Math.PI);
    ctx.fill();
  };
  
  // Draw darts on board
  const drawDarts = (ctx) => {
    darts.forEach(dart => {
      // Different colors for human vs opponent darts
      const dartColor = dart.player === 'human' ? '#4169E1' : '#FF4500'; // Blue for human, Red for opponent
      const tailColor = dart.player === 'human' ? '#FFD700' : '#FFFF00'; // Gold for human, Yellow for opponent
      
      ctx.fillStyle = dartColor;
      ctx.beginPath();
      ctx.arc(dart.x, dart.y, 3, 0, 2 * Math.PI);
      ctx.fill();
      
      // Dart tail
      ctx.strokeStyle = tailColor;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(dart.x, dart.y);
      ctx.lineTo(dart.x - 15, dart.y - 5);
      ctx.stroke();
    });
  };
  
  // Opponent decision making based on skill level
  const getOpponentTarget = () => {
    const { center, radius } = DARTBOARD;
    
    // Skill-based strategy adjustments
    const skillSettings = {
      easy: { bullseyeChance: 0.15, highNumberChance: 0.50, powerVariation: 0.4 },
      medium: { bullseyeChance: 0.25, highNumberChance: 0.60, powerVariation: 0.25 },
      hard: { bullseyeChance: 0.35, highNumberChance: 0.70, powerVariation: 0.15 }
    };
    
    const settings = skillSettings[opponentSkill] || skillSettings.medium;
    const strategy = Math.random();
    
    if (strategy < settings.bullseyeChance) {
      // Aim for bullseye
      const offset = opponentSkill === 'hard' ? 15 : opponentSkill === 'medium' ? 20 : 30;
      return {
        x: center.x + (Math.random() - 0.5) * offset,
        y: center.y + (Math.random() - 0.5) * offset,
        power: 0.6 + (Math.random() - 0.5) * settings.powerVariation
      };
    } else if (strategy < settings.bullseyeChance + settings.highNumberChance) {
      // Aim for high-scoring segments (20, 19, 18, 17)
      const targetNumbers = [20, 19, 18, 17];
      const targetNum = targetNumbers[Math.floor(Math.random() * targetNumbers.length)];
      const segmentIndex = DART_SCORES.indexOf(targetNum);
      
      // Calculate angle for this segment
      const angle = segmentIndex * 18 * Math.PI / 180;
      const targetRadius = 60 + Math.random() * 40;
      
      return {
        x: center.x + Math.cos(angle - Math.PI / 2) * targetRadius,
        y: center.y + Math.sin(angle - Math.PI / 2) * targetRadius,
        power: 0.6 + (Math.random() - 0.5) * settings.powerVariation
      };
    } else {
      // Random aim (opponent makes mistakes)
      const randomAngle = Math.random() * 2 * Math.PI;
      const randomRadius = Math.random() * radius * 0.8;
      
      return {
        x: center.x + Math.cos(randomAngle) * randomRadius,
        y: center.y + Math.sin(randomAngle) * randomRadius,
        power: 0.5 + (Math.random() - 0.5) * settings.powerVariation * 2
      };
    }
  };
  
  // Opponent throw logic
  const executeOpponentThrow = useCallback(() => {
    if (localGameState.currentPlayer !== 'opponent' || localGameState.gameComplete) return;
    
    const opponentTarget = getOpponentTarget();
    
    // Add opponent "thinking" delay for realism
    const thinkingTime = opponentSkill === 'hard' ? 800 : opponentSkill === 'medium' ? 1200 : 1600;
    setTimeout(() => {
      throwDart(opponentTarget.x, opponentTarget.y, opponentTarget.power, 'opponent');
    }, thinkingTime + Math.random() * 800);
  }, [localGameState.currentPlayer, localGameState.gameComplete, opponentSkill]);

  const calculateScore = (x, y) => {
    const dx = x - DARTBOARD.center.x;
    const dy = y - DARTBOARD.center.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    
    // Miss the board
    if (distance > DARTBOARD.radius) return 0;
    
    // Bullseye
    if (distance <= DARTBOARD.bullseyeRadius) return 50;
    if (distance <= DARTBOARD.innerBullRadius) return 25;
    
    // Calculate which segment
    let angle = Math.atan2(dy, dx) * 180 / Math.PI + 90;
    if (angle < 0) angle += 360;
    
    const segmentIndex = Math.floor((angle + 9) / 18) % 20;
    const baseScore = DART_SCORES[segmentIndex];
    
    // Check for special rings
    if (distance >= DARTBOARD.outerRingStart && distance <= DARTBOARD.outerRingEnd) {
      return baseScore * 2; // Double
    }
    if (distance >= DARTBOARD.innerRingStart && distance <= DARTBOARD.innerRingEnd) {
      return baseScore * 3; // Triple
    }
    
    return baseScore;
  };
  
  // Handle dart throw
  const throwDart = useCallback((targetX, targetY, power, player = 'human') => {
    // For opponent, don't use tremor (they have their own inaccuracy)
    const actualTargetX = player === 'human' ? targetX + tremor.x : targetX;
    const actualTargetY = player === 'human' ? targetY + tremor.y : targetY;
    
    // Calculate distance from dartboard center for difficulty
    const dx = actualTargetX - DARTBOARD.center.x;
    const dy = actualTargetY - DARTBOARD.center.y;
    const distanceFromCenter = Math.sqrt(dx * dx + dy * dy);
    
    // Balanced inaccuracy system (opponent has skill-based accuracy)
    let baseInaccuracy = player === 'human' ? 15 : 
                        opponentSkill === 'easy' ? 25 : 
                        opponentSkill === 'medium' ? 18 : 12; // Hard opponent is more accurate
    
    // Power affects accuracy (sweet spot at 60%)
    const optimalPower = 0.6;
    const powerPenalty = Math.abs(power - optimalPower) * 35;
    
    // Distance penalty (harder to hit edges accurately)
    const distancePenalty = (distanceFromCenter / DARTBOARD.radius) * 20;
    
    // Combine all inaccuracy factors with reasonable cap
    const totalInaccuracy = Math.min(45, baseInaccuracy + powerPenalty + distancePenalty);
    
    // Add random spread in both X and Y directions
    const spreadX = (Math.random() - 0.5) * totalInaccuracy * 1.5;
    const spreadY = (Math.random() - 0.5) * totalInaccuracy * 1.5;
    
    // Very low power might not reach the board
    if (power < 0.15) {
      const shortfall = (0.15 - power) * 70;
      const finalX = actualTargetX + spreadX - shortfall;
      const finalY = actualTargetY + spreadY + shortfall;
      
      setDarts(prev => [...prev, { x: finalX, y: finalY, player }]);
      
      const nextPlayer = player === 'human' ? 'opponent' : 'human';
      const newDartsThrown = localGameState.dartsThrown + 1;
      const maxDarts = dartsPerPlayer * 2;
      
      setLocalGameState(prev => ({
        ...prev,
        dartsThrown: newDartsThrown,
        isAiming: false,
        isCharging: false,
        power: 0,
        currentPlayer: nextPlayer,
        gameStatus: player === 'human' ? `Too weak! ${opponentName}'s turn` : `${opponentName} dart fell short. Your turn!`,
        gameComplete: newDartsThrown >= maxDarts
      }));
      return;
    }
    
    // Very high power might overshoot
    if (power > 0.95) {
      const overshoot = (power - 0.95) * 100;
      const finalX = actualTargetX + spreadX + overshoot * Math.cos(Math.atan2(dy, dx));
      const finalY = actualTargetY + spreadY + overshoot * Math.sin(Math.atan2(dy, dx));
      
      setDarts(prev => [...prev, { x: finalX, y: finalY, player }]);
      
      const nextPlayer = player === 'human' ? 'opponent' : 'human';
      const newDartsThrown = localGameState.dartsThrown + 1;
      const maxDarts = dartsPerPlayer * 2;
      
      setLocalGameState(prev => ({
        ...prev,
        dartsThrown: newDartsThrown,
        isAiming: false,
        isCharging: false,
        power: 0,
        currentPlayer: nextPlayer,
        gameStatus: player === 'human' ? `Too strong! ${opponentName}'s turn` : `${opponentName} overshot. Your turn!`,
        gameComplete: newDartsThrown >= maxDarts
      }));
      return;
    }
    
    const finalX = actualTargetX + spreadX;
    const finalY = actualTargetY + spreadY;
    
    const score = calculateScore(finalX, finalY);
    
    setDarts(prev => [...prev, { x: finalX, y: finalY, player }]);
    
    const nextPlayer = player === 'human' ? 'opponent' : 'human';
    const newDartsThrown = localGameState.dartsThrown + 1;
    const maxDarts = dartsPerPlayer * 2;
    
    setLocalGameState(prev => ({
      ...prev,
      [player === 'human' ? 'playerScore' : 'opponentScore']: prev[player === 'human' ? 'playerScore' : 'opponentScore'] + score,
      dartsThrown: newDartsThrown,
      isAiming: false,
      isCharging: false,
      power: 0,
      currentPlayer: nextPlayer,
      gameStatus: newDartsThrown >= maxDarts ? 'Game Over!' : 
                  (player === 'human' ? 
                    (score > 0 ? `Hit! +${score} points. ${opponentName}'s turn` : `Missed! ${opponentName}'s turn`) :
                    (score > 0 ? `${opponentName} scored ${score}! Your turn` : `${opponentName} missed! Your turn`)),
      gameComplete: newDartsThrown >= maxDarts
    }));
  }, [tremor, localGameState.dartsThrown, opponentName, opponentSkill, dartsPerPlayer]);
  
  // NEW: Handle game completion and call visual novel callback
  useEffect(() => {
    if (localGameState.gameComplete && onGameComplete) {
      // Determine winner and create result message
      let resultMessage = '';
      if (localGameState.playerScore > localGameState.opponentScore) {
        resultMessage = `You won the dart game! Final score: ${localGameState.playerScore} - ${localGameState.opponentScore}`;
      } else if (localGameState.opponentScore > localGameState.playerScore) {
        resultMessage = `${opponentName} won the dart game! Final score: ${localGameState.playerScore} - ${localGameState.opponentScore}`;
      } else {
        resultMessage = `The dart game ended in a tie! Final score: ${localGameState.playerScore} - ${localGameState.opponentScore}`;
      }

      // Calculate additional stats
      const playerAverage = (localGameState.playerScore / dartsPerPlayer).toFixed(1);
      const opponentAverage = (localGameState.opponentScore / dartsPerPlayer).toFixed(1);
      const totalDarts = dartsPerPlayer * 2;
      const accuracy = ((darts.filter(dart => calculateScore(dart.x, dart.y) > 0).length / totalDarts) * 100).toFixed(1);

      // Prepare game-specific data for the visual novel
      const dartGameData = {
        playerScore: localGameState.playerScore,
        opponentScore: localGameState.opponentScore,
        playerAverage: parseFloat(playerAverage),
        opponentAverage: parseFloat(opponentAverage),
        dartsThrown: totalDarts,
        accuracy: parseFloat(accuracy),
        opponentName: opponentName,
        opponentSkill: opponentSkill,
        gameMode: gameMode,
        winner: localGameState.playerScore > localGameState.opponentScore ? 'player' : 
               localGameState.opponentScore > localGameState.playerScore ? 'opponent' : 'tie',
        scoreDifference: Math.abs(localGameState.playerScore - localGameState.opponentScore)
      };

      // Call the visual novel completion handler
      setTimeout(() => {
        onGameComplete(resultMessage, dartGameData);
      }, 2000); // Small delay to show final state
    }
  }, [localGameState.gameComplete, localGameState.playerScore, localGameState.opponentScore, onGameComplete, opponentName, opponentSkill, gameMode, dartsPerPlayer, darts]);
  
  // Mouse handlers (only active on human turn)
  const handleMouseMove = (e) => {
    if (localGameState.currentPlayer !== 'human' || localGameState.gameComplete) return;
    
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    setMousePos({ x, y });
    
    if (!localGameState.isCharging) {
      setLocalGameState(prev => ({ ...prev, isAiming: true }));
    }
  };
  
  const handleMouseDown = (e) => {
    if (localGameState.currentPlayer !== 'human' || localGameState.gameComplete) return;
    if (localGameState.dartsThrown >= dartsPerPlayer * 2) return; // Max darts total
    
    setLocalGameState(prev => ({
      ...prev,
      isCharging: true,
      gameStatus: 'Hold to charge power, release to throw!'
    }));
  };
  
  const handleMouseUp = (e) => {
    if (localGameState.currentPlayer !== 'human' || localGameState.gameComplete) return;
    if (localGameState.isCharging) {
      throwDart(mousePos.x, mousePos.y, localGameState.power, 'human');
    }
  };
  
  // Hand tremor effect (only for human player)
  useEffect(() => {
    let interval;
    if (localGameState.isAiming && localGameState.currentPlayer === 'human') {
      interval = setInterval(() => {
        setTremor({
          x: (Math.random() - 0.5) * 6, // Subtle hand shake
          y: (Math.random() - 0.5) * 6
        });
      }, 100);
    } else {
      setTremor({ x: 0, y: 0 });
    }
    return () => clearInterval(interval);
  }, [localGameState.isAiming, localGameState.currentPlayer]);
  
  // Opponent turn logic
  useEffect(() => {
    if (localGameState.currentPlayer === 'opponent' && !localGameState.gameComplete) {
      executeOpponentThrow();
    }
  }, [localGameState.currentPlayer, localGameState.gameComplete, executeOpponentThrow]);
  
  // Power charging effect (only for human)
  useEffect(() => {
    let interval;
    if (localGameState.isCharging && localGameState.currentPlayer === 'human') {
      interval = setInterval(() => {
        setLocalGameState(prev => ({
          ...prev,
          power: Math.min(1, prev.power + 0.02)
        }));
      }, 50);
    }
    return () => clearInterval(interval);
  }, [localGameState.isCharging, localGameState.currentPlayer]);
  
  // Canvas drawing
  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Draw game elements
    drawDartboard(ctx);
    drawDarts(ctx);
    drawCrosshair(ctx, mousePos.x, mousePos.y);
    
  }, [mousePos, darts, localGameState.isAiming]);
  
  const resetGame = () => {
    setDarts([]);
    setLocalGameState({
      playerScore: 0,
      opponentScore: 0,
      dartsThrown: 0,
      power: 0,
      isAiming: false,
      isCharging: false,
      gameStatus: 'Your turn! Ready to throw!',
      currentPlayer: 'human',
      gameComplete: false
    });
  };
  
  return (
    <div className="flex flex-col h-screen bg-gray-900 text-white overflow-hidden">
      {/* Compact Header */}
      <div className="flex justify-between items-center px-6 py-3 bg-gray-800 border-b border-gray-700">
        <h1 className="text-2xl font-bold text-yellow-400">🎯 Dart Game</h1>
        
        {/* Player vs Opponent Scores */}
        <div className="flex items-center gap-4">
          <div className={`text-center p-2 rounded ${localGameState.currentPlayer === 'human' ? 'bg-blue-700' : 'bg-gray-700'}`}>
            <div className="text-sm text-blue-300">You 🎯</div>
            <div className="text-xl font-bold text-blue-400">{localGameState.playerScore}</div>
          </div>
          
          <div className="text-lg font-bold text-white">VS</div>
          
          <div className={`text-center p-2 rounded ${localGameState.currentPlayer === 'opponent' ? 'bg-red-700' : 'bg-gray-700'}`}>
            <div className="text-sm text-red-300">{opponentName}</div>
            <div className="text-xl font-bold text-red-400">{localGameState.opponentScore}</div>
          </div>
          
          <div className="text-center ml-4">
            <div className="text-sm text-gray-400">Darts</div>
            <div className="text-lg font-bold text-white">{localGameState.dartsThrown}/{dartsPerPlayer * 2}</div>
          </div>
        </div>
        
        <button
          onClick={resetGame}
          className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded-lg font-medium transition-colors text-sm"
        >
          New Game
        </button>
      </div>
      
      {/* Main Game Area */}
      <div className="flex-1 flex items-center justify-center p-4">
        <div className="flex flex-col items-center">
          
          {/* Power Bar - Only show during human turn */}
          {localGameState.currentPlayer === 'human' && !localGameState.gameComplete && (
            <div className="w-80 mb-4">
              <div className="relative bg-gray-700 rounded-full h-2 overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-red-500 via-green-400 via-green-400 to-red-500 transition-all duration-100"
                  style={{ width: `${localGameState.power * 100}%` }}
                />
                {/* Sweet spot indicator */}
                <div 
                  className="absolute top-0 w-0.5 h-full bg-white opacity-70"
                  style={{ left: '60%' }}
                />
              </div>
              <div className="text-xs text-center mt-1 text-gray-400">
                Sweet spot: 60% power
              </div>
            </div>
          )}
          
          {/* Game Status */}
          <div className="mb-4 text-center">
            <div className="text-sm font-semibold text-yellow-300">
              {localGameState.gameStatus}
            </div>
            <div className="text-xs text-gray-400">
              {localGameState.currentPlayer === 'human' && !localGameState.gameComplete ? 
                (localGameState.isAiming ? 'Click & hold to charge, release to throw' : 'Move mouse to aim') :
                localGameState.currentPlayer === 'opponent' && !localGameState.gameComplete ? `${opponentName} is thinking...` : 
                'Game complete!'
              }
            </div>
          </div>
          
          {/* Dartboard - Main Focus */}
          <canvas
            ref={canvasRef}
            width={600}
            height={450}
            className="border-2 border-gray-600 rounded-lg cursor-crosshair bg-gray-800 shadow-2xl"
            onMouseMove={handleMouseMove}
            onMouseDown={handleMouseDown}
            onMouseUp={handleMouseUp}
            onMouseLeave={() => {
              if (localGameState.currentPlayer === 'human') {
                setLocalGameState(prev => ({ ...prev, isAiming: false }));
              }
            }}
          />
          
          {/* Game Over Results */}
          {localGameState.gameComplete && (
            <div className="mt-4 text-center bg-gray-800 p-4 rounded-lg border-2">
              <div className="text-2xl font-bold mb-2">
                🎉 Game Complete!
              </div>
              <div className="text-lg mb-2">
                {localGameState.playerScore > localGameState.opponentScore ? (
                  <span className="text-green-400">🏆 You Win!</span>
                ) : localGameState.opponentScore > localGameState.playerScore ? (
                  <span className="text-red-400">🏆 {opponentName} Wins!</span>
                ) : (
                  <span className="text-yellow-400">🤝 It's a Tie!</span>
                )}
              </div>
              <div className="text-sm text-gray-300">
                Final Score: You {localGameState.playerScore} - {localGameState.opponentScore} {opponentName}
              </div>
              <div className="text-xs text-gray-400 mt-1">
                Your average: {(localGameState.playerScore / dartsPerPlayer).toFixed(1)} • {opponentName} average: {(localGameState.opponentScore / dartsPerPlayer).toFixed(1)}
              </div>
            </div>
          )}
          
        </div>
      </div>
      
      {/* Footer Instructions - Compact */}
      <div className="px-6 py-3 bg-gray-800 border-t border-gray-700">
        <div className="text-center text-xs text-gray-400 max-w-4xl mx-auto">
          <strong>Quick Guide:</strong> Aim with mouse • Hold click to charge power (60% = sweet spot) • Release to throw • Too little power = falls short • Too much power = overshoots
        </div>
      </div>
    </div>
  );
};

export default DartGame;