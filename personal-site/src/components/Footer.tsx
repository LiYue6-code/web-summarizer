import { useContent } from '@/lib/useContent'

const currentYear = new Date().getFullYear()

/**
 * 页脚：版权与社交链接。
 */
export default function Footer() {
  const { profile } = useContent()

  return (
    <footer className="relative z-10 border-t border-border">
      <div className="mx-auto flex max-w-[1200px] flex-col items-center gap-3 px-4 py-8 text-sm text-muted sm:px-6">
        <div className="flex gap-4">
          {profile.socials.map((s) => (
            <a key={s.label} href={s.url} target="_blank" rel="noreferrer" className="hover:text-foreground">
              {s.label}
            </a>
          ))}
        </div>
        <p>
          © {currentYear} {profile.name} · 保留所有权利
        </p>
      </div>
    </footer>
  )
}
