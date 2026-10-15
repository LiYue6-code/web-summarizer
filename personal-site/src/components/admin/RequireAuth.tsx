import { Navigate } from 'react-router'
import type { ReactNode } from 'react'
import { isAuthenticated } from '@/api'

/**
 * 路由守卫：未登录时重定向到 /admin/login。
 */
export default function RequireAuth({ children }: { children: ReactNode }) {
  if (!isAuthenticated()) {
    return <Navigate to="/admin/login" replace />
  }
  return <>{children}</>
}
