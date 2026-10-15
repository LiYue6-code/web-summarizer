import AddTransaction from '@/components/AddTransaction'

/**
 * 添加记录页。
 */
export default function AddRecord() {
  return (
    <div className="mx-auto max-w-2xl py-16">
      <h1 className="text-3xl font-bold">添加记录</h1>
      <p className="mt-2 text-muted">新增一条内容记录（当前保存到浏览器本地）。</p>
      <div className="mt-8">
        <AddTransaction />
      </div>
    </div>
  )
}
