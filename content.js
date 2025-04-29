let userSettings = {
    maxTimes: 0,
    autoBlockHomeWhenLimit: false,
    autoPauseShortsWhenLimit: false,
    blockHomeShorts: true,
    pauseShortsVideo: true,
    redirectOption: "youtube_home",
    customUrl: ""
};

let todayCount = 0;
let hasBlocked = false;
let observer = null;
let homeObserver = null;  // 🔥 新增：监听首页变化

function loadSettingsAndData(callback) {
    chrome.storage.local.get(['settings', 'shortsData'], (result) => {
        const storedSettings = result.settings || {};
        for (let key in userSettings) {
            if (storedSettings[key] !== undefined) {
                userSettings[key] = storedSettings[key];
            }
        }

        const today = new Date().toISOString().split('T')[0];
        const data = result.shortsData || { date: today, count: 0 };
        todayCount = (data.date === today) ? data.count : 0;

        if (callback) callback();
    });
}

function hasReachedMaxTimes() {
    return userSettings.maxTimes > 0 && todayCount >= userSettings.maxTimes;
}

function blockShorts() {
    if (hasBlocked) return;
    hasBlocked = true;

    const video = document.querySelector('video');
    if (video) {
        if (userSettings.pauseShortsVideo || (userSettings.autoPauseShortsWhenLimit && hasReachedMaxTimes())) {
            video.pause();
            video.muted = true;
            video.removeAttribute('autoplay');
            console.log('⏸ 暂停 Shorts 视频');
        }

        addOverlay(video);
        showFloatingMessage('🚫 不要刷 Shorts！快去干正事！');
        incrementShortsCount();

        setTimeout(() => {
            if (userSettings.redirectOption === 'close') {
                chrome.runtime.sendMessage({ action: "closeTab" });
            } else if (userSettings.redirectOption === 'youtube_home') {
                window.location.href = 'https://www.youtube.com/';
            } else if (userSettings.redirectOption === 'custom' && userSettings.customUrl) {
                window.location.href = userSettings.customUrl;
            } else {
                window.location.href = 'https://www.youtube.com/';
            }
        }, 3000);
    }
}

function addOverlay(video) {
    try {
        const rect = video.getBoundingClientRect();
        const overlay = document.createElement('div');
        overlay.style.position = 'fixed';
        overlay.style.top = `${rect.top}px`;
        overlay.style.left = `${rect.left}px`;
        overlay.style.width = `${rect.width}px`;
        overlay.style.height = `${rect.height}px`;
        overlay.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
        overlay.style.zIndex = '9999';
        overlay.style.pointerEvents = 'none';
        document.body.appendChild(overlay);
    } catch (err) {
        console.error('⚠️ 添加遮罩失败:', err);
    }
}

function showFloatingMessage(message) {
    const popup = document.createElement('div');
    popup.textContent = message;
    popup.style.position = 'fixed';
    popup.style.top = '30%';
    popup.style.left = '50%';
    popup.style.transform = 'translateX(-50%)';
    popup.style.padding = '20px 30px';
    popup.style.backgroundColor = '#ff4c4c';
    popup.style.color = '#fff';
    popup.style.fontSize = '20px';
    popup.style.borderRadius = '8px';
    popup.style.zIndex = '10000';
    popup.style.opacity = '0';
    popup.style.transition = 'opacity 0.5s ease';
    document.body.appendChild(popup);
    setTimeout(() => popup.style.opacity = '1', 50);
    setTimeout(() => {
        popup.style.opacity = '0';
        setTimeout(() => popup.remove(), 500);
    }, 2500);
}

function incrementShortsCount() {
    const today = new Date().toISOString().split('T')[0];
    chrome.storage.local.get(['shortsData'], (result) => {
        let data = result.shortsData || { date: today, count: 0 };
        if (data.date !== today) {
            data = { date: today, count: 0 };
        }
        data.count++;
        todayCount = data.count;
        chrome.storage.local.set({ shortsData: data });
    });
}

function startObservingShorts() {
    hasBlocked = false;
    if (observer) observer.disconnect();

    observer = new MutationObserver(() => {
        const video = document.querySelector('video');
        if (video && !hasBlocked && window.location.href.includes('/shorts/')) {
            console.log('🎯 MutationObserver: 检测到 Shorts 视频');
            observer.disconnect();
            blockShorts();
        }
    });

    observer.observe(document.body, {
        childList: true,
        subtree: true
    });
}

// 屏蔽首页 Shorts
function blockHomeShorts() {
    if (!userSettings.blockHomeShorts) {
        console.log('🔕 blockHomeShorts 开关关闭，不处理');
        return;
    }

    const sections = document.querySelectorAll('ytd-rich-section-renderer');

    sections.forEach(section => {
        const shelf = section.querySelector('ytd-rich-shelf-renderer[is-shorts]');
        if (shelf) {
            console.log('🚫 检测到首页 Shorts 区块，正在隐藏...');
            section.style.display = 'none';
        }
    });
}

// 持续监听首页变化
function observeHomePage() {
    if (homeObserver) homeObserver.disconnect();

    homeObserver = new MutationObserver(() => {
        if (window.location.pathname === "/" && userSettings.blockHomeShorts) {
            blockHomeShorts();
        }
    });

    homeObserver.observe(document.body, {
        childList: true,
        subtree: true
    });

    // 页面首次加载时
    if (window.location.pathname === "/" && userSettings.blockHomeShorts) {
        blockHomeShorts();
    }
}


function patchHistory() {
    const _pushState = history.pushState;
    const _replaceState = history.replaceState;

    history.pushState = function () {
        _pushState.apply(this, arguments);
        window.dispatchEvent(new Event('locationchange'));
    };
    history.replaceState = function () {
        _replaceState.apply(this, arguments);
        window.dispatchEvent(new Event('locationchange'));
    };

    window.addEventListener('popstate', () => window.dispatchEvent(new Event('locationchange')));
    window.addEventListener('locationchange', checkUrlChange);
    window.addEventListener('yt-navigate-finish', checkUrlChange);
}

function checkUrlChange() {
    const url = window.location.href;
    console.log('🛤 URL变更:', url);
    if (url.includes('/shorts/')) {
        console.log('🎬 进入 Shorts 页面，开始观察 DOM');
        startObservingShorts();
    } else if (url === 'https://www.youtube.com/' || url === 'https://www.youtube.com') {
        console.log('🏠 在首页，准备屏蔽 Shorts 区块');
        observeHomePage();
    } else {
        if (observer) observer.disconnect();
        if (homeObserver) homeObserver.disconnect();
        hasBlocked = false;
    }
}

// 启动
loadSettingsAndData(() => {
    patchHistory();
    checkUrlChange();
});
