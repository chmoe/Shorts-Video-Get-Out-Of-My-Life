document.addEventListener('DOMContentLoaded', () => {
    // 设置国际化文本
    document.title = chrome.i18n.getMessage('extension_name');  // 🔥 设置页面标题
    document.getElementById('extensionName').textContent = chrome.i18n.getMessage('extension_name');
    document.getElementById('labelBlockHomeShorts').textContent = chrome.i18n.getMessage('block_home_shorts');
    document.getElementById('labelPauseShortsVideo').textContent = chrome.i18n.getMessage('pause_shorts_video');
    document.getElementById('openSettings').textContent = chrome.i18n.getMessage('open_settings');

    const blockHomeShortsInput = document.getElementById('blockHomeShorts');
    const pauseShortsVideoInput = document.getElementById('pauseShortsVideo');

    chrome.storage.local.get(['settings'], (result) => {
        const settings = result.settings || {};
        blockHomeShortsInput.checked = settings.blockHomeShorts ?? true;
        pauseShortsVideoInput.checked = settings.pauseShortsVideo ?? true;
    });

    blockHomeShortsInput.addEventListener('change', () => {
        chrome.storage.local.get(['settings'], (result) => {
            const settings = result.settings || {};
            settings.blockHomeShorts = blockHomeShortsInput.checked;
            chrome.storage.local.set({ settings });
            chrome.runtime.sendMessage({ action: 'refreshOptionsPage' });
        });
    });

    pauseShortsVideoInput.addEventListener('change', () => {
        chrome.storage.local.get(['settings'], (result) => {
            const settings = result.settings || {};
            settings.pauseShortsVideo = pauseShortsVideoInput.checked;
            chrome.storage.local.set({ settings });
            chrome.runtime.sendMessage({ action: 'refreshOptionsPage' });
        });
    });

    document.getElementById('openSettings').onclick = () => {
        chrome.runtime.openOptionsPage();
    };
});
