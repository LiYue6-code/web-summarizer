import type { RecordFormValues } from '@/types'

/** 表单字段错误：字段名 → 错误信息。 */
export type FieldErrors = Partial<Record<keyof RecordFormValues, string>>

/**
 * 校验内容记录表单，返回字段错误对象（空对象表示校验通过）。
 */
export function validateRecordForm(values: RecordFormValues): FieldErrors {
  const errors: FieldErrors = {}

  if (!values.title.trim()) {
    errors.title = '标题不能为空'
  }
  if (!values.content.trim()) {
    errors.content = '正文不能为空'
  }
  if (values.date && !/^\d{4}-\d{2}-\d{2}$/.test(values.date.trim())) {
    errors.date = '日期格式应为 YYYY-MM-DD'
  }

  return errors
}
