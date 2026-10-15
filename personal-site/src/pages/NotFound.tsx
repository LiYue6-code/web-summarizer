import { Link } from 'react-router'

/**
 * 404 页面。
 */
export default function NotFound() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center text-center">
      <h1 className="text-5xl font-bold">404</h1>
      <p className="mt-4 text-muted">页面不存在</p>
      <Link to="/" className="mt-6 rounded-full bg-accent px-6 py-3 font-medium text-background">
        返回首页
      </Link>
    </div>
  )
}
