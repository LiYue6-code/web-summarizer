/**
 * background.js — MV3 Service Worker
 * 职责：保存提取结果并打开图库、批量下载（统一转 PNG）、下载进度广播
 */

const PNG_PREFIX = '商品图_';

// ===== 广播消息给所有扩展页面（gallery 会监听）=====
function broadcast(message) {
  chrome.runtime.sendMessage(message).catch(() => {});
}

// ===== 打开图库标签页 =====
async function openGallery() {
  const url = chrome.runtime.getURL('gallery.html');
  await chrome.tabs.create({ url });
}

// ===== Blob -> dataURL（回退方案）=====
function blobToDataUrl(blob) {
  return new Promise((resolve, reject) => {
    const r = new FileReader();
    r.onload = () => resolve(r.result);
    r.onerror = () => reject(new Error('读取 Blob 失败'));
    r.readAsDataURL(blob);
  });
}

// ===== 抓取 + 转 PNG（OffscreenCanvas，service worker 无 DOM 也可用）=====
async function fetchAndConvertToPng(url) {
  const resp = await fetch(url, { credentials: 'omit', cache: 'force-cache' });
  if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
  const blob = await resp.blob();
  const bitmap = await createImageBitmap(blob);
  const canvas = new OffscreenCanvas(bitmap.width, bitmap.height);
  const ctx = canvas.getContext('2d');
  ctx.drawImage(bitmap, 0, 0);
  bitmap.close();
  return canvas.convertToBlob({ type: 'image/png' });
}

// ===== 单张下载 =====
// 说明：MV3 的 Service Worker 中不存在 URL.createObjectURL / revokeObjectURL，
//       因此统一将 PNG Blob 读成 dataURL 后交给 chrome.downloads.download 保存。
async function downloadOne(img, seq) {
  const pngBlob = await fetchAndConvertToPng(img.url);
  const filename = `${PNG_PREFIX}${String(seq).padStart(3, '0')}.png`;

  const dataUrl = await blobToDataUrl(pngBlob);

  return new Promise((resolve, reject) => {
    chrome.downloads.download(
      { url: dataUrl, filename, conflictAction: 'uniquify' },
      (id) => {
        if (chrome.runtime.lastError) reject(new Error(chrome.runtime.lastError.message));
        else resolve(id);
      }
    );
  });
}

// ===== 批量下载（串行，带实时进度）=====
async function startDownload(images) {
  const total = images.length;
  let done = 0;
  let success = 0;
  const failed = [];

  broadcast({ type: 'DOWNLOAD_PROGRESS', done, total, success, failed: failed.length });

  for (let i = 0; i < images.length; i++) {
    try {
      await downloadOne(images[i], i + 1);
      success++;
    } catch (err) {
      failed.push({ index: i + 1, url: images[i].url, error: err.message });
    }
    done++;
    broadcast({ type: 'DOWNLOAD_PROGRESS', done, total, success, failed: failed.length });
  }

  broadcast({ type: 'DOWNLOAD_COMPLETE', total, success, failed });
}

// ===== 消息路由 =====
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  (async () => {
    try {
      if (message.type === 'OPEN_GALLERY') {
        // 保存提取结果，图库页启动时读取
        await chrome.storage.local.set({
          images: message.images || [],
          sourceUrl: message.sourceUrl || '',
          sourceTitle: message.sourceTitle || '',
          platform: message.platform || '',
          timestamp: Date.now()
        });
        await openGallery();
        sendResponse({ ok: true });
      } else if (message.type === 'START_DOWNLOAD') {
        // 下载异步执行，进度通过广播返回
        startDownload(message.images || []);
        sendResponse({ ok: true, started: true });
      } else {
        sendResponse({ ok: false, error: '未知消息类型' });
      }
    } catch (e) {
      sendResponse({ ok: false, error: e.message });
    }
  })();
  return true; // 保持异步通道
});

// 点击工具栏图标 -> 打开图库
chrome.action.onClicked.addListener(() => {
  openGallery();
});
