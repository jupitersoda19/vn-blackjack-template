import React, { useState, useEffect, useCallback } from 'react';

/**
 * Asset Manager Component for Visual Novel Level Editor
 * Displays all assets used in the game JSON
 */

const AssetPreviewImageItem = ({ assetPath, getAssetUrl }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const fullUrl = getAssetUrl(assetPath);

  const handleLoad = () => {
    setIsLoading(false);
    setHasError(false);
  };

  const handleError = () => {
    setIsLoading(false);
    setHasError(true);
  };

  // Reset state if assetPath changes (important if keys aren't perfectly stable, though they should be)
  useEffect(() => {
    setIsLoading(true);
    setHasError(false);
  }, [fullUrl]); // Depend on fullUrl as it's derived from assetPath and baseUrl

  return (
    <div className="bg-gray-900 rounded-lg overflow-hidden flex flex-col">
      <div className="bg-gray-800 aspect-square flex items-center justify-center overflow-hidden relative">
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-800 z-10">
            <svg className="animate-spin h-8 w-8 text-yellow-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          </div>
        )}
        <img
          src={fullUrl}
          alt={assetPath.split('/').pop()}
          className={`max-w-full max-h-full object-contain ${isLoading || hasError ? 'opacity-0' : 'opacity-100'}`} // Use opacity for smoother transition
          onLoad={handleLoad}
          onError={handleError}
          loading="lazy" // Add native lazy loading
        />
        {hasError && !isLoading && ( // Show error only after attempting to load
          <div className="absolute inset-0 w-full h-full bg-gray-700 flex flex-col items-center justify-center text-gray-400 p-2">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-red-500 mb-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <span className="text-xs text-center text-red-400">Load Error</span>
          </div>
        )}
      </div>
      <div className="p-2">
        <p className="text-xs text-gray-400 truncate" title={assetPath}>{assetPath}</p>
      </div>
    </div>
  );
};
const AssetManager = ({ gameData }) => {
  const [selectedTab, setSelectedTab] = useState('summary');
  const [searchTerm, setSearchTerm] = useState('');
  const [assetData, setAssetData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [checkResults, setCheckResults] = useState(null);
  const [isCheckingAssets, setIsCheckingAssets] = useState(false); // For checkAssets button state
  const [assetsBaseUrl, setAssetsBaseUrl] = useState(''); // Base URL for assets
  
  // Parse assets when component mounts or gameData changes
  useEffect(() => {
    setIsLoading(true);
    // Use setTimeout to prevent UI freeze on large datasets
    setTimeout(() => {
      const assets = extractAssets(gameData);
      setAssetData(assets);
      setIsLoading(false);
      
      // Try to determine assets base URL from the first background
      if (assets.backgrounds && assets.backgrounds.length > 0) {
        const firstBackground = assets.backgrounds[0];
        // If it's a full URL, we don't need a base URL
        if (firstBackground.startsWith('http')) {
          setAssetsBaseUrl('');
        } else {
          try {
            const url = new URL(window.location.href);
            setAssetsBaseUrl(`${url.origin}`);
          } catch (e) {
            setAssetsBaseUrl('');
          }
        }
      }
    }, 0);
  }, [gameData]);
  
  // Filter assets based on search term
  const filterAssets = useCallback((assetList) => { 
    if (!searchTerm || !assetList) return assetList || [];
    return assetList.filter(asset => 
      asset.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [searchTerm]);
  
  // Get full asset URL
  const getAssetUrl = useCallback((path) => { // useCallback for stable reference
    if (!path) return '';
    if (path.startsWith('http') || path.startsWith('data:')) return path; // Added data:
    if (path.startsWith('/api/')) return path;
    
    let ABU = assetsBaseUrl;
    if (ABU.endsWith('/') && path.startsWith('/')) {
        ABU = ABU.slice(0, -1); 
    } else if (!ABU.endsWith('/') && !path.startsWith('/') && ABU !== '') {
        ABU = ABU + '/'; 
    }
    if (path.startsWith('/')) return `${ABU}${path}`;
    return `${ABU}${path}`; 
  }, [assetsBaseUrl]);
  
  // Check if asset actually exists
  const checkAssetExists = useCallback((url, assetType = 'image') => { // useCallback
    return new Promise((resolve) => {
      if (!url || url.startsWith('/api/')) {
        resolve({ exists: false, reason: 'Placeholder or API path' });
        return;
      }
      if (url.startsWith('data:')) {
          resolve({ exists: true, reason: 'Data URL' });
          return;
      }

      try {
        new URL(url); // Will throw if scheme is missing and it's not a relative path starting with /
      } catch (e) {
        if (!url.startsWith('/') && !url.startsWith('http')) {
             resolve({ exists: false, reason: 'Malformed or unresolvable relative URL' });
             return;
        }
      }

      if (assetType.toLowerCase().includes('image')) {
        const img = new Image();
        img.onload = () => resolve({ exists: true });
        img.onerror = () => resolve({ exists: false, reason: 'Image not found or load error (404, CORS, etc.)' });
        img.src = url;
      } else if (assetType.toLowerCase().includes('audio') || assetType.toLowerCase().includes('sound') || assetType.toLowerCase().includes('music')) {
        resolve({ exists: true, reason: 'Existence check for non-image assets like audio is limited client-side. Assumed OK if path seems valid.' });
      } else {
        resolve({ exists: true, reason: 'Existence check for this asset type is limited client-side. Assumed OK if path seems valid.' });
      }
    });
  }, []); // No dependencies if it only uses its arguments
  
  // Check for potential missing assets and issues
  const checkAssets = async () => {
    if (!assetData) return;
    setIsCheckingAssets(true);
    setCheckResults(null); // Clear previous results

    const results = {
      missing: [],
      potential: [],
      duplicated: []
    };
    
    const allAssets = Object.entries(assetData)
      .filter(([key]) => key !== 'summary')
      .flatMap(([type, assets]) => assets.map(path => ({ path, type })));
    
    allAssets.forEach(({ path, type }) => {
      if (!path) return; // Skip empty paths

      if (!path.includes('.') && !path.startsWith('/api/') && !path.startsWith('data:')) {
        results.potential.push({ path, type, issue: 'Missing file extension' });
      }
      if (path.includes('placeholder') || path.includes('missing_asset_string_pattern')) { // Be more specific if "missing" is too broad
        results.missing.push({ path, type, issue: 'Path indicates a placeholder' });
      }
      if (!path.startsWith('/') && !path.startsWith('http') && !path.startsWith('data:')) {
        results.potential.push({ path, type, issue: 'Relative path does not start with / (may need Base URL)'});
      }
    });
    
    const fileNameMap = {};
    allAssets.forEach(({ path, type }) => {
      if (!path) return;
      const fileName = path.split('/').pop().split('?')[0]; // Remove query params for filename
      if (!fileName) return;
      if (!fileNameMap[fileName]) fileNameMap[fileName] = [];
      fileNameMap[fileName].push({ path, type });
    });
    
    Object.entries(fileNameMap)
      .filter(([_, paths]) => paths.length > 1)
      .forEach(([fileName, paths]) => {
        results.duplicated.push({ fileName, paths });
      });
    
    const imageAssetTypes = ['backgrounds', 'characterImages', 'icons'];
    const assetsToVerifyExistence = allAssets
        .filter(asset => imageAssetTypes.includes(asset.type) && asset.path && !asset.path.startsWith('/api/') && !asset.path.startsWith('data:'))
        .slice(0, 20); // Limit for performance, consider making this configurable or having a "Check All" button with warning

    for (const { path, type } of assetsToVerifyExistence) {
      const url = getAssetUrl(path);
      // Determine primary type for checkAssetExists (e.g. 'image' or 'audio')
      let checkType = 'image'; // Default to image for these asset types
      // if (type === 'soundEffects' || type === 'music') checkType = 'audio';

      const status = await checkAssetExists(url, checkType);
      
      if (!status.exists && !results.missing.some(item => item.path === path)) {
        results.missing.push({
          path,
          type,
          issue: status.reason || 'File not found or inaccessible'
        });
      }
    }
    
    setCheckResults(results);
    setIsCheckingAssets(false);
  };
  
  // Download assets list
  const downloadAssetsList = () => {
    if (!assetData) return;
    
    // Create text content
    let content = "# GAME ASSET INVENTORY\n\n";
    content += `Generated: ${new Date().toLocaleString()}\n`;
    content += `Total Assets: ${assetData.summary.total}\n\n`;
    
    // Add each asset type
    Object.entries(assetData)
      .filter(([key]) => key !== 'summary')
      .forEach(([type, assets]) => {
        content += `## ${type.toUpperCase()} (${assets.length})\n`;
        assets.forEach(path => {
          content += `- ${path}\n`;
        });
        content += "\n";
      });
    
    // Create download
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'game-assets.txt';
    a.click();
    URL.revokeObjectURL(url);
  };
  
  // Change the base URL for assets
  const handleBaseUrlChange = (e) => {
    setAssetsBaseUrl(e.target.value);
  };
  
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-yellow-500 animate-pulse">
          <svg className="animate-spin -ml-1 mr-3 h-8 w-8 text-yellow-500 inline-block" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <span className="ml-2">Loading assets...</span>
        </div>
      </div>
    );
  }
  
  if (!assetData) {
    return (
      <div className="bg-red-900 text-white p-4 rounded-lg">
        <h3 className="font-bold">Error Analyzing Assets</h3>
        <p>There was a problem parsing assets from the game data.</p>
      </div>
    );
  }
  
  return (
    <div className="text-white">
      {/* Search and controls */}
      <div className="flex flex-wrap gap-2 mb-4">
        <input 
          type="text"
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
          placeholder="Search assets..."
          className="flex-grow bg-gray-700 text-white px-3 py-2 rounded border border-gray-600 focus:outline-none focus:border-yellow-500"
        />
        
        <button 
          onClick={checkAssets}
          className="bg-blue-600 hover:bg-blue-500 px-3 py-2 rounded font-medium flex items-center"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
          Check Assets
        </button>
        
        <button 
          onClick={downloadAssetsList}
          className="bg-green-600 hover:bg-green-500 px-3 py-2 rounded font-medium flex items-center"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
          Export List
        </button>
      </div>
      
      {/* Asset base URL setting */}
      <div className="mb-4 bg-gray-900 p-3 rounded-lg">
        <label className="flex flex-col sm:flex-row sm:items-center gap-2">
          <span className="text-yellow-500 font-medium whitespace-nowrap">Asset Base URL:</span>
          <input
            type="text"
            value={assetsBaseUrl}
            onChange={handleBaseUrlChange}
            placeholder="http://localhost:3000 or leave blank for relative paths"
            className="flex-grow bg-gray-700 text-white px-3 py-2 rounded border border-gray-600 focus:outline-none focus:border-yellow-500"
          />
        </label>
        <p className="text-sm text-gray-400 mt-1">
          Set this to your application's base URL to properly display images. Leave blank for relative paths.
        </p>
      </div>
      
      {/* Tabs for asset categories */}
      <div className="flex flex-wrap border-b border-gray-700 mb-4">
        <button 
          className={`px-4 py-2 font-medium ${selectedTab === 'summary' ? 'bg-gray-700 rounded-t text-yellow-500' : 'text-gray-400 hover:text-white'}`}
          onClick={() => setSelectedTab('summary')}
        >
          Summary
        </button>
        
        {Object.keys(assetData)
          .filter(key => key !== 'summary')
          .sort((a, b) => assetData[b].length - assetData[a].length) // Sort by count
          .map(type => (
            <button 
              key={type}
              className={`px-4 py-2 font-medium ${selectedTab === type ? 'bg-gray-700 rounded-t text-yellow-500' : 'text-gray-400 hover:text-white'}`}
              onClick={() => setSelectedTab(type)}
            >
              {type.charAt(0).toUpperCase() + type.slice(1)}
              <span className="ml-1 text-xs bg-gray-800 px-1 rounded">
                {assetData[type].length}
              </span>
            </button>
          ))}
      </div>
      
      {/* Asset content area */}
      <div className="bg-gray-800 rounded-lg p-4">
        {selectedTab === 'summary' ? (
          <div>
            <h3 className="text-xl font-semibold text-yellow-400 mb-3">Asset Summary</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              <div className="bg-gray-900 p-3 rounded-lg">
                <h4 className="font-medium text-yellow-500 mb-2">Total Assets</h4>
                <p className="text-3xl font-bold">{assetData.summary.total}</p>
              </div>
              
              {Object.entries(assetData.summary.byType)
                .sort(([_, a], [__, b]) => b - a) // Sort by count
                .map(([type, count]) => (
                  <div key={type} className="bg-gray-900 p-3 rounded-lg">
                    <h4 className="font-medium text-yellow-500 mb-2">
                      {type.charAt(0).toUpperCase() + type.slice(1)}
                    </h4>
                    <p className="text-2xl font-bold">{count}</p>
                  </div>
                ))}
            </div>
            
            {/* Asset check results */}
            {checkResults && (
              <div className="mt-6 space-y-4">
                <h3 className="text-xl font-semibold text-yellow-400 mb-3">Asset Check Results</h3>
                
                {/* Missing assets */}
                {checkResults.missing.length > 0 && (
                  <div className="mb-4">
                    <h4 className="font-medium text-red-500 mb-2">
                      Potentially Missing Assets ({checkResults.missing.length})
                    </h4>
                    <div className="bg-gray-900 p-3 rounded-lg max-h-40 overflow-y-auto">
                      <table className="w-full">
                        <thead>
                          <tr className="text-left text-gray-500">
                            <th className="pb-2">Path</th>
                            <th className="pb-2">Type</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-800">
                          {checkResults.missing.map((item, i) => (
                            <tr key={i} className="hover:bg-gray-800">
                              <td className="py-1 pr-4 text-red-400">{item.path}</td>
                              <td className="py-1 text-gray-400">{item.type}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
                
                {/* Potential issues */}
                {checkResults.potential.length > 0 && (
                  <div className="mb-4">
                    <h4 className="font-medium text-yellow-500 mb-2">
                      Potential Issues ({checkResults.potential.length})
                    </h4>
                    <div className="bg-gray-900 p-3 rounded-lg max-h-40 overflow-y-auto">
                      <table className="w-full">
                        <thead>
                          <tr className="text-left text-gray-500">
                            <th className="pb-2">Path</th>
                            <th className="pb-2">Issue</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-800">
                          {checkResults.potential.map((item, i) => (
                            <tr key={i} className="hover:bg-gray-800">
                              <td className="py-1 pr-4 text-yellow-400">{item.path}</td>
                              <td className="py-1 text-gray-400">{item.issue}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
                
                {/* Duplicated assets */}
                {checkResults.duplicated.length > 0 && (
                  <div className="mb-4">
                    <h4 className="font-medium text-blue-400 mb-2">
                      Possible Duplicated Assets ({checkResults.duplicated.length})
                    </h4>
                    <div className="bg-gray-900 p-3 rounded-lg max-h-40 overflow-y-auto">
                      <div className="space-y-2">
                        {checkResults.duplicated.map((item, i) => (
                          <div key={i} className="p-2 hover:bg-gray-800 rounded">
                            <div className="font-medium text-blue-400">{item.fileName}</div>
                            <ul className="pl-4 text-sm text-gray-400 mt-1">
                              {item.paths.map((path, j) => (
                                <li key={j}>{path.path} <span className="text-gray-600">({path.type})</span></li>
                              ))}
                            </ul>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
                
                {checkResults.missing.length === 0 && 
                 checkResults.potential.length === 0 &&
                 checkResults.duplicated.length === 0 && (
                  <div className="bg-green-900 text-green-200 p-3 rounded-lg">
                    All assets appear to be valid!
                  </div>
                )}
              </div>
            )}
          </div>
        ) : (
          <div>
            <div className="flex justify-between items-center mb-3">
              <h3 className="text-xl font-semibold text-yellow-400">
                {selectedTab.charAt(0).toUpperCase() + selectedTab.slice(1)}
                <span className="ml-2 text-sm font-normal text-gray-400">
                  {filterAssets(assetData[selectedTab]).length} items
                </span>
              </h3>
              
              {/* Asset type specific controls */}
              {(selectedTab === 'backgrounds' || selectedTab === 'characterImages') && (
                <div className="text-sm text-gray-400">
                  <button
                    className="text-blue-400 hover:text-blue-300 hover:underline"
                    onClick={() => {
                      // Copy all paths to clipboard
                      const paths = assetData[selectedTab].join('\n');
                      navigator.clipboard.writeText(paths);
                      alert(`Copied ${assetData[selectedTab].length} ${selectedTab} paths to clipboard`);
                    }}
                  >
                    Copy All Paths
                  </button>
                </div>
              )}
            </div>
            
            {filterAssets(assetData[selectedTab]).length > 0 ? (
              // Image previews for visual assets
              (selectedTab === 'backgrounds' || selectedTab === 'characterImages' || selectedTab === 'icons') ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 max-h-96 overflow-y-auto p-1">
                  {filterAssets(assetData[selectedTab]).map((asset, index) => (
                    <AssetPreviewImageItem
                      key={`${selectedTab}-${asset}-${index}`} // More robust key
                      assetPath={asset}
                      getAssetUrl={getAssetUrl}
                    />
                  ))}
                </div>
              ) : (
                // List view for non-visual assets
                <div className="max-h-96 overflow-y-auto">
                  <table className="w-full">
                    <thead className="bg-gray-900">
                      <tr className="text-left text-gray-500">
                        <th className="py-2 px-4 rounded-tl">Path</th>
                        <th className="py-2 px-4 rounded-tr">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-800">
                      {filterAssets(assetData[selectedTab]).map((asset, index) => (
                        <tr 
                          key={index}
                          className="hover:bg-gray-800"
                        >
                          <td className="py-2 px-4">
                            <span className="truncate block max-w-md" title={asset}>{asset}</span>
                          </td>
                          <td className="py-2 px-4">
                            <button
                              onClick={() => {
                                navigator.clipboard.writeText(asset);
                                // Show a quick tooltip (would be better with proper UI)
                                alert(`Copied: ${asset}`);
                              }}
                              className="text-blue-400 hover:text-blue-300 text-sm"
                            >
                              Copy Path
                            </button>
                            
                            {(selectedTab === 'soundEffects' || selectedTab === 'music') && (
                              <button
                                onClick={() => {
                                  // Create an audio element to play the sound
                                  try {
                                    const audio = new Audio(getAssetUrl(asset));
                                    audio.play();
                                  } catch (e) {
                                    alert(`Unable to play: ${asset}\nError: ${e.message}`);
                                  }
                                }}
                                className="text-green-400 hover:text-green-300 text-sm ml-3"
                              >
                                Play
                              </button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )
            ) : (
              <p className="text-gray-400 italic p-4 text-center">No matching assets found.</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

/**
 * Extract all assets from the game data
 */
function extractAssets(gameData) {
  // Initialize containers for different asset types
  const assets = {
    backgrounds: new Set(),
    characterImages: new Set(),
    soundEffects: new Set(),
    music: new Set(),
    icons: new Set(),
    iframes: new Set(),
    miscAssets: new Set()
  };
  
  // Process metadata assets
  if (gameData.metadata) {
    const metadata = gameData.metadata;
    
    if (metadata.backgroundImage) {
      assets.backgrounds.add(metadata.backgroundImage);
    }
  }
  
  // Process achievements
  if (gameData.achievements) {
    gameData.achievements.forEach(achievement => {
      if (achievement.icon) {
        assets.icons.add(achievement.icon);
      }
    });
  }
  
  // Process all events
  if (gameData.events && Array.isArray(gameData.events)) {
    gameData.events.forEach(event => {
      // Process pre-dialog assets
      if (event.preDialog && Array.isArray(event.preDialog)) {
        processDialogAssets(event.preDialog, assets);
      }
      
      // Process post-dialog assets
      if (event.postDialog && Array.isArray(event.postDialog)) {
        processDialogAssets(event.postDialog, assets);
      }
    });
  }
  
  // Convert Sets to Arrays for easier handling in the result
  const result = {};
  for (const [key, value] of Object.entries(assets)) {
    result[key] = Array.from(value);
  }
  
  // Add summary counts
  result.summary = {
    total: Object.values(result).reduce((sum, arr) => sum + arr.length, 0),
    byType: {}
  };
  
  for (const [key, value] of Object.entries(result)) {
    if (key !== 'summary') {
      result.summary.byType[key] = value.length;
    }
  }
  
  return result;
}

/**
 * Helper function to process assets from dialog sequences
 */
function processDialogAssets(dialogSequence, assets) {
  dialogSequence.forEach(dialog => {
    // Extract background images
    if (dialog.background) {
      assets.backgrounds.add(dialog.background);
    }
    
    // Extract character images
    if (dialog.characters) {
      for (const position in dialog.characters) {
        const character = dialog.characters[position];
        if (character.image) {
          assets.characterImages.add(character.image);
        }
      }
    }
    
    // Extract sound effects
    if (dialog.soundEffect) {
      assets.soundEffects.add(dialog.soundEffect);
    }
    
    // Extract multiple sound effects if present
    if (dialog.soundEffects && Array.isArray(dialog.soundEffects)) {
      dialog.soundEffects.forEach(effect => {
        if (effect.file) {
          assets.soundEffects.add(effect.file);
        }
      });
    }
    
    // Extract ambient music
    if (dialog.ambientMusic && dialog.ambientMusic.file) {
      assets.music.add(dialog.ambientMusic.file);
    }
    
    // Extract iframe sources
    if (dialog.iframe && dialog.iframe.url) {
      assets.iframes.add(dialog.iframe.url);
    }
  });
}

export default AssetManager;