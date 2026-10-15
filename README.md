# 电商图片提取下载（Chrome 扩展）

在**淘宝/天猫、京东、拼多多商家版**的商品详情页，一键提取全部商品图片，并在图库页中集中预览、勾选、批量下载为 PNG。

## 目录结构

```
web-summarizer/
├── extension/            # Chrome 扩展本体
│   ├── manifest.json     # Manifest V3 配置
│   ├── content.js        # 注入按钮 + 提取图片
│   ├── content.css       # 按钮样式
│   ├── background.js     # Service Worker（下载 / 转 PNG / 消息转发）
│   ├── gallery.html      # 图库页（展示 + 勾选）
│   ├── gallery.css
│   ├── gallery.js
│   └── icons/            # 16 / 48 / 128 图标
├── website/              # 插件官网（展示页）
│   ├── index.html
│   ├── styles.css
│   └── script.js
├── scripts/gen-icons.mjs # 图标生成脚本（可选）
├── PROMPT.md             # AI 编程提示词
└── README.md
```

## 安装步骤

1. 打开 Chrome，地址栏输入 `chrome://extensions` 并回车。
2. 打开右上角「**开发者模式**」开关。
3. 点击「**加载已解压的扩展程序**」。
4. 选择本项目的 `extension` 文件夹。
5. （建议）点击工具栏拼图图标，把「电商图片提取下载」固定到工具栏。

## 使用方法

1. 打开任意商品详情页：
   - 淘宝/天猫：`item.taobao.com/...`、`detail.tmall.com/...`
   - 京东：`item.jd.com/xxxx.html`
   - 拼多多商家版：`mobile.yangkeduo.com/...`、`mobile.pinduoduo.com/...`
2. 页面右下角会出现「**获取图片**」按钮，点击开始提取。
3. 自动打开图库页，网格化展示所有图片（含尺寸信息）。
4. 勾选需要的图片（支持全选 / 反选），点击「**下载选中**」。
5. 实时查看进度条，完成后显示成功 / 失败数量，图片保存到浏览器默认下载目录，命名 `商品图_001.png`。

## 技术要点

- **Manifest V3**，权限：`activeTab`、`scripting`、`downloads`、`storage`。
- 图片来源：`<img>`、`srcset`、`data-src` / `data-lazy-src` / `data-original` 等懒加载属性、`<picture><source>`、CSS `background-image`。
- 过滤：去重、过滤宽或高小于 100px 的图标/占位图（`MIN_SIZE` 可在 `content.js` 顶部调整）。
- 转 PNG：在 Service Worker 中用 `fetch` + `createImageBitmap` + `OffscreenCanvas` 统一转换，避免页面端 canvas 被 CORS 污染。
- 下载进度：Service Worker 处理时通过 `chrome.runtime.sendMessage` 向图库页实时广播进度。

## 常见问题

**Q1：部分图片下载失败？**
图片通常托管在 CDN（如 `alicdn.com`、`360buyimg.com`、`pddpic.com`）上。`manifest.json` 已内置常见 CDN 域名；若仍失败，请在 `host_permissions` 中追加对应域名，或直接加入 `"*://*/*"` 后，到 `chrome://extensions` 点击「重新加载」再试。

**Q2：按钮没有出现？**
确认当前页面是商品详情页（而非首页/搜索页），且域名在匹配列表内。SPA 页面切换后按钮会自动刷新。

**Q3：图片是 jpg/webp，为什么下载是 png？**
插件会统一通过 canvas 转成 PNG，保证格式一致。

## 本地预览官网

直接用浏览器打开 `website/index.html` 即可预览，无需构建。
