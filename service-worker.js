// Listen for messages from the popup script
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
	if (message.action === 'getImages') {
		// Send a message to the content-script.js to request the images
		chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
			const tab = tabs[0];

			chrome.tabs.sendMessage(
				tab.id,
				{ action: 'extractImages' },
				(response) => {
					// Send the extracted images back to the popup script
					const returnResponse = {
						imageSrcs: response.imageSrcs
					};

					sendResponse(returnResponse);
				});
		});
		return true; // Indicates that sendResponse will be called asynchronously
	}
});