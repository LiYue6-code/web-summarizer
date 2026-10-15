import { useContent } from '@/lib/useContent'

/**
 * 联系：邮箱 + 社交链接（表单待实现）。
 */
export default function Contact() {
  const { profile } = useContent()

  return (
    <section id="contact" className="py-16">
      <h2 className="text-2xl font-semibold">联系</h2>
      <p className="mt-4 text-muted">
        邮箱：
        <a href={`mailto:${profile.email}`} className="text-accent hover:underline">
          {profile.email}
        </a>
      </p>
      <p className="mt-2 text-muted">联系表单待实现。</p>
    </section>
  )
}
