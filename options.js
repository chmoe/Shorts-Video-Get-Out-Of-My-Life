// 全局变量声明
let maxTimesInput;
let blockHomeShortsInput;
let pauseShortsVideoInput;
let redirectOptionInput;
let customUrlGroup;
let customUrlInput;
let autoBlockHomeWhenLimitInput;
let autoPauseShortsWhenLimitInput;
let toast;
// 加载国际化
function loadI18nTexts() {
    document.getElementById('optionsTitle').textContent = chrome.i18n.getMessage('extension_name');
    document.getElementById('extensionName').textContent = chrome.i18n.getMessage('extension_name');
    document.getElementById('labelBlockHomeShorts').textContent = chrome.i18n.getMessage('block_home_shorts');
    document.getElementById('labelPauseShortsVideo').textContent = chrome.i18n.getMessage('pause_shorts_video');
    document.getElementById('shortsPlayLimitLabel').textContent = chrome.i18n.getMessage('shorts_play_limit_label');
    document.getElementById('labelAutoBlockHome').textContent = chrome.i18n.getMessage('auto_block_home_after_limit');
    document.getElementById('labelAutoPauseShorts').textContent = chrome.i18n.getMessage('auto_pause_after_limit');
    document.getElementById('redirectOptionLabel').textContent = chrome.i18n.getMessage('redirect_option_label');
    document.getElementById('redirectCloseTab').textContent = chrome.i18n.getMessage('redirect_close_tab');
    document.getElementById('redirectHome').textContent = chrome.i18n.getMessage('redirect_home');
    document.getElementById('redirectCustom').textContent = chrome.i18n.getMessage('redirect_custom');
    document.getElementById('customUrlLabel').textContent = chrome.i18n.getMessage('custom_url_label');
    document.getElementById('autoBlockHomeWhenLimit').textContent = chrome.i18n.getMessage('max_times_hint');

}

// 加载今日 Shorts 播放统计
function loadShortsStats() {
    const statsEl = document.getElementById('shortsStats');
    if (!statsEl) {
        console.warn('⚠️ statsEl 未找到，跳过 loadShortsStats');
        return;
    }

    chrome.storage.local.get(['shortsData'], (result) => {
        const today = new Date().toISOString().split('T')[0];
        const data = result.shortsData || { date: today, count: 0 };
        const count = (data.date === today) ? data.count : 0;
        const averageSecondsPerShort = 15;
        const totalMinutes = (count * averageSecondsPerShort / 60).toFixed(1);

        const statsText = chrome.i18n.getMessage('shorts_stats_message', [count, totalMinutes]);
        statsEl.textContent = statsText;


    });
}

// 加载设置
function loadSettings() {
    // 如果控件还未准备好，跳过
    if (!maxTimesInput) {
        // console.warn('⚠️ 控件未就绪，跳过 loadSettings');
        console.warn(chrome.i18n.getMessage('control_not_ready_skip_load'));
        return;
    }

    chrome.storage.local.get(['settings'], (result) => {
        const settings = result.settings || {
            maxTimes: 0,
            blockHomeShorts: true,
            pauseShortsVideo: true,
            redirectOption: "youtube_home",
            customUrl: "",
            autoBlockHomeWhenLimit: false,
            autoPauseShortsWhenLimit: false
        };

        maxTimesInput.value = settings.maxTimes;
        blockHomeShortsInput.checked = settings.blockHomeShorts;
        pauseShortsVideoInput.checked = settings.pauseShortsVideo;
        redirectOptionInput.value = settings.redirectOption;
        customUrlInput.value = settings.customUrl || "";
        autoBlockHomeWhenLimitInput.checked = settings.autoBlockHomeWhenLimit;
        autoPauseShortsWhenLimitInput.checked = settings.autoPauseShortsWhenLimit;

        toggleCustomUrlField();
        updateMaxTimesAvailability();
    });
}

// 保存设置
function saveSettings() {
    if (!maxTimesInput) {
        console.warn('⚠️ 控件未就绪，跳过 saveSettings');
        return;
    }

    const maxTimes = parseInt(maxTimesInput.value) || 0;
    const blockHomeShorts = blockHomeShortsInput.checked;
    const pauseShortsVideo = pauseShortsVideoInput.checked;
    const redirectOption = redirectOptionInput.value;
    const customUrl = customUrlInput.value.trim();
    const autoBlockHomeWhenLimit = autoBlockHomeWhenLimitInput.checked;
    const autoPauseShortsWhenLimit = autoPauseShortsWhenLimitInput.checked;

    if (redirectOption === 'custom' && !isValidUrl(customUrl)) {
        // showToast('❌ 请输入有效的 URL（必须以 http 或 https 开头）', false);
        showToast(chrome.i18n.getMessage('invalid_url_warning'), false);
        return;
    }

    const newSettings = {
        maxTimes,
        blockHomeShorts,
        pauseShortsVideo,
        redirectOption,
        customUrl,
        autoBlockHomeWhenLimit,
        autoPauseShortsWhenLimit
    };

    chrome.storage.local.set({ settings: newSettings }, () => {
        console.log('✅ 设置已保存:', newSettings);
        // showToast('设置已保存');
        showToast(chrome.i18n.getMessage('save_success'));

    });
}

// 辅助函数：验证 URL
function isValidUrl(url) {
    try {
        const parsed = new URL(url);
        return parsed.protocol === "http:" || parsed.protocol === "https:";
    } catch (e) {
        return false;
    }
}

// 辅助函数：显示/隐藏自定义跳转地址输入框
function toggleCustomUrlField() {
    if (redirectOptionInput.value === 'custom') {
        customUrlGroup.style.display = 'block';
    } else {
        customUrlGroup.style.display = 'none';
    }
}

// 辅助函数：显示 Toast 提示
function showToast(message, success = true) {
    toast.textContent = message;
    toast.style.backgroundColor = success ? 'var(--success-color)' : '#dc3545'; // 成功绿色 / 错误红色
    toast.style.opacity = '1';
    toast.style.transform = 'translateY(0)';
    setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transform = 'translateY(-20px)';
    }, 2000);
}

// 辅助函数：更新 "每日最大打开次数" 控制可用性
function updateMaxTimesAvailability() {
    const pauseShortsEnabled = pauseShortsVideoInput.checked;
    const maxTimesGroup = document.getElementById('maxTimesGroup');

    if (pauseShortsEnabled) {
        maxTimesGroup.classList.add('disabled-section');
        // maxTimesGroup.setAttribute('data-disabled-message', '已禁用（因为开启了"阻止 Shorts 页面自动播放"）');
        maxTimesGroup.setAttribute('data-disabled-message', chrome.i18n.getMessage('disabled_section_message'));
    } else {
        maxTimesGroup.classList.remove('disabled-section');
        maxTimesGroup.removeAttribute('data-disabled-message');
    }
}

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', () => {
    loadI18nTexts();
    // 缓存 DOM 元素
    maxTimesInput = document.getElementById('maxTimes');
    blockHomeShortsInput = document.getElementById('blockHomeShorts');
    pauseShortsVideoInput = document.getElementById('pauseShortsVideo');
    redirectOptionInput = document.getElementById('redirectOption');
    customUrlGroup = document.getElementById('customUrlGroup');
    customUrlInput = document.getElementById('customUrl');
    autoBlockHomeWhenLimitInput = document.getElementById('autoBlockHomeWhenLimit');
    autoPauseShortsWhenLimitInput = document.getElementById('autoPauseShortsWhenLimit');
    toast = document.getElementById('toast');
    if (customUrlInput) {
        customUrlInput.placeholder = chrome.i18n.getMessage('custom_url_placeholder');
    }
    // 初次加载
    loadShortsStats();
    loadSettings();

    // 绑定控件事件
    maxTimesInput.addEventListener('input', () => {
        if (maxTimesInput.disabled) {
            // showToast('⚠️ 当前启用了阻止播放，无法使用次数限制！', false);
            showToast(chrome.i18n.getMessage('max_times_disabled_warning'), false);
            maxTimesInput.value = 0;
        } else {
            saveSettings();
        }
    });
    blockHomeShortsInput.addEventListener('change', saveSettings);
    pauseShortsVideoInput.addEventListener('change', () => {
        saveSettings();
        updateMaxTimesAvailability();
    });
    redirectOptionInput.addEventListener('change', () => {
        toggleCustomUrlField();
        saveSettings();
    });
    customUrlInput.addEventListener('input', saveSettings);
    autoBlockHomeWhenLimitInput.addEventListener('change', saveSettings);
    autoPauseShortsWhenLimitInput.addEventListener('change', saveSettings);

    // 监听 popup 消息，触发刷新
    chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
        if (message.action === 'refreshOptionsPage') {
            console.log('🔄 收到刷新请求，重新加载设置');
            loadShortsStats();
            loadSettings();
        }
    });
});
