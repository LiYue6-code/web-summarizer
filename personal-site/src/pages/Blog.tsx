import { Link } from 'react-router'
import { useContent } from '@/lib/useContent'

/**
 * 博客列表页（仅展示已发布文章）。
 */
export default function Blog() {
  const { posts } = useContent()
  const published = posts.filter((p) => !p.draft)

  return (
    <div className="py-16">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">博客</h1>
        <Link to="/add" className="text-sm text-accent hover:underline">
          写文章
        </Link>
      </div>
      {published.length === 0 ? (
        <p className="mt-8 text-muted">暂无文章。</p>
      ) : (
        <ul className="mt-8 space-y-4">
          {published.map((post) => (
            <li key={post.slug}>
              <Link
                to={`/blog/${post.slug}`}
                className="block rounded-card border border-border bg-surface p-6 transition hover:-translate-y-0.5 hover:border-muted"
              >
                <h2 className="text-xl font-medium">{post.title}</h2>
                <p className="mt-2 text-muted">{post.excerpt}</p>
                <div className="mt-3 flex flex-wrap items-center gap-2 text-sm text-muted">
                  <time dateTime={post.date}>{post.date}</time>
                  {post.tags.map((tag) => (
                    <span key={tag} className="rounded-full border border-border px-2 py-0.5 text-xs">
                      {tag}
                    </span>
                  ))}
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
