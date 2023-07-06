function onMouseMove(e) {
	console.log(e.pageX, e.pageY);
}


// Check for mouse location
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
	if (message.type === "updateState") {
		if (message.enabled) {
			console.log("Enabled");
			document.addEventListener("mousemove", onMouseMove);
		}
		else {
			console.log("Disabled");
			document.removeEventListener("mousemove", onMouseMove);
		}
	}
}
);
