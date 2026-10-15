import { useEffect, useRef } from 'react'

interface Star {
  x: number
  y: number
  r: number
  baseAlpha: number
  twinkleSpeed: number
  twinkleOffset: number
}

/**
 * 星空背景：Canvas 2D 粒子，缓慢闪烁。
 * - 移动端降低粒子数，保证帧率；
 * - 尊重 prefers-reduced-motion（只绘制一帧静态星空，不启动动画循环）；
 * - 页面不可见时暂停动画。
 */
export default function Starfield() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches

    let width = 0
    let height = 0
    let stars: Star[] = []
    let raf = 0

    const particleCount = () => {
      const w = window.innerWidth
      if (w < 640) return 60
      if (w < 1024) return 120
      return 200
    }

    const initStars = () => {
      const count = particleCount()
      stars = Array.from({ length: count }, () => ({
        x: Math.random() * width,
        y: Math.random() * height,
        r: Math.random() * 1.4 + 0.3,
        baseAlpha: Math.random() * 0.5 + 0.3,
        twinkleSpeed: Math.random() * 0.002 + 0.0005,
        twinkleOffset: Math.random() * Math.PI * 2,
      }))
    }

    // 单帧绘制（抽离出来，供静态与动画两种模式复用）
    const render = (t: number) => {
      ctx.clearRect(0, 0, width, height)
      ctx.fillStyle = '#e6eaf2'
      for (const s of stars) {
        const alpha = reduceMotion
          ? s.baseAlpha
          : s.baseAlpha * (0.6 + 0.4 * Math.sin(t * s.twinkleSpeed + s.twinkleOffset))
        ctx.globalAlpha = alpha
        ctx.beginPath()
        ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2)
        ctx.fill()
      }
      ctx.globalAlpha = 1
    }

    const loop = (t: number) => {
      render(t)
      raf = requestAnimationFrame(loop)
    }

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2)
      width = window.innerWidth
      height = window.innerHeight
      canvas.width = width * dpr
      canvas.height = height * dpr
      canvas.style.width = `${width}px`
      canvas.style.height = `${height}px`
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      initStars()
      if (reduceMotion) render(0) // 静态模式：尺寸变化后立即重绘一次
    }

    const onVisibility = () => {
      if (reduceMotion) return
      if (document.hidden) {
        cancelAnimationFrame(raf)
      } else {
        raf = requestAnimationFrame(loop)
      }
    }

    resize()
    window.addEventListener('resize', resize)
    document.addEventListener('visibilitychange', onVisibility)

    if (reduceMotion) {
      render(0) // 偏好减少动效：只绘制一帧静态星空
    } else {
      raf = requestAnimationFrame(loop)
    }

    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('resize', resize)
      document.removeEventListener('visibilitychange', onVisibility)
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-0"
    />
  )
}
