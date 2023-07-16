# Code Reader Chrome Extension

Code Reader Chrome Extension

## Features

1. Works on QR Code, Barcode, PDF417 Code, and possibly other code format that I did not mention, so I'll just use "Code" hereinafter.
2. While hovering over a Code `image` / `canvas` / `video` html element, it will show a hover popup that displays the decoded content of the Code.
3. While the hovering popup is active, use
    - `"Ctrl C"` to copy the content to the user's clipboard
    - `"Enter"` to open the link (if it's a link, otherwise it'll just copy to clipboard) in a new tab.

## Not Features

1. Only works on `http://` and `https://` websites, does not work on local files.
2. Does not show anything when Code cannot be detected.
3. Bundle size of content-script.js is rather huge (idk how to make it any smoller bruv)

## Issues

1. Not all Code can be detected.
2. Does not work when some element is overlapping the Code.

## How to use

1. Download repository
2. Go to extensions page
3. Enable `Developer mode`
4. Click on `Load unpacked`
5. Select the repository
6. Enable extension in extensions page
7. (Extension is disabled on every webpage by default, turn it on before using it)
8. Stonks

## WIP

1. Chrome extension store?? (probably not im lazy)

## Arigatou

1. [zxing-js/browser](https://github.com/zxing-js/browser/tree/master)
