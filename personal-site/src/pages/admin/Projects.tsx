import { useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router'
import type { FormEvent } from 'react'
import { getProjects, getProjectBySlug, saveProject, deleteProject } from '@/api'
import type { Project } from '@/types'
import { projectSchema, formErrors } from '@/lib/schemas'
import MarkdownEditor from '@/components/admin/MarkdownEditor'
import { Field, inputClass, btnPrimary, btnGhost, PageHeader, ConfirmDialog } from '@/components/admin/ui'

/** 表单中 tags 用逗号分隔字符串编辑。 */
type ProjectForm = {
  slug: string
  title: string
  summary: string
  cover: string
  tags: string
  links: { label: string; url: string }[]
  date: string
  featured: boolean
  content: string
}

function toForm(p: Project): ProjectForm {
  return {
    slug: p.slug,
    title: p.title,
    summary: p.summary,
    cover: p.cover ?? '',
    tags: (p.tags ?? []).join(', '),
    links: p.links ?? [],
    date: p.date,
    featured: p.featured ?? false,
    content: p.content ?? '',
  }
}

function fromForm(f: ProjectForm): Project {
  return { ...f, tags: f.tags.split(',').map((t) => t.trim()).filter(Boolean) }
}

function today(): string {
  return new Date().toISOString().slice(0, 10)
}

/**
 * 项目管理：列表 + 新建/编辑。
 * /admin/projects 列表；/admin/projects/new 新建；/admin/projects/:slug 编辑。
 */
export default function Projects() {
  const { slug } = useParams<{ slug: string }>()
  const navigate = useNavigate()

  if (slug) {
    return <ProjectEditor slug={slug === 'new' ? undefined : slug} onBack={() => navigate('/admin/projects')} />
  }
  return <ProjectList />
}

function ProjectList() {
  const [projects, setProjects] = useState<Project[]>(() => getProjects())
  const [pending, setPending] = useState<string | null>(null)

  const confirmDelete = () => {
    if (pending) setProjects(deleteProject(pending))
    setPending(null)
  }

  const pendingProject = projects.find((p) => p.slug === pending)

  return (
    <div>
      <PageHeader
        title="项目管理"
        description="管理项目展示内容"
        action={
          <Link to="/admin/projects/new" className={btnPrimary}>
            新建项目
          </Link>
        }
      />

      {projects.length === 0 ? (
        <p className="text-muted">暂无项目。</p>
      ) : (
        <ul className="space-y-3">
          {projects.map((p) => (
            <li
              key={p.slug}
              className="flex items-center justify-between gap-4 rounded-card border border-border bg-surface p-4"
            >
              <div className="min-w-0">
                <p className="truncate font-medium">{p.title}</p>
                <p className="truncate text-sm text-muted">
                  {p.slug} · {p.date}
                </p>
              </div>
              <div className="flex shrink-0 items-center gap-2">
                <Link to={`/admin/projects/${p.slug}`} className={btnGhost}>
                  编辑
                </Link>
                <button
                  type="button"
                  className="text-sm text-red-400 hover:underline"
                  onClick={() => setPending(p.slug)}
                >
                  删除
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}

      <ConfirmDialog
        open={pending !== null}
        title="确认删除"
        message={`确定删除项目「${pendingProject?.title ?? ''}」吗？此操作不可恢复。`}
        onConfirm={confirmDelete}
        onCancel={() => setPending(null)}
      />
    </div>
  )
}

function ProjectEditor({ slug, onBack }: { slug?: string; onBack: () => void }) {
  const existing = slug ? getProjectBySlug(slug) : undefined
  const [form, setForm] = useState<ProjectForm>(() =>
    existing
      ? toForm(existing)
      : { slug: '', title: '', summary: '', cover: '', tags: '', links: [], date: today(), featured: false, content: '' },
  )
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [saved, setSaved] = useState(false)

  const set = (patch: Partial<ProjectForm>) => {
    setForm((f) => ({ ...f, ...patch }))
    setSaved(false)
  }

  const setLink = (i: number, patch: Partial<{ label: string; url: string }>) =>
    set({ links: form.links.map((l, idx) => (idx === i ? { ...l, ...patch } : l)) })

  const onSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const result = projectSchema.safeParse(form)
    if (!result.success) {
      setErrors(formErrors(result.error))
      setSaved(false)
      return
    }
    setErrors({})
    saveProject(fromForm(form))
    setSaved(true)
  }

  return (
    <form onSubmit={onSubmit} noValidate>
      <PageHeader
        title={slug ? '编辑项目' : '新建项目'}
        description="字段带 * 号为必填项"
        action={
          <div className="flex gap-2">
            <button type="button" className={btnGhost} onClick={onBack}>
              返回
            </button>
            <button type="submit" className={btnPrimary}>
              保存
            </button>
          </div>
        }
      />

      {saved && (
        <p className="mb-4 rounded-lg border border-green-700 bg-green-950/40 px-4 py-2 text-sm text-green-300">
          已保存。
        </p>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="标题 *" htmlFor="title" error={errors.title}>
          <input id="title" className={inputClass} value={form.title} onChange={(e) => set({ title: e.target.value })} />
        </Field>
        <Field label="slug *" htmlFor="slug" error={errors.slug}>
          <input
            id="slug"
            className={inputClass}
            value={form.slug}
            onChange={(e) => set({ slug: e.target.value })}
            placeholder="如 my-project"
          />
        </Field>
        <Field label="日期 *" htmlFor="date" error={errors.date}>
          <input id="date" type="date" className={inputClass} value={form.date} onChange={(e) => set({ date: e.target.value })} />
        </Field>
        <Field label="封面 URL" htmlFor="cover">
          <input
            id="cover"
            className={inputClass}
            value={form.cover}
            onChange={(e) => set({ cover: e.target.value })}
            placeholder="https://…（可留空）"
          />
        </Field>
      </div>

      <div className="mt-4">
        <Field label="摘要 *" htmlFor="summary" error={errors.summary}>
          <textarea id="summary" rows={2} className={inputClass} value={form.summary} onChange={(e) => set({ summary: e.target.value })} />
        </Field>
      </div>

      <div className="mt-4">
        <Field label="标签（逗号分隔）" htmlFor="tags">
          <input
            id="tags"
            className={inputClass}
            value={form.tags}
            onChange={(e) => set({ tags: e.target.value })}
            placeholder="如 Java, Spring Boot"
          />
        </Field>
      </div>

      <div className="mt-4">
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" checked={form.featured} onChange={(e) => set({ featured: e.target.checked })} />
          设为精选项目
        </label>
      </div>

      <section className="mt-6">
        <div className="mb-2 flex items-center justify-between">
          <h2 className="font-medium">相关链接</h2>
          <button
            type="button"
            className={btnGhost}
            onClick={() => set({ links: [...form.links, { label: '', url: '' }] })}
          >
            添加链接
          </button>
        </div>
        <div className="space-y-3">
          {form.links.map((link, i) => (
            <div key={i} className="flex gap-3">
              <input
                className={`${inputClass} max-w-40`}
                placeholder="名称（如 GitHub）"
                value={link.label}
                onChange={(e) => setLink(i, { label: e.target.value })}
              />
              <input className={inputClass} placeholder="https://…" value={link.url} onChange={(e) => setLink(i, { url: e.target.value })} />
              <button
                type="button"
                className="shrink-0 text-sm text-red-400 hover:underline"
                onClick={() => set({ links: form.links.filter((_, idx) => idx !== i) })}
              >
                删除
              </button>
            </div>
          ))}
        </div>
      </section>

      <section className="mt-6">
        <h2 className="mb-2 font-medium">正文（Markdown）</h2>
        <MarkdownEditor value={form.content} onChange={(content) => set({ content })} />
      </section>

      <div className="mt-8">
        <button type="submit" className={btnPrimary}>
          保存
        </button>
      </div>
    </form>
  )
}
