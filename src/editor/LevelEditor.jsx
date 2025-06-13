import React, { useState } from 'react';
import MetadataEditor from './MetadataEditor';
import EventsEditor from './EventsEditor';
import MacroLibraryEditor from './MacroLibraryEditor';
import AdvancedExport from './AdvancedExport';
import ImportJsonModal from './ImportJsonModal';
import AssetManager from './AssetManager';
import StoryGenerator from './StoryGenerator';
import StoryMerger from './StoryMerger';

const LevelEditor = ({ onSave, onCancel, initialData = {} }) => {
  const [gameData, setGameData] = useState({
    metadata: initialData.metadata || {
      title: "Blackjack Adventure",
      version: "1.0.0",
      description: "A blackjack adventure where your choices determine your fortune",
      author: "",
      backgroundImage: "/assets/backgrounds/casino-entrance.png",
      titleScreenTheme: {
        primaryColor: "#D97706",
        secondaryColor: "#92400E",
        textColor: "#FEF3C7"
      }
    },
    macros: initialData.macros || {},
    conditionalTemplates: initialData.conditionalTemplates || {},
    events: initialData.events || []
  });
  
  const [activeTab, setActiveTab] = useState(0);
  const [showExport, setShowExport] = useState(false);
  const [showImport, setShowImport] = useState(false);
  const [showAssetManager, setShowAssetManager] = useState(false);
  const [unsavedChanges, setUnsavedChanges] = useState(false);
  
  const handleMetadataChange = (newMetadata) => {
    setGameData({ ...gameData, metadata: newMetadata });
    setUnsavedChanges(true);
  };

  const handleMacrosChange = (newMacros) => {
    setGameData({ ...gameData, macros: newMacros });
    setUnsavedChanges(true);
  };

  const handleConditionalTemplatesChange = (newTemplates) => {
    setGameData({ ...gameData, conditionalTemplates: newTemplates });
    setUnsavedChanges(true);
  };
  
  const handleEventsChange = (newEvents) => {
    setGameData({ ...gameData, events: newEvents });
    setUnsavedChanges(true);
  };

  const handleMergeComplete = (mergedStoryData) => {
    setGameData(mergedStoryData);
    setUnsavedChanges(true);
    // Switch to events tab to show the merged result
    setActiveTab(2);
  };
  
  const handleSave = () => {
    onSave(gameData);
    setUnsavedChanges(false);
  };
 
  const handleImport = (importedData, importOption) => {
    let newGameData;
   
    switch (importOption) {
      case 'replace':
        newGameData = { 
          metadata: importedData.metadata || {},
          macros: importedData.macros || {},
          conditionalTemplates: importedData.conditionalTemplates || {},
          events: importedData.events || []
        };
        break;
       
      case 'merge':
        const existingEventKeys = new Set(gameData.events.map(event => event.key));
        const newEvents = [
          ...gameData.events,
          ...importedData.events.filter(event => !existingEventKeys.has(event.key))
        ];
       
        newGameData = {
          metadata: { ...importedData.metadata },
          macros: { ...gameData.macros, ...importedData.macros },
          conditionalTemplates: { ...gameData.conditionalTemplates, ...importedData.conditionalTemplates },
          events: newEvents
        };
        break;
       
      case 'events_only':
        const currentEventKeys = new Set(gameData.events.map(event => event.key));
        const filteredNewEvents = importedData.events.filter(event => !currentEventKeys.has(event.key));
       
        newGameData = {
          metadata: { ...gameData.metadata },
          macros: { ...gameData.macros },
          conditionalTemplates: { ...gameData.conditionalTemplates },
          events: [...gameData.events, ...filteredNewEvents]
        };
        break;

      case 'macros_only':
        newGameData = {
          metadata: { ...gameData.metadata },
          macros: { ...gameData.macros, ...importedData.macros },
          conditionalTemplates: { ...gameData.conditionalTemplates, ...importedData.conditionalTemplates },
          events: [...gameData.events]
        };
        break;
       
      case 'metadata_only':
        newGameData = {
          metadata: { ...importedData.metadata },
          macros: { ...gameData.macros },
          conditionalTemplates: { ...gameData.conditionalTemplates },
          events: [...gameData.events]
        };
        break;
       
      default:
        newGameData = { 
          metadata: importedData.metadata || {},
          macros: importedData.macros || {},
          conditionalTemplates: importedData.conditionalTemplates || {},
          events: importedData.events || []
        };
    }
   
    setGameData(newGameData);
    setUnsavedChanges(true);
   
    if (importOption === 'metadata_only') {
      setActiveTab(0);
    } else if (importOption === 'macros_only') {
      setActiveTab(1);
    } else if (importOption !== 'metadata_only') {
      setActiveTab(2);
    }
  };
  
  const getStats = () => {
    return {
      totalEvents: gameData.events.length,
      totalMacros: Object.keys(gameData.macros).length,
      totalTemplates: Object.keys(gameData.conditionalTemplates).length,
      connectedEvents: gameData.events.filter(event =>
        event.nextEvent ||
        (event.preDialog && event.preDialog.some(dialog => dialog.choices && dialog.choices.length > 0)) ||
        (event.postDialog && event.postDialog.some(dialog => dialog.choices && dialog.choices.length > 0))
      ).length,
      storyEndpoints: gameData.events.filter(event => !event.nextEvent || event.nextEvent === 'end').length
    };
  };
  
  const stats = getStats();
  
  const tabs = [
    {
      id: 'metadata',
      name: 'Metadata',
      badge: null,
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      component: (
        <MetadataEditor
          metadata={gameData.metadata}
          onMetadataChange={handleMetadataChange}
        />
      )
    },
    {
      id: 'macros',
      name: 'Macros',
      badge: stats.totalMacros,
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      ),
      component: (
        <MacroLibraryEditor
          macros={gameData.macros}
          conditionalTemplates={gameData.conditionalTemplates}
          onMacrosChange={handleMacrosChange}
          onConditionalTemplatesChange={handleConditionalTemplatesChange}
        />
      )
    },
    {
      id: 'events',
      name: 'Events',
      badge: gameData.events.length,
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
        </svg>
      ),
      component: (
        <EventsEditor
          events={gameData.events}
          onEventsChange={handleEventsChange}
          availableMacros={Object.keys(gameData.macros)}
          availableTemplates={Object.keys(gameData.conditionalTemplates)}
        />
      )
    },
    {
      id: 'generator',
      name: 'Story Generator',
      badge: stats.storyEndpoints > 0 ? stats.storyEndpoints : null,
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
      ),
      component: (
        <StoryGenerator gameData={gameData} />
      )
    },
    {
      id: 'merger',
      name: 'Story Merger',
      badge: null,
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
        </svg>
      ),
      component: (
        <StoryMerger gameData={gameData} onMergeComplete={handleMergeComplete} />
      )
    }
  ];
  
  return (
    <div className="fixed inset-0 bg-gray-900 flex flex-col">
      {/* Header Bar */}
      <div className="bg-gray-800 border-b border-yellow-700 p-4 flex-shrink-0">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold text-yellow-500">
              Game Level Editor
              {unsavedChanges && <span className="ml-2 text-sm text-yellow-400">(unsaved changes)</span>}
            </h2>
            <div className="text-sm text-gray-400 mt-1">
              {stats.totalEvents} events • {stats.totalMacros} macros • {stats.totalTemplates} templates • {stats.connectedEvents} connected
              {stats.storyEndpoints > 0 && (
                <span className="ml-2 text-yellow-400">• {stats.storyEndpoints} endpoint{stats.storyEndpoints !== 1 ? 's' : ''}</span>
              )}
            </div>
          </div>
          <div className="flex space-x-2">
            <button
              className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-2 px-4 rounded flex items-center"
              onClick={() => setShowAssetManager(true)}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
              </svg>
              Assets
            </button>
            <button
              className="bg-purple-600 hover:bg-purple-500 text-white font-bold py-2 px-4 rounded flex items-center"
              onClick={() => setShowImport(true)}
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
              </svg>
              Import
            </button>
            <button
              className="bg-blue-600 hover:bg-blue-500 text-white font-bold py-2 px-4 rounded flex items-center"
              onClick={() => setShowExport(true)}
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              Export
            </button>
            <button
              className="bg-green-600 hover:bg-green-500 text-white font-bold py-2 px-4 rounded flex items-center"
              onClick={handleSave}
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
              </svg>
              Save
            </button>
            <button
              className="bg-red-600 hover:bg-red-500 text-white font-bold py-2 px-4 rounded"
              onClick={onCancel}
            >
              Cancel
            </button>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="bg-gray-800 border-b border-yellow-700 px-4 flex-shrink-0">
        <div className="flex overflow-x-auto">
          {tabs.map((tab, index) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(index)}
              className={`py-3 px-4 font-semibold cursor-pointer focus:outline-none border-b-2 transition-colors whitespace-nowrap flex items-center ${
                activeTab === index
                  ? 'border-yellow-500 text-yellow-400 bg-gray-700'
                  : 'border-transparent text-gray-400 hover:text-gray-300 hover:bg-gray-750'
              }`}
            >
              {tab.icon}
              <span className="ml-2">{tab.name}</span>
              {tab.badge !== null && (
                <span className="ml-2 px-2 py-1 bg-yellow-800 text-yellow-200 rounded-full text-xs">
                  {tab.badge}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content - Full Height */}
      <div className="flex-1 overflow-hidden">
        <div className="h-full overflow-auto p-6">
          {tabs[activeTab].component}
        </div>
      </div>
      
      {/* Modals */}
      {showAssetManager && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
          <div className="bg-gray-900 rounded-lg shadow-lg max-w-5xl w-full max-h-screen overflow-auto">
            <div className="flex justify-between items-center p-4 border-b border-gray-700">
              <h2 className="text-xl font-bold text-yellow-500">Asset Manager</h2>
              <button 
                onClick={() => setShowAssetManager(false)}
                className="text-gray-400 hover:text-white"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="p-4">
              <AssetManager gameData={gameData} />
            </div>
            <div className="p-4 border-t border-gray-700 flex justify-end">
              <button
                onClick={() => setShowAssetManager(false)}
                className="bg-yellow-600 hover:bg-yellow-500 text-white font-bold py-2 px-4 rounded"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
      
      {showExport && (
        <AdvancedExport
          gameData={gameData}
          onClose={() => setShowExport(false)}
        />
      )}
     
      {showImport && (
        <ImportJsonModal
          onImport={handleImport}
          onClose={() => setShowImport(false)}
        />
      )}
    </div>
  );
};

export default LevelEditor;