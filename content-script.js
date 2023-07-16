import './styles.css';
import { BrowserMultiFormatReader } from '@zxing/browser';

// Some variables
let codeReader = null;
var target = null;
var decoded = null;

// Hover popup
const hoverPopup = document.createElement('div');
hoverPopup.id = 'hoverPopup';
hoverPopup.classList.add('hover-popup');

// Alert popup
const alertPopup = document.createElement('div');
alertPopup.id = 'alert-popup';
alertPopup.classList.add('alert-popup');

// Triggers when user presses some key 
function onKeyPressHandler(event) {
	// Ignore if decoded is null
	if (!decoded) return;

	// When user presses Ctrl C, copy decoded
	if (event.ctrlKey && event.code === 'KeyC') {
		handleDecoded(decoded, "CtrlC");
	}
	// When user presses Enter, open decoded / copy decoded if no link
	else if (event.code === 'Enter') {
		handleDecoded(decoded, "Enter");
	}
}

// Triggers when user enters an element
function onMouseEnter(event) {
	target = event.target;

	if (target.tagName.toLowerCase() === "img" || target.tagName.toLowerCase() === "canvas" || target.tagName.toLowerCase() === "video") {
		(async () => {
			decoded = await detectQRCodes(target, target.tagName.toLowerCase());

			if (!decoded) return;

			hoverPopup.innerHTML = `
				<div class="hover-popup-content-container">
					<span class="hover-popup-content-title">Content:</span>
					<span class="hover-popup-content-content">${decoded}</span>
					<span class="hover-popup-content-subtitle">"Ctrl C" to copy</span>
					<span class="hover-popup-content-subtitle">"Enter" to open link</span>
				</div>`;

			const boundingRect = target.getBoundingClientRect();

			// Get position and adjust the position if overlaying
			let topPosition = Math.max(window.scrollY + boundingRect.top, window.scrollY);
			let leftPosition = Math.max(window.scrollX + boundingRect.left - hoverPopup.offsetWidth, window.scrollX);

			if ((leftPosition + hoverPopup.offsetWidth) > (window.scrollX + boundingRect.left)) {
				leftPosition = boundingRect.right;
			}

			hoverPopup.style.top = topPosition + 'px';
			hoverPopup.style.left = leftPosition + 'px';

			hoverPopup.style.opacity = '1';
		})();
	}
}

// Triggers when user leaves an element
function onMouseLeave(event) {
	// Remove the popup element if the user is not hovering over the target element 
	if (event.target === target) {
		hoverPopup.style.opacity = '0';
		hoverPopup.style.top = '-1000px';
	}

	if (decoded) {
		target = null;
		decoded = null;
	}
}

// Helper function to handle decoded content when user press keys 
function handleDecoded(decoded, keyPressType) {
	// Declare some flags and variables
	const isCtrlC = keyPressType === "CtrlC";
	const isURL = /^(https?:\/\/)?([\w-]+\.)+[\w-]+(\/[\w-./?%&=]*)?$/.test(decoded);
	let message = "";

	// If is CtrlC, copy to clipboard regardless of content
	// Or if is Enter and not URL, copy to clipboard
	if (decoded && (isCtrlC || !isCtrlC && !isURL)) {
		message = `
			<div class="alert-popup-content-container">
				<span class="alert-popup-content-title">Copied to Clipboard:</span>
				<span class="alert-popup-content-content">${decoded}</span>
			</div>
			`;

		if (decoded) {
			navigator.clipboard.writeText(decoded);
		}
	}
	// If is Enter, and is URL, open in new tab
	else if (decoded && !isCtrlC && isURL) {
		message = `
			<div class="alert-popup-content-container">
				<span class="alert-popup-content-title">Opening in new tab:</span>
				<span class="alert-popup-content-content">${decoded}</span>
			</div>`;
		setTimeout(() => {
			(async () => {
				await chrome.runtime.sendMessage({ action: "openNewTab", link: decoded });
			})();
		}, 500);
	}
	// Else that means decoded is null, so do nothing (assuming keypress is either CtrlC or Enter no other types)
	else {
		return;
	}

	// Put the popup element into the DOM
	document.body.appendChild(alertPopup);

	alertPopup.innerHTML = message;
	alertPopup.style.top = 10 + 'px';
	alertPopup.style.opacity = '1';

	setTimeout(() => {
		alertPopup.style.top = 10 + 'px';  // Animate the popup element out

		alertPopup.style.opacity = '0';

		// Remove the popup element after the animation completes
		setTimeout(() => {
			alertPopup.remove();
		}, 200);
	}, 1500);
}

// Decode QR codes 
async function detectQRCodes(elem, type) {
	// Create a new reader
	if (!codeReader) {
		codeReader = new BrowserMultiFormatReader();
	}
	var decoded = null;

	// Decode image from imgSrc
	try {
		if (type === "img") {
			// Clone the element and set crossOrigin to Anonymous
			let clonedElem = elem.cloneNode(false);
			clonedElem.crossOrigin = "Anonymous";

			const result = await codeReader.decodeFromImageElement(clonedElem);
			decoded = result.text;
		}
		else if (type === "canvas") {
			// Read from canvas
			const result = await codeReader.decodeFromCanvas(elem);
			decoded = result.text;
		}
		else if (type === "video") {
			// Convert to canvas then read from canvas 
			const canvas = document.createElement('canvas');
			const context = canvas.getContext('2d');
			canvas.width = elem.videoWidth;
			canvas.height = elem.videoHeight;
			context.drawImage(elem, 0, 0, canvas.width, canvas.height);

			const result = await codeReader.decodeFromCanvas(canvas);
			decoded = result.text;
		}
	} catch (error) {
		// No QR code detected
	}

	return decoded;
}

// Listen for messages from the background script
// If enabled, add listeners for keypress, mouseenter, and mouseleave events
// else, remove the listeners
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
	if (message.action === "updateState") {
		if (message.enabled) {
			document.addEventListener("keydown", onKeyPressHandler);
			document.addEventListener("mouseover", onMouseEnter);
			document.addEventListener("mouseout", onMouseLeave);
			document.body.appendChild(hoverPopup);
			sendResponse({ message: "enabled" });
		}
		else {
			document.removeEventListener("keydown", onKeyPressHandler);
			document.removeEventListener("mouseover", onMouseEnter);
			document.removeEventListener("mouseout", onMouseLeave);
			hoverPopup.remove();
			sendResponse({ message: "disabled" });
		}
	}
}
);