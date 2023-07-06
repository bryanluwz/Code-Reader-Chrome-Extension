chrome.runtime.onInstalled.addListener(() => {
	// Set the initial state of the extension
	chrome.storage.local.set({ enabled: false });
});

var enabledDictionary = {

};

chrome.action.onClicked.addListener((tab) => {
	// Retrieve the current state from storage
	const isEnabled = enabledDictionary[tab.id] || false;

	// Toggle the state
	const updatedState = !isEnabled;

	isInjected = true;

	// Save the updated state to storage
	chrome.storage.local.set({ enabled: updatedState });

	// Set the appropriate icon based on the state
	const iconPath = updatedState ? 'icon_enabled.png' : 'icon_disabled.png';
	chrome.action.setIcon({ path: iconPath });

	// Execute or disable the content script based on the state	
	// Bruh I swear to GD, there is not content script shown, yet it still works
	(async () => { console.log(await chrome.scripting.getRegisteredContentScripts()); })()
		.then(() => {
			chrome.tabs.sendMessage(tab.id, { type: "updateState", enabled: updatedState })
				.then(() => {
					enabledDictionary[tab.id] = updatedState;
				});
		});
});

chrome.tabs.onActivated.addListener((activeInfo) => {
	const iconPath = enabledDictionary[activeInfo.tabId] ? 'icon_enabled.png' : 'icon_disabled.png';
	chrome.action.setIcon({ path: iconPath });
});