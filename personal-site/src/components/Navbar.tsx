import { useEffect, useState } from 'react'
import { Link, NavLink } from 'react-router'
import { useContent } from '@/lib/useContent'

const navLinks = [
  { label: '首页', to: '/', end: true },
  { label: '项目', to: '/#projects', end: false },
  { label: '博客', to: '/blog', end: false },
  { label: '联系', to: '/#contact', end: false },
]

/**
 * 吸顶毛玻璃导航；移动端汉堡菜单。
 */
export default function Navbar() {
  const { profile } = useContent()
  const [open, setOpen] = useState(false)

  // 按 Esc 关闭移动端菜单
  useEffect(() => {
    if (!open) return
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false)
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [open])

  const linkClass = ({ isActive }: { isActive: boolean }) =>
    `text-sm transition-colors hover:text-foreground ${
      isActive ? 'font-medium text-foreground' : 'text-muted'
    }`

  return (
    <header className="sticky top-0 z-20 border-b border-border bg-background/70 backdrop-blur">
      <nav className="mx-auto flex max-w-[1200px] items-center justify-between px-4 py-3 sm:px-6">
        <Link to="/" className="text-lg font-semibold" onClick={() => setOpen(false)}>
          {profile.name}
        </Link>

        <ul className="hidden items-center gap-6 sm:flex">
          {navLinks.map((link) => (
            <li key={link.to}>
              <NavLink to={link.to} end={link.end} className={linkClass}>
                {link.label}
              </NavLink>
            </li>
          ))}
        </ul>

        <button
          type="button"
          className="rounded-lg border border-border px-3 py-1.5 text-sm sm:hidden"
          aria-label="切换菜单"
          aria-expanded={open}
          onClick={() => setOpen((v) => !v)}
        >
          {open ? '关闭' : '菜单'}
        </button>
      </nav>

      {open && (
        <ul className="flex flex-col gap-3 border-t border-border px-4 py-3 sm:hidden">
          {navLinks.map((link) => (
            <li key={link.to}>
              <Link
                to={link.to}
                className="text-muted transition-colors hover:text-foreground"
                onClick={() => setOpen(false)}
              >
                {link.label}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </header>
  )
}
