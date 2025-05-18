# Claude's Casino - Visual Novel Engine with Blackjack Integration

A sophisticated interactive visual novel engine featuring a fully integrated blackjack mini-game. This project allows users to create immersive narratives with character interactions, branching storylines, and engaging card gameplay.

## 🎮 Features

- **Visual Novel Engine**: Create interactive stories with characters, backgrounds, and branching dialog
- **Blackjack Gameplay**: Fully functional blackjack game integrated seamlessly into the storytelling
- **Level Editor**: Comprehensive editor for creating custom adventures with your own assets
- **Asset Management**: Built-in tools to manage, validate, and organize game assets
- **Import/Export**: Save, load, and share your custom adventures

## 🎲 Game Features

- Immersive visual novel experience with character interactions
- Professional blackjack mechanics with standard casino rules
- Character progression based on earnings
- Multiple endings based on player choices
- Customizable game parameters and difficulty

## 🛠️ Level Editor

The Level Editor is the heart of Claude's Casino's customization features, allowing you to create entirely custom adventures using your own assets or URL-loaded assets.

### Getting Started with the Level Editor

1. From the main menu, click on "Level Editor"
2. You'll see the editor interface with tabs for Metadata and Events
3. The top bar has buttons for Import, Export, Asset Manager, and Save
4. Start by setting up your game's metadata before creating events

### Detailed Editor Components

#### 1. Metadata Editor

The Metadata Editor is where you define the basic information and appearance of your game.

**Basic Information Section:**
- **Game Title**: The name displayed on the title screen and browser tab
- **Version**: Version number (e.g., "1.0.0") for tracking updates
- **Author**: Your name or studio name (appears on the title screen)
- **Description**: Short text describing your game (appears on the title screen)

**Visual Theming Section:**
- **Background Image URL**: The path to your title screen background
  - Can be a local path (`/assets/backgrounds/casino.jpg`) or a full URL
  - Recommended size: 1280×720 pixels
  - Will be displayed behind the title text and buttons
- **Primary Color**: Main color for buttons and interactive elements (use the color picker)
- **Secondary Color**: Used for borders and secondary elements
- **Text Color**: Color for text elements on the title screen

The right panel shows a real-time preview of how your title screen will look with the current settings. Changes are applied immediately so you can fine-tune the appearance.

#### 2. Events Editor

Events are the building blocks of your game's story. Each event represents a scene or situation and contains dialog, character interactions, and choices.

**Event List Panel (Left):**
- Lists all events in your game
- Click an event to select it for editing
- Shows the event title and key for easy reference
- Includes buttons for duplicating or deleting events
- "Add New Event" button at the bottom creates a new blank event

**Event Editor Panel (Right):**
- **Event Properties**:
  - **Event Title**: Descriptive name for your reference (not shown to players)
  - **Event Key**: Unique identifier used to link events (must be unique)
  - **Default Next Event**: Where to go after this event completes (if not using choices)
  - **Editor Tags**: Optional comma-separated keywords for organization

- **Pre-Dialog Sequence**: Dialog shown before any game action
  - Contains one or more dialog segments
  - Each segment has background, characters, and text
  - Can include choices that branch the story
  
- **Post-Dialog Sequence**: Dialog shown after a game action (like blackjack)
  - Only appears if you add it explicitly
  - Works the same way as Pre-Dialog
  - Often used to show results of gameplay

**Flow Graph Mode**:
- Click "Flow Graph" at the top to see a visual representation of your story
- Shows connections between events based on "next event" links and choices
- Helps identify orphaned events or dead ends
- Color coding shows entry points, exit points, and regular events
- Click any event in the graph to edit it

#### 3. Dialog Editor

The Dialog Editor is where you create the actual content of your story. Each event contains a sequence of dialog segments.

**Adding Dialog Segments**:
- Click "Add Dialog Segment" to create a new segment
- Segments play in sequence, one after another
- Drag segments to reorder them

**For Each Dialog Segment**:
- **Background Image**: Path or URL to the scene background
- **Speaker**: Name of the character who is speaking (appears in dialog box)
- **Dialog Text**: The actual text shown to the player
  - Can use `{money}` and `{profit}` as placeholders for player's stats
  - Supports basic formatting

**Character Positioning**:
- Each dialog segment can have characters in three positions: left, center, right
- For each position, you can set:
  - **Character Name**: Name of the character
  - **Image Path**: Path or URL to the character image
  - **Emotion**: Character's current emotion (neutral, happy, sad, etc.)
  - **State**: Special state (default, entering, exiting, etc.)

**Adding Choices**:
- At the bottom of the Dialog Editor, select a dialog to edit its choices
- Click "Edit Choices" to open the Choices Editor
- For each choice:
  - **Choice Text**: Text shown in the choice button
  - **Action Type**: What happens when selected
    - Go to Next Event: Jump to another event by key
    - Start Game: Begin a blackjack game with custom parameters
    - Exit Game: End the game
  - **Next Event**: For "Go to Next Event" action, select the destination
  - **Game Parameters**: For "Start Game" action, set blackjack parameters:
    - Player Event Name: Description of the game
    - Player Cost: Starting money for the player
    - Opponent Indices: Which character(s) to use as opponents
    - Special Rules: Custom rules variants

#### 4. Asset Manager

The Asset Manager helps you organize and validate all the assets used in your game.

**Asset Overview**:
- Shows a summary of all assets by type
- Counts backgrounds, characters, sounds, etc.
- Identifies potential issues like missing files

**Asset Browser**:
- Filter assets by type (backgrounds, characters, sounds, etc.)
- Preview images directly in the browser
- Copy asset paths for use in other parts of the editor
- Play audio files to test sounds

**Asset Validation**:
- Click "Check Assets" to validate all assets
- Identifies missing files, broken links, and duplicates
- Shows potential issues like incorrect path formats
- Provides suggestions for fixing problems

**Asset Base URL**:
- Set the base URL for relative paths
- Useful when hosting assets on different servers
- Can be changed to test different asset locations

#### 5. Import and Export

**Exporting Your Game**:
- Click "Export" to open the Export dialog
- Choose export format:
  - Pretty (readable): Nicely formatted JSON with indentation
  - Compact: Minified JSON for smaller file size
- Select export options:
  - Full Game: Complete game with metadata and all events
  - Metadata Only: Just the game information
  - Events Only: Just the game events
  - Selected Events: Choose specific events to export
- Provide a filename for the exported file
- Click "Download JSON" to save the file

**Importing Game Data**:
- Click "Import" to open the Import dialog
- Choose import method:
  - Paste JSON: Paste game data directly
  - Upload File: Select a JSON file to upload
  - Merge Files: Combine multiple JSON files
- Select import option:
  - Replace All: Overwrite everything
  - Merge: Add to existing events
  - Events Only: Keep current metadata
  - Metadata Only: Keep current events
- Validate the imported data before confirming
- Click "Import Game" to apply changes

### Creating Your Own Adventure

#### Step-by-Step Guide to Building a Game

1. **Plan Your Story**
   - Sketch out the main plot and branching paths
   - Identify key characters and their relationships
   - Decide where to incorporate blackjack games into the narrative
   - Plan the win/loss conditions and rewards

2. **Prepare Your Assets**
   - Create or collect all necessary images before starting
   - Organize assets in a logical folder structure
   - Name files consistently (e.g., character_emotion.png)
   - Test all assets to ensure they load correctly

3. **Set Up Metadata**
   - Enter basic game information and choose theme colors
   - Set a compelling title screen background
   - Write an engaging description
   - Preview how your title screen will appear

4. **Create Your Story Events**
   - Start with an intro event (key: "intro")
   - Build each scene as a separate event
   - Create branching paths using choices
   - Link events together using "next event" references
   - Use the Flow Graph to verify story connections

5. **Integrate Blackjack Games**
   - Add blackjack games at key decision points
   - Configure parameters (starting money, difficulty)
   - Set up meaningful rewards and consequences
   - Create post-game dialog for both winning and losing outcomes

6. **Test Thoroughly**
   - Playtest all story branches
   - Verify that all assets load correctly
   - Check that money values persist correctly
   - Test blackjack game balance
   - Use the Asset Manager to identify any missing assets

#### Asset Types and Requirements

1. **Background Images**: Set the scene with custom backgrounds
   - Recommended size: 1280x720px
   - Supported formats: PNG, JPG, WEBP
   - Can be loaded from local files or URLs
   - Used in: Dialog segments, title screen
   - Example path: `/assets/backgrounds/casino-entrance.jpg`

2. **Character Images**: Create characters with different emotions
   - Recommended size: Full body characters 500-600px tall
   - Transparent backgrounds (PNG) work best
   - Create variants for different emotions and states
   - Used in: Character positions (left, center, right)
   - Example path: `/assets/characters/dealer_happy.png`
   - Naming convention: character_emotion.png
   - Required emotions for complete experience:
     - neutral
     - happy
     - sad
     - angry
     - surprised

3. **Sound Effects and Music**: Add audio to enhance the experience
   - Supported formats: MP3, WAV, OGG
   - Background music can be set for scenes
   - Sound effects can be triggered by dialog events
   - Used in: Dialog segments, title screen
   - Example path: `/assets/sounds/card_deal.mp3`

4. **Custom Icons and UI Elements**: Personalize your game's look
   - Achievement icons: 32x32px or 64x64px
   - Button graphics: Various sizes
   - Card styles for blackjack
   - Used in: UI elements, achievements
   - Example path: `/assets/icons/achievement_jackpot.png`

### Blackjack Integration

The Level Editor allows you to seamlessly integrate blackjack games into your visual novel. Here's how to set up blackjack games in your story:

#### Adding Blackjack to Your Story

1. **Create a Dialog Choice to Start the Game**
   - In any dialog segment, add a choice
   - Set the action type to "Start Game (Blackjack)"
   - Configure the game parameters

2. **Configure Game Parameters**
   - **Player Event Name**: Description of the game (e.g., "High Stakes Game")
   - **Player Cost**: Starting money for the player (e.g., 1000)
   - **Opponent Indices**: Which character(s) to use as opponents
     - Comma-separated list of character indices (e.g., "1,2")
     - First number is the dealer, others are additional opponents
   - **Special Rules**: Optional custom rule variants (e.g., "vegas")

3. **Set Up Post-Game Dialog**
   - Create post-dialog sequences to handle game outcomes
   - Use `{result}` placeholder to display game result
   - Use `{money}` placeholder to show current player money
   - Use `{profit}` placeholder to show player profit

#### Example Blackjack Configuration

```json
{
  "action": "startGame",
  "eventParams": {
    "playerEvent": "High Stakes Game",
    "playerCost": 1000,
    "opponentIndices": [1],
    "opponentEvents": [
      {
        "name": "Dealer Challenge",
        "cost": 5000
      }
    ],
    "specialRules": "vegas",
    "deckCount": 6
  }
}
```

#### Advanced Blackjack Options

- **Multiple Opponents**: Set opponentIndices to multiple character indices
- **Deck Count**: Number of decks used (2-8)
- **Special Rules**: Custom rule variants:
  - "vegas": Las Vegas rules
  - "atlantic": Atlantic City rules
  - "vip": Special VIP rules with better payouts

#### Creating Meaningful Game Outcomes

- **Link Different Events Based on Outcomes**:
  - Create separate events for winning and losing
  - Use choices in post-game dialog to determine next steps
  - Have character reactions change based on results

- **Use Game Results in Dialog**:
  - Refer to the player's winnings/losses in post-game dialog
  - Have characters comment on the player's luck or skill
  - Use conditional text to change dialog based on results

### Creating Conditional Content

The Level Editor supports creating conditional content that changes based on player actions or game state:

#### Using Variables in Dialog

You can use these placeholders in your dialog text:
- `{money}`: Player's current money amount
- `{profit}`: Player's profit from the current session
- `{result}`: Result of the most recent blackjack game

Example:
```
"Wow, you've got ${money} now! That's ${profit} more than when you started!"
```

#### Creating Conditional Choices

1. **Requirement Conditions**: Choices can have requirement conditions
   - Money requirements (e.g., must have at least $1000)
   - Previous event requirements (e.g., must have completed a specific event)

2. **Money-Gated Options**: Create choices that only appear when the player has enough money
   - Great for "high roller" options
   - Encourages players to earn more in blackjack games

3. **Branching Based on Success**: Create different story paths based on blackjack performance
   - Success path for consistently winning players
   - Alternative path for players who struggle

### Advanced Techniques

#### Using URL-Loaded Assets

You can load assets from external URLs by entering the complete URL path in the asset fields:

```
https://example.com/your-images/background.jpg
```

This allows you to:
- Host assets on image hosting services
- Use CDNs for better performance
- Share adventures without bundling large asset files
- Create dynamic content that can be updated remotely

#### Split/Merge Game Files

The editor allows you to split your game into multiple JSON files or merge separate files:

**Splitting**:
1. Import your complete game
2. Click "Split" in the Export dialog
3. Choose which components to extract (events, metadata)
4. Download the separate files

**Merging**:
1. Click "Merge" in the Import dialog
2. Upload multiple JSON files (events, metadata, etc.)
3. The editor will combine them into a complete game
4. Resolve any conflicts (duplicate event keys, etc.)

#### Advanced Dialog Features

**Text Animation**: Add animation to your dialog text:
- "fadeIn": Text fades in
- "typewriter": Text appears character by character
- "none": Text appears immediately

**Background Transitions**: Add transitions between scenes:
- "fade": Smooth fade transition
- "slide": Slide transition from one side
- "fadeToBlack": Fade to black first, then show new background

**Background Effects**: Add visual effects to backgrounds:
- "particles": Particle effects (e.g., snow, rain)
- "ambient-light": Subtle light effects
- "weather": Weather effects (rain, snow, etc.)

**Sound Effects**: Add sound effects to dialog:
- Single sounds: Play once when dialog appears
- Ambient sounds: Loop during the dialog
- Multiple sounds: Play multiple sounds in sequence

**Character Animations**: Animate characters in scenes:
- "entering": Character enters the scene
- "exiting": Character leaves the scene
- "close": Character moves closer to the center
- "very-close": Character moves very close (for intimate scenes)

#### Event Flow Control

**Reset Variables**: Reset game variables at specific points:
```json
"resetVariables": true
```

**Carry Over Money**: Choose whether to carry over money between events:
```json
"usePreviousMoney": true
```

**Global Variables**: Set and check global variables for advanced branching:
```json
"setVariables": {
  "metDealer": true,
  "wonFirstGame": true
}
```

### Practical Examples

#### Complete Dialog Sequence Example

Here's a complete example of a dialog sequence with characters and choices:

```json
{
  "key": "casino_entrance",
  "title": "Casino Entrance",
  "preDialog": [
    {
      "background": "/assets/backgrounds/casino-entrance.jpg",
      "characters": {
        "right": {
          "image": "/assets/characters/player.png",
          "name": "Player",
          "emotion": "neutral"
        },
        "left": {
          "image": "/assets/characters/dealer.png",
          "name": "Dealer",
          "emotion": "welcoming"
        }
      },
      "speaker": "Dealer",
      "text": "Welcome to our casino! Would you like to try your luck at the blackjack table?"
    },
    {
      "background": "/assets/backgrounds/casino-entrance.jpg",
      "characters": {
        "right": {
          "image": "/assets/characters/player.png",
          "name": "Player",
          "emotion": "excited"
        },
        "left": {
          "image": "/assets/characters/dealer.png",
          "name": "Dealer",
          "emotion": "happy"
        }
      },
      "speaker": "Player",
      "text": "I'd love to! What are the stakes?"
    },
    {
      "background": "/assets/backgrounds/casino-entrance.jpg",
      "characters": {
        "right": {
          "image": "/assets/characters/player.png",
          "name": "Player",
          "emotion": "neutral"
        },
        "left": {
          "image": "/assets/characters/dealer.png",
          "name": "Dealer",
          "emotion": "explaining"
        }
      },
      "speaker": "Dealer",
      "text": "We have tables for all budgets. What would you prefer?",
      "choices": [
        {
          "text": "Low Stakes - $200",
          "action": "startGame",
          "eventParams": {
            "playerEvent": "Low Stakes Game",
            "playerCost": 200,
            "opponentIndices": [1],
            "opponentEvents": [
              {
                "name": "Dealer Game",
                "cost": 1000
              }
            ]
          }
        },
        {
          "text": "High Stakes - $1000",
          "action": "startGame",
          "eventParams": {
            "playerEvent": "High Stakes Game",
            "playerCost": 1000,
            "opponentIndices": [1],
            "opponentEvents": [
              {
                "name": "Dealer Game",
                "cost": 5000
              }
            ],
            "specialRules": "vegas"
          },
          "requiresCondition": {
            "variable": "playerMoney",
            "operator": ">=",
            "value": 1000
          }
        }
      ]
    }
  ],
  "postDialog": [
    {
      "background": "/assets/backgrounds/casino-entrance.jpg",
      "characters": {
        "right": {
          "image": "/assets/characters/player.png",
          "name": "Player",
          "emotion": "happy"
        },
        "left": {
          "image": "/assets/characters/dealer.png",
          "name": "Dealer",
          "emotion": "impressed"
        }
      },
      "speaker": "Dealer",
      "text": "Well played! {result}. Your balance is now ${money}.",
      "conditionalElements": {
        "winCondition": {
          "variable": "playerWon",
          "value": true,
          "additionalText": " You have quite the talent for this game."
        },
        "loseCondition": {
          "variable": "playerWon",
          "value": false,
          "additionalText": " Better luck next time."
        }
      }
    },
    {
      "background": "/assets/backgrounds/casino-entrance.jpg",
      "characters": {
        "right": {
          "image": "/assets/characters/player.png",
          "name": "Player",
          "emotion": "neutral"
        },
        "left": {
          "image": "/assets/characters/dealer.png",
          "name": "Dealer",
          "emotion": "neutral"
        }
      },
      "speaker": "Dealer",
      "text": "Would you like to try again or explore more of the casino?",
      "choices": [
        {
          "text": "Play again",
          "nextEvent": "casino_entrance"
        },
        {
          "text": "Explore the VIP area",
          "nextEvent": "vip_area",
          "requiresCondition": {
            "variable": "playerMoney",
            "operator": ">=",
            "value": 2000
          }
        }
      ]
    }
  ],
  "nextEvent": "casino_floor"
}
```

#### Full Event Structure Example

Here's the complete structure of an event with all possible fields:

```json
{
  "key": "unique_event_id",
  "title": "Descriptive Event Title",
  "editorTags": ["beginning", "blackjack", "romance"],
  "preDialog": [
    {
      "background": "/assets/backgrounds/image.jpg",
      "backgroundTransition": "fade",
      "backgroundEffects": {
        "type": "particles",
        "options": "ambient-light"
      },
      "soundEffect": "door_open.mp3",
      "ambientMusic": {
        "file": "jazz_lounge.mp3",
        "volume": 0.4,
        "fadeIn": true
      },
      "characters": {
        "left": {
          "image": "/assets/characters/dealer.png",
          "name": "Dealer",
          "emotion": "welcoming",
          "state": "entering"
        },
        "center": {
          "image": "/assets/characters/manager.png",
          "name": "Manager",
          "emotion": "neutral",
          "state": "standing"
        },
        "right": {
          "image": "/assets/characters/player.png",
          "name": "Player",
          "emotion": "excited",
          "state": "default"
        }
      },
      "speaker": "Dealer",
      "text": "Welcome to our casino! Your current balance is ${money}.",
      "textAnimation": "fadeIn",
      "iframe": {
        "url": "https://example.com/embedded-content",
        "width": "90%",
        "height": "300px",
        "position": "center",
        "allowFullscreen": true
      },
      "choices": [
        {
          "text": "Let's play blackjack",
          "action": "startGame",
          "eventParams": {
            "playerEvent": "Regular Game",
            "playerCost": 500,
            "opponentIndices": [1],
            "specialRules": "standard"
          }
        },
        {
          "text": "Tell me more about this place",
          "nextEvent": "casino_info"
        }
      ]
    }
  ],
  "postDialog": [
    // Similar structure to preDialog
  ],
  "nextEvent": "next_event_key",
  "usePreviousMoney": true,
  "resetVariables": false,
  "setVariables": {
    "visitedCasino": true
  }
}
```

### Best Practices and Tips

#### File and Asset Organization

- **Consistent Naming Convention**:
  - Use lowercase with underscores for spaces
  - Include character name and emotion in filenames
  - Example: `dealer_happy.png`, `dealer_angry.png`

- **Folder Structure**:
  - `/assets/backgrounds/`: All background images
  - `/assets/characters/`: Character images (grouped by character)
  - `/assets/sounds/`: Sound effects and music
  - `/assets/icons/`: UI elements and icons

- **Asset Optimization**:
  - Compress images to reduce file size
  - Use PNG for characters needing transparency
  - Use JPG for backgrounds and photos
  - Keep audio files under 1MB when possible

#### Story Structure

- **Linear with Branches**:
  - Start with a main storyline
  - Add branches at key decision points
  - Ensure all branches eventually rejoin or reach endings
  - Use the Flow Graph to visualize and check connections

- **Progressive Difficulty**:
  - Start with lower stakes blackjack games
  - Increase stakes as the player progresses
  - Lock higher stake tables behind money requirements
  - Create "comeback" opportunities if player loses money

- **Engaging Characters**:
  - Give each character a distinct personality
  - Ensure characters react to game outcomes
  - Create relationship development based on player choices
  - Use different emotions to express character reactions

#### Game Balance

- **Money Management**:
  - Start the player with enough money to survive early losses
  - Create balanced blackjack games (not too easy or hard)
  - Provide opportunities to earn back lost money
  - Remember to use `usePreviousMoney: true` to persist money between events

- **Choice Consequences**:
  - Make choices meaningful with real consequences
  - Use money requirements to gate certain paths
  - Create different endings based on player performance
  - Allow both winning and losing paths to be interesting

#### Testing and Refinement

- **Testing Workflow**:
  - Test each event individually before linking
  - Verify all asset paths work correctly
  - Check all dialog for errors and typos
  - Test all branches and endings
  - Use Asset Manager to identify issues

- **Common Pitfalls to Avoid**:
  - Missing or incorrect asset paths
  - Broken links between events
  - Forgetting to set "nextEvent" properties
  - Dialog text placeholders not being replaced
  - Inaccessible content due to too-high money requirements

### Getting Started Guide

#### Creating Your First Adventure

1. **Launch the Editor**
   - From the main menu, click "Level Editor"
   - You'll see the editor interface with the Metadata tab active

2. **Set Up Basic Information**
   - Enter a title for your game, e.g., "Midnight at Monte Carlo"
   - Set version to "1.0.0"
   - Enter your name as the author
   - Write a brief description: "A thrilling night of high-stakes blackjack"
   - Set a background image for your title screen
   - Choose theme colors that match your game's atmosphere

3. **Create Your First Event**
   - Switch to the Events tab
   - Click "Add New Event"
   - Set Event Title to "Introduction"
   - Set Event Key to "intro" (important: the game starts with this key)
   - Add a pre-dialog sequence:
     - Click "Add Dialog Segment"
     - Set a background image
     - Add a character on the right (the player)
     - Add a character on the left (e.g., a casino greeter)
     - Set the speaker to "Greeter"
     - Write dialog text: "Welcome to Monte Carlo Casino!"

4. **Add More Dialog**
   - Continue adding dialog segments to build the scene
   - Introduce the setting and establish the player's goals
   - Create at least 3-4 segments to establish the scene

5. **Create a Choice**
   - In the last dialog segment, add choices:
     - Click "Edit Choices for Pre-Dialog #X"
     - Add a choice: "Play Blackjack" with action "Start Game"
     - Configure game parameters:
       - Player Cost: 500
       - Opponent Indices: 1
     - Add another choice: "Explore the casino" with action "Go to Next Event"
     - Set this to go to a new event key, e.g., "casino_floor"

6. **Create a Second Event**
   - Add a new event with key "casino_floor"
   - Create dialog and choices similar to the first event
   - Make sure to set up connections back to other events

7. **Test Your Adventure**
   - Click "Save" to save your adventure
   - Return to the main game
   - Your adventure will start automatically
   - Test all dialog and choices
   - Make sure blackjack games work correctly

8. **Refine and Expand**
   - Return to the editor to fix any issues
   - Add more events to flesh out your story
   - Create multiple story paths
   - Add post-dialog sequences to handle game outcomes
   - Use the Flow Graph to check overall story structure

#### Importing and Playing Adventures

1. **Export Your Adventure**
   - From the editor, click "Export"
   - Choose "Full Game" format
   - Enter a filename
   - Click "Download JSON"

2. **Share Your Adventure**
   - Send the JSON file to friends
   - Upload it to file sharing services
   - Include instructions for importing

3. **Import an Adventure**
   - From the main menu, click "Import Game"
   - Choose "Upload File" or "Paste JSON"
   - Select the adventure file
   - Click "Import Game"

4. **Play the Adventure**
   - The imported adventure will start automatically
   - Follow the story and make choices
   - Play blackjack games when they appear
   - See how many different endings you can find

### Conclusion

The Level Editor in Claude's Casino provides everything you need to create compelling interactive stories with integrated blackjack gameplay. By following this guide, you can create professional-quality adventures that combine narrative choices with gambling mechanics.

Remember that the key to a great adventure is balancing story with gameplay. Use blackjack games as meaningful parts of your narrative, where the outcomes affect the story and the character relationships. With practice, you'll be creating complex, branching adventures that players will want to replay multiple times to discover all the possible endings.

Now it's time to start creating your own casino adventure! Good luck, and may the cards be in your favor.