import { z } from 'zod'

/** 把 zod 错误扁平化为 字段 → 首条消息 的映射。 */
export function formErrors(error: z.ZodError): Record<string, string> {
  const flat = error.flatten().fieldErrors
  const out: Record<string, string> = {}
  for (const [key, msgs] of Object.entries(flat)) {
    const first = Array.isArray(msgs) ? msgs[0] : undefined
    if (first) out[key] = first
  }
  return out
}

const slugPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/
const datePattern = /^\d{4}-\d{2}-\d{2}$/
const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export const loginSchema = z.object({
  username: z.string().min(1, '请输入用户名'),
  password: z.string().min(1, '请输入密码'),
})

export const profileSchema = z.object({
  name: z.string().min(1, '姓名不能为空'),
  title: z.string().min(1, '职位不能为空'),
  tagline: z.string(),
  email: z.string().regex(emailPattern, '邮箱格式不正确'),
  avatar: z.string(),
  resumeUrl: z.string(),
})

export const projectSchema = z.object({
  slug: z
    .string()
    .min(1, 'slug 不能为空')
    .regex(slugPattern, 'slug 只能包含小写字母、数字与连字符'),
  title: z.string().min(1, '标题不能为空'),
  summary: z.string().min(1, '摘要不能为空'),
  cover: z.string(),
  date: z.string().regex(datePattern, '日期格式应为 YYYY-MM-DD'),
  tags: z.string(),
  links: z.array(z.object({ label: z.string(), url: z.string() })),
  content: z.string(),
})

export const postSchema = z.object({
  slug: z
    .string()
    .min(1, 'slug 不能为空')
    .regex(slugPattern, 'slug 只能包含小写字母、数字与连字符'),
  title: z.string().min(1, '标题不能为空'),
  excerpt: z.string().min(1, '摘要不能为空'),
  date: z.string().regex(datePattern, '日期格式应为 YYYY-MM-DD'),
  tags: z.string(),
  draft: z.boolean(),
  content: z.string(),
})

export const settingsSchema = z.object({
  accentColor: z.string().regex(/^#[0-9a-fA-F]{6}$/, '请选择主题色'),
})

export const skillCategoriesSchema = z.array(
  z.object({
    category: z.string().min(1, '分类名不能为空'),
    items: z.array(
      z.object({
        name: z.string().min(1, '技能名不能为空'),
        icon: z.string(),
        level: z.number().int().min(1).max(5),
      }),
    ),
  }),
)
