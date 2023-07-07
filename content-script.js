// Some variables
var target = null;

// Hover popup
const hoverPopup = document.createElement('div');
hoverPopup.id = 'hoverPopup';
hoverPopup.style.position = 'absolute';
hoverPopup.style.backgroundColor = '#fff';
hoverPopup.style.border = '1px solid #ccc';
hoverPopup.style.opacity = '0';
hoverPopup.style.transition = 'opacity 0.3s';
hoverPopup.style.padding = '10px';
document.body.appendChild(hoverPopup);

// Enter key popup
const enterKeyPopup = document.createElement('div');
enterKeyPopup.id = 'enterKeyPopup';
enterKeyPopup.style.position = 'fixed';
enterKeyPopup.style.top = '-50px';
enterKeyPopup.style.left = '50%';
enterKeyPopup.style.transform = 'translateX(-50%)';
enterKeyPopup.style.padding = '10px';
enterKeyPopup.style.background = '#f0f0f0';
enterKeyPopup.style.border = '1px solid #ccc';
enterKeyPopup.style.borderRadius = '4px';
enterKeyPopup.style.opacity = '0';
enterKeyPopup.style.transition = 'top 0.5s, opacity 0.5s';
enterKeyPopup.style.zIndex = '9999';
enterKeyPopup.style.textAlign = 'center';

// Triggers when user presses enter
function onDecodeTrigger(e) {
	// Only process if the target is an image or canvas, and user presses enter
	if (e.code === 'Enter') {
		if (target.tagName.toLowerCase() === "img") {
			(async () => {
				target.crossOrigin = "Anonymous";
				const link = await detectQRCodesThroughImgElem(target);
				handleLinkWhenEnterKey(link);
			})();
		}
		else if (target.tagName.toLowerCase() === "canvas") {
			(async () => {
				const link = await detectQRCodesThroughCanvas(target);
				console.log(link);
				handleLinkWhenEnterKey(link);
			})();
		}
	}
}

// Triggers when user enters an element
function onMouseEnter(e) {
	target = e.target;

	if (target.tagName.toLowerCase() === "img") {
		(async () => {
			target.crossOrigin = "Anonymous";
			const link = await detectQRCodesThroughImgElem(target);
			if (link) {
				const topPosition = target.offsetTop - hoverPopup.offsetHeight - 10;
				const leftPosition = target.offsetLeft + (target.offsetWidth - hoverPopup.offsetWidth) / 2;

				hoverPopup.style.position = 'absolute';
				hoverPopup.style.top = topPosition + 'px';
				hoverPopup.style.left = leftPosition + 'px';

				hoverPopup.innerHTML = `<div style="display:flex;flex-direction:column;"><span>Content:</span><span>${link}</span><span>Press Enter to copy to clipboard or open in a new tab</span></div>`;

				hoverPopup.style.opacity = '1';
			}
		})();

	}
	else if (target.tagName.toLowerCase() === "canvas") {
		(async () => {
			const link = await detectQRCodesThroughCanvas(target);
			if (link) {
				const topPosition = target.offsetTop - hoverPopup.offsetHeight - 10;
				const leftPosition = target.offsetLeft + (target.offsetWidth - hoverPopup.offsetWidth) / 2;

				hoverPopup.style.position = 'absolute';
				hoverPopup.style.top = topPosition + 'px';
				hoverPopup.style.left = leftPosition + 'px';

				hoverPopup.innerHTML = `<div style="display:flex;flex-direction:column;"><span>Content:</span><span>${link}</span><span>Press Enter to copy to clipboard or open in a new tab</span></div>`;

				hoverPopup.style.opacity = '1';
			}
		})();
	}
}

function onMouseLeave(e) {
	target = null;
	hoverPopup.style.opacity = '0';
	// hoverPopup.remove();
}

// Check for mouse location
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
	if (message.action === "updateState") {
		if (message.enabled) {
			document.addEventListener("keydown", onDecodeTrigger);
			document.addEventListener("mouseover", onMouseEnter);
			document.addEventListener("mouseout", onMouseLeave);
		}
		else {
			document.removeEventListener("keydown", onDecodeTrigger);
			document.removeEventListener("mouseover", onMouseEnter);
			document.removeEventListener("mouseout", onMouseLeave);
		}
	}
}
);

// Handle link
function handleLinkWhenEnterKey(link) {
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
	else if (link) {
		message =
			`<div style="display:flex;flex-direction:column;"><span>Copied to clipboard:</span><span>${link}</span></div>`;
		if (link) {
			navigator.clipboard.writeText(link);
		}
	}
	// Else if link is null, return
	else {
		return;
	}

	document.body.appendChild(enterKeyPopup);

	// Animate the popup element
	enterKeyPopup.innerHTML = message;
	enterKeyPopup.style.top = '10px';
	enterKeyPopup.style.opacity = '1';

	// Set a timeout to remove the popup after a certain duration (e.g., 3 seconds)
	setTimeout(() => {
		// Animate the popup element out
		enterKeyPopup.style.top = '-50px';

		enterKeyPopup.style.opacity = '0';

		// Remove the popup element after the animation completes
		setTimeout(() => {
			enterKeyPopup.remove();
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

