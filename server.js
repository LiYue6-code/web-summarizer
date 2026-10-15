import 'dotenv/config';
import express from 'express';
import { Readability } from '@mozilla/readability';
import { JSDOM } from 'jsdom';

const app = express();
const PORT = process.env.PORT || 3000;

const DEEPSEEK_API_KEY = process.env.DEEPSEEK_API_KEY;
const DEEPSEEK_MODEL = process.env.DEEPSEEK_MODEL || 'deepseek-flash';
const DEEPSEEK_BASE_URL = 'https://api.deepseek.com';
// 正文截断长度，避免超出模型上下文、也控制成本
const MAX_INPUT_CHARS = 8000;
// 网页 HTML 最大解析长度，防止超大页面拖慢速度
const MAX_HTML_CHARS = 2_000_000;

app.use(express.json());
app.use(express.static('dist'));

// 兜底提示：前端尚未构建时给出说明（开发环境请用 npm run dev）
app.get('/', (req, res) => {
  res.send('前端尚未构建。开发环境请运行 <code>npm run dev</code>；生产环境请先运行 <code>npm run build</code> 再启动。');
});

// 规范化网址：补全协议、校验格式
function normalizeUrl(raw) {
  let url = String(raw || '').trim();
  if (!url) return null;
  if (!/^https?:\/\//i.test(url)) url = 'https://' + url;
  try {
    return new URL(url).href;
  } catch {
    return null;
  }
}

// 抓取网页 HTML
async function fetchHtml(url) {
  const res = await fetch(url, {
    headers: {
      'User-Agent':
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
      Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
      'Accept-Language': 'zh-CN,zh;q=0.9,en;q=0.8'
    },
    redirect: 'follow',
    signal: AbortSignal.timeout(20000)
  });

  if (!res.ok) {
    throw new Error(`网页请求失败（状态码 ${res.status}）`);
  }

  const contentType = res.headers.get('content-type') || '';
  if (!contentType.includes('text/html') && !contentType.includes('application/xhtml+xml')) {
    throw new Error('该链接返回的不是网页（可能是图片、文件等）');
  }

  let html = await res.text();
  if (html.length > MAX_HTML_CHARS) html = html.slice(0, MAX_HTML_CHARS);
  return html;
}

// 提取正文（火狐"阅读模式"同款算法）
function extractArticle(html, url) {
  const dom = new JSDOM(html, { url });
  const reader = new Readability(dom.window.document);
  const article = reader.parse();

  if (!article || !article.textContent || article.textContent.trim().length < 50) {
    throw new Error('未能从该网页提取到正文（可能是登录页或纯动态页面）');
  }

  return {
    title: (article.title || '').trim() || '无标题',
    text: article.textContent.trim()
  };
}

// 调用 DeepSeek 生成中文摘要
async function summarize(title, text) {
  const prompt = [
    '请阅读下面的网页内容，并用中文生成一段简洁、准确的摘要。',
    '要求：',
    '1. 先写一句话概括核心内容；',
    '2. 再用 3~5 个要点列出关键信息（每个要点另起一行，用数字编号，例如 "1. ..."）；',
    '3. 总字数控制在 300 字以内；',
    '4. 若原文是英文，请先翻译成中文再总结；',
    '5. 请使用纯文本输出，不要使用 Markdown 语法（不要出现 #、*、- 等符号）。',
    '',
    '【标题】' + title,
    '',
    '【正文】',
    text
  ].join('\n');

  const aiRes = await fetch(`${DEEPSEEK_BASE_URL}/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${DEEPSEEK_API_KEY}`
    },
    body: JSON.stringify({
      model: DEEPSEEK_MODEL,
      messages: [
        { role: 'system', content: '你是一个专业的内容总结助手，擅长用中文提炼网页要点。' },
        { role: 'user', content: prompt }
      ],
      thinking: { type: 'disabled' },
      temperature: 0.3,
      max_tokens: 900,
      stream: false
    })
  });

  if (!aiRes.ok) {
    const errText = await aiRes.text().catch(() => '');
    throw new Error(`AI 服务返回错误（${aiRes.status}）${errText ? '：' + errText.slice(0, 300) : ''}`);
  }

  const data = await aiRes.json();
  const summary = data?.choices?.[0]?.message?.content;
  if (!summary) throw new Error('AI 未返回有效摘要');
  return summary.trim();
}

app.post('/api/summarize', async (req, res) => {
  const url = normalizeUrl(req.body?.url);
  if (!url) {
    return res.status(400).json({ error: '网址格式不正确，请检查后重试' });
  }
  if (!DEEPSEEK_API_KEY) {
    return res.status(500).json({ error: '服务器未配置 DeepSeek API Key（请填写 .env 文件）' });
  }

  try {
    const html = await fetchHtml(url);
    const { title, text } = extractArticle(html, url);
    const clipped = text.slice(0, MAX_INPUT_CHARS);
    const summary = await summarize(title, clipped);
    res.json({ title, summary, charCount: text.length });
  } catch (err) {
    console.error('[summarize] 失败：', err.message);
    res.status(500).json({ error: err.message || '处理失败，请稍后重试' });
  }
});

app.listen(PORT, () => {
  console.log(`✅ 网页总结工具已启动：http://localhost:${PORT}`);
});
