var target = null;

function onDecodeTrigger(e) {
	// Only process if the target is an image or canvas, and user presses enter
	if (e.code === 'Enter') {
		if (target.tagName.toLowerCase() === "img") {
			e.preventDefault();
			(async () => {
				target.crossOrigin = "Anonymous";
				const link = await detectQRCodesThroughImgElem(target);
				handleLink(link);
			})();
		}
		else if (target.tagName.toLowerCase() === "canvas") {
			e.preventDefault();
			(async () => {
				const link = await detectQRCodesThroughCanvas(target);
				handleLink(link);
			})();
		}
	}
}

function onMouseOver(e) {
	target = e.target;
}

// Check for mouse location
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
	if (message.action === "updateState") {
		if (message.enabled) {
			document.addEventListener("keydown", onDecodeTrigger);
			document.addEventListener("mouseover", onMouseOver);
		}
		else {
			document.removeEventListener("keydown", onDecodeTrigger);
			document.removeEventListener("mouseover", onMouseOver);
		}
	}
}
);

// Handle link
function handleLink(link) {
	// Check if the link is a valid URL
	const urlPattern = /^(https?:\/\/)?([\w-]+\.)+[\w-]+(\/[\w-./?%&=]*)?$/;
	const isURL = urlPattern.test(link);

	var message = "";

	// If is URL, open in new tab;
	if (isURL) {
		message = `Opening ${link} in a new tab...`;
		setTimeout(() => {
			(async () => {
				await chrome.runtime.sendMessage({ action: "openNewTab", link: link });
			})();
		}, 500);
	}
	// Else if is not URL, copy to clipboard
	else {
		message =
			link ?
				`<div style="display:flex;flex-direction:column;"><span>Copied to clipboard:</span><span>${link}</span></div>`
				:
				"Is this a QR code?";
		if (link) {
			navigator.clipboard.writeText(link);
		}
	}

	// Create the popup element
	const popupElement = document.createElement('div');

	popupElement.innerHTML = message;

	popupElement.style.position = 'fixed';
	popupElement.style.top = '-50px';
	popupElement.style.left = '50%';
	popupElement.style.transform = 'translateX(-50%)';
	popupElement.style.padding = '10px';
	popupElement.style.background = '#f0f0f0';
	popupElement.style.border = '1px solid #ccc';
	popupElement.style.borderRadius = '4px';
	popupElement.style.opacity = '0';
	popupElement.style.transition = 'top 0.5s, opacity 0.5s';
	popupElement.style.zIndex = '9999';
	popupElement.style.textAlign = 'center';

	// Append the popup element to the document body
	document.body.appendChild(popupElement);

	// Animate the popup element
	popupElement.style.top = '10px';
	popupElement.style.opacity = '1';

	// Set a timeout to remove the popup after a certain duration (e.g., 3 seconds)
	setTimeout(() => {
		// Animate the popup element out
		popupElement.style.top = '-50px';
		popupElement.style.opacity = '0';

		// Remove the popup element after the animation completes
		setTimeout(() => {
			popupElement.remove();
		}, 200);
	}, 1500);
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

