# Visual Novel Engine Documentation

## Table of Contents
1. [Overview](#overview)
2. [Game Data Structure](#game-data-structure)
3. [Events System](#events-system)
4. [Dialog System](#dialog-system)
5. [Macro System](#macro-system)
6. [Conditional Logic](#conditional-logic)
7. [Character Management](#character-management)
8. [Visual Effects](#visual-effects)
9. [Player Features](#player-features)
10. [Advanced Features](#advanced-features)

## Overview

This Visual Novel Engine is a React-based system for creating interactive story games with branching narratives, dynamic variables, and rich multimedia content. The engine supports blackjack mini-games, character relationships, conditional storytelling, and extensive customization options.

### Key Features
- **Event-driven storytelling** with branching narratives
- **Dynamic macro system** for variable manipulation
- **Conditional text and choices** based on game state
- **Character relationship tracking**
- **Rich dialog system** with portraits and emotions
- **Visual effects** including backgrounds, transitions, and particles
- **Save/load functionality** with auto-save
- **Keyboard shortcuts** and accessibility features
- **Theme customization**
- **Achievement system**

## Game Data Structure

### Metadata Format
```json
{
  "metadata": {
    "title": "Game Title",
    "version": "1.0.0",
    "description": "Game description",
    "author": "Author Name",
    "backgroundImage": "/path/to/background.jpg",
    "titleScreenTheme": {
      "primaryColor": "#8B0000",
      "secondaryColor": "#2D0000",
      "textColor": "#F5F5DC"
    }
  }
}
```

### Root Structure
The game data should follow this structure:
```json
{
  "metadata": { /* metadata object */ },
  "macros": { /* macro definitions */ },
  "conditionalTemplates": { /* reusable conditions */ },
  "events": [ /* story events array */ ],
  "achievements": [ /* achievement definitions */ ]
}
```

## Events System

Events are the core building blocks of your story. Each event represents a scene or interaction point.

### Event Structure
```json
{
  "key": "unique_event_id",
  "title": "Event Title",
  "editorTags": ["tag1", "tag2"],
  "preDialog": [ /* dialog before any game */ ],
  "postDialog": [ /* dialog after game completion */ ],
  "nextEvent": "next_event_key"
}
```

### Event Properties
- **key**: Unique identifier for the event
- **title**: Display name for the event
- **editorTags**: Categories for organization
- **preDialog**: Dialog sequence before any mini-game
- **postDialog**: Dialog sequence after mini-game completion
- **nextEvent**: Default next event to transition to

## Dialog System

### Dialog Object Structure
```json
{
  "background": "/path/to/background.jpg",
  "backgroundTransition": "fade|slide|none",
  "backgroundEffects": {
    "type": "particles",
    "options": "ambient-light"
  },
  "characters": {
    "position": {
      "image": "/path/to/character.png",
      "name": "Character Name",
      "emotion": "happy|sad|angry|neutral",
      "state": "close|casual|formal"
    }
  },
  "speaker": "Character Name",
  "text": "Dialog text with {variable} substitution",
  "macros": ["macro1", "macro2:param"],
  "conditions": ["condition1", "condition2"],
  "conditionalText": {
    "condition": " Additional text if condition is met"
  },
  "choices": [
    {
      "text": "Choice text",
      "macros": ["choice_macro"],
      "nextEvent": "target_event",
      "requiresCondition": "condition_expression"
    }
  ]
}
```

### Character Positions
- **left**: Left side of screen
- **center**: Center of screen  
- **right**: Right side of screen

### Background Transitions
- **fade**: Smooth fade transition
- **slide**: Sliding transition
- **none**: Instant change

### Character Emotions
Emotions affect the visual styling and color themes:
- **neutral**: Default appearance
- **happy**: Bright, warm colors
- **sad**: Muted, cool colors
- **angry**: Intense, red tones
- **embarrassed**: Pink/warm tones
- **surprised**: Bright, alert colors
- **love**: Pink/red romantic colors

### Embedded Content
You can embed iframes for external content:
```json
{
  "iframe": {
    "url": "https://example.com/content",
    "width": "90%",
    "height": "300px",
    "position": "center",
    "allowFullscreen": true,
    "autoplay": false
  }
}
```

## Macro System

Macros provide dynamic variable manipulation and game logic.

### Macro Definition
```json
{
  "macroName": {
    "description": "What this macro does",
    "parameters": ["param1", "param2"],
    "updates": {
      "variableName": "operation",
      "{param1}Variable": "+{param2|default}"
    },
    "conditions": {
      "if": "condition_expression",
      "then": {
        "variable": "operation"
      },
      "else": {
        "variable": "different_operation"
      }
    }
  }
}
```

### Variable Operations
- **Assignment**: `"=10"`, `"=hello"`, `"=true"`, `"=[]"`
- **Addition**: `"+5"`, `"++"`
- **Subtraction**: `"-3"`, `"--"`
- **Multiplication**: `"*2"`
- **Division**: `"/2"`
- **Random**: `"random:1-10"`, `"random:100"`
- **Array Operations**: `"push:item"`, `"remove:item"`
- **Boolean**: `"toggle"`

### Parameter Substitution
- **Simple**: `{param}` - Direct parameter value
- **With Default**: `{param|default}` - Use default if param missing
- **Math**: `{param/10}`, `{param*2}` - Mathematical operations
- **Game State**: `{$variable}` - Reference game state variables

### Built-in Variables
The engine automatically tracks these variables:
- **playerMoney**: Current player money
- **profit**: Net profit/loss
- **totalHandsPlayed**: Number of games played
- **completedEvents**: Array of completed event keys
- **customVariables**: Object containing all dynamic variables

### Flow Control Macros
- **jumpToEvent:eventKey**: Jump to a specific event
- **jumpIf:condition:eventKey:fallback**: Conditional jump
- **setNextEvent:eventKey**: Set the next event to transition to

### Example Macros
```json
{
  "increaseRelationship": {
    "description": "Increase relationship with a character",
    "parameters": ["character", "amount"],
    "updates": {
      "{character}Relationship": "+{amount|5}"
    }
  },
  "complexChoice": {
    "description": "Complex choice with conditions",
    "parameters": ["outcome"],
    "conditions": {
      "if": "{$playerMoney} >= 1000",
      "then": {
        "playerMoney": "-500",
        "reputation": "+10"
      },
      "else": {
        "reputation": "-5"
      }
    }
  }
}
```

## Conditional Logic

### Conditional Templates
Reusable condition definitions:
```json
{
  "isRich": {
    "variable": "playerMoney",
    "operator": ">=",
    "value": 5000,
    "text": " Your wealth is clearly impressive."
  },
  "likesYou": {
    "variable": "{character}Relationship",
    "operator": ">=", 
    "value": 15,
    "text": " {character} smiles warmly at you."
  }
}
```

### Condition Operators
- **>=**: Greater than or equal
- **<=**: Less than or equal
- **>**: Greater than
- **<**: Less than
- **==**: Equal to
- **!=**: Not equal to
- **===**: Strictly equal
- **!==**: Strictly not equal

### Complex Conditions
Support for logical operators:
```json
{
  "requiresCondition": "likesYou:victoria AND playerMoney >= 1000"
}
```

- **AND**: Both conditions must be true
- **OR**: Either condition can be true
- **NOT**: Negates the condition
- **Parentheses**: Group conditions for complex logic

### Array/Collection Operations
```json
{
  "requiresCondition": "{$achievements} contains 'first_win'"
}
```

- **contains**: Check if array contains item
- **notContains**: Check if array doesn't contain item
- **isEmpty**: Check if array/string is empty
- **size >= 5**: Check collection size

### Variable Existence
```json
{
  "requiresCondition": "variableExists customVar"
}
```

## Character Management

### Character Object
```json
{
  "image": "/path/to/character.png",
  "name": "Character Name",
  "emotion": "happy",
  "state": "close",
  "avatar": "/path/to/avatar.png"
}
```

### Relationship Tracking
Character relationships are tracked as variables:
- **{character}Relationship**: Numeric relationship value
- Positive values indicate friendship/love
- Negative values indicate dislike/hostility
- Use conditional templates to display different text based on relationship levels

### Emotion System
Characters can display different emotions that affect visual styling:
- Emotion colors are automatically applied to dialog borders and UI elements
- Portrait filters can be applied based on emotion
- Emotion indicators appear as small emoji overlays

## Visual Effects

### Background Management
```json
{
  "background": "/path/to/background.jpg",
  "backgroundTransition": "fade",
  "backgroundEffects": {
    "type": "particles",
    "options": "ambient-light",
    "weather": "starrynight",
    "intensity": 0.5
  }
}
```

### Supported Transitions
- **fade**: Smooth crossfade
- **slide**: Sliding transition
- **none**: Instant change
- **fadeToBlack**: Fade to black then back

### Text Animations
- **typewriter**: Character-by-character typing (default)
- **fadeIn**: Smooth fade-in effect

### Audio Support
```json
{
  "soundEffect": "sound.mp3",
  "ambientMusic": {
    "file": "music.mp3",
    "volume": 0.4,
    "fadeIn": true
  }
}
```

## Player Features

### Save/Load System
- **Auto-save**: Automatic saves at key points
- **Manual save**: Player-initiated saves
- **Multiple slots**: Support for multiple save files
- **Game state**: Saves complete game state including custom variables

### Keyboard Shortcuts
- **Space/Enter**: Advance dialog
- **Escape**: Open menu
- **A**: Toggle auto-advance
- **S**: Toggle skip read dialog
- **Numbers 1-9**: Select choices

### Menu Features
- **Save/Load**: Access save system
- **Settings**: Adjust text speed, auto-advance
- **History**: Review previous dialogs
- **Keyboard Help**: Show shortcut reference

### Accessibility
- **Text Speed**: Adjustable typing speed
- **Auto-advance**: Automatic dialog progression
- **Skip Read**: Skip previously seen dialog
- **High Contrast**: Theme-based accessibility options

## Advanced Features

### Mini-Game Integration
The engine supports blackjack mini-games:
```json
{
  "choices": [
    {
      "text": "Play Blackjack - $500",
      "action": "startGame",
      "eventParams": {
        "playerEvent": "High Stakes Game",
        "playerCost": 500,
        "specialRules": "vegas"
      }
    }
  ]
}
```

### Achievement System
```json
{
  "achievements": [
    {
      "id": "first_win",
      "title": "Beginner's Luck", 
      "description": "Win your first game",
      "icon": "/path/to/icon.png"
    }
  ]
}
```

Unlock achievements using macros:
```json
{
  "macros": ["unlockAchievement:first_win"]
}
```

### Theme Customization
```json
{
  "titleScreenTheme": {
    "primaryColor": "#8B0000",
    "secondaryColor": "#2D0000", 
    "textColor": "#F5F5DC",
    "accentColor": "#FFD700",
    "backgroundColor": "#1a1a1a"
  }
}
```

### Dynamic Variable System
The engine supports unlimited custom variables:
- Variables are created automatically when first used
- Support for all JavaScript data types
- Persistent across save/load
- Accessible in all macro operations and conditions

### Error Handling
- **Graceful degradation**: Missing assets show defaults
- **Condition validation**: Invalid conditions default to false
- **Variable safety**: Missing variables default to appropriate types
- **Development logging**: Detailed console output in development mode

### Performance Optimization
- **Memoized components**: Dialog and character data is cached
- **Efficient re-renders**: Only updates when necessary
- **Asset preloading**: Background preloading of images
- **Memory management**: Automatic cleanup of unused resources

## Best Practices

### Story Structure
1. **Start simple**: Begin with linear stories before adding branches
2. **Test frequently**: Use the development console to monitor variables
3. **Plan relationships**: Design character relationship progressions
4. **Balance choices**: Ensure all paths have meaningful content

### Performance
1. **Optimize images**: Use appropriate formats and sizes
2. **Limit simultaneous effects**: Don't overload visual effects
3. **Test on devices**: Verify performance on target platforms
4. **Monitor memory**: Watch for memory leaks in long stories

### User Experience
1. **Clear choices**: Make choice outcomes predictable
2. **Save frequently**: Provide save opportunities before major decisions
3. **Feedback**: Show progress and achievement unlocks
4. **Accessibility**: Test with different accessibility settings

### Development
1. **Version control**: Track changes to game data
2. **Documentation**: Comment complex macro logic
3. **Testing**: Test all story branches thoroughly
4. **Backup**: Maintain backups of game assets

This documentation covers the core features of the Visual Novel Engine. For specific implementation details, refer to the source code and example game data provided.