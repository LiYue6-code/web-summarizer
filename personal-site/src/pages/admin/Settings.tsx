import { useState } from 'react'
import type { FormEvent } from 'react'
import { getSettings, saveSettings } from '@/api'
import { settingsSchema, formErrors } from '@/lib/schemas'
import { Field, inputClass, btnPrimary, PageHeader } from '@/components/admin/ui'

/**
 * 站点设置：配置全局主题色等选项。
 */
export default function Settings() {
  const [accentColor, setAccentColor] = useState(() => getSettings().accentColor)
  const [error, setError] = useState('')
  const [saved, setSaved] = useState(false)

  const update = (value: string) => {
    setAccentColor(value)
    setSaved(false)
  }

  const onSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const result = settingsSchema.safeParse({ accentColor })
    if (!result.success) {
      setError(formErrors(result.error).accentColor ?? '请选择主题色')
      setSaved(false)
      return
    }
    setError('')
    saveSettings({ accentColor })
    setSaved(true)
  }

  return (
    <form onSubmit={onSubmit} noValidate>
      <PageHeader
        title="站点设置"
        description="配置站点全局选项"
        action={
          <button type="submit" className={btnPrimary}>
            保存
          </button>
        }
      />

      {saved && (
        <p className="mb-4 rounded-lg border border-green-700 bg-green-950/40 px-4 py-2 text-sm text-green-300">
          已保存。
        </p>
      )}

      <Field label="强调色" htmlFor="accentColor" error={error}>
        <div className="flex items-center gap-3">
          <input
            id="accentColor"
            type="color"
            value={accentColor}
            onChange={(e) => update(e.target.value)}
            className="h-10 w-16 cursor-pointer rounded border border-border bg-transparent"
          />
          <input
            className={`${inputClass} max-w-40`}
            value={accentColor}
            onChange={(e) => update(e.target.value)}
            placeholder="#6c8cff"
          />
        </div>
      </Field>

      <div className="mt-8">
        <button type="submit" className={btnPrimary}>
          保存
        </button>
      </div>
    </form>
  )
}
