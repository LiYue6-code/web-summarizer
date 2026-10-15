/**
 * 内容数据模型（与 TECH_DESIGN.md §3 对应）。
 */

export interface SocialLink {
  label: string
  url: string
}

/** 个人信息（姓名、职位、简介、经历、教育、社交）。 */
export interface Profile {
  name: string
  title: string
  tagline: string
  email: string
  avatar: string
  resumeUrl?: string
  socials: SocialLink[]
  summary: string[]
  timeline: TimelineItem[]
  education: Education[]
}

/** 站点设置。 */
export interface SiteSettings {
  accentColor: string
}

export interface TimelineItem {
  period: string
  title: string
  org: string
  description: string
  tags?: string[]
}

export interface Education {
  school: string
  degree: string
  period: string
  note?: string
}

export interface Skill {
  name: string
  icon: string
  level: 1 | 2 | 3 | 4 | 5
}

export interface SkillCategory {
  category: string
  items: Skill[]
}

export interface Project {
  slug: string
  title: string
  summary: string
  cover: string
  tags: string[]
  links: { label: string; url: string }[]
  date: string
  featured?: boolean
  /** 详情正文（Markdown）。 */
  content?: string
}

export interface Post {
  slug: string
  title: string
  excerpt: string
  date: string
  tags: string[]
  draft?: boolean
  /** 文章正文（Markdown）。 */
  content?: string
}

export interface ContactMessage {
  name: string
  email: string
  subject?: string
  content: string
}

/** 一条内容记录（持久化到本地存储）。 */
export interface ContentRecord {
  id: string
  title: string
  excerpt: string
  date: string
  tags: string[]
  content: string
  createdAt: string
}

/** 内容记录表单的输入值（tags 用逗号分隔字符串）。 */
export interface RecordFormValues {
  title: string
  excerpt: string
  date: string
  tags: string
  content: string
}
