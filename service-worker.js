var enabledDictionary = {};

const icon_enabled = 'icon_enabled.png';
const icon_disabled = 'icon_disabled.png';

// Listen for a click on the extension icon
chrome.action.onClicked.addListener((tab) => {
	// Retrieve the current state from storage
	const isEnabled = enabledDictionary[tab.id] || false;

	// Toggle the state
	const updatedState = !isEnabled;

	isInjected = true;

	// Save the updated state to storage
	chrome.storage.local.set({ enabled: updatedState });

	// Set the appropriate icon based on the state
	const iconPath = updatedState ? icon_enabled : icon_disabled;
	chrome.action.setIcon({ path: iconPath });

	// Execute or disable the content script based on the state	
	// Bruh I swear to GD, there is not content script shown, yet it still works
	(async () => { console.log(await chrome.scripting.getRegisteredContentScripts()); })()
		.then(() => {
			chrome.tabs.sendMessage(tab.id, { action: "updateState", enabled: updatedState })
				.then(() => {
					enabledDictionary[tab.id] = updatedState;
				});
		}).catch((err) => {
			console.log(err);
		});
});

// Listen for tab changes
chrome.tabs.onActivated.addListener((activeInfo) => {
	const iconPath = enabledDictionary[activeInfo.tabId] ? icon_enabled : icon_disabled;
	chrome.action.setIcon({ path: iconPath });
});

// Listen for tab removal
chrome.tabs.onRemoved.addListener((tabId, removeInfo) => {
	delete enabledDictionary[tabId];
});

// Listen for tab updates (i.e. tab refresh)
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
	enabledDictionary[tabId] = false;
	const iconPath = icon_disabled;
	chrome.action.setIcon({ path: iconPath });
});
