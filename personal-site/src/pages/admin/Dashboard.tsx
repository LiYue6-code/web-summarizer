import { Link } from 'react-router'
import { useContent } from '@/lib/useContent'

/**
 * 后台仪表盘：内容统计概览。
 */
export default function Dashboard() {
  const { projects, posts, skills } = useContent()
  const skillCount = skills.reduce((n, c) => n + c.items.length, 0)

  const stats = [
    { label: '项目', value: projects.length, to: '/admin/projects' },
    { label: '文章', value: posts.length, to: '/admin/posts' },
    { label: '技能分类', value: skills.length, to: '/admin/skills' },
    { label: '技能条目', value: skillCount, to: '/admin/skills' },
  ]

  return (
    <div>
      <h1 className="text-2xl font-bold">仪表盘</h1>
      <p className="mt-1 text-sm text-muted">内容统计概览</p>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((s) => (
          <Link
            key={s.label}
            to={s.to}
            className="rounded-card border border-border bg-surface p-5 transition hover:-translate-y-0.5 hover:border-muted"
          >
            <p className="text-sm text-muted">{s.label}</p>
            <p className="mt-2 text-3xl font-bold">{s.value}</p>
          </Link>
        ))}
      </div>
    </div>
  )
}
