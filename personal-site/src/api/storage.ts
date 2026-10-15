/**
 * 统一的 localStorage 存储适配层。
 * 若后续接入真实后端，只需替换 src/api/client.ts 中的实现为 fetch 调用。
 */

const PREFIX = 'personal-site'

function storageKey(name: string): string {
  return `${PREFIX}:${name}`
}

export function readStorage<T>(name: string): T | null {
  try {
    const raw = localStorage.getItem(storageKey(name))
    return raw ? (JSON.parse(raw) as T) : null
  } catch {
    return null
  }
}

export function writeStorage<T>(name: string, value: T): void {
  try {
    localStorage.setItem(storageKey(name), JSON.stringify(value))
  } catch {
    // 忽略写入失败（如隐私模式配额受限）
  }
}

export function removeStorage(name: string): void {
  try {
    localStorage.removeItem(storageKey(name))
  } catch {
    // 忽略
  }
}
