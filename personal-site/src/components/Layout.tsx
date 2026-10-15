import { Outlet } from 'react-router'
import Navbar from './Navbar'
import Footer from './Footer'
import Starfield from './Starfield'
import ScrollManager from './ScrollManager'

/**
 * 全局布局：星空背景 + 吸顶导航 + 内容区 + 页脚。
 */
export default function Layout() {
  return (
    <div className="relative min-h-screen">
      <Starfield />
      <ScrollManager />
      <Navbar />
      <main className="relative z-10 mx-auto w-full max-w-[1200px] px-4 sm:px-6">
        <Outlet />
      </main>
      <Footer />
    </div>
  )
}
