import type { ReactNode } from 'react'

/** 后台共用的输入框样式。 */
export const inputClass =
  'w-full rounded-lg border border-border bg-background px-3 py-2 text-foreground placeholder:text-muted focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent'

export const labelClass = 'mb-1.5 block text-sm font-medium'

export const btnPrimary =
  'rounded-full bg-accent px-5 py-2 text-sm font-medium text-background transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50'

export const btnGhost = 'rounded-full border border-border px-5 py-2 text-sm transition hover:border-muted'

/** 带标签与错误提示的表单字段容器。 */
export function Field({
  label,
  htmlFor,
  error,
  children,
}: {
  label: string
  htmlFor?: string
  error?: string
  children: ReactNode
}) {
  return (
    <div>
      <label htmlFor={htmlFor} className={labelClass}>
        {label}
      </label>
      {children}
      {error && <p className="mt-1 text-sm text-red-400">{error}</p>}
    </div>
  )
}

/** 页面标题 + 描述 + 右侧操作区。 */
export function PageHeader({
  title,
  description,
  action,
}: {
  title: string
  description?: string
  action?: ReactNode
}) {
  return (
    <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
      <div>
        <h1 className="text-2xl font-bold">{title}</h1>
        {description && <p className="mt-1 text-sm text-muted">{description}</p>}
      </div>
      {action}
    </div>
  )
}

/** 删除二次确认弹窗。 */
export function ConfirmDialog({
  open,
  title,
  message,
  onConfirm,
  onCancel,
}: {
  open: boolean
  title: string
  message: string
  onConfirm: () => void
  onCancel: () => void
}) {
  if (!open) return null
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
      onClick={onCancel}
    >
      <div
        className="w-full max-w-sm rounded-card border border-border bg-surface p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-lg font-semibold">{title}</h2>
        <p className="mt-2 text-sm text-muted">{message}</p>
        <div className="mt-6 flex justify-end gap-3">
          <button type="button" className={btnGhost} onClick={onCancel}>
            取消
          </button>
          <button
            type="button"
            className="rounded-full bg-red-600 px-5 py-2 text-sm font-medium text-white transition hover:opacity-90"
            onClick={onConfirm}
          >
            确认删除
          </button>
        </div>
      </div>
    </div>
  )
}
