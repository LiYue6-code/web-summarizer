# 电商图片下载插件 —— AI 编程提示词（可直接投喂给 AI）

> 说明：以下是提炼后的完整提示词，已把「进度提示 / 结果反馈 / 官网」等需求一并补全。可直接复制给任意 AI 编程工具使用。

---

## 角色设定

你是一位拥有 10 年以上经验的资深 Chrome 扩展开发工程师，精通 Manifest V3、Content Script、Service Worker、`chrome.downloads` / `chrome.storage` / `chrome.runtime` API、`OffscreenCanvas` 图片处理，以及现代前端交互与响应式设计。你擅长把需求拆解为清晰、模块化的文件结构，输出可直接加载运行、零报错、中文注释完善的生产级代码。

## 任务目标

开发一个 Chrome 浏览器扩展「电商图片提取下载插件」，支持在淘宝/天猫、京东、拼多多商家版（拼多多、洋码头域名）的**商品详情页**一键提取页面内所有商品图片，在新标签页中集中展示、勾选，并批量下载为 PNG 格式，全程提供下载进度提示与结果反馈。同时生成一个用于展示该插件的**单页官网**。

## 功能需求

1. 悬浮按钮（content script）
   - 仅在三个平台的商品详情页右下角悬浮显示，文案「获取图片」。
   - 圆角、带阴影、hover 有反馈、不遮挡页面原有操作；非详情页不显示。
   - 适配 SPA 路由切换，进入/离开详情页时按钮随之显示/隐藏。
2. 图片提取
   - 扫描 `<img>`、`srcset`、`data-src` / `data-lazy-src` / `data-original` 等懒加载属性、`<picture><source>`、CSS `background-image` 背景图。
   - 相对路径补全为绝对 URL，按 URL 去重。
   - 过滤图标、logo、占位图、1×1 像素图、宽或高小于 100px 的图片。
   - 通过 `chrome.runtime.sendMessage` 把图片列表传给扩展。
3. 新页面展示（gallery.html）
   - 网格化展示所有图片，每张显示缩略图、尺寸信息、复选框。
   - 顶部提供：全选 / 反选 / 已选数量显示 / 「下载选中」按钮；响应式网格布局。
4. 下载（service worker）
   - 勾选后批量下载；在 service worker 中用 `fetch` + `createImageBitmap` + `OffscreenCanvas` 统一转换为 PNG。
   - 文件名规则 `商品图_001.png`（序号补零）；用 `chrome.downloads.download` 保存到默认下载目录。
   - 下载过程实时进度（已完成/总数、成功/失败数量），完成后给出结果反馈。
5. 官网（website/）
   - 单页响应式落地页，展示插件功能、支持平台、安装教程，视觉风格与插件一致。

## 技术约束

- 使用 Manifest V3；权限 `activeTab`、`scripting`、`downloads`、`storage`；`host_permissions` 覆盖三平台域名及常见图片 CDN 域名。
- 匹配域名：
  - 淘宝：`*://*.taobao.com/*`、`*://*.tmall.com/*`
  - 京东：`*://*.jd.com/*`
  - 拼多多商家版：`*://*.pinduoduo.com/*`、`*://*.yangkeduo.com/*`
- 图片转 PNG 若遇到跨域问题，在 service worker 中通过 `fetch` + `createImageBitmap` 处理，并在 manifest 中声明对应 host 权限。
- 代码需模块化、有中文注释、可直接加载到 `chrome://extensions` 运行。

## 测试

开发完成后逐项自测：按钮注入与隐藏、提取完整性、过滤正确性、图库渲染、全选/反选/勾选、批量下载、PNG 格式与命名、进度与结果反馈、跨域图片下载。

## 交付物

`manifest.json` / `content.js` / `content.css` / `background.js` / `gallery.html` / `gallery.js` / `gallery.css` / `icons`（16/48/128）/ `website`（官网）/ `README` 安装使用说明。

## 输出要求

- 先给出整体文件结构与实现思路，再逐个文件输出完整代码。
- 代码要能直接运行，不要伪代码；关键逻辑加中文注释；平台差异（如懒加载属性不同）做兼容处理。
