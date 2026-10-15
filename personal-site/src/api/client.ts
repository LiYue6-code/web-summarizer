import type { Profile, SiteSettings, SkillCategory, Project, Post } from '@/types'
import { defaultProfile } from '@/content/profile'
import { defaultSettings } from '@/content/settings'
import { defaultSkills } from '@/content/skills'
import { defaultProjects } from '@/content/projects'
import { defaultPosts } from '@/content/posts'
import { readStorage, writeStorage } from './storage'

/**
 * 统一数据接口层（localStorage 版）。
 * 所有读写都经过这里，便于后续替换为真实后端（改这里即可）。
 */

const KEYS = {
  profile: 'profile',
  settings: 'settings',
  skills: 'skills',
  projects: 'projects',
  posts: 'posts',
} as const

// —— 个人信息 ——
export function getProfile(): Profile {
  return readStorage<Profile>(KEYS.profile) ?? defaultProfile
}

export function saveProfile(profile: Profile): void {
  writeStorage(KEYS.profile, profile)
}

// —— 站点设置 ——
export function getSettings(): SiteSettings {
  return readStorage<SiteSettings>(KEYS.settings) ?? defaultSettings
}

export function saveSettings(settings: SiteSettings): void {
  writeStorage(KEYS.settings, settings)
  applyAccentColor(settings.accentColor)
}

/** 把强调色应用到 CSS 变量（运行时覆盖 @theme 默认值）。 */
export function applyAccentColor(color: string): void {
  if (typeof document !== 'undefined') {
    document.documentElement.style.setProperty('--color-accent', color)
  }
}

/** 应用已保存的站点设置（在应用启动时调用一次）。 */
export function applyStoredSettings(): void {
  applyAccentColor(getSettings().accentColor)
}

// —— 技能 ——
export function getSkills(): SkillCategory[] {
  return readStorage<SkillCategory[]>(KEYS.skills) ?? defaultSkills
}

export function saveSkills(skills: SkillCategory[]): void {
  writeStorage(KEYS.skills, skills)
}

// —— 项目 ——
export function getProjects(): Project[] {
  return readStorage<Project[]>(KEYS.projects) ?? defaultProjects
}

export function getProjectBySlug(slug: string): Project | undefined {
  return getProjects().find((p) => p.slug === slug)
}

/** 新建或更新项目（按 slug 判断），返回更新后的列表。 */
export function saveProject(project: Project): Project[] {
  const projects = [...getProjects()]
  const idx = projects.findIndex((p) => p.slug === project.slug)
  if (idx >= 0) projects[idx] = project
  else projects.unshift(project)
  writeStorage(KEYS.projects, projects)
  return projects
}

export function deleteProject(slug: string): Project[] {
  const projects = getProjects().filter((p) => p.slug !== slug)
  writeStorage(KEYS.projects, projects)
  return projects
}

// —— 博客 ——
export function getPosts(): Post[] {
  return readStorage<Post[]>(KEYS.posts) ?? defaultPosts
}

/** 读取已发布文章（过滤草稿），供前台展示。 */
export function getPublishedPosts(): Post[] {
  return getPosts().filter((p) => !p.draft)
}

export function getPostBySlug(slug: string): Post | undefined {
  return getPosts().find((p) => p.slug === slug && !p.draft)
}

/** 新建或更新文章（按 slug 判断），返回更新后的列表。 */
export function savePost(post: Post): Post[] {
  const posts = [...getPosts()]
  const idx = posts.findIndex((p) => p.slug === post.slug)
  if (idx >= 0) posts[idx] = post
  else posts.unshift(post)
  writeStorage(KEYS.posts, posts)
  return posts
}

export function deletePost(slug: string): Post[] {
  const posts = getPosts().filter((p) => p.slug !== slug)
  writeStorage(KEYS.posts, posts)
  return posts
}
