import { useState, useMemo } from 'react'
import { Search, Plus, User, X, Check } from 'lucide-react'
import { useAppStore } from '@/store/useAppStore'
import type { Customer, TreatmentPlan } from '@/types'
import { cn } from '@/lib/utils'

const skinTypeOptions = ['干性', '中性', '油性', '混合性']
const statusOptions: { value: Customer['treatmentStatus']; label: string }[] = [
  { value: 'in_progress', label: '治疗中' },
  { value: 'completed', label: '已完成' },
  { value: 'none', label: '未开始' },
]
const concernOptions = ['色斑', '暗沉', '红血丝', '痘印', '毛孔粗大', '细纹']

const statusConfig: Record<Customer['treatmentStatus'], { label: string; className: string }> = {
  in_progress: { label: '治疗中', className: 'bg-emerald-50 text-emerald-700 border border-emerald-200' },
  completed: { label: '已完成', className: 'bg-blue-50 text-blue-700 border border-blue-200' },
  none: { label: '未开始', className: 'bg-slate-50 text-slate-500 border border-slate-200' },
}

const repurchaseConfig: Record<Customer['repurchaseIntent'], { dotClass: string; label: string }> = {
  high: { dotClass: 'bg-emerald-500', label: '高意向' },
  medium: { dotClass: 'bg-amber-400', label: '中意向' },
  low: { dotClass: 'bg-slate-300', label: '低意向' },
  none: { dotClass: '', label: '' },
}

function getProgressInfo(customerId: string, plans: TreatmentPlan[]) {
  const plan = plans.find((p) => p.customerId === customerId)
  if (!plan) return null
  const completed = plan.sessions.filter((s) => s.status === 'completed').length
  const total = plan.sessions.length
  return { completed, total, percent: Math.round((completed / total) * 100) }
}

interface FormData {
  name: string
  gender: Customer['gender']
  age: string
  phone: string
  skinType: string
  concerns: string[]
}

const initialForm: FormData = {
  name: '',
  gender: 'female',
  age: '',
  phone: '',
  skinType: '中性',
  concerns: [],
}

export default function CustomerList() {
  const { customers, treatmentPlans, addCustomer } = useAppStore()

  const [search, setSearch] = useState('')
  const [activeSkinType, setActiveSkinType] = useState<string | null>(null)
  const [activeStatus, setActiveStatus] = useState<Customer['treatmentStatus'] | null>(null)
  const [modalOpen, setModalOpen] = useState(false)
  const [form, setForm] = useState<FormData>(initialForm)

  const filtered = useMemo(() => {
    return customers.filter((c) => {
      const q = search.trim().toLowerCase()
      if (q && !c.name.toLowerCase().includes(q) && !c.phone.includes(q)) return false
      if (activeSkinType && c.skinType !== activeSkinType) return false
      if (activeStatus && c.treatmentStatus !== activeStatus) return false
      return true
    })
  }, [customers, search, activeSkinType, activeStatus])

  const handleSubmit = () => {
    if (!form.name.trim() || !form.age || !form.phone.trim()) return
    addCustomer({
      id: 'c' + Date.now(),
      name: form.name.trim(),
      gender: form.gender,
      age: Number(form.age),
      phone: form.phone.trim(),
      skinType: form.skinType,
      concerns: form.concerns,
      treatmentStatus: 'none',
      repurchaseIntent: 'none',
      createdAt: new Date().toISOString().slice(0, 10),
    })
    setForm(initialForm)
    setModalOpen(false)
  }

  const toggleConcern = (concern: string) => {
    setForm((prev) => ({
      ...prev,
      concerns: prev.concerns.includes(concern)
        ? prev.concerns.filter((c) => c !== concern)
        : [...prev.concerns, concern],
    }))
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="font-serif text-2xl font-semibold text-slate-800">客户档案</h1>
        <button
          onClick={() => setModalOpen(true)}
          className="inline-flex items-center gap-2 px-4 py-2 bg-primary-600 text-white text-sm font-medium rounded-lg hover:bg-primary-700 transition-colors shadow-sm shadow-primary-200"
        >
          <Plus className="w-4 h-4" />
          新建档案
        </button>
      </div>

      <div className="space-y-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="搜索客户姓名或手机号"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-lg text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-400 transition-all"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs text-slate-400 font-medium mr-1">肤质</span>
          {skinTypeOptions.map((st) => (
            <button
              key={st}
              onClick={() => setActiveSkinType(activeSkinType === st ? null : st)}
              className={cn(
                'px-3 py-1 rounded-full text-xs font-medium transition-all',
                activeSkinType === st
                  ? 'bg-primary-600 text-white shadow-sm'
                  : 'bg-white text-slate-500 border border-slate-200 hover:border-primary-300 hover:text-primary-600'
              )}
            >
              {st}
            </button>
          ))}

          <span className="text-slate-200 mx-2">|</span>

          <span className="text-xs text-slate-400 font-medium mr-1">状态</span>
          {statusOptions.map((s) => (
            <button
              key={s.value}
              onClick={() => setActiveStatus(activeStatus === s.value ? null : s.value)}
              className={cn(
                'px-3 py-1 rounded-full text-xs font-medium transition-all',
                activeStatus === s.value
                  ? 'bg-primary-600 text-white shadow-sm'
                  : 'bg-white text-slate-500 border border-slate-200 hover:border-primary-300 hover:text-primary-600'
              )}
            >
              {s.label}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-3 gap-5">
        {filtered.map((customer) => {
          const progress = getProgressInfo(customer.id, treatmentPlans)
          const repurchase = repurchaseConfig[customer.repurchaseIntent]
          const status = statusConfig[customer.treatmentStatus]

          return (
            <div
              key={customer.id}
              className="card bg-white rounded-xl p-5 border border-slate-100 shadow-sm card-hover transition-all duration-200"
            >
              <div className="flex items-start gap-3">
                <div
                  className={cn(
                    'w-11 h-11 rounded-full flex items-center justify-center shrink-0',
                    customer.gender === 'female' ? 'bg-primary-100' : 'bg-blue-100'
                  )}
                >
                  <span
                    className={cn(
                      'text-sm font-semibold',
                      customer.gender === 'female' ? 'text-primary-700' : 'text-blue-700'
                    )}
                  >
                    {customer.name[0]}
                  </span>
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-sm text-slate-800">{customer.name}</span>
                    <span className="text-xs text-slate-400">{customer.age}岁</span>
                    {repurchase.dotClass && (
                      <span className="inline-flex items-center gap-1 ml-auto">
                        <span className={cn('w-1.5 h-1.5 rounded-full', repurchase.dotClass)} />
                        <span className="text-[10px] text-slate-400">{repurchase.label}</span>
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-400 mt-0.5">{customer.phone}</p>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-1.5 mt-3">
                <span className="px-2 py-0.5 rounded-full bg-slate-50 text-slate-500 text-[10px] border border-slate-100">
                  {customer.skinType}
                </span>
                {customer.concerns.map((concern) => (
                  <span
                    key={concern}
                    className="px-2 py-0.5 rounded-full bg-primary-50 text-primary-600 text-[10px] border border-primary-100"
                  >
                    {concern}
                  </span>
                ))}
              </div>

              <div className="flex items-center justify-between mt-3">
                <span className={cn('px-2 py-0.5 rounded-full text-[10px] font-medium', status.className)}>
                  {status.label}
                </span>
              </div>

              {progress && (
                <div className="mt-3">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[10px] text-slate-400">治疗进度</span>
                    <span className="text-[10px] text-slate-500 font-medium">
                      {progress.completed}/{progress.total} 次
                    </span>
                  </div>
                  <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-primary-500 rounded-full transition-all duration-500"
                      style={{ width: `${progress.percent}%` }}
                    />
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </div>

      {filtered.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 text-slate-400">
          <User className="w-12 h-12 mb-3 text-slate-300" />
          <p className="text-sm">暂无匹配的客户档案</p>
        </div>
      )}

      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/40" onClick={() => setModalOpen(false)} />
          <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-md mx-4 p-6">
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-serif text-lg font-semibold text-slate-800">新建客户档案</h2>
              <button
                onClick={() => setModalOpen(false)}
                className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1.5">姓名</label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-400 transition-all"
                  placeholder="请输入客户姓名"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1.5">性别</label>
                  <div className="flex gap-2">
                    {(['female', 'male'] as const).map((g) => (
                      <button
                        key={g}
                        onClick={() => setForm((p) => ({ ...p, gender: g }))}
                        className={cn(
                          'flex-1 py-2 rounded-lg text-xs font-medium border transition-all',
                          form.gender === g
                            ? 'bg-primary-50 border-primary-300 text-primary-700'
                            : 'bg-white border-slate-200 text-slate-500 hover:border-slate-300'
                        )}
                      >
                        {g === 'female' ? '女' : '男'}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1.5">年龄</label>
                  <input
                    type="number"
                    value={form.age}
                    onChange={(e) => setForm((p) => ({ ...p, age: e.target.value }))}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-400 transition-all"
                    placeholder="年龄"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1.5">手机号</label>
                <input
                  type="tel"
                  value={form.phone}
                  onChange={(e) => setForm((p) => ({ ...p, phone: e.target.value }))}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-400 transition-all"
                  placeholder="请输入手机号"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1.5">肤质类型</label>
                <div className="flex flex-wrap gap-2">
                  {skinTypeOptions.map((st) => (
                    <button
                      key={st}
                      onClick={() => setForm((p) => ({ ...p, skinType: st }))}
                      className={cn(
                        'px-3 py-1.5 rounded-lg text-xs font-medium border transition-all',
                        form.skinType === st
                          ? 'bg-primary-50 border-primary-300 text-primary-700'
                          : 'bg-white border-slate-200 text-slate-500 hover:border-slate-300'
                      )}
                    >
                      {st}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1.5">皮肤问题（多选）</label>
                <div className="flex flex-wrap gap-2">
                  {concernOptions.map((c) => (
                    <button
                      key={c}
                      onClick={() => toggleConcern(c)}
                      className={cn(
                        'px-3 py-1.5 rounded-lg text-xs font-medium border transition-all inline-flex items-center gap-1',
                        form.concerns.includes(c)
                          ? 'bg-primary-50 border-primary-300 text-primary-700'
                          : 'bg-white border-slate-200 text-slate-500 hover:border-slate-300'
                      )}
                    >
                      {form.concerns.includes(c) && <Check className="w-3 h-3" />}
                      {c}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setModalOpen(false)}
                className="flex-1 py-2.5 rounded-lg text-sm font-medium text-slate-600 bg-slate-100 hover:bg-slate-200 transition-colors"
              >
                取消
              </button>
              <button
                onClick={handleSubmit}
                disabled={!form.name.trim() || !form.age || !form.phone.trim()}
                className="flex-1 py-2.5 rounded-lg text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm shadow-primary-200"
              >
                确认创建
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
