import { useState } from 'react'
import { getSkills, saveSkills } from '@/api'
import type { SkillCategory, Skill } from '@/types'
import { skillCategoriesSchema, formErrors } from '@/lib/schemas'
import { inputClass, btnPrimary, btnGhost, PageHeader, ConfirmDialog } from '@/components/admin/ui'
import type { FormEvent } from 'react'

/** 待确认的删除操作。 */
type PendingDelete = { kind: 'category'; index: number } | { kind: 'item'; ci: number; ii: number } | null

/**
 * 技能管理：分类 + 条目增删改，实时保存。
 */
export default function Skills() {
  const [categories, setCategories] = useState<SkillCategory[]>(() => getSkills())
  const [error, setError] = useState('')
  const [saved, setSaved] = useState(false)
  const [pending, setPending] = useState<PendingDelete>(null)

  const persist = (next: SkillCategory[]) => {
    setCategories(next)
    setSaved(false)
  }

  const updateCategory = (ci: number, patch: Partial<SkillCategory>) =>
    categories.map((c, i) => (i === ci ? { ...c, ...patch } : c))
  const updateItem = (ci: number, ii: number, patch: Partial<Skill>) =>
    categories.map((c, i) =>
      i === ci ? { ...c, items: c.items.map((it, j) => (j === ii ? { ...it, ...patch } : it)) } : c,
    )

  const onSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const result = skillCategoriesSchema.safeParse(categories)
    if (!result.success) {
      setError(Object.values(formErrors(result.error))[0] ?? '数据有误')
      setSaved(false)
      return
    }
    setError('')
    saveSkills(categories)
    setSaved(true)
  }

  const confirmDelete = () => {
    if (!pending) return
    if (pending.kind === 'category') {
      persist(categories.filter((_, i) => i !== pending.index))
    } else {
      persist(
        categories.map((c, i) =>
          i === pending.ci ? { ...c, items: c.items.filter((_, j) => j !== pending.ii) } : c,
        ),
      )
    }
    setPending(null)
  }

  return (
    <form onSubmit={onSubmit} noValidate>
      <PageHeader
        title="技能管理"
        description="管理技能分类、条目与熟练度（1–5）"
        action={
          <button
            type="button"
            className={btnGhost}
            onClick={() => persist([...categories, { category: '', items: [] }])}
          >
            添加分类
          </button>
        }
      />

      {saved && (
        <p className="mb-4 rounded-lg border border-green-700 bg-green-950/40 px-4 py-2 text-sm text-green-300">
          已保存。
        </p>
      )}
      {error && (
        <p className="mb-4 rounded-lg border border-red-800 bg-red-950/40 px-4 py-2 text-sm text-red-300">
          {error}
        </p>
      )}

      <div className="space-y-6">
        {categories.map((cat, ci) => (
          <div key={ci} className="rounded-card border border-border bg-surface p-5">
            <div className="flex items-center gap-3">
              <input
                className={`${inputClass} max-w-xs`}
                placeholder="分类名（如 后端）"
                value={cat.category}
                onChange={(e) => persist(updateCategory(ci, { category: e.target.value }))}
              />
              <button
                type="button"
                className="text-sm text-red-400 hover:underline"
                onClick={() => setPending({ kind: 'category', index: ci })}
              >
                删除分类
              </button>
            </div>

            <div className="mt-4 space-y-3">
              {cat.items.map((skill, ii) => (
                <div key={ii} className="flex flex-wrap items-center gap-3">
                  <input
                    className={`${inputClass} max-w-48`}
                    placeholder="名称"
                    value={skill.name}
                    onChange={(e) => persist(updateItem(ci, ii, { name: e.target.value }))}
                  />
                  <input
                    className={`${inputClass} max-w-40`}
                    placeholder="图标标识"
                    value={skill.icon}
                    onChange={(e) => persist(updateItem(ci, ii, { icon: e.target.value }))}
                  />
                  <select
                    className={`${inputClass} w-24`}
                    value={skill.level}
                    onChange={(e) =>
                      persist(updateItem(ci, ii, { level: Number(e.target.value) as Skill['level'] }))
                    }
                  >
                    {[1, 2, 3, 4, 5].map((n) => (
                      <option key={n} value={n}>
                        {n}
                      </option>
                    ))}
                  </select>
                  <button
                    type="button"
                    className="text-sm text-red-400 hover:underline"
                    onClick={() => setPending({ kind: 'item', ci, ii })}
                  >
                    删除
                  </button>
                </div>
              ))}
            </div>

            <button
              type="button"
              className={`${btnGhost} mt-4`}
              onClick={() =>
                persist(
                  categories.map((c, i) =>
                    i === ci ? { ...c, items: [...c.items, { name: '', icon: '', level: 3 }] } : c,
                  ),
                )
              }
            >
              添加技能
            </button>
          </div>
        ))}
      </div>

      <div className="mt-8">
        <button type="submit" className={btnPrimary}>
          保存全部
        </button>
      </div>

      <ConfirmDialog
        open={pending !== null}
        title="确认删除"
        message={pending?.kind === 'category' ? '确定删除该分类及其所有技能吗？' : '确定删除该技能条目吗？'}
        onConfirm={confirmDelete}
        onCancel={() => setPending(null)}
      />
    </form>
  )
}
