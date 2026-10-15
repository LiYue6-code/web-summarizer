import Hero from '@/components/sections/Hero'
import About from '@/components/sections/About'
import Skills from '@/components/sections/Skills'
import Projects from '@/components/sections/Projects'
import BlogPreview from '@/components/sections/BlogPreview'
import Contact from '@/components/sections/Contact'

/**
 * 首页：单页滚动（Hero → 介绍 → 技能 → 项目 → 博客 → 联系）。
 */
export default function Home() {
  return (
    <>
      <Hero />
      <About />
      <Skills />
      <Projects />
      <BlogPreview />
      <Contact />
    </>
  )
}
