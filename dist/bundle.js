/******/ (() => { // webpackBootstrap
var __webpack_exports__ = {};
/*!***************************!*\
  !*** ./service-worker.js ***!
  \***************************/
chrome.runtime.onInstalled.addListener(() => {
	// Set the initial state of the extension
	chrome.storage.local.set({ enabled: false });
});

chrome.action.onClicked.addListener((tab) => {
	// Retrieve the current state from storage
	chrome.storage.local.get('enabled', (result) => {
		const isEnabled = result.enabled || false;

		// Toggle the state
		const updatedState = !isEnabled;

		// Save the updated state to storage
		chrome.storage.local.set({ enabled: updatedState });

		// Set the appropriate icon based on the state
		const iconPath = updatedState ? 'icon_enabled.png' : 'icon_disabled.png';
		chrome.action.setIcon({ path: iconPath, tabId: tab.id });

		// Execute or disable the content script based on the state
		if (updatedState) {
			chrome.scripting.executeScript({ target: { tabId: tab.id }, files: ['content-script.js'] });
		} else {
			// chrome.scripting.removeScript({ target: { tabId: tab.id }, files: ['content-script.js'] });
		}
	});
});
/******/ })()
;
//# sourceMappingURL=bundle.js.map