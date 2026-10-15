import { Link, useParams } from 'react-router'
import { getPostBySlug } from '@/api'

/**
 * 博客详情页：标题、日期、标签与正文。
 */
export default function BlogPost() {
  const { slug } = useParams<{ slug: string }>()
  const post = getPostBySlug(slug ?? '')

  if (!post) {
    return (
      <div className="py-16">
        <p className="text-muted">未找到该文章。</p>
        <Link to="/blog" className="mt-4 inline-block text-accent hover:underline">
          ← 返回博客
        </Link>
      </div>
    )
  }

  return (
    <article className="mx-auto max-w-3xl py-16">
      <Link to="/blog" className="text-sm text-accent hover:underline">
        ← 返回博客
      </Link>
      <h1 className="mt-4 text-3xl font-bold">{post.title}</h1>
      <div className="mt-3 flex flex-wrap items-center gap-3 text-sm text-muted">
        <time dateTime={post.date}>{post.date}</time>
        {post.tags.map((tag) => (
          <span key={tag} className="rounded-full border border-border px-2 py-0.5 text-xs">
            {tag}
          </span>
        ))}
      </div>

      <div className="mt-8 space-y-4">
        {(post.content ?? '').split('\n\n').map((p, i) => (
          <p key={i} className="leading-relaxed text-muted">
            {p}
          </p>
        ))}
      </div>
    </article>
  )
}
