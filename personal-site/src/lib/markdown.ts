import { marked } from 'marked'
import DOMPurify from 'dompurify'

/**
 * 把 Markdown 渲染为安全的 HTML（先 marked 解析，再 DOMPurify 消毒防 XSS）。
 */
export function renderMarkdown(src: string): string {
  const raw = marked.parse(src ?? '', { async: false }) as string
  return DOMPurify.sanitize(raw)
}
