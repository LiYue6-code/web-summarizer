import { useState } from 'react'
import { Navigate, useNavigate } from 'react-router'
import type { FormEvent } from 'react'
import { login, isAuthenticated } from '@/api'
import { loginSchema, formErrors } from '@/lib/schemas'
import { Field, inputClass, btnPrimary } from '@/components/admin/ui'

/**
 * 后台登录页。
 */
export default function Login() {
  const navigate = useNavigate()
  const [values, setValues] = useState({ username: '', password: '' })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [message, setMessage] = useState('')

  // 已登录则直接进入后台
  if (isAuthenticated()) {
    return <Navigate to="/admin" replace />
  }

  const onSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const result = loginSchema.safeParse(values)
    if (!result.success) {
      setErrors(formErrors(result.error))
      setMessage('')
      return
    }
    setErrors({})
    if (login(values.username, values.password)) {
      navigate('/admin', { replace: true })
    } else {
      setMessage('账号或密码错误')
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <form
        onSubmit={onSubmit}
        noValidate
        className="w-full max-w-sm rounded-card border border-border bg-surface p-8"
      >
        <h1 className="text-xl font-semibold">后台登录</h1>
        <p className="mt-1 text-sm text-muted">使用管理员账号登录</p>

        <div className="mt-6 space-y-4">
          <Field label="用户名" htmlFor="username" error={errors.username}>
            <input
              id="username"
              className={inputClass}
              value={values.username}
              onChange={(e) => setValues((v) => ({ ...v, username: e.target.value }))}
              autoComplete="username"
            />
          </Field>
          <Field label="密码" htmlFor="password" error={errors.password}>
            <input
              id="password"
              type="password"
              className={inputClass}
              value={values.password}
              onChange={(e) => setValues((v) => ({ ...v, password: e.target.value }))}
              autoComplete="current-password"
            />
          </Field>

          {message && <p className="text-sm text-red-400">{message}</p>}

          <button type="submit" className={`${btnPrimary} w-full`}>
            登录
          </button>
        </div>

        <p className="mt-4 text-xs text-muted">演示账号：admin / admin123</p>
      </form>
    </div>
  )
}
