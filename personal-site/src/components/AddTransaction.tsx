import { useState } from 'react'
import type { FormEvent } from 'react'
import { validateRecordForm } from '@/lib/validation'
import type { FieldErrors } from '@/lib/validation'
import { createId, saveRecord } from '@/lib/storage'
import type { RecordFormValues } from '@/types'

// 模块级计算，避免在组件渲染期间调用 new Date()（保持组件纯净）。
const initialDate = new Date().toISOString().slice(0, 10)

const inputClass =
  'w-full rounded-lg border border-border bg-surface px-3 py-2 text-foreground placeholder:text-muted focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent'

type Status = 'idle' | 'success' | 'error'

/**
 * 添加记录表单：标题 / 日期 / 标签 / 摘要 / 正文，含校验与提交反馈。
 * 提交成功后写入浏览器本地存储（当前无后端）。
 */
export default function AddTransaction() {
  const [values, setValues] = useState<RecordFormValues>({
    title: '',
    excerpt: '',
    date: initialDate,
    tags: '',
    content: '',
  })
  const [errors, setErrors] = useState<FieldErrors>({})
  const [status, setStatus] = useState<Status>('idle')
  const [submitting, setSubmitting] = useState(false)

  const update = (field: keyof RecordFormValues, value: string) => {
    setValues((prev) => ({ ...prev, [field]: value }))
    setErrors((prev) => {
      const next = { ...prev }
      delete next[field]
      return next
    })
  }

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setStatus('idle')

    const nextErrors = validateRecordForm(values)
    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors)
      return
    }

    setSubmitting(true)
    try {
      saveRecord({
        id: createId(),
        title: values.title.trim(),
        excerpt: values.excerpt.trim(),
        date: values.date,
        tags: values.tags
          .split(',')
          .map((t) => t.trim())
          .filter(Boolean),
        content: values.content.trim(),
        createdAt: new Date().toISOString(),
      })
      setStatus('success')
      setValues({ title: '', excerpt: '', date: initialDate, tags: '', content: '' })
    } catch {
      setStatus('error')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-6">
      {status === 'success' && (
        <div
          role="status"
          className="rounded-lg border border-green-700 bg-green-950/40 px-4 py-3 text-sm text-green-300"
        >
          记录已添加成功。
        </div>
      )}
      {status === 'error' && (
        <div
          role="alert"
          className="rounded-lg border border-red-800 bg-red-950/40 px-4 py-3 text-sm text-red-300"
        >
          提交失败，请重试。
        </div>
      )}

      <div>
        <label htmlFor="title" className="mb-1.5 block text-sm font-medium">
          标题
        </label>
        <input
          id="title"
          type="text"
          value={values.title}
          onChange={(e) => update('title', e.target.value)}
          aria-invalid={Boolean(errors.title)}
          aria-describedby={errors.title ? 'title-error' : undefined}
          className={inputClass}
          placeholder="请输入标题"
        />
        {errors.title && (
          <p id="title-error" className="mt-1 text-sm text-red-400">
            {errors.title}
          </p>
        )}
      </div>

      <div>
        <label htmlFor="date" className="mb-1.5 block text-sm font-medium">
          日期
        </label>
        <input
          id="date"
          type="date"
          value={values.date}
          onChange={(e) => update('date', e.target.value)}
          aria-invalid={Boolean(errors.date)}
          aria-describedby={errors.date ? 'date-error' : undefined}
          className={inputClass}
        />
        {errors.date && (
          <p id="date-error" className="mt-1 text-sm text-red-400">
            {errors.date}
          </p>
        )}
      </div>

      <div>
        <label htmlFor="tags" className="mb-1.5 block text-sm font-medium">
          标签（用逗号分隔）
        </label>
        <input
          id="tags"
          type="text"
          value={values.tags}
          onChange={(e) => update('tags', e.target.value)}
          className={inputClass}
          placeholder="例如：前端, React"
        />
      </div>

      <div>
        <label htmlFor="excerpt" className="mb-1.5 block text-sm font-medium">
          摘要
        </label>
        <textarea
          id="excerpt"
          rows={2}
          value={values.excerpt}
          onChange={(e) => update('excerpt', e.target.value)}
          className={inputClass}
          placeholder="一句话简介（可选）"
        />
      </div>

      <div>
        <label htmlFor="content" className="mb-1.5 block text-sm font-medium">
          正文
        </label>
        <textarea
          id="content"
          rows={6}
          value={values.content}
          onChange={(e) => update('content', e.target.value)}
          aria-invalid={Boolean(errors.content)}
          aria-describedby={errors.content ? 'content-error' : undefined}
          className={inputClass}
          placeholder="请输入正文内容"
        />
        {errors.content && (
          <p id="content-error" className="mt-1 text-sm text-red-400">
            {errors.content}
          </p>
        )}
      </div>

      <button
        type="submit"
        disabled={submitting}
        className="rounded-full bg-accent px-6 py-2.5 font-medium text-background transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {submitting ? '提交中…' : '提交'}
      </button>
    </form>
  )
}
