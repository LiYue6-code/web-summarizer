import { useContent } from '@/lib/useContent'

/**
 * 个人介绍：简介段落 + 经历时间线 + 教育背景。
 */
export default function About() {
  const { profile } = useContent()

  return (
    <section id="about" className="py-16">
      <h2 className="text-2xl font-semibold">个人介绍</h2>

      {profile.summary.map((p) => (
        <p key={p} className="mt-4 max-w-3xl text-muted">
          {p}
        </p>
      ))}

      <h3 className="mt-10 text-xl font-medium">经历</h3>
      <ol className="mt-4 space-y-5 border-l border-border pl-5">
        {profile.timeline.map((item) => (
          <li key={`${item.period}-${item.title}`}>
            <span className="text-sm text-muted">{item.period}</span>
            <p className="font-medium">
              {item.title} · {item.org}
            </p>
            <p className="mt-1 text-muted">{item.description}</p>
          </li>
        ))}
      </ol>

      <h3 className="mt-10 text-xl font-medium">教育背景</h3>
      <ul className="mt-4 space-y-2">
        {profile.education.map((edu) => (
          <li key={`${edu.school}-${edu.degree}`} className="text-muted">
            <span className="font-medium text-foreground">{edu.school}</span> · {edu.degree} · {edu.period}
          </li>
        ))}
      </ul>
    </section>
  )
}
