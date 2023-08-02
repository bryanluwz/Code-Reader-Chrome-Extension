# Code Reader Chrome Extension

Code Reader Chrome Extension

## Features

1. Works on QR Code, Barcode, PDF417 Code, and possibly other code format that I did not mention, so I'll just use "Code" hereinafter.
2. While hovering over a Code `image` / `canvas` / `video` html element, it will show a hover popup that displays the decoded content of the Code.
3. Use `"Ctrl Shift U"` to toggle capture mode, `Left Click` to capture.
4. Use `"Ctrl Shift Y"` to decode image from clipboard.
5. While the decoded popup is active, use
    - `"Ctrl C"` to copy the content to the user's clipboard,
    - `"Enter"` to open the link (if it's a link, otherwise it'll just copy to clipboard) in a new tab.

## Not Features

1. Only works on `http://` and `https://` websites, does not work on local files.
2. Does not show anything when Code cannot be detected.
3. Bundle size of content-script.js is rather huge (idk how to make it any smoller bruv)

## Issues

1. Not all Code can be detected (i dont know which ok?)
2. Does not work when some element is overlapping the Code.

## How to install

1. Download repository
2. Go to extensions page
3. Enable `Developer mode`
4. Click on `Load unpacked`
5. Select the repository
6. Enable extension in extensions page
7. (Extension is disabled on every webpage by default, turn it on before using it)
8. Stonks

## How to use

1. Click on extension icon to enable it in that tab
2. Hover over Code to reveal encoded data, `"Ctrl C"` or `"Enter"`
3. If Code is an image / HTML object by itself, then use `"Ctrl Shift U"` to toggle Capture Mode, left click to capture that Code
    - `[` to make it smaller
    - `]` to make it larger
4. If your Code is on your clipboard, use `"Ctrl Shift Y"` to decode from clipboard.

## Future Plans

1. Chrome extension store?? (probably not im broke)

## Arigatou

1. [zxing-js/browser](https://github.com/zxing-js/browser/tree/master)
