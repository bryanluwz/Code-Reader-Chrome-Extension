// Listen for messages from the background script
chrome.runtime.onMessage.addListener(
	(message, sender, sendResponse) => {
		if (message.action === 'extractImages') {
			const imgs = Array.from(document.getElementsByTagName('img')).map(img => img.src);

			// Send the img tags back to the background script
			const returnResponse = {
				imgs: imgs
			};

			sendResponse(returnResponse);

			return true; // Indicates that sendResponse will be called asynchronously
		}
	});
