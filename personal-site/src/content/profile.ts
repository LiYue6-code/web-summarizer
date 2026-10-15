import type { Profile } from '@/types'

/**
 * 个人信息默认值（首次访问时的种子数据）。
 * 后台修改后会写入 localStorage，覆盖此默认值。
 */
export const defaultProfile: Profile = {
  name: '李越',
  title: 'Java 后端开发工程师',
  tagline: '大连海事大学软件工程专业 2023 级，专注于 Java 后端与数据库开发，正在寻找后端方向的工作机会。',
  email: '1722191281@qq.com',
  avatar: '',
  resumeUrl: '',
  socials: [
    { label: 'GitHub', url: 'https://github.com/yourname' },
    { label: '掘金', url: 'https://juejin.cn/user/yourname' },
  ],
  summary: [
    '大连海事大学软件工程专业 2023 级本科生，主修方向为 Java 后端开发。掌握 Java、Spring Boot、MyBatis、MySQL、Redis 等后端技术栈，熟悉常见的数据结构与算法。',
    '对后端系统设计、数据库优化与高并发场景有浓厚兴趣，正在通过开源项目与课程实践持续积累经验。',
  ],
  timeline: [
    {
      period: '2023 – 2027',
      title: '软件工程 · 本科',
      org: '大连海事大学',
      description: '系统学习 Java 程序设计、数据结构、操作系统、计算机网络、数据库原理等课程，聚焦 Java 后端开发方向。',
      tags: ['Java', 'Spring Boot', 'MySQL'],
    },
  ],
  education: [
    {
      school: '大连海事大学',
      degree: '软件工程 · 本科',
      period: '2023 – 2027',
    },
  ],
}
