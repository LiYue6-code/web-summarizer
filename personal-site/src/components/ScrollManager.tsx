import { useEffect } from 'react'
import { useLocation } from 'react-router'

/**
 * 路由变化时的滚动管理：
 * - 带 hash 时平滑滚动到对应区块；
 * - 否则回到页面顶部，避免 SPA 换页后保留旧滚动位置。
 * 尊重 prefers-reduced-motion。
 */
export default function ScrollManager() {
  const { pathname, hash } = useLocation()

  useEffect(() => {
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches

    if (hash) {
      const target = document.getElementById(hash.slice(1))
      if (target) {
        target.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'start' })
        return
      }
    }

    window.scrollTo({ top: 0, left: 0, behavior: 'instant' })
  }, [pathname, hash])

  return null
}
