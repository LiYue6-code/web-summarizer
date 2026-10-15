import { useContent } from '@/lib/useContent'

/**
 * 首页 Hero：头像、姓名、职位、一句话介绍、CTA。
 */
export default function Hero() {
  const { profile } = useContent()

  return (
    <section
      id="hero"
      className="relative flex min-h-[80vh] flex-col items-center justify-center overflow-hidden text-center"
    >
      {/* 装饰性背景光晕（纯装饰，不参与交互） */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute left-1/2 top-1/2 -z-10 h-72 w-72 -translate-x-1/2 -translate-y-1/2 rounded-full bg-accent/15 blur-3xl"
      />

      {profile.avatar && (
        <img
          src={profile.avatar}
          alt={`${profile.name} 的头像`}
          className="h-28 w-28 rounded-full border border-border object-cover"
        />
      )}
      <h1 className="mt-6 text-4xl font-bold sm:text-5xl">{profile.name}</h1>
      <p className="mt-2 text-xl text-muted">{profile.title}</p>
      <p className="mt-4 max-w-xl text-muted">{profile.tagline}</p>

      <div className="mt-8 flex flex-wrap justify-center gap-4">
        <a
          href="#projects"
          className="rounded-full bg-accent px-6 py-3 font-medium text-background transition hover:opacity-90"
        >
          查看项目
        </a>
        {profile.resumeUrl && (
          <a
            href={profile.resumeUrl}
            target="_blank"
            rel="noreferrer"
            className="rounded-full border border-border px-6 py-3 transition hover:border-muted"
          >
            下载简历
          </a>
        )}
        <a
          href="#contact"
          className="rounded-full border border-border px-6 py-3 transition hover:border-muted"
        >
          联系我
        </a>
      </div>
    </section>
  )
}
