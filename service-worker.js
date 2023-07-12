console.log("Service worker loaded");

var enabledDictionary = {};

const icon_enabled = './icons/icon_enabled.png';
const icon_disabled = './icons/icon_disabled.png';

// Listen for a click on the extension icon
chrome.action.onClicked.addListener((tab) => {
	// Retrieve the current state from storage
	const isEnabled = enabledDictionary[tab.id] || false;

	// Toggle the state
	const updatedState = !isEnabled;

	// Set the appropriate icon based on the state
	const iconPath = updatedState ? icon_enabled : icon_disabled;
	chrome.action.setIcon({ path: iconPath });
	chrome.action.setTitle({ title: updatedState ? "Enabled" : "Disabled" });

	// Execute or disable the content script based on the state
	updateContentScript(tab.id, updatedState);
});

// Listen for tab changes
chrome.tabs.onActivated.addListener((activeInfo) => {
	const updatedState = enabledDictionary[activeInfo.tabId];
	const iconPath = updatedState ? icon_enabled : icon_disabled;

	chrome.action.setIcon({ path: iconPath });
	chrome.action.setTitle({ title: updatedState ? "Enabled" : "Disabled" });
});

// Listen for tab updates
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
	if (changeInfo.status === "complete") {
		const updatedState = enabledDictionary[tabId];
		const iconPath = updatedState ? icon_enabled : icon_disabled;

		chrome.action.setIcon({ path: iconPath });
		chrome.action.setTitle({ title: updatedState ? "Enabled" : "Disabled" });

		updateContentScript(tabId, updatedState);
	}
});

// Listen for messages from content script
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
	if (message.action === "openNewTab") {
		chrome.tabs.create({ url: message.link });
		sendResponse({ success: true });
	}
});

function updateContentScript(tabId, updatedState) {
	// Execute or disable the content script based on the state	
	(async () => {
		// Dont remove this useless line of code otherwise it won't run properly idk why
		await chrome.scripting.getRegisteredContentScripts();
	})()
		.then(() => {
			chrome.tabs.sendMessage(tabId, { action: "updateState", enabled: updatedState })
				.then((response) => {
					enabledDictionary[tabId] = updatedState;
				})
				.catch((err) => {
					console.log(err);
				});
		}).catch((err) => {
			console.log(err);
		});
}