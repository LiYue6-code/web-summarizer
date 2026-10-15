// 生成扩展图标（16/48/128），纯 Node 无依赖，输出到 extension/icons/
import { deflateSync } from 'node:zlib';
import { writeFileSync, mkdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));

// ---------- PNG 基础工具 ----------
const CRC_TABLE = (() => {
  const t = new Uint32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    t[n] = c >>> 0;
  }
  return t;
})();

function crc32(buf) {
  let c = 0xffffffff;
  for (let i = 0; i < buf.length; i++) c = CRC_TABLE[(c ^ buf[i]) & 0xff] ^ (c >>> 8);
  return (c ^ 0xffffffff) >>> 0;
}

function chunk(type, data) {
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length, 0);
  const t = Buffer.from(type, 'ascii');
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(Buffer.concat([t, data])), 0);
  return Buffer.concat([len, t, data, crc]);
}

// ---------- 几何与颜色 ----------
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const lerp = (a, b, t) => a + (b - a) * t;

function inRoundedRect(u, v, x0, y0, x1, y1, r) {
  if (u < x0 || u > x1 || v < y0 || v > y1) return false;
  const cx = clamp(u, x0 + r, x1 - r);
  const cy = clamp(v, y0 + r, y1 - r);
  const dx = u - cx;
  const dy = v - cy;
  return dx * dx + dy * dy <= r * r;
}

function inCircle(u, v, cx, cy, r) {
  const dx = u - cx;
  const dy = v - cy;
  return dx * dx + dy * dy <= r * r;
}

function sign(px, py, ax, ay, bx, by) {
  return (px - bx) * (ay - by) - (ax - bx) * (py - by);
}

function inTriangle(px, py, a, b, c) {
  const d1 = sign(px, py, a[0], a[1], b[0], b[1]);
  const d2 = sign(px, py, b[0], b[1], c[0], c[1]);
  const d3 = sign(px, py, c[0], c[1], a[0], a[1]);
  const hasNeg = d1 < 0 || d2 < 0 || d3 < 0;
  const hasPos = d1 > 0 || d2 > 0 || d3 > 0;
  return !(hasNeg && hasPos);
}

// 单像素取色：渐变背景 + 白色「图片」图标（相框 + 太阳 + 山）
function pixelColor(u, v) {
  const r = lerp(99, 139, v);
  const g = lerp(102, 92, v);
  const b = lerp(241, 246, v);

  const x0 = 0.2, y0 = 0.2, x1 = 0.8, y1 = 0.8, rad = 0.1;
  const outer = inRoundedRect(u, v, x0, y0, x1, y1, rad);
  const t = 0.055;
  const inner = inRoundedRect(u, v, x0 + t, y0 + t, x1 - t, y1 - t, rad - t);

  if (outer && !inner) return [255, 255, 255]; // 相框描边

  if (inner) {
    if (inCircle(u, v, 0.4, 0.4, 0.09)) return [255, 255, 255]; // 太阳
    if (inTriangle(u, v, [0.28, 0.68], [0.5, 0.5], [0.72, 0.68])) return [255, 255, 255]; // 山
    if (u >= 0.28 && u <= 0.72 && v >= 0.68 && v <= 0.74) return [255, 255, 255]; // 山脚
  }

  return [r, g, b];
}

function makePng(size) {
  const raw = Buffer.alloc(size * (1 + size * 3));
  let p = 0;
  for (let y = 0; y < size; y++) {
    raw[p++] = 0; // filter: none
    const v = size === 1 ? 0 : y / (size - 1);
    for (let x = 0; x < size; x++) {
      const u = size === 1 ? 0 : x / (size - 1);
      const [rr, gg, bb] = pixelColor(u, v);
      raw[p++] = Math.round(rr);
      raw[p++] = Math.round(gg);
      raw[p++] = Math.round(bb);
    }
  }

  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(size, 0);
  ihdr.writeUInt32BE(size, 4);
  ihdr[8] = 8; // bit depth
  ihdr[9] = 2; // color type: RGB
  const sig = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);
  const idat = deflateSync(raw, { level: 9 });
  return Buffer.concat([sig, chunk('IHDR', ihdr), chunk('IDAT', idat), chunk('IEND', Buffer.alloc(0))]);
}

const outDir = join(__dirname, '..', 'extension', 'icons');
mkdirSync(outDir, { recursive: true });
for (const s of [16, 48, 128]) {
  writeFileSync(join(outDir, `icon${s}.png`), makePng(s));
  console.log(`generated icon${s}.png`);
}
