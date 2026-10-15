import { useState } from 'react'
import type { FormEvent } from 'react'
import { getProfile, saveProfile } from '@/api'
import type { Profile, SocialLink, Education, TimelineItem } from '@/types'
import { profileSchema, formErrors } from '@/lib/schemas'
import { Field, inputClass, btnPrimary, btnGhost, PageHeader, ConfirmDialog } from '@/components/admin/ui'

/** timeline 的 tags 在表单中用逗号分隔字符串编辑。 */
type TimelineFormItem = Omit<TimelineItem, 'tags'> & { tags: string }
type ProfileForm = Omit<Profile, 'timeline'> & { timeline: TimelineFormItem[] }

/** 待确认的删除操作。 */
type PendingDelete =
  | { kind: 'social'; index: number }
  | { kind: 'summary'; index: number }
  | { kind: 'timeline'; index: number }
  | { kind: 'education'; index: number }

function toForm(p: Profile): ProfileForm {
  return {
    ...p,
    timeline: p.timeline.map((t) => ({ ...t, tags: (t.tags ?? []).join(', ') })),
  }
}

function fromForm(f: ProfileForm): Profile {
  return {
    ...f,
    timeline: f.timeline.map((t) => ({
      period: t.period,
      title: t.title,
      org: t.org,
      description: t.description,
      tags: t.tags.split(',').map((x) => x.trim()).filter(Boolean),
    })),
  }
}

function updateItem<T>(list: T[], index: number, patch: Partial<T>): T[] {
  return list.map((it, i) => (i === index ? { ...it, ...patch } : it))
}

function removeItem<T>(list: T[], index: number): T[] {
  return list.filter((_, i) => i !== index)
}

/**
 * 个人信息管理：基本信息 + 社交 + 简介 + 经历 + 教育，支持增删改。
 */
export default function Profile() {
  const [form, setForm] = useState<ProfileForm>(() => toForm(getProfile()))
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [saved, setSaved] = useState(false)
  const [pending, setPending] = useState<PendingDelete | null>(null)

  const set = (patch: Partial<ProfileForm>) => {
    setForm((f) => ({ ...f, ...patch }))
    setSaved(false)
  }

  const onSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const result = profileSchema.safeParse(form)
    if (!result.success) {
      setErrors(formErrors(result.error))
      setSaved(false)
      return
    }
    setErrors({})
    saveProfile(fromForm(form))
    setSaved(true)
  }

  const setSocial = (i: number, patch: Partial<SocialLink>) => set({ socials: updateItem(form.socials, i, patch) })
  const setSummary = (i: number, value: string) =>
    set({ summary: form.summary.map((s, idx) => (idx === i ? value : s)) })
  const setTimeline = (i: number, patch: Partial<TimelineFormItem>) =>
    set({ timeline: updateItem(form.timeline, i, patch) })
  const setEducation = (i: number, patch: Partial<Education>) =>
    set({ education: updateItem(form.education, i, patch) })

  const confirmDelete = () => {
    if (!pending) return
    if (pending.kind === 'social') set({ socials: removeItem(form.socials, pending.index) })
    else if (pending.kind === 'summary') set({ summary: removeItem(form.summary, pending.index) })
    else if (pending.kind === 'timeline') set({ timeline: removeItem(form.timeline, pending.index) })
    else set({ education: removeItem(form.education, pending.index) })
    setPending(null)
  }

  return (
    <form onSubmit={onSubmit} noValidate>
      <PageHeader
        title="个人信息"
        description="管理首页 Hero、个人介绍与联系信息"
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

      <div className="grid gap-6 lg:grid-cols-2">
        <Field label="姓名" htmlFor="name" error={errors.name}>
          <input id="name" className={inputClass} value={form.name} onChange={(e) => set({ name: e.target.value })} />
        </Field>
        <Field label="职位" htmlFor="title" error={errors.title}>
          <input id="title" className={inputClass} value={form.title} onChange={(e) => set({ title: e.target.value })} />
        </Field>
        <Field label="一句话介绍" htmlFor="tagline">
          <input id="tagline" className={inputClass} value={form.tagline} onChange={(e) => set({ tagline: e.target.value })} />
        </Field>
        <Field label="邮箱" htmlFor="email" error={errors.email}>
          <input id="email" className={inputClass} value={form.email} onChange={(e) => set({ email: e.target.value })} />
        </Field>
        <Field label="头像 URL" htmlFor="avatar">
          <input id="avatar" className={inputClass} value={form.avatar} onChange={(e) => set({ avatar: e.target.value })} />
        </Field>
        <Field label="简历 URL" htmlFor="resumeUrl">
          <input id="resumeUrl" className={inputClass} value={form.resumeUrl ?? ''} onChange={(e) => set({ resumeUrl: e.target.value })} />
        </Field>
      </div>

      {/* 社交链接 */}
      <section className="mt-8">
        <div className="mb-2 flex items-center justify-between">
          <h2 className="font-medium">社交链接</h2>
          <button type="button" className={btnGhost} onClick={() => set({ socials: [...form.socials, { label: '', url: '' }] })}>
            添加
          </button>
        </div>
        <div className="space-y-3">
          {form.socials.map((s, i) => (
            <div key={i} className="flex gap-3">
              <input className={inputClass} placeholder="名称（如 GitHub）" value={s.label} onChange={(e) => setSocial(i, { label: e.target.value })} />
              <input className={inputClass} placeholder="https://…" value={s.url} onChange={(e) => setSocial(i, { url: e.target.value })} />
              <button type="button" className="text-sm text-red-400 hover:underline" onClick={() => setPending({ kind: 'social', index: i })}>
                删除
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* 简介 */}
      <section className="mt-8">
        <div className="mb-2 flex items-center justify-between">
          <h2 className="font-medium">个人简介</h2>
          <button type="button" className={btnGhost} onClick={() => set({ summary: [...form.summary, ''] })}>
            添加段落
          </button>
        </div>
        <div className="space-y-3">
          {form.summary.map((s, i) => (
            <div key={i} className="flex gap-3">
              <textarea rows={2} className={inputClass} value={s} onChange={(e) => setSummary(i, e.target.value)} />
              <button type="button" className="text-sm text-red-400 hover:underline" onClick={() => setPending({ kind: 'summary', index: i })}>
                删除
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* 经历 */}
      <section className="mt-8">
        <div className="mb-2 flex items-center justify-between">
          <h2 className="font-medium">经历</h2>
          <button
            type="button"
            className={btnGhost}
            onClick={() => set({ timeline: [...form.timeline, { period: '', title: '', org: '', description: '', tags: '' }] })}
          >
            添加经历
          </button>
        </div>
        <div className="space-y-4">
          {form.timeline.map((t, i) => (
            <div key={i} className="rounded-card border border-border bg-surface p-4">
              <div className="grid gap-3 sm:grid-cols-3">
                <input className={inputClass} placeholder="时间（如 2023 – 2027）" value={t.period} onChange={(e) => setTimeline(i, { period: e.target.value })} />
                <input className={inputClass} placeholder="标题" value={t.title} onChange={(e) => setTimeline(i, { title: e.target.value })} />
                <input className={inputClass} placeholder="组织" value={t.org} onChange={(e) => setTimeline(i, { org: e.target.value })} />
              </div>
              <textarea className={`${inputClass} mt-3`} rows={2} placeholder="描述" value={t.description} onChange={(e) => setTimeline(i, { description: e.target.value })} />
              <div className="mt-3 flex items-center gap-3">
                <input className={inputClass} placeholder="标签（逗号分隔）" value={t.tags} onChange={(e) => setTimeline(i, { tags: e.target.value })} />
                <button type="button" className="text-sm text-red-400 hover:underline" onClick={() => setPending({ kind: 'timeline', index: i })}>
                  删除
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 教育 */}
      <section className="mt-8">
        <div className="mb-2 flex items-center justify-between">
          <h2 className="font-medium">教育背景</h2>
          <button
            type="button"
            className={btnGhost}
            onClick={() => set({ education: [...form.education, { school: '', degree: '', period: '' }] })}
          >
            添加教育
          </button>
        </div>
        <div className="space-y-4">
          {form.education.map((edu, i) => (
            <div key={i} className="rounded-card border border-border bg-surface p-4">
              <div className="grid gap-3 sm:grid-cols-3">
                <input className={inputClass} placeholder="学校" value={edu.school} onChange={(e) => setEducation(i, { school: e.target.value })} />
                <input className={inputClass} placeholder="专业 / 学位" value={edu.degree} onChange={(e) => setEducation(i, { degree: e.target.value })} />
                <input className={inputClass} placeholder="时间" value={edu.period} onChange={(e) => setEducation(i, { period: e.target.value })} />
              </div>
              <div className="mt-3 flex items-center gap-3">
                <input className={inputClass} placeholder="备注（可选）" value={edu.note ?? ''} onChange={(e) => setEducation(i, { note: e.target.value })} />
                <button type="button" className="text-sm text-red-400 hover:underline" onClick={() => setPending({ kind: 'education', index: i })}>
                  删除
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      <div className="mt-8">
        <button type="submit" className={btnPrimary}>
          保存
        </button>
      </div>

      <ConfirmDialog
        open={pending !== null}
        title="确认删除"
        message="确定删除该条目吗？此操作不可恢复。"
        onConfirm={confirmDelete}
        onCancel={() => setPending(null)}
      />
    </form>
  )
}
