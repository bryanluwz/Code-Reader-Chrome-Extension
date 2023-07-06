// Setup reader and other variables
let codeReader;
const imgs = [];
const links = [];

function detectQRCodes() {
	// Load ZXing browser asynchronously using import()
	import('@zxing/browser').then(async ({ BrowserQRCodeReader }) => {
		// Create a new reader
		codeReader = new BrowserQRCodeReader();

		// Loop through imgs elements and decode each one
		await Promise.all(
			imgs.map(async (img) => {
				try {
					console.log("Decoding this image: " + img);
					const result = await codeReader.decodeFromImageUrl(img);
					console.log("Decoded: " + result);
					console.log("\n");
					links.push(result);
				} catch (error) {
					console.log("Cannot decode this image: " + img);
					console.log("\n");
				}
			})
		);

		// Get element of id 'content-list' and append each link to it
		const contentList = document.getElementById('content-list');
		contentList.innerHTML = '';

		// Each link is just a link item, and a link (<a/> tag)
		links.forEach((link) => {
			const listItem = document.createElement('li');
			const linkElement = document.createElement('a');

			linkElement.href = link;
			linkElement.textContent = link;

			listItem.appendChild(linkElement);
			contentList.appendChild(listItem);
		});

		if (links.length === 0) {
			const listItem = document.createElement('li');
			listItem.textContent = "No QR codes detected";

			contentList.appendChild(listItem);
		}
	})
		.catch((error) => {
			console.log(error);
		});
};

function loadImages(callbackFunction = () => { }) {
	// Send message to get images to content-script.js
	(async () => {
		const [tab] = await chrome.tabs.query({ active: true, lastFocusedWindow: true });
		if (!tab) {
			console.log("No tab found");
			return;
		}

		const response = await chrome.tabs.sendMessage(tab.id, { action: 'extractImages' });

		if (!response) {
			console.log("No response");
			return;
		};

		const responseImgs = response.imgs;

		// Clear imageSrcs
		imgs.length = 0;

		responseImgs.forEach(img => {
			imgs.push(img);
		});

		callbackFunction();
	})();
}

// Run these after every thing loads
document.addEventListener("DOMContentLoaded", () => {
	// Load images
	loadImages(detectQRCodes);

	// Add event listener to refresh button
	const button = document.getElementById('detect-button');
	button.addEventListener('click', () => {
		loadImages(detectQRCodes);
	});
});
