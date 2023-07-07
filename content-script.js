function onMouseClick(e) {
	const target = e.target;

	// Only process if the target is an image
	if (e.shiftKey && target.tagName.toLowerCase() === "img") {
		e.preventDefault();
		(async () => {
			target.crossOrigin = "Anonymous";
			const link = await detectQRCodesThroughImgElem(target);
			handleLink(link);
		})();
	}
	else if (e.shiftKey && target.tagName.toLowerCase() === "canvas") {
		e.preventDefault();
		(async () => {
			const link = await detectQRCodesThroughCanvas(target);
			handleLink(link);
		})();
	}
}

// Check for mouse location
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
	if (message.action === "updateState") {
		if (message.enabled) {
			document.addEventListener("click", onMouseClick);
		}
		else {
			document.removeEventListener("click", onMouseClick);
		}
	}
}
);

// Handle link
function handleLink(link) {
	if (link) {
		alert(link);
	}
}

// QR Code Reader
import { BrowserQRCodeReader } from '@zxing/browser';

let codeReader = null;

// Decode QR code function
async function detectQRCodesThroughImgElem(img) {
	// Load ZXing browser
	// Create a new reader
	if (!codeReader) {
		codeReader = new BrowserQRCodeReader();
	}
	var link = null;

	// Decode image from imgSrc
	try {
		const result = await codeReader.decodeFromImageElement(img);
		link = result.text;
	} catch (error) {
	}

	return link;
};


async function detectQRCodesThroughCanvas(canvas) {
	// Load ZXing browser
	// Create a new reader
	if (!codeReader) {
		codeReader = new BrowserQRCodeReader();
	}
	var link = null;

	// Decode image from imgSrc
	try {
		const result = await codeReader.decodeFromCanvas(canvas);
		link = result.text;
	} catch (error) {
	}

	return link;
};

