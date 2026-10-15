import { Link, NavLink, Outlet, useNavigate } from 'react-router'
import { logout } from '@/api'

const navLinks = [
  { to: '/admin', label: '仪表盘', end: true },
  { to: '/admin/profile', label: '个人信息', end: false },
  { to: '/admin/skills', label: '技能管理', end: false },
  { to: '/admin/projects', label: '项目管理', end: false },
  { to: '/admin/posts', label: '博客管理', end: false },
  { to: '/admin/settings', label: '站点设置', end: false },
]

/**
 * 后台独立布局：侧边栏 + 顶栏，不复用前台 Navbar。
 */
export default function AdminLayout() {
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/admin/login', { replace: true })
  }

  const linkClass = ({ isActive }: { isActive: boolean }) =>
    `rounded-lg px-3 py-2 text-sm transition-colors ${
      isActive ? 'bg-accent/15 font-medium text-foreground' : 'text-muted hover:bg-surface hover:text-foreground'
    }`

  return (
    <div className="min-h-screen lg:flex">
      <aside className="border-b border-border bg-surface lg:w-60 lg:shrink-0 lg:border-b-0 lg:border-r">
        <div className="px-4 py-4 text-lg font-semibold">后台管理</div>
        <nav className="flex gap-1 overflow-x-auto px-2 pb-3 lg:flex-col lg:pb-0">
          {navLinks.map((link) => (
            <NavLink key={link.to} to={link.to} end={link.end} className={linkClass}>
              {link.label}
            </NavLink>
          ))}
        </nav>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex items-center justify-between border-b border-border px-4 py-3 sm:px-6">
          <span className="text-sm text-muted">内容管理后台</span>
          <div className="flex items-center gap-4">
            <Link to="/" className="text-sm text-muted transition-colors hover:text-foreground">
              查看前台 ↗
            </Link>
            <button
              type="button"
              onClick={handleLogout}
              className="text-sm text-muted transition-colors hover:text-foreground"
            >
              退出登录
            </button>
          </div>
        </header>
        <main className="flex-1 p-4 sm:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
