import { readStorage, writeStorage, removeStorage } from './storage'

const TOKEN_KEY = 'auth-token'

// 演示用账号密码（真实项目应替换为后端登录接口 + 安全校验）
const ADMIN_USERNAME = 'admin'
const ADMIN_PASSWORD = 'admin123'

/**
 * 登录：校验账号密码，成功后写入随机 token（不明文存密码）。
 */
export function login(username: string, password: string): boolean {
  if (username === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
    writeStorage(TOKEN_KEY, crypto.randomUUID())
    return true
  }
  return false
}

export function logout(): void {
  removeStorage(TOKEN_KEY)
}

export function getToken(): string | null {
  return readStorage<string>(TOKEN_KEY)
}

export function isAuthenticated(): boolean {
  return getToken() !== null
}
