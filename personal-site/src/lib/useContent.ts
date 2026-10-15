import { useState } from 'react'
import { getProfile, getSettings, getSkills, getProjects, getPosts } from '@/api'

/**
 * 前台内容读取钩子：在组件挂载时从 API 层读取一次数据。
 * 前台与后台是不同路由，切回前台时会重新挂载、读到最新数据。
 */
export function useContent() {
  const [data] = useState(() => ({
    profile: getProfile(),
    settings: getSettings(),
    skills: getSkills(),
    projects: getProjects(),
    posts: getPosts(),
  }))
  return data
}
