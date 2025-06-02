import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Music, Heart, Star, ArrowUp, ArrowDown, ArrowLeft, ArrowRight } from 'lucide-react';

// Beat timing utilities
const calculateBeatInterval = (bpm) => {
  return 60000 / bpm; // milliseconds per beat
};

const TIMING_WINDOWS = {
  perfect: 150, // ±150ms
  good: 300,    // ±300ms
  okay: 450,    // ±450ms
  miss: 999     // anything else
};

const SCORE_VALUES = {
  perfect: 100,
  good: 75,
  okay: 50,
  miss: 0
};

const ARROW_KEYS = ['W', 'A', 'S', 'D'];
const ARROW_DIRECTIONS = {
  'W': { icon: ArrowUp, color: '#4CAF50', name: 'Up' },
  'A': { icon: ArrowLeft, color: '#2196F3', name: 'Left' },
  'S': { icon: ArrowDown, color: '#FF9800', name: 'Down' },
  'D': { icon: ArrowRight, color: '#F44336', name: 'Right' }
};

// Game duration in seconds
const GAME_DURATION = 30;

// Shared timing constants - target zone in the middle for better UX
const TRAVEL_TIME = 3000; // 3 seconds to travel the full lane (slightly slower for better timing)
const TARGET_POSITION = 50; // Target zone at 50% down the lane (middle)
const TIMING_ZONES = {
  perfect: 3,   // ±3% around target for perfect timing
  good: 6,      // ±6% around target for good timing  
  okay: 10,     // ±10% around target for okay timing
  miss: 15      // ±15% around target for any hit (beyond this is complete miss)
};

// Arrow Indicator Component with animation that survives re-renders
const ArrowIndicator = ({ beat, onHit, isActive, gameTime }) => {
  const [position, setPosition] = useState(0);
  const [opacity, setOpacity] = useState(1);
  const animationRef = useRef(null);
  const startTimeRef = useRef(beat.createdAt); // Use beat creation time, not current time
  
  const direction = ARROW_DIRECTIONS[beat.key];
  const IconComponent = direction.icon;
  
  useEffect(() => {
    if (!isActive || beat.hit) return;
    
    // Use the beat's creation time as the reference point
    const beatStartTime = startTimeRef.current;
    
    const animate = () => {
      const elapsed = Date.now() - beatStartTime;
      const progress = Math.min(elapsed / TRAVEL_TIME, 1);
      
      if (progress >= 1) {
        if (!beat.hit) {
          onHit(beat.id, 'miss');
        }
        return;
      }
      
      // Linear movement - arrows travel the full height of the lane
      setPosition(progress * 100); // Move from 0% to 100% of lane height
      setOpacity(Math.max(0.4, 1 - (progress * 0.3)));
      
      animationRef.current = requestAnimationFrame(animate);
    };
    
    // Start animation
    animationRef.current = requestAnimationFrame(animate);
    
    // Cleanup function
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [beat.id, onHit, isActive, beat.hit]); // Only depend on beat.id and beat.hit, not the entire beat object
  
  const getColor = () => {
    if (beat.hit) {
      switch (beat.result) {
        case 'perfect': return '#4CAF50';
        case 'good': return '#FFC107';
        case 'okay': return '#FF9800';
        case 'miss': return '#F44336';
        default: return direction.color;
      }
    }
    return direction.color;
  };
  
  const getScale = () => {
    if (beat.hit) {
      return beat.result === 'perfect' ? 1.4 : 
             beat.result === 'good' ? 1.2 : 
             beat.result === 'okay' ? 1.1 : 0.8;
    }
    return 1;
  };
  
  // Check if this is part of a simultaneous group
  const isSimultaneous = beat.simultaneousGroup && beat.simultaneousGroup.length > 1;
  
  return (
    <div 
      className="absolute transition-transform duration-200 ease-out"
      style={{
        top: `${position}%`,
        left: '50%',
        transform: `translateX(-50%) scale(${getScale()})`,
        opacity: opacity,
        zIndex: beat.hit ? 30 : (isSimultaneous ? 25 : 10)
      }}
    >
      <div 
        className={`w-16 h-16 rounded-lg flex items-center justify-center shadow-lg transition-all duration-200 ${
          isSimultaneous ? 'border-4' : 'border-2'
        }`}
        style={{ 
          borderColor: getColor(),
          backgroundColor: isSimultaneous 
            ? `${getColor()}40`
            : `${getColor()}${beat.hit ? '40' : '20'}`,
          boxShadow: isSimultaneous 
            ? `0 0 20px ${getColor()}60, 0 0 40px ${getColor()}30`
            : `0 0 15px ${getColor()}40`
        }}
      >
        <IconComponent 
          className={`${isSimultaneous ? 'w-10 h-10' : 'w-8 h-8'} transition-all duration-200`} 
          style={{ color: getColor() }} 
        />
        
        {/* Connection line for simultaneous beats */}
        {isSimultaneous && !beat.hit && beat.simultaneousGroup.length === 2 && (
          <div 
            className="absolute top-1/2 left-1/2 w-8 h-1 transform -translate-y-1/2"
            style={{ 
              backgroundColor: getColor(),
              boxShadow: `0 0 10px ${getColor()}60`,
              transform: beat.key === 'W' || beat.key === 'S' ? 
                'translateX(-50%) translateY(-50%) rotate(90deg)' : 
                'translateX(-50%) translateY(-50%)'
            }}
          />
        )}
        
        {beat.hit && (
          <div className="absolute left-1/2 transform -translate-x-1/2" style={{ top: '-2rem' }}>
            <span 
              className="text-xs font-bold px-3 py-1 rounded-full shadow-lg whitespace-nowrap"
              style={{ 
                backgroundColor: getColor(),
                color: 'white',
                boxShadow: `0 0 10px ${getColor()}60`
              }}
            >
              {beat.result === 'perfect' ? 'PERFECT!' : 
               beat.result === 'good' ? 'GOOD!' :
               beat.result === 'okay' ? 'OK' : 'MISS'}
            </span>
          </div>
        )}
      </div>
    </div>
  );
};

// Arrow Lane Component - memoized to prevent unnecessary re-renders
const ArrowLane = React.memo(({ keyType, beats, onHit, isActive, gameTime }) => {
  const direction = ARROW_DIRECTIONS[keyType];
  const IconComponent = direction.icon;
  
  const laneBeats = beats.filter(beat => beat.key === keyType);
  
  return (
    <div className="relative h-full flex-1 mx-1">
      {/* Lane Background */}
      <div 
        className="w-full h-full rounded-lg border-2 border-opacity-30 relative overflow-hidden"
        style={{ borderColor: direction.color, backgroundColor: `${direction.color}10` }}
      >
        {/* Clean Target Zone - just the main target area */}
        <div 
          className="absolute w-full h-32 border-4 border-opacity-70 rounded-lg"
          style={{ 
            top: `${TARGET_POSITION - 8}%`, // Center the zone around 50%
            borderColor: direction.color,
            backgroundColor: `${direction.color}25`,
            boxShadow: `inset 0 0 20px ${direction.color}30`
          }}
        >
          <div className="w-full h-full flex items-center justify-center">
            <IconComponent 
              className="w-10 h-10 opacity-60" 
              style={{ color: direction.color }} 
            />
          </div>
        </div>
        
        {/* Moving Arrows */}
        {laneBeats.map(beat => (
          <ArrowIndicator
            key={beat.id}
            beat={beat}
            onHit={onHit}
            isActive={isActive}
            gameTime={gameTime}
          />
        ))}
      </div>
      
      {/* Key Label */}
      <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2">
        <div 
          className="w-10 h-10 rounded-lg border-2 flex items-center justify-center text-white font-bold text-lg"
          style={{ borderColor: direction.color, backgroundColor: `${direction.color}40` }}
        >
          {keyType}
        </div>
      </div>
    </div>
  );
});

// Game Timer Component
const GameTimer = ({ timeLeft, totalTime }) => {
  const percentage = (timeLeft / totalTime) * 100;
  
  return (
    <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-30">
      <div className="bg-black bg-opacity-70 rounded-lg p-3 text-white min-w-48">
        <div className="text-center">
          <div className="text-xs opacity-70 mb-1">TIME REMAINING</div>
          <div className="text-2xl font-bold mb-2">{Math.ceil(timeLeft)}s</div>
          <div className="w-full bg-gray-600 rounded-full h-2">
            <div 
              className="h-2 rounded-full transition-all duration-100"
              style={{ 
                width: `${percentage}%`,
                backgroundColor: percentage > 30 ? '#4CAF50' : percentage > 10 ? '#FFC107' : '#F44336'
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

// Score Display Component
const ScoreDisplay = ({ score, combo, accuracy, grade }) => {
  return (
    <div className="absolute top-4 left-4 z-30">
      <div className="bg-black bg-opacity-70 rounded-lg p-3 text-white">
        <div className="flex items-center space-x-4">
          <div>
            <div className="text-xs opacity-70">SCORE</div>
            <div className="text-xl font-bold">{score.toLocaleString()}</div>
          </div>
          <div>
            <div className="text-xs opacity-70">COMBO</div>
            <div className="text-xl font-bold text-yellow-400">{combo}x</div>
          </div>
          <div>
            <div className="text-xs opacity-70">ACCURACY</div>
            <div className="text-xl font-bold text-blue-400">{Math.round(accuracy * 100)}%</div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Simplified Pattern Generator - only singles and simple doubles
const generateRandomPattern = (difficulty, bpm) => {
  const patterns = {
    easy: [
      ['W'], ['A'], ['S'], ['D'],  // 90% single notes
      ['W'], ['A'], ['S'], ['D'],
      ['W'], ['A'], ['S'], ['D'],
      ['W'], ['A'], ['S'], ['D'],
      ['W'], ['A'], ['S'], ['D'],
      ['W'], ['A'], ['S'], ['D'],
      ['W'], ['A'], ['S'], ['D'],
      ['W'], ['A'], ['S'], ['D'],
      ['W'], ['A'], ['S'], ['D'],
      ['W', 'S']  // 10% simple opposites only
    ],
    medium: [
      ['W'], ['A'], ['S'], ['D'],  // 80% single notes
      ['W'], ['A'], ['S'], ['D'],
      ['W'], ['A'], ['S'], ['D'],
      ['W'], ['A'], ['S'], ['D'],
      ['W', 'S'], ['A', 'D']       // 20% simple doubles
    ],
    hard: [
      ['W'], ['A'], ['S'], ['D'],  // 70% single notes
      ['W'], ['A'], ['S'], ['D'],
      ['W'], ['A'], ['S'], ['D'],
      ['W', 'S'], ['A', 'D'],      // 25% opposites
      ['W', 'A'], ['S', 'D']       // 5% adjacent
    ]
  };
  
  let adjustedPatterns = patterns[difficulty] || patterns.medium;
  
  // Higher BPM = more singles for playability
  if (bpm > 140) {
    adjustedPatterns = [
      ['W'], ['A'], ['S'], ['D'],
      ['W'], ['A'], ['S'], ['D'],
      ['W'], ['A'], ['S'], ['D'],
      ['W'], ['A'], ['S'], ['D'],
      ['W'], ['A'], ['S'], ['D'],
      ['W'], ['A'], ['S'], ['D'],
      ['W'], ['A'], ['S'], ['D'],
      ['W'], ['A'], ['S'], ['D'],
      ['W'], ['A'], ['S'], ['D'],
      ['W', 'S']  // Very rare doubles on fast songs
    ];
  }
  
  return adjustedPatterns[Math.floor(Math.random() * adjustedPatterns.length)];
};

// Main Dance Game Component
const DanceComponent = ({
  initialEvent,
  onGameComplete,
  gameState = { playerMoney: 1000 }
}) => {
  const [gameStarted, setGameStarted] = useState(false);
  const [gameEnded, setGameEnded] = useState(false);
  const [gameTime, setGameTime] = useState(0);
  const [timeLeft, setTimeLeft] = useState(GAME_DURATION);
  const [beats, setBeats] = useState([]);
  const [score, setScore] = useState(0);
  const [combo, setCombo] = useState(0);
  const [maxCombo, setMaxCombo] = useState(0);
  const [hits, setHits] = useState([]);
  const [nextBeatId, setNextBeatId] = useState(0);
  const [showCountdown, setShowCountdown] = useState(false);
  const [countdown, setCountdown] = useState(3);
  const [pressedKeys, setPressedKeys] = useState(new Set());
  
  const gameRef = useRef({
    beatInterval: 0,
    lastBeatTime: 0,
    totalBeats: 0,
    gameStartTime: 0
  });
  
  // Extract game parameters
  const eventParams = initialEvent?.eventParams || {};
  const partner = eventParams.partner || 'unknown';
  const song = eventParams.song || { file: '', bpm: 120, duration: 180 };
  const difficulty = eventParams.difficulty || 'medium';
  
  // Calculate timing based on difficulty and BPM - more generous timing
  const getDifficultyMultiplier = () => {
    switch (difficulty) {
      case 'easy': return 2.0;    // Much slower
      case 'medium': return 1.5;  // Moderately slower
      case 'hard': return 1.2;    // Slightly slower
      default: return 1.5;
    }
  };
  
  const beatInterval = calculateBeatInterval(song.bpm) * getDifficultyMultiplier();
  gameRef.current.beatInterval = beatInterval;
  
  // Game timer
  useEffect(() => {
    if (!gameStarted || gameEnded) return;
    
    const startTime = Date.now();
    gameRef.current.gameStartTime = startTime;
    
    const timer = setInterval(() => {
      const elapsed = (Date.now() - startTime) / 1000;
      const remaining = Math.max(0, GAME_DURATION - elapsed);
      
      setGameTime(elapsed);
      setTimeLeft(remaining);
      
      if (remaining <= 0) {
        setGameEnded(true);
        handleGameEnd();
      }
    }, 100);
    
    return () => clearInterval(timer);
  }, [gameStarted, gameEnded]);
  
  // Generate beats with improved timing
  const generateBeat = useCallback(() => {
    if (gameEnded) return;
    
    const now = Date.now();
    if (now - gameRef.current.lastBeatTime >= beatInterval) {
      const pattern = generateRandomPattern(difficulty, song.bpm);
      
      // Create a unique group ID for simultaneous beats
      const groupId = pattern.length > 1 ? `group_${nextBeatId}` : null;
      
      // Create beats for each key in the pattern
      pattern.forEach((key, index) => {
        const newBeat = {
          id: nextBeatId + index,
          key: key,
          createdAt: now,
          hit: false,
          result: null,
          simultaneousGroup: pattern.length > 1 ? pattern : null,
          groupId: groupId
        };
        
        setBeats(prev => [...prev, newBeat]);
        gameRef.current.totalBeats++;
      });
      
      setNextBeatId(prev => prev + pattern.length);
      gameRef.current.lastBeatTime = now;
    }
  }, [beatInterval, nextBeatId, difficulty, song.bpm, gameEnded]);
  
  // Handle beat hits with React.memo optimization
  const handleBeatHit = useCallback((beatId, timing) => {
    setBeats(prev => prev.map(beat => {
      if (beat.id === beatId && !beat.hit) {
        const hitResult = { ...beat, hit: true, result: timing };
        
        // Update score and combo
        const points = SCORE_VALUES[timing];
        let bonusPoints = 0;
        
        // Combo bonus
        if (timing !== 'miss') {
          bonusPoints = Math.floor(combo * 2);
          setCombo(prev => {
            const newCombo = prev + 1;
            setMaxCombo(current => Math.max(current, newCombo));
            return newCombo;
          });
        } else {
          setCombo(0);
        }
        
        // Perfect timing bonus
        if (timing === 'perfect') {
          bonusPoints += 25;
        }
        
        setScore(prev => prev + points + bonusPoints);
        setHits(prev => [...prev, { timing, score: points + bonusPoints, key: beat.key }]);
        
        return hitResult;
      }
      return beat;
    }));
  }, [combo]);
  
  // Handle player input - determine timing based on arrow position when hit
  const handlePlayerInput = useCallback((key) => {
    if (!gameStarted || gameEnded) return;
    
    const now = Date.now();
    
    // Find the closest active beat for this key
    const targetBeats = beats
      .filter(beat => !beat.hit && beat.key === key)
      .map(beat => {
        const beatAge = now - beat.createdAt;
        const currentPosition = (beatAge / TRAVEL_TIME) * 100; // Current position as percentage (0-100)
        const distanceFromTarget = Math.abs(currentPosition - TARGET_POSITION); // Distance from 50%
        
        return { ...beat, currentPosition, distanceFromTarget };
      })
      .sort((a, b) => a.distanceFromTarget - b.distanceFromTarget);
    
    const activeBeat = targetBeats[0];
    
    if (activeBeat) {
      const distance = activeBeat.distanceFromTarget;
      
      // Only register hits if the arrow is within a reasonable range of the target
      if (distance <= TIMING_ZONES.miss) {
        let timing;
        if (distance <= TIMING_ZONES.perfect) {
          timing = 'perfect';
        } else if (distance <= TIMING_ZONES.good) {
          timing = 'good';
        } else if (distance <= TIMING_ZONES.okay) {
          timing = 'okay';
        } else {
          timing = 'miss';
        }
        
        handleBeatHit(activeBeat.id, timing);
      } else {
        // Arrow is too far from target zone
        if (activeBeat.currentPosition < TARGET_POSITION - TIMING_ZONES.miss) {
          // Way too early - no penalty
          return;
        } else {
          // Too late - small penalty
          setCombo(0);
          setHits(prev => [...prev, { timing: 'miss', score: 0, key }]);
        }
      }
    } else {
      // No matching beat found - small penalty
      setCombo(0);
      setHits(prev => [...prev, { timing: 'miss', score: 0, key }]);
    }
  }, [gameStarted, gameEnded, beats, handleBeatHit]);
  
  // Keyboard controls
  useEffect(() => {
    const handleKeyDown = (e) => {
      const key = e.key.toUpperCase();
      if (['W', 'A', 'S', 'D'].includes(key) && !pressedKeys.has(key)) {
        e.preventDefault();
        setPressedKeys(prev => new Set([...prev, key]));
        handlePlayerInput(key);
      }
    };
    
    const handleKeyUp = (e) => {
      const key = e.key.toUpperCase();
      if (['W', 'A', 'S', 'D'].includes(key)) {
        e.preventDefault();
        setPressedKeys(prev => {
          const newSet = new Set(prev);
          newSet.delete(key);
          return newSet;
        });
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [handlePlayerInput, pressedKeys]);
  
  // Game timing loop
  useEffect(() => {
    if (!gameStarted || gameEnded) return;
    
    const interval = setInterval(generateBeat, 100);
    return () => clearInterval(interval);
  }, [gameStarted, gameEnded, generateBeat]);
  
  // Clean up old beats
  useEffect(() => {
    const cleanup = setInterval(() => {
      setBeats(prev => prev.filter(beat => {
        const age = Date.now() - beat.createdAt;
        const shouldKeep = age < 3000; // Clean up after 3 seconds
        
        // Auto-miss beats that completely passed
        if (!shouldKeep && !beat.hit) {
          setHits(prevHits => [...prevHits, { timing: 'miss', score: 0, key: beat.key }]);
          setCombo(0);
        }
        
        return shouldKeep;
      }));
    }, 200);
    
    return () => clearInterval(cleanup);
  }, []);
  
  // Calculate final results
  const calculateResults = useCallback(() => {
    const totalPossible = gameRef.current.totalBeats * 100;
    const actualScore = hits.reduce((sum, hit) => sum + hit.score, 0);
    const accuracy = totalPossible > 0 ? actualScore / totalPossible : 0;
    
    let grade;
    if (accuracy >= 0.95) grade = 'S';
    else if (accuracy >= 0.85) grade = 'A';
    else if (accuracy >= 0.75) grade = 'B';
    else if (accuracy >= 0.65) grade = 'C';
    else if (accuracy >= 0.50) grade = 'D';
    else grade = 'F';
    
    const perfectHits = hits.filter(h => h.timing === 'perfect').length;
    const goodHits = hits.filter(h => h.timing === 'good').length;
    const okayHits = hits.filter(h => h.timing === 'okay').length;
    const missHits = hits.filter(h => h.timing === 'miss').length;
    
    return {
      grade,
      accuracy,
      perfectHits,
      goodHits,
      okayHits,
      missHits,
      totalBeats: gameRef.current.totalBeats,
      maxCombo,
      finalScore: score
    };
  }, [hits, score, maxCombo]);
  
  // Start countdown
  const startCountdown = () => {
    setShowCountdown(true);
    setCountdown(3);
    
    const countdownInterval = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          clearInterval(countdownInterval);
          setShowCountdown(false);
          setGameStarted(true);
          gameRef.current.lastBeatTime = Date.now();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };
  
  // Handle game end
  const handleGameEnd = () => {
    setGameEnded(true);
    
    setTimeout(() => {
      const results = calculateResults();
      
      const getReactionText = (grade) => {
        switch (grade) {
          case 'S': return 'is absolutely amazed by your perfect performance!';
          case 'A': return 'is very impressed with your dancing!';
          case 'B': return 'enjoyed dancing with you!';
          case 'C': return 'had a nice time, though you could improve!';
          case 'D': return 'appreciates the effort you put in!';
          case 'F': return 'suggests you practice more before the next dance!';
          default: return 'had an interesting experience!';
        }
      };
      
      const relationshipGain = Math.max(0, Math.floor(results.accuracy * 20));
      
      const gameResult = {
        message: `${results.grade} performance! ${partner} ${getReactionText(results.grade)}`,
        playerMoney: gameState.playerMoney,
        profit: 0,
        gameSpecificData: {
          grade: results.grade,
          accuracy: results.accuracy,
          perfectHits: results.perfectHits,
          totalBeats: results.totalBeats,
          relationshipGain,
          partner
        }
      };
      
      onGameComplete?.(gameResult.message, {
        player: gameState.playerMoney,
        opponents: [gameState.playerMoney],
        initialPlayer: gameState.playerMoney,
        handsPlayed: 1
      });
    }, 2000);
  };
  
  const currentAccuracy = hits.length > 0 ? 
    hits.reduce((sum, hit) => sum + hit.score, 0) / (hits.length * 100) : 0;
  
  const finalResults = gameEnded ? calculateResults() : null;
  
  return (
    <div className="w-full h-screen bg-gradient-to-br from-purple-900 via-pink-800 to-red-900 relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-20">
        <div className="w-full h-full" style={{
          backgroundImage: `radial-gradient(circle at 25% 25%, #fff 1px, transparent 1px),
                           radial-gradient(circle at 75% 75%, #fff 1px, transparent 1px)`,
          backgroundSize: '50px 50px'
        }} />
      </div>
      
      {/* Game Timer */}
      {gameStarted && !gameEnded && (
        <GameTimer timeLeft={timeLeft} totalTime={GAME_DURATION} />
      )}
      
      {/* Score Display */}
      {gameStarted && (
        <ScoreDisplay
          score={score}
          combo={combo}
          accuracy={currentAccuracy}
          grade={finalResults?.grade}
        />
      )}
      
      {/* Game Area - Arrow Lanes */}
      {gameStarted && !gameEnded && (
        <div className="absolute inset-0 flex items-center justify-center pt-24 pb-16">
          <div className="flex space-x-2 h-full max-w-4xl w-full px-4">
            {ARROW_KEYS.map(key => (
              <ArrowLane
                key={key}
                keyType={key}
                beats={beats}
                onHit={handleBeatHit}
                isActive={gameStarted && !gameEnded}
                gameTime={gameTime}
              />
            ))}
          </div>
        </div>
      )}
      
      {/* Pre-game Screen */}
      {!gameStarted && !showCountdown && (
        <div className="absolute inset-0 bg-black bg-opacity-70 flex items-center justify-center">
          <div className="text-center text-white p-8 max-w-md">
            <Music className="w-16 h-16 mx-auto mb-4 text-pink-400" />
            <h2 className="text-3xl font-bold mb-4">Dance with {partner}</h2>
            <p className="text-lg mb-6 opacity-80">
              Use WASD keys to hit the arrows when they pass through the target zone!
            </p>
            
            {/* Key Guide */}
            <div className="mb-6 grid grid-cols-2 gap-4">
              {Object.entries(ARROW_DIRECTIONS).map(([key, direction]) => {
                const IconComponent = direction.icon;
                return (
                  <div key={key} className="flex items-center justify-center space-x-2">
                    <div 
                      className="w-8 h-8 rounded border-2 flex items-center justify-center font-bold"
                      style={{ borderColor: direction.color, color: direction.color }}
                    >
                      {key}
                    </div>
                    <IconComponent className="w-5 h-5" style={{ color: direction.color }} />
                    <span className="text-sm opacity-80">{direction.name}</span>
                  </div>
                );
              })}
            </div>
            
            <div className="mb-6">
              <div className="text-lg font-bold text-yellow-400 mb-2">30 Second Challenge!</div>
              <div className="text-sm opacity-60 mb-2">BPM: {song.bpm}</div>
              <div className="text-sm opacity-60 mb-2">Difficulty: {difficulty.toUpperCase()}</div>
              <div className="text-xs opacity-50 mt-2">
                💡 Hit arrows when they're in the center for perfect timing!
              </div>
            </div>
            <button
              onClick={startCountdown}
              className="bg-pink-600 hover:bg-pink-700 text-white px-8 py-3 rounded-lg font-bold text-lg transition-colors"
            >
              Start Dancing!
            </button>
          </div>
        </div>
      )}
      
      {/* Countdown */}
      {showCountdown && (
        <div className="absolute inset-0 bg-black bg-opacity-70 flex items-center justify-center">
          <div className="text-center text-white">
            <div className="text-8xl font-bold text-pink-400 mb-4">
              {countdown}
            </div>
            <div className="text-2xl">Get Ready!</div>
          </div>
        </div>
      )}
      
      {/* End Game Results */}
      {gameEnded && finalResults && (
        <div className="absolute inset-0 bg-black bg-opacity-80 flex items-center justify-center">
          <div className="text-center text-white p-8 max-w-lg">
            <Heart className="w-16 h-16 mx-auto mb-4 text-pink-400" />
            <h2 className="text-4xl font-bold mb-6">Dance Complete!</h2>
            
            <div className="bg-black bg-opacity-50 rounded-lg p-6 mb-6">
              <div className="text-6xl font-bold text-yellow-400 mb-4">
                Grade: {finalResults.grade}
              </div>
              
              <div className="grid grid-cols-2 gap-4 text-sm mb-4">
                <div>
                  <div className="text-green-400">Perfect: {finalResults.perfectHits}</div>
                  <div className="text-yellow-400">Good: {finalResults.goodHits}</div>
                </div>
                <div>
                  <div className="text-orange-400">Okay: {finalResults.okayHits}</div>
                  <div className="text-red-400">Miss: {finalResults.missHits}</div>
                </div>
              </div>
              
              <div className="pt-4 border-t border-gray-600">
                <div>Accuracy: {Math.round(finalResults.accuracy * 100)}%</div>
                <div>Max Combo: {finalResults.maxCombo}x</div>
                <div>Final Score: {finalResults.finalScore.toLocaleString()}</div>
                <div className="text-sm opacity-75 mt-2">
                  Total Beats: {finalResults.totalBeats}
                </div>
              </div>
            </div>
            
            <div className="text-lg opacity-80 mb-4">
              {partner} {finalResults.grade === 'S' ? 'is absolutely amazed!' :
               finalResults.grade === 'A' ? 'is very impressed!' :
               finalResults.grade === 'B' ? 'enjoyed the dance!' :
               finalResults.grade === 'C' ? 'had a nice time!' :
               finalResults.grade === 'D' ? 'appreciates the effort!' :
               'suggests more practice!'}
            </div>
            
            <button
              onClick={() => window.location.reload()}
              className="bg-pink-600 hover:bg-pink-700 text-white px-6 py-2 rounded-lg font-bold transition-colors"
            >
              Dance Again
            </button>
          </div>
        </div>
      )}
      
      {/* Instructions */}
      {gameStarted && !gameEnded && (
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 text-white text-center">
          <div className="bg-black bg-opacity-50 rounded-lg px-4 py-2">
            <div className="flex items-center space-x-4">
              {Object.entries(ARROW_DIRECTIONS).map(([key, direction]) => {
                const IconComponent = direction.icon;
                const isPressed = pressedKeys.has(key);
                return (
                  <div key={key} className="flex items-center space-x-1">
                    <kbd 
                      className={`px-3 py-2 rounded-lg transition-all font-bold ${
                        isPressed ? 'bg-white text-black scale-110 shadow-lg' : 'bg-gray-700 text-white'
                      }`}
                      style={{
                        borderColor: isPressed ? direction.color : 'transparent',
                        borderWidth: '2px'
                      }}
                    >
                      {key}
                    </kbd>
                    <IconComponent 
                      className="w-5 h-5" 
                      style={{ color: isPressed ? direction.color : '#999' }} 
                    />
                  </div>
                );
              })}
            </div>
            <div className="text-xs mt-2 opacity-75">
              Hit arrows in the target zone • Closer to center = better score • {GAME_DURATION}s challenge
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DanceComponent;