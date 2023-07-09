import './styles.css';

// Some variables
var target = null;

// Hover popup
const hoverPopup = document.createElement('div');
hoverPopup.id = 'hoverPopup';
hoverPopup.classList.add('hover-popup');
document.body.appendChild(hoverPopup);

// Alert popup
const alertPopup = document.createElement('div');
alertPopup.id = 'alert-popup';
alertPopup.classList.add('alert-popup');

// Triggers when user presses some key 
function onKeyPressHandler(event) {
	if (event.ctrlKey && event.code === 'KeyC') {
		if (target.tagName.toLowerCase() === "img") {
			(async () => {
				target.crossOrigin = "Anonymous";
				const decoded = await detectQRCodesThroughImgElem(target);
				handleDecodedWhenCtrlC(decoded);
			})();
		}
		else if (target.tagName.toLowerCase() === "canvas") {
			(async () => {
				const decoded = await detectQRCodesThroughCanvas(target);
				handleDecodedWhenCtrlC(decoded);
			})();
		}
	}
	else if (event.code === 'Enter') {
		if (target.tagName.toLowerCase() === "img") {
			(async () => {
				target.crossOrigin = "Anonymous";
				const decoded = await detectQRCodesThroughImgElem(target);
				handleDecodedWhenEnter(decoded);
			})();
		}
		else if (target.tagName.toLowerCase() === "canvas") {
			(async () => {
				const decoded = await detectQRCodesThroughCanvas(target);
				handleDecodedWhenEnter(decoded);
			})();
		}
	}
}

// Triggers when user enters an element
function onMouseEnter(event) {
	target = event.target;

	if (target.tagName.toLowerCase() === "img") {
		(async () => {
			target.crossOrigin = "Anonymous";
			const decoded = await detectQRCodesThroughImgElem(target);
			if (decoded) {
				hoverPopup.innerHTML = `
				<div class="hover-popup-content-container">
				<span><b>Content:</b></span>
				<span>${decoded}</span>
				<span><i>Enter</i> or <i>Ctrl C</i> to open link / copy to clipboard</span>
				</div>`;

				const topPosition = Math.max(target.offsetTop, window.scrollY);
				const leftPosition = Math.max(0, target.offsetLeft);

				hoverPopup.style.position = 'absolute';
				hoverPopup.style.top = topPosition + 'px';
				hoverPopup.style.left = leftPosition + 'px';

				hoverPopup.style.opacity = '1';
			}
		})();

	}
	else if (target.tagName.toLowerCase() === "canvas") {
		(async () => {
			const decoded = await detectQRCodesThroughCanvas(target);
			if (decoded) {
				hoverPopup.innerHTML = `
				<div class="hover-popup-content-container">
				<span><b>Content:</b></span>
				<span>${decoded}</span>
				<span><i>Enter</i> or <i>Ctrl C</i> to open link / copy to clipboard</span>
				</div>`;

				const topPosition = Math.max(target.offsetTop - hoverPopup.offsetHeight, window.scrollY);
				const leftPosition = Math.max(0, target.offsetLeft - hoverPopup.offsetWidth);

				hoverPopup.style.position = 'absolute';
				hoverPopup.style.top = topPosition + 'px';
				hoverPopup.style.left = leftPosition + 'px';

				hoverPopup.style.opacity = '1';
			}
		})();
	}
}

// Triggers when user leaves an element
function onMouseLeave(event) {
	hoverPopup.style.opacity = '0';
	hoverPopup.style.top = '-1000px';
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
		}
		else {
			document.removeEventListener("keydown", onKeyPressHandler);
			document.removeEventListener("mouseover", onMouseEnter);
			document.removeEventListener("mouseout", onMouseLeave);
		}
	}
}
);

// Handle decoded content
function handleDecodedWhenCtrlC(decoded) {
	var message = "";

	message = `
	<div class="hover-popup-content-container" style="text-align: center">
	<b>Copied to Clipboard:</b>
	<span>${decoded}</span>
	</div>`;

	if (decoded) {
		navigator.clipboard.writeText(decoded);
	}

	document.body.appendChild(alertPopup);

	// Animate the popup element
	alertPopup.innerHTML = message;
	alertPopup.style.top = 10 + 'px';
	alertPopup.style.opacity = '1';

	// Set a timeout to remove the popup after a certain duration (e.g., 3 seconds)
	setTimeout(() => {
		// Animate the popup element out
		alertPopup.style.top = 10 + 'px';

		alertPopup.style.opacity = '0';

		// Remove the popup element after the animation completes
		setTimeout(() => {
			alertPopup.remove();
		}, 200);
	}, 1500);
}

function handleDecodedWhenEnter(decoded) {
	const urlPattern = /^(https?:\/\/)?([\w-]+\.)+[\w-]+(\/[\w-./?%&=]*)?$/;
	const isURL = urlPattern.test(decoded);

	var message = "";

	if (isURL) {
		message = `<b>Opening</b> ${decoded} <b>in a new tab...</b>`;
		setTimeout(() => {
			(async () => {
				await chrome.runtime.sendMessage({ action: "openNewTab", link: decoded });
			})();
		}, 500);
	} else if (decoded) {
		message = `
		<div class="alert-popup-content-container" style="text-align: center">
		<span><b>Copied to Clipboard:</b></span>
		<span>${decoded}</span>
		</div>`;
		navigator.clipboard.writeText(decoded);
	}
	else {
		return;
	}

	document.body.appendChild(alertPopup);

	// Animate the popup element
	alertPopup.innerHTML = message;
	alertPopup.style.top = 10 + 'px';
	alertPopup.style.opacity = '1';

	// Set a timeout to remove the popup after a certain duration (e.g., 3 seconds)
	setTimeout(() => {
		// Animate the popup element out
		alertPopup.style.top = 10 + 'px';

		alertPopup.style.opacity = '0';

		// Remove the popup element after the animation completes
		setTimeout(() => {
			alertPopup.remove();
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
	var decoded = null;

	// Decode image from imgSrc
	try {
		const result = await codeReader.decodeFromImageElement(img);
		decoded = result.text;
	} catch (error) {
	}

	return decoded;
};


async function detectQRCodesThroughCanvas(canvas) {
	// Load ZXing browser
	// Create a new reader
	if (!codeReader) {
		codeReader = new BrowserQRCodeReader();
	}
	var decoded = null;

	// Decode image from imgSrc
	try {
		const result = await codeReader.decodeFromCanvas(canvas);
		decoded = result.text;
	} catch (error) {
	}

	return decoded;
};

