import type { Project } from '@/types'

/**
 * 项目默认值（首次访问时的种子数据，取自 GitHub 典型 Java 后端开源项目）。
 * 后台修改后会写入 localStorage，覆盖此默认值。
 */
export const defaultProjects: Project[] = [
  {
    slug: 'mall-ecommerce',
    title: 'Mall 电商系统',
    summary: '一套完整的电商系统，含前台商城与后台管理系统，基于 Spring Boot + MyBatis + Redis 实现。',
    cover: '',
    tags: ['Java', 'Spring Boot', 'MyBatis', 'MySQL', 'Redis'],
    links: [{ label: 'GitHub', url: 'https://github.com/macrozheng/mall' }],
    date: '2026-06-01',
    featured: true,
    content:
      '## 项目简介\n\nMall 是一个完整的电商系统，包含前台商城与后台管理系统。\n\n## 技术栈\n\n- Spring Boot\n- MyBatis\n- MySQL / Redis\n- Elasticsearch / RabbitMQ\n\n## 核心模块\n\n涵盖商品、订单、购物车、营销、权限等模块，是学习 Java 后端工程化与分布式组件的典型项目。',
  },
  {
    slug: 'ruoyi-vue',
    title: 'RuoYi-Vue 权限管理系统',
    summary: '前后端分离的通用权限管理系统，基于 Spring Boot + Spring Security + JWT 实现。',
    cover: '',
    tags: ['Java', 'Spring Boot', 'Spring Security', 'JWT'],
    links: [{ label: 'GitHub', url: 'https://github.com/yangzongzhuan/RuoYi-Vue' }],
    date: '2026-04-15',
    content:
      '## 项目简介\n\nRuoYi-Vue 是一个前后端分离的权限管理系统，后端基于 Spring Boot，前端基于 Vue。\n\n## 核心能力\n\n- 基于 RBAC 的权限模型\n- JWT 登录认证\n- 定时任务\n- 代码生成器\n\n适合学习权限设计、认证授权以及前后端分离的工程实践。',
  },
  {
    slug: 'newbee-mall',
    title: 'Newbee-Mall 新蜂商城',
    summary: '个人开源电商系统，包含商品、购物车、订单等模块，基于 Spring Boot + MyBatis + Thymeleaf。',
    cover: '',
    tags: ['Java', 'Spring Boot', 'MyBatis', 'Thymeleaf'],
    links: [{ label: 'GitHub', url: 'https://github.com/newbee-ltd/newbee-mall' }],
    date: '2026-03-10',
    content:
      '## 项目简介\n\nNewbee-Mall 是一个由个人开发者开源的电商系统，前后端不分离，使用 Thymeleaf 渲染页面。\n\n覆盖商品浏览、搜索、购物车、下单、支付模拟、订单管理等完整流程，适合入门 Spring Boot Web 开发与经典 MVC 架构。',
  },
  {
    slug: 'eladmin',
    title: 'EL-ADMIN 后台管理系统',
    summary: '基于 Spring Boot 的通用后台管理系统，提供权限管理、定时任务、代码生成等功能。',
    cover: '',
    tags: ['Java', 'Spring Boot', 'Redis', 'Docker'],
    links: [{ label: 'GitHub', url: 'https://github.com/elunez/eladmin' }],
    date: '2026-02-20',
    content:
      '## 项目简介\n\nEL-ADMIN 是一个基于 Spring Boot 的通用后台管理系统，提供开箱即用的基础能力。\n\n## 功能模块\n\n- 用户与权限管理\n- 定时任务\n- 服务监控\n- 代码生成\n- 日志管理\n\n适合学习企业级后台系统的分层设计与通用能力封装。',
  },
]
