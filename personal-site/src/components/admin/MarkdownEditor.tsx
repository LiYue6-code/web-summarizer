import { useRef } from 'react'
import Markdown from '@/components/Markdown'
import { inputClass } from './ui'

const tools: { label: string; prefix: string; suffix: string; placeholder: string }[] = [
  { label: 'H2', prefix: '## ', suffix: '', placeholder: '标题' },
  { label: 'B', prefix: '**', suffix: '**', placeholder: '加粗' },
  { label: 'I', prefix: '*', suffix: '*', placeholder: '斜体' },
  { label: '代码', prefix: '`', suffix: '`', placeholder: 'code' },
  { label: '代码块', prefix: '```\n', suffix: '\n```', placeholder: '代码块' },
  { label: '列表', prefix: '- ', suffix: '', placeholder: '列表项' },
  { label: '链接', prefix: '[', suffix: '](url)', placeholder: '链接文字' },
]

/**
 * Markdown 编辑器：工具栏 + 文本域 + 实时预览。
 */
export default function MarkdownEditor({
  value,
  onChange,
}: {
  value: string
  onChange: (value: string) => void
}) {
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const apply = (prefix: string, suffix: string, placeholder: string) => {
    const ta = textareaRef.current
    const start = ta?.selectionStart ?? value.length
    const end = ta?.selectionEnd ?? value.length
    const selected = value.slice(start, end) || placeholder
    const next = value.slice(0, start) + prefix + selected + suffix + value.slice(end)
    onChange(next)
    requestAnimationFrame(() => {
      ta?.focus()
      ta?.setSelectionRange(start + prefix.length, start + prefix.length + selected.length)
    })
  }

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <div>
        <div className="mb-2 flex flex-wrap gap-1">
          {tools.map((t) => (
            <button
              key={t.label}
              type="button"
              onClick={() => apply(t.prefix, t.suffix, t.placeholder)}
              className="rounded border border-border px-2 py-1 text-xs text-muted transition-colors hover:text-foreground"
            >
              {t.label}
            </button>
          ))}
        </div>
        <textarea
          ref={textareaRef}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          rows={16}
          className={inputClass}
          placeholder="支持 Markdown 语法……"
        />
      </div>
      <div className="rounded-lg border border-border bg-background p-4">
        <p className="mb-2 text-xs text-muted">预览</p>
        <Markdown content={value} />
      </div>
    </div>
  )
}
