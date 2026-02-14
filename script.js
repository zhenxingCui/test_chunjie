/**
 * 马年拜年祝福 - 手机端红色主题
 */

// 状态管理
const state = {
    senderName: '尉明阳',
    receiverName: '领导',
    musicPlayed: false
};

// DOM元素
const elements = {
    pages: {
        input: document.getElementById('inputPage'),
        blessing: document.getElementById('blessingPage')
    },
    inputs: {
        sender: document.getElementById('senderNameInput'),
        receiver: document.getElementById('receiverNameInput')
    },
    displays: {
        sender: document.getElementById('displaySender'),
        receiver: document.getElementById('displayReceiver')
    },
    buttons: {
        start: document.getElementById('startBtn'),
        replay: document.getElementById('replayBtn'),
        share: document.getElementById('shareBtn')
    },
    bgMusic: document.getElementById('bgMusic'),
    toast: document.getElementById('toast')
};

/**
 * 初始化
 */
function init() {
    bindEvents();
    preloadResources();
}

/**
 * 绑定事件
 */
function bindEvents() {
    // 生成祝福按钮
    elements.buttons.start.addEventListener('click', generateBlessing);
    
    // 重新制作按钮
    elements.buttons.replay.addEventListener('click', backToInput);
    
    // 发送祝福按钮
    elements.buttons.share.addEventListener('click', shareBlessing);
    
    // 输入框回车事件
    elements.inputs.receiver.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            generateBlessing();
        }
    });
    
    // 页面可见性变化
    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    // 触摸优化
    document.addEventListener('touchstart', () => {}, { passive: true });
}

/**
 * 生成祝福
 */
function generateBlessing() {
    const sender = elements.inputs.sender.value.trim();
    const receiver = elements.inputs.receiver.value.trim();
    
    // 验证输入
    if (!sender) {
        showToast('请输入您的姓名');
        elements.inputs.sender.focus();
        return;
    }
    
    if (!receiver) {
        showToast('请输入对方姓名');
        elements.inputs.receiver.focus();
        return;
    }
    
    // 保存姓名
    state.senderName = sender;
    state.receiverName = receiver;
    
    // 更新显示
    elements.displays.sender.textContent = sender;
    elements.displays.receiver.textContent = receiver;
    
    // 播放音乐
    playMusic();
    
    // 切换到祝福页面
    switchPage('blessing');
}

/**
 * 返回输入页面
 */
function backToInput() {
    switchPage('input');
}

/**
 * 切换页面
 */
function switchPage(pageName) {
    // 隐藏所有页面
    Object.values(elements.pages).forEach(page => {
        page.classList.remove('page-active');
    });
    
    // 显示目标页面
    const targetPage = elements.pages[pageName];
    if (targetPage) {
        targetPage.classList.add('page-active');
        
        // 滚动到顶部
        targetPage.scrollTop = 0;
    }
}

/**
 * 播放背景音乐
 */
function playMusic() {
    const music = elements.bgMusic;
    if (!music || state.musicPlayed) return;
    
    music.volume = 0.4;
    music.play().then(() => {
        state.musicPlayed = true;
    }).catch(() => {
        // 自动播放被阻止，等待用户交互
        console.log('等待用户交互后播放音乐');
    });
}

/**
 * 发送祝福
 */
function shareBlessing() {
    const blessingText = `尊敬的${state.receiverName}，${state.senderName}给您拜年了！\n\n马年纳福，笃行致远\n新春安康，事业顺遂\n阖家幸福，万事胜意\n\n——${state.senderName} 敬上\n中国工商银行`;
    
    // 尝试使用Web Share API
    if (navigator.share) {
        navigator.share({
            title: '马年拜年祝福',
            text: blessingText,
        }).then(() => {
            showToast('祝福已发送');
        }).catch(() => {
            copyToClipboard(blessingText);
        });
    } else {
        copyToClipboard(blessingText);
    }
}

/**
 * 复制到剪贴板
 */
function copyToClipboard(text) {
    if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(text).then(() => {
            showToast('祝福已复制，快去发送吧！');
        }).catch(() => {
            fallbackCopy(text);
        });
    } else {
        fallbackCopy(text);
    }
}

/**
 * 备用复制方法
 */
function fallbackCopy(text) {
    const textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.style.cssText = `
        position: fixed;
        top: -9999px;
        left: -9999px;
        opacity: 0;
    `;
    document.body.appendChild(textarea);
    
    // 选择文本
    if (navigator.userAgent.match(/ipad|iphone/i)) {
        const range = document.createRange();
        range.selectNodeContents(textarea);
        const selection = window.getSelection();
        selection.removeAllRanges();
        selection.addRange(range);
        textarea.setSelectionRange(0, 999999);
    } else {
        textarea.select();
    }
    
    try {
        const success = document.execCommand('copy');
        if (success) {
            showToast('祝福已复制，快去发送吧！');
        } else {
            showToast('复制失败，请手动复制');
        }
    } catch (err) {
        showToast('复制失败，请手动复制');
    }
    
    document.body.removeChild(textarea);
}

/**
 * 显示提示消息
 */
function showToast(message) {
    const toast = elements.toast;
    toast.textContent = message;
    toast.classList.add('show');
    
    setTimeout(() => {
        toast.classList.remove('show');
    }, 2000);
}

/**
 * 处理页面可见性变化
 */
function handleVisibilityChange() {
    const music = elements.bgMusic;
    if (!music) return;
    
    if (document.hidden) {
        music.pause();
    } else {
        if (state.musicPlayed) {
            music.play().catch(() => {});
        }
    }
}

/**
 * 预加载资源
 */
function preloadResources() {
    const music = elements.bgMusic;
    if (music) {
        music.load();
    }
}

/**
 * 检测是否为微信环境
 */
function isWeChat() {
    return /MicroMessenger/i.test(navigator.userAgent);
}

/**
 * 微信环境处理
 */
function handleWeChat() {
    if (isWeChat()) {
        document.addEventListener('WeixinJSBridgeReady', () => {
            const music = elements.bgMusic;
            if (music && !state.musicPlayed) {
                music.play().then(() => {
                    state.musicPlayed = true;
                }).catch(() => {});
            }
        });
    }
}

/**
 * 防止双击缩放
 */
function preventDoubleTapZoom() {
    let lastTouchEnd = 0;
    document.addEventListener('touchend', (e) => {
        const now = Date.now();
        if (now - lastTouchEnd <= 300) {
            e.preventDefault();
        }
        lastTouchEnd = now;
    }, { passive: false });
}

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', () => {
    init();
    handleWeChat();
    preventDoubleTapZoom();
});

// 导出API
window.BlessingApp = {
    setSender: (name) => {
        state.senderName = name;
        elements.inputs.sender.value = name;
    },
    setReceiver: (name) => {
        state.receiverName = name;
        elements.inputs.receiver.value = name;
    },
    generate: generateBlessing,
    reset: backToInput
};
