import type { Post } from '@/types'

/**
 * 博客默认值（首次访问时的种子数据）。
 * 后台修改后会写入 localStorage，覆盖此默认值。
 */
export const defaultPosts: Post[] = [
  {
    slug: 'spring-boot-rest-api',
    title: 'Spring Boot 快速搭建 RESTful API',
    excerpt: '从零开始用 Spring Boot 搭建一个规范的 RESTful 接口服务。',
    date: '2026-09-20',
    tags: ['Spring Boot', 'Java'],
    content:
      'Spring Boot 是目前 Java 后端开发的主流框架，本文从项目初始化开始，介绍如何搭建一个规范的 RESTful API 服务。\n\n## 内容要点\n\n- 依赖管理与分层结构（Controller / Service / Repository）\n- 参数校验\n- 统一响应与异常处理\n\n最后给出一个完整的 CRUD 示例，帮助快速上手。',
  },
  {
    slug: 'mybatis-plus',
    title: 'MyBatis-Plus 实战：简化持久层开发',
    excerpt: '介绍 MyBatis-Plus 的常用功能，减少重复的 CRUD 代码。',
    date: '2026-08-12',
    tags: ['MyBatis', 'Java'],
    content:
      'MyBatis-Plus 在 MyBatis 基础上提供了大量增强能力，可以显著减少重复的持久层代码。\n\n## 常用特性\n\n- 通用 Mapper\n- 条件构造器\n- 分页插件\n- 逻辑删除与自动填充\n\n并结合 Spring Boot 展示如何快速集成与使用。',
  },
  {
    slug: 'mysql-index',
    title: 'MySQL 索引与 SQL 优化入门',
    excerpt: '理解 B+ 树索引、执行计划与常见的 SQL 优化手段。',
    date: '2026-07-05',
    tags: ['MySQL', '数据库'],
    content:
      '索引是数据库性能优化的核心。本文从 B+ 树的结构出发，解释主键索引与二级索引的区别。\n\n## 内容要点\n\n- 通过 EXPLAIN 查看执行计划\n- 最左前缀、覆盖索引、回表\n- 常见的 SQL 优化建议与避坑点',
  },
  {
    slug: 'redis-cache',
    title: 'Redis 缓存实战与三大经典问题',
    excerpt: '使用 Redis 做缓存，并理解缓存穿透、击穿、雪崩的应对方案。',
    date: '2026-06-18',
    tags: ['Redis', '缓存'],
    content:
      'Redis 是后端开发中最常用的缓存中间件。本文介绍 Spring Boot 集成 Redis 做缓存的常见做法。\n\n## 三大经典问题\n\n- 缓存穿透：空值缓存 / 布隆过滤器\n- 缓存击穿：互斥锁 / 逻辑过期\n- 缓存雪崩：随机过期时间 / 多级缓存\n\n帮助在面试与实践中应对高并发缓存场景。',
  },
  {
    slug: 'jwt-security',
    title: 'JWT + Spring Security 实现登录认证',
    excerpt: '基于 JWT 与 Spring Security 搭建无状态的用户认证体系。',
    date: '2026-05-22',
    tags: ['Spring Security', 'JWT', 'Java'],
    content:
      '前后端分离场景下，JWT 是常用的无状态认证方案。本文介绍 JWT 的结构与签发、校验流程。\n\n## 内容要点\n\n- Spring Security 过滤链配置\n- 登录接口与鉴权\n- 令牌刷新\n- 密钥管理与令牌过期策略',
  },
]
