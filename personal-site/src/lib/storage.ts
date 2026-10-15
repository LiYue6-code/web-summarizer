import type { ContentRecord } from '@/types'

const STORAGE_KEY = 'personal-site:records'

/** 生成唯一 id（优先 crypto.randomUUID，失败时回退）。 */
export function createId(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID()
  }
  return `${Date.now()}-${Math.random().toString(36).slice(2)}`
}

/** 读取本地存储的全部记录。 */
export function loadRecords(): ContentRecord[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? (JSON.parse(raw) as ContentRecord[]) : []
  } catch {
    return []
  }
}

/** 保存一条记录（置于列表头部），返回更新后的列表。 */
export function saveRecord(record: ContentRecord): ContentRecord[] {
  const next = [record, ...loadRecords()]
  localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
  return next
}
