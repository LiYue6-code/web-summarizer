import { Link } from 'react-router'
import { useContent } from '@/lib/useContent'

/**
 * 项目展示：卡片网格，点击进入项目详情页。
 */
export default function Projects() {
  const { projects } = useContent()

  return (
    <section id="projects" className="py-16">
      <h2 className="text-2xl font-semibold">项目展示</h2>

      <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {projects.map((project) => (
          <Link
            key={project.slug}
            to={`/projects/${project.slug}`}
            className="flex flex-col rounded-card border border-border bg-surface p-6 transition hover:-translate-y-0.5 hover:border-muted"
          >
            <h3 className="font-medium">{project.title}</h3>
            <p className="mt-2 flex-1 text-sm text-muted">{project.summary}</p>
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
          </Link>
        ))}
      </div>
    </section>
  )
}
