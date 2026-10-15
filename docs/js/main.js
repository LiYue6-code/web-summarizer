/* ==========================================================================
   docs/js/main.js —— 图提取 ImageGrab 官网交互脚本
   功能：移动端汉堡菜单、导航栏滚动阴影、滚动进入视口动画、当前区块高亮
   ========================================================================== */
(function () {
  'use strict';

  // ===== 移动端汉堡菜单 =====
  const toggle = document.getElementById('navToggle');
  const navLinks = document.getElementById('navLinks');

  function closeMenu() {
    navLinks.classList.remove('open');
    toggle.classList.remove('active');
    toggle.setAttribute('aria-expanded', 'false');
  }

  if (toggle && navLinks) {
    toggle.addEventListener('click', () => {
      const open = navLinks.classList.toggle('open');
      toggle.classList.toggle('active', open);
      toggle.setAttribute('aria-expanded', String(open));
    });

    // 点击任意导航链接后收起菜单
    navLinks.querySelectorAll('a').forEach((a) => {
      a.addEventListener('click', closeMenu);
    });
  }

  // ===== 导航栏滚动阴影 =====
  const navbar = document.getElementById('navbar');
  function updateNavbarShadow() {
    if (navbar) navbar.classList.toggle('scrolled', window.scrollY > 8);
  }

  // ===== 滚动进入视口动画（IntersectionObserver，只触发一次） =====
  const revealEls = document.querySelectorAll('.reveal');
  const revealObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          revealObserver.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
  );
  revealEls.forEach((el) => revealObserver.observe(el));

  // ===== 导航当前区块高亮（滚动监听 + requestAnimationFrame 节流） =====
  const sections = Array.from(document.querySelectorAll('section[id]'));
  const navAnchors = Array.from(document.querySelectorAll('.nav-links a[href^="#"]'));
  const NAV_OFFSET = 96; // 吸顶导航高度补偿

  function scrollSpy() {
    const pos = window.scrollY + NAV_OFFSET;
    let currentId = '';
    sections.forEach((sec) => {
      if (sec.offsetTop <= pos) currentId = sec.id;
    });
    navAnchors.forEach((a) => {
      a.classList.toggle('active', a.getAttribute('href') === '#' + currentId);
    });
  }

  let ticking = false;
  function onScroll() {
    updateNavbarShadow();
    if (!ticking) {
      window.requestAnimationFrame(() => {
        scrollSpy();
        ticking = false;
      });
      ticking = true;
    }
  }

  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll(); // 页面加载后先执行一次，正确初始化高亮与阴影状态
})();
