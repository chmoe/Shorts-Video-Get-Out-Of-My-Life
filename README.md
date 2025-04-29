# 🎯 Shorts Video Get Out Of My Life

> A Chrome extension to help you break free from YouTube Shorts and reclaim your focus.

## 📦 What is this?

**Shorts Video Get Out Of My Life** is a productivity-focused Chrome extension that blocks or pauses YouTube Shorts to help users stay focused and avoid mindless scrolling.

## ✨ Features

- ✅ Block Shorts section on YouTube Home
- ⏸ Pause Shorts auto-play videos
- ⏱ Set a daily Shorts view limit
- 🚫 Auto-close tab, redirect to homepage, or custom URL after limit
- 📊 Track daily Shorts count and estimated time spent
- 🌐 Multi-language support (English, 中文, 日本語)
- 🧘‍♀️ Floating motivational messages on Shorts pages

## 🛠 Installation

### ▶ From Chrome Web Store (recommended)

> Coming soon...

When published, you'll be able to install from the [Chrome Web Store](https://chromewebstore.google.com/).

### ▶ Manual Installation (for developers or testing)

1. Clone or download this repository:
   ```bash
   git clone https://github.com/chmoe/Shorts-Video-Get-Out-Of-My-Life.git
   ```
2. Open chrome://extensions/ in your Chrome browser.
3. Enable Developer Mode (top right corner).
4. Click Load unpacked and select the folder.

## 🌍 Languages Supported

- English
- 简体中文
- 日本語

Language switches automatically based on your browser’s language setting.

## 📁 File Structure

```pgsql
📦 Shorts-Video-Get-Out-Of-My-Life/
├── background.js              # Handles background events (e.g. close tab)
├── content.js                 # Injected into YouTube pages to block Shorts
├── manifest.json              # Extension configuration file
├── popup.html                 # Popup UI (quick settings)
├── popup.js                   # Popup behavior logic
├── options.html               # Full settings page UI
├── options.js                 # Settings logic & storage
├── style.css                  # Style for content script popups
├── _locales/                  # Internationalization folders
│   ├── en/
│   │   └── messages.json      # English language texts
│   ├── zh_CN/
│   │   └── messages.json      # Simplified Chinese
│   └── ja/
│       └── messages.json      # Japanese
├── icons/                     # [Not exit] Folder for extension icons
│   ├── icon16.png
│   ├── icon48.png
│   └── icon128.png
└── README.md                  # Project documentation


```

## 🤝 Contributing
Pull requests, suggestions and issue reports are welcome!
Let’s build a better YouTube experience together.

## 📜 License
[MIT License](/LICENSE) © [chmoe](https://cha.moe)
