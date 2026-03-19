/* 简洁主脚本：包含移动汉堡菜单逻辑和页面通用交互（高频、无副作用） */

document.addEventListener('DOMContentLoaded', function () {
    const navToggle = document.querySelector('.nav-toggle');

    // 创建移动菜单面板（如果页面中未存在）
    let mobilePanel = document.querySelector('.mobile-nav-panel');
    // 创建遮罩（如果页面中未存在）
    let mobileOverlay = document.querySelector('.mobile-nav-overlay');
    if (!mobilePanel) {
        mobilePanel = document.createElement('div');
        mobilePanel.className = 'mobile-nav-panel';
        const ul = document.createElement('ul');
        ul.className = 'mobile-nav-list';

        // 收集主导航链接作为移动端菜单项
        const mainNavLinks = document.querySelectorAll('.main-nav .nav-list .nav-item a');
        mainNavLinks.forEach(a => {
            const li = document.createElement('li');
            li.className = 'mobile-nav-item';
            const link = a.cloneNode(true);
            // 保证点击后关闭面板并正常导航（使用统一关闭函数以触发动画）
            link.addEventListener('click', function () {
                closeMobileNav();
            });
            li.appendChild(link);
            ul.appendChild(li);
        });

        mobilePanel.appendChild(ul);
        document.body.appendChild(mobilePanel);
    }

    if (!mobileOverlay) {
        mobileOverlay = document.createElement('div');
        mobileOverlay.className = 'mobile-nav-overlay';
        mobileOverlay.setAttribute('aria-hidden', 'true');
        document.body.appendChild(mobileOverlay);
    }

    // 切换函数：打开/关闭面板并切换按钮符号，使用 clip-path 从汉堡位置扩散
    function openMobileNav() {
        if (!navToggle) return;
        // activate panel and overlay first so panel expands to full width
        mobileOverlay.classList.add('active');
        mobilePanel.classList.add('active');

        // ensure layout updated
        const btnRect = navToggle.getBoundingClientRect();
        const panelRect = mobilePanel.getBoundingClientRect();
        const originX = btnRect.left + btnRect.width / 2 - panelRect.left;
        const originY = btnRect.top + btnRect.height / 2 - panelRect.top;

        // compute max distance to panel corners after panel is active
        const w = panelRect.width || window.innerWidth;
        const h = panelRect.height || (window.innerHeight - (parseInt(getComputedStyle(document.documentElement).getPropertyValue('--header-height')) || 60));
        const d1 = Math.hypot(originX, originY);
        const d2 = Math.hypot(w - originX, originY);
        const d3 = Math.hypot(originX, h - originY);
        const d4 = Math.hypot(w - originX, h - originY);
        const radius = Math.ceil(Math.max(d1, d2, d3, d4));

        mobilePanel.style.setProperty('--menu-clip-x', originX + 'px');
        mobilePanel.style.setProperty('--menu-clip-y', originY + 'px');
        // start from 0 then expand
        mobilePanel.style.setProperty('--menu-clip-radius', '0px');

        // trigger expansion on next frame
        requestAnimationFrame(function () {
            mobilePanel.style.setProperty('--menu-clip-radius', radius + 'px');
        });

        navToggle.classList.add('active');
        navToggle.setAttribute('aria-expanded', 'true');
        navToggle.textContent = '×';
    }

    function closeMobileNav() {
        if (!navToggle) return;
        // shrink clip to 0, hide overlay
        mobilePanel.style.setProperty('--menu-clip-radius', '0px');
        mobileOverlay.classList.remove('active');

        // after clip transition finishes, remove active class
        const onEnd = function (e) {
            // some browsers report 'clip-path' other times 'clipPath'
            if (!e || (e.propertyName && (e.propertyName.includes('clip') || e.propertyName.includes('clip-path')))) {
                mobilePanel.classList.remove('active');
                mobilePanel.removeEventListener('transitionend', onEnd);
            }
        };

        mobilePanel.addEventListener('transitionend', onEnd);

        navToggle.classList.remove('active');
        navToggle.setAttribute('aria-expanded', 'false');
        navToggle.textContent = '☰';
    }

    function toggleMobileNav() {
        if (!mobilePanel.classList.contains('active')) openMobileNav(); else closeMobileNav();
    }

    if (navToggle) {
        navToggle.addEventListener('click', function (e) {
            e.stopPropagation();
            toggleMobileNav();
        });
    }

    // 点击遮罩关闭
    mobileOverlay.addEventListener('click', function () {
        closeMobileNav();
    });

    // 点击页面空白处关闭
    document.addEventListener('click', function (e) {
        if (!mobilePanel.contains(e.target) && navToggle && !navToggle.contains(e.target)) {
            closeMobileNav();
        }
    });

    // Esc 键关闭
    document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape') {
            closeMobileNav();
        }
    });

    // 触发一次以设置初始文本
    if (navToggle && !navToggle.textContent.trim()) navToggle.textContent = '☰';

    // 平滑滚动/其他通用交互可在此添加（轻量、无副作用）
});

    /* 轮播功能已移除；保留移动导航与其他交互逻辑 */

// 首屏自动滚动补充：在非触摸设备上，向下快速滚动会平滑跳转到第二屏
(function () {
    if ('ontouchstart' in window) return; // 触摸设备使用原生滚动
    const snapContainer = document.getElementById('snap-container');
    const second = document.getElementById('second-screen');
    if (!snapContainer || !second) return;

    let locked = false; // 防止重复触发
    let deltaAccum = 0;
    const THRESHOLD = 80; // 累积滚动阈值（像素），可调

    function onWheel(e) {
        if (locked) return;
        // 只在首屏时触发
        if (window.scrollY > 10) return;
        deltaAccum += e.deltaY;
        if (deltaAccum > THRESHOLD) {
            locked = true;
            second.scrollIntoView({ behavior: 'smooth' });
            setTimeout(() => { locked = false; deltaAccum = 0; }, 800);
        }
        // 轻微反向滚动清零
        if (deltaAccum < 0) deltaAccum = 0;
    }

    window.addEventListener('wheel', onWheel, { passive: true });
})();
