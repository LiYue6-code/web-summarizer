import { useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router'
import type { FormEvent } from 'react'
import { getPosts, savePost, deletePost } from '@/api'
import type { Post } from '@/types'
import { postSchema, formErrors } from '@/lib/schemas'
import MarkdownEditor from '@/components/admin/MarkdownEditor'
import { Field, inputClass, btnPrimary, btnGhost, PageHeader, ConfirmDialog } from '@/components/admin/ui'

/** 表单中 tags 用逗号分隔字符串编辑。 */
type PostForm = {
  slug: string
  title: string
  excerpt: string
  date: string
  tags: string
  draft: boolean
  content: string
}

function toForm(p: Post): PostForm {
  return {
    slug: p.slug,
    title: p.title,
    excerpt: p.excerpt,
    date: p.date,
    tags: (p.tags ?? []).join(', '),
    draft: p.draft ?? false,
    content: p.content ?? '',
  }
}

function fromForm(f: PostForm): Post {
  return { ...f, tags: f.tags.split(',').map((t) => t.trim()).filter(Boolean) }
}

function today(): string {
  return new Date().toISOString().slice(0, 10)
}

/**
 * 博客管理：列表 + 新建/编辑。
 * /admin/posts 列表；/admin/posts/new 新建；/admin/posts/:slug 编辑。
 */
export default function Posts() {
  const { slug } = useParams<{ slug: string }>()
  const navigate = useNavigate()

  if (slug) {
    return <PostEditor slug={slug === 'new' ? undefined : slug} onBack={() => navigate('/admin/posts')} />
  }
  return <PostList />
}

function PostList() {
  const [posts, setPosts] = useState<Post[]>(() => getPosts())
  const [pending, setPending] = useState<string | null>(null)

  const confirmDelete = () => {
    if (pending) setPosts(deletePost(pending))
    setPending(null)
  }

  const pendingPost = posts.find((p) => p.slug === pending)

  return (
    <div>
      <PageHeader
        title="博客管理"
        description="管理博客文章（草稿不会在前台展示）"
        action={
          <Link to="/admin/posts/new" className={btnPrimary}>
            新建文章
          </Link>
        }
      />

      {posts.length === 0 ? (
        <p className="text-muted">暂无文章。</p>
      ) : (
        <ul className="space-y-3">
          {posts.map((p) => (
            <li
              key={p.slug}
              className="flex items-center justify-between gap-4 rounded-card border border-border bg-surface p-4"
            >
              <div className="min-w-0">
                <p className="truncate font-medium">
                  {p.draft && (
                    <span className="mr-2 rounded-full border border-border px-2 py-0.5 text-xs text-muted">
                      草稿
                    </span>
                  )}
                  {p.title}
                </p>
                <p className="truncate text-sm text-muted">
                  {p.slug} · {p.date}
                </p>
              </div>
              <div className="flex shrink-0 items-center gap-2">
                <Link to={`/admin/posts/${p.slug}`} className={btnGhost}>
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
        message={`确定删除文章「${pendingPost?.title ?? ''}」吗？此操作不可恢复。`}
        onConfirm={confirmDelete}
        onCancel={() => setPending(null)}
      />
    </div>
  )
}

function PostEditor({ slug, onBack }: { slug?: string; onBack: () => void }) {
  // 管理端需要读到草稿，故直接遍历全量文章（getPostBySlug 会过滤草稿）。
  const existing = slug ? getPosts().find((p) => p.slug === slug) : undefined
  const [form, setForm] = useState<PostForm>(() =>
    existing
      ? toForm(existing)
      : { slug: '', title: '', excerpt: '', date: today(), tags: '', draft: false, content: '' },
  )
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [saved, setSaved] = useState(false)

  const set = (patch: Partial<PostForm>) => {
    setForm((f) => ({ ...f, ...patch }))
    setSaved(false)
  }

  const onSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const result = postSchema.safeParse(form)
    if (!result.success) {
      setErrors(formErrors(result.error))
      setSaved(false)
      return
    }
    setErrors({})
    savePost(fromForm(form))
    setSaved(true)
  }

  return (
    <form onSubmit={onSubmit} noValidate>
      <PageHeader
        title={slug ? '编辑文章' : '新建文章'}
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
            placeholder="如 my-first-post"
          />
        </Field>
        <Field label="日期 *" htmlFor="date" error={errors.date}>
          <input id="date" type="date" className={inputClass} value={form.date} onChange={(e) => set({ date: e.target.value })} />
        </Field>
      </div>

      <div className="mt-4">
        <Field label="摘要 *" htmlFor="excerpt" error={errors.excerpt}>
          <textarea id="excerpt" rows={2} className={inputClass} value={form.excerpt} onChange={(e) => set({ excerpt: e.target.value })} />
        </Field>
      </div>

      <div className="mt-4">
        <Field label="标签（逗号分隔）" htmlFor="tags">
          <input
            id="tags"
            className={inputClass}
            value={form.tags}
            onChange={(e) => set({ tags: e.target.value })}
            placeholder="如 Spring Boot, Java"
          />
        </Field>
      </div>

      <div className="mt-4">
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" checked={form.draft} onChange={(e) => set({ draft: e.target.checked })} />
          设为草稿（草稿不会在前台展示）
        </label>
      </div>

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
