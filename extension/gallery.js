/**
 * gallery.js — 图库页：展示提取的图片、勾选、批量下载（含进度与结果反馈）
 */

const els = {
  grid: document.getElementById('grid'),
  empty: document.getElementById('empty'),
  sourceInfo: document.getElementById('sourceInfo'),
  totalCount: document.getElementById('totalCount'),
  selectedCount: document.getElementById('selectedCount'),
  btnSelectAll: document.getElementById('btnSelectAll'),
  btnInvert: document.getElementById('btnInvert'),
  btnDownload: document.getElementById('btnDownload'),
  progressWrap: document.getElementById('progressWrap'),
  progressFill: document.getElementById('progressFill'),
  progressText: document.getElementById('progressText'),
  result: document.getElementById('result')
};

let images = [];
const selected = new Set();
let downloading = false;

// ===== 初始化：读取 service worker 保存的结果 =====
async function init() {
  const data = await chrome.storage.local.get(['images', 'sourceUrl', 'sourceTitle', 'platform']);
  images = data.images || [];
  if (data.sourceTitle) {
    els.sourceInfo.textContent = data.sourceTitle;
    els.sourceInfo.title = data.sourceUrl || '';
  }
  els.totalCount.textContent = images.length;

  if (!images.length) {
    els.empty.hidden = false;
    return;
  }
  renderGrid();
}

// ===== 渲染网格 =====
function renderGrid() {
  const frag = document.createDocumentFragment();
  images.forEach((img, i) => {
    const card = document.createElement('div');
    card.className = 'card';
    card.dataset.index = i;

    const check = document.createElement('div');
    check.className = 'check';
    check.innerHTML = '<svg viewBox="0 0 24 24"><path d="M20 6L9 17l-5-5"/></svg>';

    const imgEl = document.createElement('img');
    imgEl.loading = 'lazy';
    imgEl.referrerPolicy = 'no-referrer';
    imgEl.src = img.url;
    imgEl.alt = `商品图 ${String(i + 1).padStart(3, '0')}`;
    imgEl.onerror = () => imgEl.classList.add('broken');

    const meta = document.createElement('div');
    meta.className = 'meta';

    const dims = document.createElement('span');
    dims.className = 'dims';
    dims.textContent = img.width && img.height ? `${img.width}×${img.height}` : '尺寸未知';

    const seq = document.createElement('span');
    seq.className = 'seq';
    seq.textContent = String(i + 1).padStart(3, '0');

    meta.appendChild(dims);
    meta.appendChild(seq);
    card.appendChild(check);
    card.appendChild(imgEl);
    card.appendChild(meta);

    card.addEventListener('click', () => toggleCard(i, card));
    frag.appendChild(card);
  });
  els.grid.appendChild(frag);
}

function toggleCard(i, card) {
  if (selected.has(i)) {
    selected.delete(i);
    card.classList.remove('selected');
  } else {
    selected.add(i);
    card.classList.add('selected');
  }
  updateCount();
}

function updateCount() {
  els.selectedCount.textContent = selected.size;
}

// ===== 全选 / 反选 =====
els.btnSelectAll.addEventListener('click', () => {
  images.forEach((_, i) => selected.add(i));
  document.querySelectorAll('.card').forEach((c) => c.classList.add('selected'));
  updateCount();
});

els.btnInvert.addEventListener('click', () => {
  images.forEach((_, i) => {
    if (selected.has(i)) selected.delete(i);
    else selected.add(i);
  });
  document.querySelectorAll('.card').forEach((c) => {
    const i = Number(c.dataset.index);
    c.classList.toggle('selected', selected.has(i));
  });
  updateCount();
});

// ===== 结果反馈 =====
function showResult(msg, type) {
  els.result.hidden = false;
  els.result.className = 'result ' + type;
  els.result.textContent = msg;
  clearTimeout(els.result._timer);
  els.result._timer = setTimeout(() => {
    els.result.hidden = true;
  }, 6000);
}

// ===== 下载 =====
els.btnDownload.addEventListener('click', () => {
  if (downloading) return;
  if (!selected.size) {
    showResult('请先勾选要下载的图片', 'warn');
    return;
  }
  const chosen = [...selected].sort((a, b) => a - b).map((i) => images[i]);

  downloading = true;
  els.btnDownload.disabled = true;
  els.result.hidden = true;
  els.progressWrap.hidden = false;
  els.progressFill.style.width = '0%';
  els.progressText.textContent = `准备下载 ${chosen.length} 张图片…`;

  chrome.runtime.sendMessage({ type: 'START_DOWNLOAD', images: chosen }).catch((e) => {
    downloading = false;
    els.btnDownload.disabled = false;
    showResult('启动下载失败：' + e.message, 'error');
  });
});

// ===== 接收 service worker 的进度广播 =====
chrome.runtime.onMessage.addListener((message) => {
  if (message.type === 'DOWNLOAD_PROGRESS') {
    const pct = message.total ? Math.round((message.done / message.total) * 100) : 0;
    els.progressFill.style.width = pct + '%';
    els.progressText.textContent =
      `正在下载 ${message.done}/${message.total} · 成功 ${message.success} · 失败 ${message.failed}`;
  } else if (message.type === 'DOWNLOAD_COMPLETE') {
    downloading = false;
    els.btnDownload.disabled = false;
    els.progressFill.style.width = '100%';
    if (message.failed.length) {
      els.progressText.textContent = `下载完成：成功 ${message.success}，失败 ${message.failed.length}`;
      showResult(`已完成，但 ${message.failed.length} 张下载失败（可能因图片源跨域被拦截，详见 README 常见问题）`, 'warn');
    } else {
      els.progressText.textContent = `下载完成：成功 ${message.success}`;
      showResult('全部下载完成！图片已保存到浏览器默认下载目录。', 'success');
    }
  }
});

init();
