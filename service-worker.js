// Listen for messages from the popup script
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
	if (message.action === 'getImages') {
		// Send a message to the content-script.js to request the images
		(async () => {
			const [tab] = await chrome.tabs.query({ active: true, lastFocusedWindow: true });
			if (!tab) {
				console.log("No tab found");
				return;
			}

			// Async await for response from content-script.js
			const response = await chrome.tabs.sendMessage(tab.id, { action: 'extractImages' });

			console.log(response);

			// Send the extracted images back to the popup script
			const returnResponse = {
				imageSrcs: response.imageSrcs
			};

			sendResponse(returnResponse);
		})();

		return true; // Indicates that sendResponse will be called asynchronously
	}
});