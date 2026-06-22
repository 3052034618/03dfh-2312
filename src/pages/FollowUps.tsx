import { useState, useMemo } from 'react'
import { PhoneOutgoing, Star, Clock, CheckCircle, AlertTriangle } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useAppStore } from '@/store/useAppStore'
import type { FollowUpTask, Customer } from '@/types'

type FilterTab = 'all' | 'pending' | 'completed' | 'overdue'

const TABS: { key: FilterTab; label: string }[] = [
  { key: 'all', label: '全部' },
  { key: 'pending', label: '待回访' },
  { key: 'completed', label: '已完成' },
  { key: 'overdue', label: '已逾期' },
]

function getTriggerBadge(triggerDay: FollowUpTask['triggerDay']) {
  switch (triggerDay) {
    case 3:
      return { text: '3天回访', className: 'bg-blue-50 text-blue-700 border border-blue-200' }
    case 7:
      return { text: '7天回访', className: 'bg-amber-50 text-amber-700 border border-amber-200' }
    case 14:
      return { text: '14天回访', className: 'bg-purple-50 text-purple-700 border border-purple-200' }
  }
}

function getStatusBadge(status: FollowUpTask['status']) {
  switch (status) {
    case 'pending':
      return { text: '待回访', className: 'bg-amber-50 text-amber-600', icon: Clock }
    case 'completed':
      return { text: '已完成', className: 'bg-green-50 text-green-600', icon: CheckCircle }
    case 'overdue':
      return { text: '已逾期', className: 'bg-red-50 text-red-600', icon: AlertTriangle }
  }
}

function formatDate(dateStr: string) {
  const d = new Date(dateStr + 'T00:00:00')
  return `${d.getFullYear()}年${d.getMonth() + 1}月${d.getDate()}日`
}

function getTodayStr() {
  return new Date().toISOString().split('T')[0]
}

export default function FollowUps() {
  const { followUps, customers, updateFollowUp } = useAppStore()

  const [activeTab, setActiveTab] = useState<FilterTab>('all')
  const [showModal, setShowModal] = useState(false)
  const [selectedTask, setSelectedTask] = useState<FollowUpTask | null>(null)

  const [feedback, setFeedback] = useState('')
  const [satisfaction, setSatisfaction] = useState<1 | 2 | 3 | 4 | 5>(3)
  const [isAbnormal, setIsAbnormal] = useState(false)
  const [abnormalNote, setAbnormalNote] = useState('')
  const [repurchaseIntent, setRepurchaseIntent] = useState<'high' | 'medium' | 'low' | 'none'>('medium')

  const getCustomer = (id: string): Customer | undefined => customers.find((c) => c.id === id)

  const filteredTasks = useMemo(() => {
    return followUps.filter((f) => {
      if (activeTab === 'all') return true
      return f.status === activeTab
    })
  }, [followUps, activeTab])

  const tabCounts = useMemo(() => {
    const counts: Record<FilterTab, number> = { all: 0, pending: 0, completed: 0, overdue: 0 }
    followUps.forEach((f) => {
      counts.all++
      counts[f.status]++
    })
    return counts
  }, [followUps])

  const openModal = (task: FollowUpTask) => {
    setSelectedTask(task)
    setFeedback('')
    setSatisfaction(3)
    setIsAbnormal(false)
    setAbnormalNote('')
    setRepurchaseIntent('medium')
    setShowModal(true)
  }

  const handleSubmit = () => {
    if (!selectedTask) return
    updateFollowUp(selectedTask.id, {
      status: 'completed',
      completedAt: getTodayStr(),
      result: {
        feedback,
        satisfaction,
        isAbnormal,
        repurchaseIntent,
        ...(isAbnormal && abnormalNote ? { abnormalNote } : {}),
      },
    })
    setShowModal(false)
    setSelectedTask(null)
  }

  const repurchaseOptions: { value: 'high' | 'medium' | 'low' | 'none'; label: string; color: string }[] = [
    { value: 'high', label: '高', color: 'bg-green-500' },
    { value: 'medium', label: '中', color: 'bg-amber-400' },
    { value: 'low', label: '低', color: 'bg-orange-400' },
    { value: 'none', label: '无', color: 'bg-slate-400' },
  ]

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
        <div className="flex items-center gap-3">
          <PhoneOutgoing className="w-5 h-5 text-primary-600" />
          <h1 className="font-serif-title text-xl font-semibold text-slate-800">回访任务</h1>
        </div>
        <span className="text-sm text-slate-400">{formatDate(getTodayStr())}</span>
      </div>

      <div className="flex items-center gap-1 px-6 py-3 border-b border-slate-100 bg-slate-50/50">
        {TABS.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={cn(
              'px-4 py-1.5 text-sm font-medium rounded-lg transition-all',
              activeTab === tab.key
                ? 'bg-white text-primary-700 shadow-sm'
                : 'text-slate-500 hover:text-slate-700 hover:bg-white/50'
            )}
          >
            {tab.label}
            <span className={cn(
              'ml-1.5 text-xs',
              activeTab === tab.key ? 'text-primary-500' : 'text-slate-400'
            )}>
              {tabCounts[tab.key]}
            </span>
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-auto p-6">
        {filteredTasks.length === 0 ? (
          <div className="py-20 text-center text-sm text-slate-400">暂无回访任务</div>
        ) : (
          <div className="space-y-3">
            {filteredTasks.map((task) => {
              const customer = getCustomer(task.customerId)
              const triggerBadge = getTriggerBadge(task.triggerDay)
              const statusBadge = getStatusBadge(task.status)
              const StatusIcon = statusBadge.icon

              return (
                <div key={task.id} className="card px-5 py-4">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-primary-50 flex items-center justify-center shrink-0 text-primary-600 text-sm font-semibold">
                      {customer?.name?.slice(0, 1) ?? '?'}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-sm font-medium text-slate-800">{customer?.name ?? '—'}</span>
                        <span className={cn('text-[11px] font-medium px-2 py-0.5 rounded-full', triggerBadge.className)}>
                          {triggerBadge.text}
                        </span>
                        <span className={cn('inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-full', statusBadge.className)}>
                          <StatusIcon className="w-3 h-3" />
                          {statusBadge.text}
                        </span>
                      </div>
                      <div className="flex items-center gap-1 mt-1 text-xs text-slate-400">
                        <Clock className="w-3 h-3" />
                        截止: {formatDate(task.dueDate)}
                      </div>
                    </div>

                    <div className="shrink-0">
                      {task.status === 'completed' && task.result ? (
                        <div className="flex flex-col items-end gap-1">
                          <div className="flex items-center gap-0.5">
                            {Array.from({ length: 5 }, (_, i) => (
                              <Star
                                key={i}
                                className={cn(
                                  'w-3.5 h-3.5',
                                  i < task.result!.satisfaction
                                    ? 'fill-amber-400 text-amber-400'
                                    : 'text-slate-200'
                                )}
                              />
                            ))}
                          </div>
                          {task.result.feedback && (
                            <p className="text-xs text-slate-400 max-w-[200px] truncate">
                              {task.result.feedback}
                            </p>
                          )}
                        </div>
                      ) : (
                        <button
                          onClick={() => openModal(task)}
                          className="flex items-center gap-1.5 px-4 py-1.5 bg-primary-600 text-white text-sm font-medium rounded-lg hover:bg-primary-700 transition-colors shadow-sm shadow-primary-200"
                        >
                          <PhoneOutgoing className="w-3.5 h-3.5" />
                          执行回访
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {showModal && selectedTask && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30" onClick={() => setShowModal(false)}>
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6 max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 rounded-full bg-primary-50 flex items-center justify-center text-primary-600 text-sm font-semibold">
                {getCustomer(selectedTask.customerId)?.name?.slice(0, 1) ?? '?'}
              </div>
              <div>
                <p className="text-sm font-medium text-slate-800">
                  {getCustomer(selectedTask.customerId)?.name ?? '—'}
                </p>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className={cn('text-[11px] font-medium px-2 py-0.5 rounded-full', getTriggerBadge(selectedTask.triggerDay).className)}>
                    {getTriggerBadge(selectedTask.triggerDay).text}
                  </span>
                  <span className="text-xs text-slate-400">截止: {formatDate(selectedTask.dueDate)}</span>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-600 mb-1">客户反馈</label>
                <textarea
                  value={feedback}
                  onChange={(e) => setFeedback(e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-200 resize-none"
                  placeholder="请输入客户反馈内容..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-600 mb-2">满意度评分</label>
                <div className="flex items-center gap-1">
                  {Array.from({ length: 5 }, (_, i) => {
                    const starVal = (i + 1) as 1 | 2 | 3 | 4 | 5
                    return (
                      <button
                        key={i}
                        type="button"
                        onClick={() => setSatisfaction(starVal)}
                        className="p-0.5 transition-transform hover:scale-110"
                      >
                        <Star
                          className={cn(
                            'w-7 h-7',
                            starVal <= satisfaction
                              ? 'fill-amber-400 text-amber-400'
                              : 'text-slate-200'
                          )}
                        />
                      </button>
                    )
                  })}
                  <span className="ml-2 text-sm text-slate-500">{satisfaction} 分</span>
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium text-slate-600">是否异常</label>
                  <button
                    type="button"
                    onClick={() => setIsAbnormal(!isAbnormal)}
                    className={cn(
                      'relative w-10 h-5.5 rounded-full transition-colors',
                      isAbnormal ? 'bg-rose-500' : 'bg-slate-200'
                    )}
                  >
                    <span
                      className={cn(
                        'absolute top-0.5 w-4.5 h-4.5 bg-white rounded-full shadow transition-transform',
                        isAbnormal ? 'left-5' : 'left-0.5'
                      )}
                    />
                  </button>
                </div>
                {isAbnormal && (
                  <textarea
                    value={abnormalNote}
                    onChange={(e) => setAbnormalNote(e.target.value)}
                    rows={2}
                    className="w-full mt-2 px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-200 resize-none"
                    placeholder="请描述异常情况..."
                  />
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-600 mb-2">复购意向</label>
                <div className="flex items-center gap-3">
                  {repurchaseOptions.map((opt) => (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => setRepurchaseIntent(opt.value)}
                      className={cn(
                        'flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-sm font-medium transition-all',
                        repurchaseIntent === opt.value
                          ? 'border-primary-300 bg-primary-50 text-primary-700 ring-1 ring-primary-200'
                          : 'border-slate-200 text-slate-500 hover:border-slate-300'
                      )}
                    >
                      <span className={cn('w-2 h-2 rounded-full', opt.color)} />
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 text-sm text-slate-600 bg-slate-100 rounded-lg hover:bg-slate-200 transition-colors"
              >
                取消
              </button>
              <button
                onClick={handleSubmit}
                className="px-4 py-2 text-sm text-white bg-primary-600 rounded-lg hover:bg-primary-700 transition-colors shadow-sm shadow-primary-200"
              >
                提交回访
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
