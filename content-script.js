import './styles.css';
import { BrowserMultiFormatReader } from '@zxing/browser';

// Some variables
let codeReader = null;
var target = null;
var decoded = null;

let isCaptureMode = false;

// Hover popup
const hoverPopup = document.createElement('div');
hoverPopup.id = 'hoverPopup';
hoverPopup.classList.add('hover-popup');

// Alert popup
const alertPopup = document.createElement('div');
alertPopup.id = 'alert-popup';
alertPopup.classList.add('alert-popup');

// Capture mode capture square
const captureSquare = document.createElement('div');
captureSquare.id = 'capture-square';
captureSquare.classList.add('capture-square');

// Triggers when user presses some key 
function onKeyPressHandler(event) {
	// If Ctrl Shift U, toggle capture mode
	if (event.ctrlKey && event.shiftKey && event.code === 'KeyU') {
		event.preventDefault();

		isCaptureMode = !isCaptureMode;

		updateCaptureMode(event);
	}
	// Else if escape, exit capture mode
	else if (event.code === 'Escape') {
		event.preventDefault();

		isCaptureMode = false;

		updateCaptureMode(event);
	}
	// Else if Ctrl Shift Y, trigger decode by clipboard
	else if (event.ctrlKey && event.shiftKey && event.code === 'KeyY') {
		event.preventDefault();

		onDecodeClipboard(event);
	}

	// If capture mode check for larger or smaller square ([ or ])
	if (isCaptureMode) {
		if (event.code === "BracketLeft") {
			event.preventDefault();

			const height = Math.max(20, captureSquare.offsetHeight - 10);
			const width = height;

			captureSquare.style.width = width + 'px';
			captureSquare.style.height = height + 'px';
		}
		else if (event.code === "BracketRight") {
			event.preventDefault();

			const height = Math.min(window.innerHeight, captureSquare.offsetHeight + 10);
			const width = height;

			captureSquare.style.width = width + 'px';
			captureSquare.style.height = height + 'px'; s;
		}
	}

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

// Capture mode
function updateCaptureMode(event = null) {
	if (isCaptureMode) {
		// Change cursor to crosshair, and a square border to where the mouse 
		document.body.style.cursor = "crosshair";
		document.body.appendChild(captureSquare);

		if (!event) {
			captureSquare.style.top = event.pageY + 'px';
			captureSquare.style.left = event.pageX + 'px';
		}

		// Add event listener to capture square that moves to wherever the mouse is
		document.addEventListener("mousemove", onMouseMoveForCaptureMode);
		document.addEventListener("click", onMouseClickForCaptureMode);
	}
	else {
		// Change cursor back to default, and remove the square border
		document.body.style.cursor = "default";
		captureSquare.remove();

		// Remove event listener
		document.removeEventListener("mousemove", onMouseMoveForCaptureMode);
		document.removeEventListener("click", onMouseClickForCaptureMode);
	}
}

// Triggers when user moves mouse in capture mode
function onMouseMoveForCaptureMode(event) {
	if (isCaptureMode) {
		// Calculate the new top and left of the capture square
		let boundingRect = captureSquare.getBoundingClientRect();
		const width = boundingRect.width;
		const height = boundingRect.height;
		const top = (event.pageY + height) > (window.scrollY + window.innerHeight) ? window.scrollY + window.innerHeight - height - 10 : event.pageY;
		const left = (event.pageX + width) > (window.scrollX + window.innerWidth) ? window.scrollX + window.innerWidth - width - 10 : event.pageX;

		// Move the capture square to where the mouse is, unless the resulting box exceeds window size
		captureSquare.style.top = top + 'px';
		captureSquare.style.left = left + 'px';
	}
}

// Triggers when user clicks in capture mode
function onMouseClickForCaptureMode(event) {
	event.preventDefault();

	// If left click, capture the visible tab
	if (event.button === 0) {
		chrome.runtime.sendMessage({ action: "captureVisibleTab", canvasStyle: captureSquare.style })
			.then(response => {
				// Get the dataUrl from the response
				const dataUrl = response.dataUrl;

				const canvas = document.createElement("canvas");
				const context = canvas.getContext("2d");

				// Get the capture square's position and size using the style attribute
				let boundingRect = captureSquare.getBoundingClientRect();
				const left = window.scrollX + boundingRect.left;
				const top = window.scrollY + boundingRect.top;
				const width = boundingRect.width;
				const height = boundingRect.height;

				const image = new Image();
				image.src = dataUrl;

				image.onload = () => {
					// Image not same as window inner height and width, so scale it down, bruh this is so stupid it took me an hour to figure out why it isn't working
					const scaleFactor = Math.min(window.innerWidth / image.width, window.innerHeight / image.height);
					const scaleFactorInverse = 1 / scaleFactor;

					// Set canvas top and left to capture square's top and left
					canvas.style.position = 'absolute';
					canvas.style.top = top + 'px';
					canvas.style.left = left + 'px';
					canvas.style.zIndex = "9999";

					// I don't know why this is important but it works	
					canvas.width = width;
					canvas.height = height;

					// Draw image cropped to the capture square
					context.drawImage(image, boundingRect.left * scaleFactorInverse, boundingRect.top * scaleFactorInverse, width * scaleFactorInverse, height * scaleFactorInverse, 0, 0, width, height);

					detectQRCodes(canvas, "canvas")
						.then(decoded => { handleDecoded(decoded, "CtrlC"); });
				};
			});
	}
}

// Triggers when user Ctrl Shift Y, trigger decode by clipboard
function onDecodeClipboard(event) {
	event.preventDefault();

	if (!(navigator.clipboard && typeof navigator.clipboard.read === 'function')) {
		console.log("Clipboard API not supported");
	}

	// Get image from clipboard
	navigator.clipboard.read()
		.then(clipboardItems => {
			clipboardItems.forEach(clipboardItem => {
				clipboardItem.types.forEach(type => {
					if (type.startsWith("image/")) {
						const imageFormat = type.substring(6);
						clipboardItem.getType(`image/${imageFormat}`).then(blob => {
							blobToBase64(blob)
								.then(dataUrl => {
									const image = document.createElement("img");
									image.src = dataUrl;

									detectQRCodes(image, "img")
										.then(decoded => { handleDecoded(decoded, "CtrlC"); });
								});
						});
					}
				});
			});
		}
		)
		.catch(err => {
			console.log(err);
		});
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
	console.log(decoded);

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

// Helper function (https://stackoverflow.com/questions/18650168/convert-blob-to-base64/18650249#18650249)
function blobToBase64(blob) {
	return new Promise((resolve, _) => {
		const reader = new FileReader();
		reader.onloadend = () => resolve(reader.result);
		reader.readAsDataURL(blob);
	});
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