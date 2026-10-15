import { Link, useParams } from 'react-router'
import { getProjectBySlug } from '@/api'

/**
 * 项目详情页：标题、标签、链接与正文。
 */
export default function ProjectDetail() {
  const { slug } = useParams<{ slug: string }>()
  const project = getProjectBySlug(slug ?? '')

  if (!project) {
    return (
      <div className="py-16">
        <p className="text-muted">未找到该项目。</p>
        <Link to="/#projects" className="mt-4 inline-block text-accent hover:underline">
          ← 返回项目
        </Link>
      </div>
    )
  }

  return (
    <article className="py-16">
      <Link to="/#projects" className="text-sm text-accent hover:underline">
        ← 返回项目
      </Link>
      <h1 className="mt-4 text-3xl font-bold">{project.title}</h1>
      <p className="mt-2 text-sm text-muted">
        <time dateTime={project.date}>{project.date}</time>
      </p>

      <div className="mt-4 flex flex-wrap gap-2">
        {project.tags.map((tag) => (
          <span
            key={tag}
            className="rounded-full border border-border px-2 py-0.5 text-xs text-muted"
          >
            {tag}
          </span>
        ))}
      </div>

      <p className="mt-6 max-w-3xl text-lg text-foreground">{project.summary}</p>

      {project.links.length > 0 && (
        <div className="mt-4 flex flex-wrap gap-4">
          {project.links.map((link) => (
            <a
              key={link.label}
              href={link.url}
              target="_blank"
              rel="noreferrer"
              className="text-sm text-accent hover:underline"
            >
              {link.label} ↗
            </a>
          ))}
        </div>
      )}

      <div className="mt-8 max-w-3xl space-y-4">
        {(project.content ?? '').split('\n\n').map((p, i) => (
          <p key={i} className="leading-relaxed text-muted">
            {p}
          </p>
        ))}
      </div>
    </article>
  )
}
