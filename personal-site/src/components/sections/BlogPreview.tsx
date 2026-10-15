import { Link } from 'react-router'
import { useContent } from '@/lib/useContent'

/**
 * 首页博客预览：展示最新几篇文章入口。
 */
export default function BlogPreview() {
  const { posts } = useContent()
  const latest = posts.filter((p) => !p.draft).slice(0, 3)

  return (
    <section id="blog" className="py-16">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-semibold">博客</h2>
        <Link to="/blog" className="text-sm text-accent hover:underline">
          查看全部 →
        </Link>
      </div>

      <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {latest.map((post) => (
          <Link
            key={post.slug}
            to={`/blog/${post.slug}`}
            className="flex flex-col rounded-card border border-border bg-surface p-6 transition hover:-translate-y-0.5 hover:border-muted"
          >
            <h3 className="font-medium">{post.title}</h3>
            <p className="mt-2 flex-1 text-sm text-muted">{post.excerpt}</p>
            <p className="mt-4 text-xs text-muted">
              <time dateTime={post.date}>{post.date}</time>
            </p>
          </Link>
        ))}
      </div>
    </section>
  )
}
