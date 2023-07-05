// Listen for messages from the background script
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
	if (message.action === 'extractImages') {
		const imageSrcs = Array.from(document.getElementsByTagName('img')).map((img) => img.src);

		// Send the extracted images back to the background script
		const returnResponse = {
			imageSrcs: imageSrcs
		};

		sendResponse(returnResponse);

		return true; // Indicates that sendResponse will be called asynchronously
	}
});
