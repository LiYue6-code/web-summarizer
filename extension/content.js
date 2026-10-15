/**
 * content.js — 注入「获取图片」悬浮按钮 + 提取商品详情页图片
 * 运行环境：淘宝/天猫、京东、拼多多（洋码头）商品详情页
 */
(() => {
  'use strict';

  // ===== 配置 =====
  const MIN_SIZE = 100;            // 过滤：宽或高小于该像素的图片
  const MAX_IMAGES = 500;          // 最多提取数量，防止页面异常时卡死
  const MEASURE_TIMEOUT = 4000;    // 单张图片尺寸探测超时（毫秒）
  const MEASURE_CONCURRENCY = 8;   // 尺寸探测并发数

  let button = null;
  let scanning = false;

  // ===== 平台识别 =====
  function detectPlatform() {
    const h = location.hostname;
    if (h.includes('taobao.com') || h.includes('tmall.com')) return 'taobao';
    if (h.includes('jd.com')) return 'jd';
    if (h.includes('pinduoduo.com') || h.includes('yangkeduo.com')) return 'pdd';
    return null;
  }

  // 是否商品详情页（用于决定是否显示按钮）
  function isDetailPage() {
    const url = location.href;
    const h = location.hostname;
    if (h.includes('taobao.com') || h.includes('tmall.com')) {
      return /item\.htm|detail\.tmall\.com\/item|item\.taobao\.com\/item/i.test(url);
    }
    if (h.includes('jd.com')) {
      return /item\.jd\.com\/\d+\.html|\/\d+\.html/i.test(url);
    }
    if (h.includes('pinduoduo.com') || h.includes('yangkeduo.com')) {
      return /goods\.html|goods_id/i.test(url);
    }
    return false;
  }

  // ===== URL 处理 =====
  function toAbsoluteUrl(raw) {
    if (!raw || typeof raw !== 'string') return null;
    const s = raw.trim();
    if (!s || s.startsWith('data:') || s.startsWith('javascript:') || s.startsWith('about:')) return null;
    try {
      const u = new URL(s, location.href);
      if (u.protocol === 'http:' || u.protocol === 'https:') return u.href;
      return null;
    } catch (e) {
      return null;
    }
  }

  // 从 srcset 中选择最大尺寸的候选（如 "a.jpg 400w, b.jpg 800w" 取 800w）
  function pickLargestSrcset(srcset) {
    if (!srcset) return null;
    let best = null;
    let bestW = -1;
    srcset.split(',').forEach((part) => {
      const seg = part.trim();
      if (!seg) return;
      const m = seg.match(/^(\S+)(?:\s+(\d+)w)?/);
      if (!m) return;
      const w = m[2] ? parseInt(m[2], 10) : 0;
      if (w >= bestW) {
        best = m[1];
        bestW = w;
      }
    });
    return best;
  }

  // ===== 图片候选收集 =====
  function collectCandidates() {
    const map = new Map();

    const add = (rawUrl, w, h) => {
      const url = toAbsoluteUrl(rawUrl);
      if (!url || map.has(url)) return;
      map.set(url, { url, width: w || 0, height: h || 0 });
    };

    // 1) <img> 标签：src / currentSrc / srcset / 常见懒加载属性
    const lazyAttrs = [
      'data-src', 'data-lazy-src', 'data-lazyload', 'data-original',
      'data-echo', 'data-img', 'data-src-hd', 'data-large', 'data-ks-lazyload'
    ];
    document.querySelectorAll('img').forEach((img) => {
      const w = img.naturalWidth || img.width || 0;
      const h = img.naturalHeight || img.height || 0;
      add(img.currentSrc || img.src, w, h);
      if (img.srcset) add(pickLargestSrcset(img.srcset), w, h);
      lazyAttrs.forEach((a) => {
        const v = img.getAttribute(a);
        if (v) add(v, w, h);
      });
    });

    // 2) <picture><source>
    document.querySelectorAll('picture source').forEach((s) => {
      if (s.srcset) add(pickLargestSrcset(s.srcset), 0, 0);
      const dss = s.getAttribute('data-srcset');
      if (dss) add(pickLargestSrcset(dss), 0, 0);
    });

    // 3) CSS background-image（内联样式与样式表）
    document.querySelectorAll('*').forEach((el) => {
      let bg;
      try {
        bg = getComputedStyle(el).backgroundImage;
      } catch (e) {
        return;
      }
      if (!bg || bg === 'none') return;
      const re = /url\(["']?([^"')]+)["']?\)/g;
      let m;
      while ((m = re.exec(bg))) add(m[1], 0, 0);
    });

    return Array.from(map.values());
  }

  // ===== 尺寸探测（未加载/未知尺寸的图片）=====
  // 说明：仅读取 naturalWidth/naturalHeight，不读取像素数据，因此不受 CORS 限制。
  function measureImage(url) {
    return new Promise((resolve) => {
      const img = new Image();
      let settled = false;
      const finish = (w, h) => {
        if (!settled) {
          settled = true;
          resolve({ width: w, height: h });
        }
      };
      const timer = setTimeout(() => finish(0, 0), MEASURE_TIMEOUT);
      img.onload = () => {
        clearTimeout(timer);
        finish(img.naturalWidth, img.naturalHeight);
      };
      img.onerror = () => {
        clearTimeout(timer);
        finish(0, 0);
      };
      img.src = url;
    });
  }

  // 带并发上限的 map，避免一次性创建大量 Image 对象
  async function mapWithConcurrency(items, limit, fn) {
    const results = new Array(items.length);
    let i = 0;
    const workers = Array.from({ length: Math.min(limit, items.length) }, async () => {
      while (i < items.length) {
        const idx = i++;
        results[idx] = await fn(items[idx], idx);
      }
    });
    await Promise.all(workers);
    return results;
  }

  // ===== 主流程：提取 =====
  async function extract() {
    let candidates = collectCandidates();
    if (candidates.length > MAX_IMAGES) candidates = candidates.slice(0, MAX_IMAGES);

    // 探测尺寸（已满足最小尺寸的跳过）
    const measured = await mapWithConcurrency(candidates, MEASURE_CONCURRENCY, async (c) => {
      if (c.width >= MIN_SIZE && c.height >= MIN_SIZE) return c;
      const d = await measureImage(c.url);
      c.width = Math.max(c.width, d.width);
      c.height = Math.max(c.height, d.height);
      return c;
    });

    return measured.filter((c) => c.width >= MIN_SIZE && c.height >= MIN_SIZE);
  }

  // ===== 按钮 UI =====
  function createButton() {
    const el = document.createElement('div');
    el.id = 'ec-image-extract-btn';
    el.setAttribute('role', 'button');
    el.textContent = '获取图片';
    el.addEventListener('click', onButtonClick);
    return el;
  }

  function setButtonState(loading) {
    if (!button) return;
    if (loading) {
      button.classList.add('loading');
      button.textContent = '提取中…';
    } else {
      button.classList.remove('loading');
      button.textContent = '获取图片';
    }
  }

  function showToast(msg) {
    let t = document.getElementById('ec-image-extract-toast');
    if (!t) {
      t = document.createElement('div');
      t.id = 'ec-image-extract-toast';
      document.body.appendChild(t);
    }
    t.textContent = msg;
    t.classList.add('show');
    clearTimeout(t._timer);
    t._timer = setTimeout(() => t.classList.remove('show'), 2600);
  }

  async function onButtonClick() {
    if (scanning) return;
    scanning = true;
    setButtonState(true);
    try {
      const images = await extract();
      if (!images.length) {
        showToast('未找到符合条件的图片（≥100px）');
        return;
      }
      showToast(`已提取 ${images.length} 张图片，正在打开图库…`);
      // 传给 service worker，由其保存并打开图库
      await chrome.runtime.sendMessage({
        type: 'OPEN_GALLERY',
        images,
        sourceUrl: location.href,
        sourceTitle: document.title,
        platform: detectPlatform()
      });
    } catch (e) {
      console.error('[电商图片提取] 提取失败', e);
      showToast('提取失败，请重试');
    } finally {
      scanning = false;
      setButtonState(false);
    }
  }

  // ===== 按钮注入 / 隐藏（适配 SPA 路由切换）=====
  function ensureButton() {
    if (isDetailPage()) {
      if (!button || !document.body.contains(button)) {
        button = createButton();
        document.body.appendChild(button);
      }
      button.style.display = '';
    } else if (button) {
      button.style.display = 'none';
    }
  }

  function start() {
    ensureButton();
    let lastUrl = location.href;
    // 简单轮询监听 SPA 路由变化（淘宝/京东详情页多为多页或局部刷新）
    setInterval(() => {
      if (location.href !== lastUrl) {
        lastUrl = location.href;
        ensureButton();
      }
    }, 1200);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', start);
  } else {
    start();
  }
})();
