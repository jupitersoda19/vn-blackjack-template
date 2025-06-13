# Visual Novel Engine Story Continuation Generator

You are a Visual Novel Engine developer. Your task is to continue an existing story by creating NEW events, macros, and conditional templates in JSON format.

## CRITICAL: You MUST output valid JSON in the exact format specified below.

## Engine Operations Reference
**Macro Operations**: `"=value"`, `"+5"`, `"-3"`, `"*2"`, `"/2"`, `"++"`, `"--"`, `"random:1-10"`, `"push:item"`, `"remove:item"`, `"toggle"`
**Conditions**: `>=`, `<=`, `>`, `<`, `==`, `!=`, `AND`, `OR`, `NOT`, `contains`, `isEmpty`, `size >= 5`
**Mini-Games**: `startGame` (blackjack), `startDance`, `startDart`
**Flow Control**: `jumpToEvent:eventKey`, `jumpIf:condition:eventKey:fallback`

## VARIABLE NAMING CONVENTIONS - CRITICAL
**In Dialog Text and Conditions**: Always use `{$variableName}` format
**In Macro Parameters**: Use `{parameterName}` format (no $)
**In Macro Condition Checks**: Use `{$variableName}` for game state, `{parameterName}` for macro parameters

---

## EXISTING STORY TO CONTINUE

[PASTE YOUR LLM-FRIENDLY STORY TEXT HERE]

---

## YOUR TASK: Generate Story Continuation

Analyze the existing story above and create 3-5 NEW events that continue the narrative. 

**CRITICAL: You must identify WHERE in the existing story the new content should connect and provide specific connection instructions.**

Before generating new events, analyze the existing story for:
- Events that end without a nextEvent (dead ends)
- Choices that don't lead anywhere (nextEvent missing or "end")
- Natural story progression points where new content should attach
- Multiple branching paths that could lead to different new events

## REQUIRED OUTPUT FORMAT

Return ONLY valid JSON in this exact structure (matching your game format):

```json
{
  "events": [
    {
      "key": "event_key_here",
      "title": "Event Title",
      "editorTags": ["continuation", "chapter2"],
      "preDialog": [
        {
          "background": "/backgrounds/location.jpg",
          "backgroundTransition": "fade",
          "characters": {
            "center": {
              "image": "/characters/character.png",
              "name": "Character Name",
              "emotion": "happy"
            }
          },
          "speaker": "Character Name",
          "text": "Dialog text with {$variableName} substitution",
          "macros": ["macroName:param1:param2"],
          "conditions": ["conditionalTemplate"],
          "conditionalText": {
            "{$relationship} >= 10": " You smile warmly.",
            "{$playerMoney} > 1000 + {$reputation} >= 50": " You feel confident and respected."
          },
          "choices": [
            {
              "text": "Choice text with {$variableName}",
              "macros": ["increaseRelationship:character:5"],
              "nextEvent": "next_event_key",
              "requiresCondition": "{$variableName} >= value",
              "action": "startGame",
              "eventParams": {
                "playerCost": 500,
                "deckCount": 2
              }
            }
          ]
        }
      ],
      "postDialog": [
        {
          "speaker": "Character Name",
          "text": "Post-game dialog with {$gameResultMessage} and {$playerMoney}",
          "macros": ["updateReputation:result"],
          "conditionalText": {
            "{$profit} > 0": " You made money!",
            "{$danceGrade} == A+": " Perfect performance!"
          }
        }
      ],
      "nextEvent": "next_event_key"
    }
  ],
  "macros": {
    "macroName": {
      "description": "What this macro does",
      "parameters": ["param1", "param2"],
      "updates": {
        "{param1}Relationship": "+{param2}",
        "reputation": "+1",
        "playerMoney": "+{amount}"
      },
      "conditions": {
        "if": "{$playerMoney} >= {amount}",
        "then": {
          "wealth_status": "=rich",
          "bonus": "+{param2}"
        },
        "else": {
          "wealth_status": "=poor"
        }
      }
    }
  },
  "conditionalTemplates": {
    "templateName": {
      "variable": "character_relationship",
      "operator": ">=",
      "value": 15,
      "text": " {character} looks at you with affection."
    },
    "wealthyPlayer": {
      "variable": "playerMoney",
      "operator": ">=",
      "value": 1000,
      "text": " You feel confident with your wealth."
    }
  },
  "connectionInstructions": {
    "analysisOfExistingStory": "Brief description of where story currently ends and connection opportunities",
    "connections": [
      {
        "type": "updateEvent",
        "existingEventKey": "existing_event_key",
        "newNextEvent": "first_new_event_key",
        "reason": "This event currently has no continuation"
      },
      {
        "type": "updateChoice",
        "existingEventKey": "existing_event_key", 
        "dialogIndex": 0,
        "choiceIndex": 1,
        "newNextEvent": "second_new_event_key",
        "reason": "This choice currently leads nowhere"
      },
      {
        "type": "conditionalConnection",
        "existingEventKey": "existing_event_key",
        "condition": "{$relationship} >= 10",
        "newNextEvent": "romantic_path_event",
        "fallbackNextEvent": "friendship_path_event",
        "reason": "Create branching based on relationship level"
      }
    ],
    "firstNewEventKey": "event_key_here",
    "storyFlowSummary": "Explanation of how new events connect and flow together"
  }
}
```

## VARIABLE USAGE EXAMPLES - CRITICAL TO FOLLOW

### ✅ CORRECT Variable Usage:

**Dialog Text:**
```json
"text": "You have {$playerMoney} dollars and {$victoriaRelationship} relationship points."
```

**Conditional Text:**
```json
"conditionalText": {
  "{$playerMoney} >= 1000": " You feel wealthy!",
  "{$relationship} > 15 + {$reputation} >= 50": " People respect and like you."
}
```

**Macro Conditions:**
```json
"conditions": {
  "if": "{$playerMoney} >= {threshold}",
  "then": {
    "status": "=wealthy"
  }
}
```

**Choice Requirements:**
```json
"requiresCondition": "{$playerMoney} >= 500"
```

**Flow Control:**
```json
"macros": ["jumpIf:{$playerMoney} > 1000:rich_path:poor_path"]
```

### ✅ CORRECT Macro Parameter Usage:

**Macro Updates:**
```json
"updates": {
  "playerMoney": "+{amount}",
  "{character}Relationship": "+{points}",
  "totalSpent": "+{cost}"
}
```

### ❌ INCORRECT Examples (DO NOT USE):
- `"text": "You have {playerMoney} dollars"` ❌ (missing $)
- `"updates": {"playerMoney": "+{$amount}"}` ❌ (parameters don't use $)
- `"conditionalText": {"playerMoney >= 1000": "text"}` ❌ (missing {$})

## AVAILABLE GAME RESULT VARIABLES
When creating postDialog after mini-games, these variables are available:
- `{$gameResultMessage}` - Game outcome message
- `{$lastGameType}` - "blackjack", "dance", or "dart"
- `{$playerMoney}` - Updated money after game
- `{$profit}` - Money gained/lost in game
- `{$danceGrade}` - Dance game grade (A+, A, B, etc.)
- `{$danceAccuracy}` - Dance accuracy percentage
- `{$dartPlayerScore}` - Player's dart score
- `{$dartWinner}` - "Player" or opponent name

## IMPORTANT REQUIREMENTS

1. **CREATE ACTUAL EVENTS**: Generate 3-5 complete new events with full dialog, choices, and progression
2. **MAINTAIN CONSISTENCY**: Use existing characters, variables, and story elements
3. **ADD MEANINGFUL CHOICES**: Include player decisions that impact relationships and story
4. **INTEGRATE MINI-GAMES**: Add blackjack, dance, or dart games where they fit naturally
5. **TRACK RELATIONSHIPS**: Use and modify character relationship variables
6. **CONNECT EVENTS**: Ensure new events link to existing ones and each other properly
7. **USE MACROS**: Create new macros for repeated operations and relationship changes
8. **FOLLOW VARIABLE CONVENTIONS**: Use {$variable} for game state, {parameter} for macro params
9. **RETURN ONLY JSON**: No explanations, just the JSON output

## CRITICAL RESTRICTIONS - DO NOT DO THESE:

❌ **DO NOT use wrong variable format**: Always {$variable} in dialog/conditions, {parameter} in macro definitions
❌ **DO NOT reference non-existent events**: Every `nextEvent` value must point to existing or newly created events
❌ **DO NOT create phantom event references**: If you write `"nextEvent": "some_event"`, that event must exist
❌ **DO NOT use placeholder event names**: No generic names unless you actually create those events
❌ **DO NOT leave dangling connections**: Every event you create must be reachable
❌ **DO NOT mix variable formats**: Be consistent with {$} vs {} usage

## VALIDATION CHECKLIST:
Before outputting JSON, verify:
✅ All dialog text uses {$variableName} format
✅ All macro parameters use {parameterName} format (no $)
✅ All macro conditions use {$variableName} for game state
✅ Every `nextEvent` value points to a real event (existing or newly created)
✅ Every event you create has a unique key that doesn't conflict with existing events
✅ All connection instructions reference actual existing event keys
✅ The story flow makes logical sense from start to finish
✅ No orphaned events that can't be reached

Generate the continuation now.