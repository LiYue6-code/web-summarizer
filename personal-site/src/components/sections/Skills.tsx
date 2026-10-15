import { useEffect, useRef, useState } from 'react'
import { useContent } from '@/lib/useContent'

/**
 * 技能展示：分类卡片，图标 + 名称 + 熟练度进度条。
 * 进度条进入视口后再展开，避免首屏就完成动画。
 */
export default function Skills() {
  const { skills } = useContent()
  const sectionRef = useRef<HTMLElement>(null)
  // 不支持 IntersectionObserver 的环境下直接显示，避免同步 setState
  const [inView, setInView] = useState(() => typeof IntersectionObserver === 'undefined')

  useEffect(() => {
    const el = sectionRef.current
    if (!el || typeof IntersectionObserver === 'undefined') return
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          setInView(true)
          observer.disconnect()
        }
      },
      { threshold: 0.1 },
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  return (
    <section id="skills" ref={sectionRef} className="py-16">
      <h2 className="text-2xl font-semibold">技能展示</h2>

      <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {skills.map((category) => (
          <div
            key={category.category}
            className="rounded-card border border-border bg-surface p-6 transition hover:-translate-y-0.5 hover:border-muted"
          >
            <h3 className="font-medium">{category.category}</h3>
            <ul className="mt-4 space-y-4">
              {category.items.map((skill) => {
                const pct = (skill.level / 5) * 100
                return (
                  <li key={skill.name}>
                    <div className="flex items-center justify-between text-sm">
                      <span>{skill.name}</span>
                      <span className="text-muted">{skill.level}/5</span>
                    </div>
                    <div className="mt-1.5 h-1.5 rounded-full bg-border">
                      <div
                        className="h-full rounded-full bg-accent"
                        style={{
                          width: inView ? `${pct}%` : '0%',
                          animation: inView ? 'skill-grow 0.9s ease-out both' : undefined,
                        }}
                      />
                    </div>
                  </li>
                )
              })}
            </ul>
          </div>
        ))}
      </div>
    </section>
  )
}
