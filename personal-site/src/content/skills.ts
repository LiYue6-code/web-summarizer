import type { SkillCategory } from '@/types'

export const defaultSkills: SkillCategory[] = [
  {
    category: '后端',
    items: [
      { name: 'Java', icon: 'java', level: 4 },
      { name: 'Spring Boot', icon: 'spring', level: 4 },
      { name: 'MyBatis', icon: 'mybatis', level: 4 },
      { name: 'MySQL', icon: 'mysql', level: 4 },
      { name: 'Redis', icon: 'redis', level: 3 },
    ],
  },
  {
    category: '基础 / 工具',
    items: [
      { name: '数据结构与算法', icon: 'dsa', level: 4 },
      { name: '计算机网络', icon: 'network', level: 3 },
      { name: 'Git / Linux', icon: 'git', level: 3 },
      { name: 'Docker', icon: 'docker', level: 2 },
    ],
  },
]
