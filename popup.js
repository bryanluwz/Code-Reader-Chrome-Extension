// Setup reader and other variables
let reader;

const imageSrcs = [];

const links = [];

function detectQRCodes() {
	// Load ZXing library asynchronously using import()
	import('@zxing/library').then((ZXingLibrary) => {
		const { MultiFormatReader, BarcodeFormat, DecodeHintType, RGBLuminanceSource, BinaryBitmap, HybridBinarizer } = ZXingLibrary;

		reader = new MultiFormatReader();

		const hints = new Map();
		hints.set(DecodeHintType.POSSIBLE_FORMATS, [BarcodeFormat.QR_CODE]);
		reader.setHints(hints);

		// Iterate through imgSrcs and capture each image using html2canvas
		imageSrcs.forEach((imgSrc) => {
			// Create an Image object with the imgSrc
			const capturedImage = new Image();
			capturedImage.src = imgSrc;

			// Pass captured image to ZXing for decoding
			capturedImage.onload = () => {
				// Get data
				const width = capturedImage.width;
				const height = capturedImage.height;

				const canvas = document.createElement('canvas');
				const context = canvas.getContext('2d');

				canvas.width = width;
				canvas.height = height;

				// Draw the captured image onto the canvas and get image data from the canvas
				context.drawImage(capturedImage, 0, 0, width, height);

				const imageData = context.getImageData(0, 0, width, height).data;

				// Pass the captured image to ZXing for QR code decoding
				const luminanceSource = new RGBLuminanceSource(imageData, width, height);
				const binaryBitmap = new BinaryBitmap(new HybridBinarizer(luminanceSource));

				try {
					const result = reader.decode(binaryBitmap);
					links.push(result.text);
				} catch (error) {
					;
				}
			};
		});


		// Get element of id 'content-list' and append each link to it
		const contentList = document.getElementById('content-list');

		// Each link is just a link item, and a link (<a/> tag)
		links.forEach((link) => {
			const listItem = document.createElement('li');
			const linkElement = document.createElement('a');

			linkElement.href = link;
			linkElement.textContent = link;

			listItem.appendChild(linkElement);
			contentList.appendChild(listItem);
		});
	})
		.catch((error) => {
			console.log(error);
		});
};

function extractImageTags() {
	chrome.scripting.executeScript({
		target: { tabId: sender.tab.id },
		files: ['contentScript.js']
	});
}

function loadImages(callbackFunction) {
	// Send message to get images to service-worker.js
	chrome.runtime.sendMessage({ action: 'getImages' }, (response) => {
		const responseImageSrcs = response.imageSrcs;

		responseImageSrcs.forEach(imgSrc => {
			imageSrcs.push(imgSrc);
		});

		callbackFunction();
	});
}

// Run these after every thing loads
window.onload = () => {
	// Add event listener to refresh button
	const button = document.getElementById('detect-button');
	button.addEventListener('click', () => {
		loadImages(detectQRCodes);
		console.log("Links: ", links);
	});

};
