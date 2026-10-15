import { renderMarkdown } from '@/lib/markdown'

/**
 * Markdown 渲染组件：用于前台详情页与后台实时预览。
 */
export default function Markdown({ content }: { content: string }) {
  return <div className="markdown" dangerouslySetInnerHTML={{ __html: renderMarkdown(content) }} />
}
