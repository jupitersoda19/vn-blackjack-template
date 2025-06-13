import React, { useState } from 'react';

const StoryGenerator = ({ gameData }) => {
  const [generatedPrompt, setGeneratedPrompt] = useState('');
  const [customInstructions, setCustomInstructions] = useState('');
  const [selectedTemplate, setSelectedTemplate] = useState('continuation');
  const [isGenerating, setIsGenerating] = useState(false);

  const templates = {
    continuation: {
      name: "Story Continuation",
      description: "Continue the existing story with 3-5 new events",
      instructions: "Create 3-5 new events that continue the current narrative. Focus on character development and meaningful choices."
    },
    character_focus: {
      name: "Character Development",
      description: "Focus on developing relationships with existing characters",
      instructions: "Create events that deepen relationships with existing characters. Include intimate conversations, shared experiences, and relationship milestones."
    },
    action_sequence: {
      name: "Action/Adventure",
      description: "Add excitement with action-packed sequences",
      instructions: "Create thrilling action sequences with mini-games, challenges, and high-stakes decisions. Include combat, chases, or dangerous situations."
    },
    mystery_investigation: {
      name: "Mystery/Investigation",
      description: "Add mystery elements and investigation mechanics",
      instructions: "Create a mystery subplot with clues to discover, suspects to interrogate, and puzzles to solve. Include investigation choices and revelation moments."
    },
    social_events: {
      name: "Social Scenarios",
      description: "Focus on social interactions and networking",
      instructions: "Create social events like parties, meetings, or gatherings. Emphasize dialogue choices, reputation management, and social mini-games."
    },
    branching_paths: {
      name: "Multiple Branching Paths",
      description: "Create divergent story paths based on player choices",
      instructions: "Create multiple branching storylines that lead to different outcomes. Include conditional events based on player stats or previous choices."
    }
  };

  const generateStoryContext = () => {
    setIsGenerating(true);
    
    try {
      // Extract story context from current game data
      const storyContext = createStoryContext(gameData);
      
      // Build the complete prompt
      const fullPrompt = buildPrompt(storyContext, selectedTemplate, customInstructions);
      
      setGeneratedPrompt(fullPrompt);
    } catch (error) {
      alert('Error generating prompt: ' + error.message);
    } finally {
      setIsGenerating(false);
    }
  };

  const createStoryContext = (data) => {
    const events = data.events || [];
    const macros = data.macros || {};
    const templates = data.conditionalTemplates || {};
    
    // Find story endpoints and key characters
    const endpoints = events.filter(event => !event.nextEvent || event.nextEvent === 'end');
    const characters = new Set();
    const variables = new Set();
    
    // Extract characters and variables from events
    events.forEach(event => {
      if (event.preDialog) {
        event.preDialog.forEach(dialog => {
          if (dialog.characters) {
            Object.values(dialog.characters).forEach(char => {
              if (char.name) characters.add(char.name);
            });
          }
          if (dialog.speaker && dialog.speaker !== 'System') {
            characters.add(dialog.speaker);
          }
          
          // Extract variables from text
          const variableMatches = dialog.text?.match(/\{\$(\w+)\}/g) || [];
          variableMatches.forEach(match => {
            variables.add(match.replace(/\{\$|\}/g, ''));
          });
        });
      }
    });

    const lastEvents = events.slice(-3).map(event => ({
      key: event.key,
      title: event.title || event.key,
      hasNextEvent: !!event.nextEvent && event.nextEvent !== 'end',
      choiceCount: event.preDialog?.reduce((count, dialog) => 
        count + (dialog.choices?.length || 0), 0) || 0
    }));

    return {
      title: data.metadata?.title || "Untitled Story",
      totalEvents: events.length,
      totalMacros: Object.keys(macros).length,
      totalTemplates: Object.keys(templates).length,
      characters: Array.from(characters),
      variables: Array.from(variables),
      endpoints: endpoints.map(event => ({
        key: event.key,
        title: event.title || event.key
      })),
      lastEvents,
      availableMacros: Object.keys(macros),
      availableTemplates: Object.keys(templates)
    };
  };

  const buildPrompt = (context, templateKey, customInstructions) => {
    const template = templates[templateKey];
    
    return `# Visual Novel Engine Story Continuation Generator

You are a Visual Novel Engine developer. Your task is to continue an existing story by creating NEW events, macros, and conditional templates in JSON format.

## CRITICAL: You MUST output valid JSON in the exact format specified below.

## Engine Operations Reference
**Macro Operations**: \`"=value"\`, \`"+5"\`, \`"-3"\`, \`"*2"\`, \`"/2"\`, \`"++"\`, \`"--"\`, \`"random:1-10"\`, \`"push:item"\`, \`"remove:item"\`, \`"toggle"\`
**Conditions**: \`>=\`, \`<=\`, \`>\`, \`<\`, \`==\`, \`!=\`, \`AND\`, \`OR\`, \`NOT\`, \`contains\`, \`isEmpty\`, \`size >= 5\`
**Mini-Games**: \`startGame\` (blackjack), \`startDance\`, \`startDart\`
**Flow Control**: \`jumpToEvent:eventKey\`, \`jumpIf:condition:eventKey:fallback\`

## VARIABLE NAMING CONVENTIONS - CRITICAL
**In Dialog Text and Conditions**: Always use \`{$variableName}\` format
**In Macro Parameters**: Use \`{parameterName}\` format (no $)
**In Macro Condition Checks**: Use \`{$variableName}\` for game state, \`{parameterName}\` for macro parameters

---

## EXISTING STORY TO CONTINUE

**Story Title**: ${context.title}
**Current Stats**: ${context.totalEvents} events, ${context.totalMacros} macros, ${context.totalTemplates} templates

**Main Characters**: ${context.characters.join(', ') || 'None defined yet'}

**Key Variables in Use**: ${context.variables.slice(0, 10).join(', ')}${context.variables.length > 10 ? '...' : ''}

**Available Macros**: ${context.availableMacros.slice(0, 8).join(', ')}${context.availableMacros.length > 8 ? ` (and ${context.availableMacros.length - 8} more)` : ''}

**Available Templates**: ${context.availableTemplates.slice(0, 8).join(', ')}${context.availableTemplates.length > 8 ? ` (and ${context.availableTemplates.length - 8} more)` : ''}

**Recent Story Events**:
${context.lastEvents.map(event => 
  `- ${event.title} (key: ${event.key}) - ${event.hasNextEvent ? 'continues' : 'ENDPOINT'} - ${event.choiceCount} choices`
).join('\n')}

**Story Connection Points** (where new content can attach):
${context.endpoints.map(endpoint => 
  `- ${endpoint.title} (key: ${endpoint.key}) - Currently ends the story`
).join('\n')}

---

## YOUR TASK: Generate Story Continuation

**Selected Template**: ${template.name}
**Instructions**: ${template.instructions}

${customInstructions ? `**Additional Custom Instructions**: ${customInstructions}` : ''}

**CRITICAL: You must identify WHERE in the existing story the new content should connect and provide specific connection instructions.**

Before generating new events, analyze the existing story for:
- Events that end without a nextEvent (dead ends)
- Choices that don't lead anywhere (nextEvent missing or "end")
- Natural story progression points where new content should attach
- The primary path where the main story continuation should begin

## REQUIRED OUTPUT FORMAT

Return ONLY valid JSON in this exact structure (matching your game format):

\`\`\`json
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
    }
  },
  "connectionInstructions": {
    "connectFromExisting": "existing_event_key_to_connect_from",
    "firstNewEvent": "first_new_event_key",
    "updateExistingEvent": {
      "eventKey": "existing_event_key_to_update",
      "newNextEvent": "first_new_event_key"
    },
    "analysisOfExistingStory": "Brief description of where story currently ends and how new content connects",
    "storyFlowSummary": "Explanation of how new events connect and flow together"
  }
}
\`\`\`

## CONNECTION INSTRUCTIONS FORMAT - CRITICAL

The \`connectionInstructions\` object tells the merger tool exactly how to connect your new content:

- **\`connectFromExisting\`**: The event key in the existing story where new content should attach
- **\`firstNewEvent\`**: The key of the first event in your new content
- **\`updateExistingEvent\`**: Specifies which existing event to modify and what its new nextEvent should be
  - \`eventKey\`: The existing event to update
  - \`newNextEvent\`: What that event's nextEvent should become (usually your first new event)

## IMPORTANT REQUIREMENTS

1. **CREATE ACTUAL EVENTS**: Generate 3-5 complete new events with full dialog, choices, and progression
2. **MAINTAIN CONSISTENCY**: Use existing characters, variables, and story elements
3. **ADD MEANINGFUL CHOICES**: Include player decisions that impact relationships and story
4. **INTEGRATE MINI-GAMES**: Add blackjack, dance, or dart games where they fit naturally
5. **TRACK RELATIONSHIPS**: Use and modify character relationship variables
6. **CONNECT EVENTS**: Ensure new events link to existing ones and each other properly
7. **USE MACROS**: Create new macros for repeated operations and relationship changes
8. **FOLLOW VARIABLE CONVENTIONS**: Use {$variable} for game state, {parameter} for macro params
9. **PROVIDE CLEAR CONNECTION**: The connectionInstructions must specify exactly how to attach new content
10. **RETURN ONLY JSON**: No explanations, just the JSON output

Generate the continuation now.`;
  };

  const copyToClipboard = (content) => {
    navigator.clipboard.writeText(content).then(() => {
      alert('Prompt copied to clipboard! You can now paste this into your AI assistant.');
    });
  };

  const downloadPrompt = () => {
    const blob = new Blob([generatedPrompt], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `story-prompt-${selectedTemplate}-${Date.now()}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-yellow-500 mb-2">AI Story Generator</h2>
        <p className="text-gray-300">Generate prompts for AI assistants to continue your story</p>
      </div>

      {/* Template Selection */}
      <div className="bg-gray-800 rounded-lg p-4">
        <h3 className="text-lg font-semibold text-yellow-400 mb-3">Select Story Type</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Object.entries(templates).map(([key, template]) => (
            <div
              key={key}
              onClick={() => setSelectedTemplate(key)}
              className={`p-3 rounded-lg border-2 cursor-pointer transition-colors ${
                selectedTemplate === key
                  ? 'border-yellow-500 bg-yellow-900/20'
                  : 'border-gray-600 bg-gray-700 hover:border-gray-500'
              }`}
            >
              <h4 className="font-semibold text-white mb-1">{template.name}</h4>
              <p className="text-sm text-gray-300">{template.description}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Custom Instructions */}
      <div className="bg-gray-800 rounded-lg p-4">
        <h3 className="text-lg font-semibold text-yellow-400 mb-3">Custom Instructions (Optional)</h3>
        <textarea
          value={customInstructions}
          onChange={(e) => setCustomInstructions(e.target.value)}
          placeholder="Add any specific requirements, character details, or plot directions..."
          className="w-full h-24 bg-gray-700 border border-gray-600 rounded p-3 text-white resize-none"
        />
        <p className="text-sm text-gray-400 mt-2">
          These instructions will be added to the AI prompt to guide story generation.
        </p>
      </div>

      {/* Story Analysis */}
      <div className="bg-gray-800 rounded-lg p-4">
        <h3 className="text-lg font-semibold text-yellow-400 mb-3">Current Story Analysis</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
          <div>
            <div className="text-2xl font-bold text-blue-400">{gameData.events?.length || 0}</div>
            <div className="text-sm text-gray-400">Events</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-green-400">{Object.keys(gameData.macros || {}).length}</div>
            <div className="text-sm text-gray-400">Macros</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-purple-400">{Object.keys(gameData.conditionalTemplates || {}).length}</div>
            <div className="text-sm text-gray-400">Templates</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-yellow-400">
              {gameData.events?.filter(e => !e.nextEvent || e.nextEvent === 'end').length || 0}
            </div>
            <div className="text-sm text-gray-400">Endpoints</div>
          </div>
        </div>
      </div>

      {/* Generate Button */}
      <div className="text-center">
        <button
          onClick={generateStoryContext}
          disabled={isGenerating || !gameData.events?.length}
          className="bg-blue-600 hover:bg-blue-500 disabled:bg-gray-600 text-white font-bold py-3 px-8 rounded-lg flex items-center mx-auto"
        >
          {isGenerating ? (
            <>
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Generating Prompt...
            </>
          ) : (
            <>
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              Generate AI Prompt
            </>
          )}
        </button>
        {!gameData.events?.length && (
          <p className="text-red-400 text-sm mt-2">
            You need at least one event in your story to generate a continuation prompt.
          </p>
        )}
      </div>

      {/* Generated Prompt Display */}
      {generatedPrompt && (
        <div className="bg-gray-800 rounded-lg p-4">
          <div className="flex justify-between items-center mb-3">
            <h3 className="text-lg font-semibold text-yellow-400">Generated AI Prompt</h3>
            <div className="flex gap-2">
              <button
                onClick={() => copyToClipboard(generatedPrompt)}
                className="bg-green-600 hover:bg-green-500 text-white font-bold py-1 px-3 rounded text-sm flex items-center"
              >
                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
                Copy
              </button>
              <button
                onClick={downloadPrompt}
                className="bg-blue-600 hover:bg-blue-500 text-white font-bold py-1 px-3 rounded text-sm flex items-center"
              >
                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Download
              </button>
            </div>
          </div>
          <div className="bg-gray-900 rounded p-3 max-h-96 overflow-auto">
            <pre className="text-xs text-gray-300 whitespace-pre-wrap">{generatedPrompt}</pre>
          </div>
          <div className="mt-3 p-3 bg-blue-900/30 border border-blue-600 rounded">
            <h4 className="font-semibold text-blue-400 mb-2">Next Steps:</h4>
            <ol className="list-decimal list-inside space-y-1 text-sm text-blue-200">
              <li>Copy the generated prompt above</li>
              <li>Paste it into Claude, ChatGPT, or your preferred AI assistant</li>
              <li>The AI will generate JSON content for your story continuation</li>
              <li>Copy the AI's JSON response</li>
              <li>Go to the "Story Merger" tab and paste it there to merge with your story</li>
            </ol>
          </div>
        </div>
      )}

      {/* Tips and Guidelines */}
      <div className="bg-gray-800 rounded-lg p-4">
        <h3 className="text-lg font-semibold text-yellow-400 mb-3">Tips for Best Results</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <h4 className="font-semibold text-green-400 mb-2">✅ Do This:</h4>
            <ul className="list-disc list-inside space-y-1 text-sm text-gray-300">
              <li>Have clear story endpoints before generating</li>
              <li>Use descriptive event titles and character names</li>
              <li>Include specific custom instructions</li>
              <li>Test the generated content in the Story Merger</li>
              <li>Review and edit the AI output if needed</li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-red-400 mb-2">❌ Avoid This:</h4>
            <ul className="list-disc list-inside space-y-1 text-sm text-gray-300">
              <li>Generating prompts for empty stories</li>
              <li>Vague or contradictory custom instructions</li>
              <li>Ignoring the connection instructions in AI output</li>
              <li>Merging without reviewing the content first</li>
              <li>Overriding important story variables accidentally</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StoryGenerator;