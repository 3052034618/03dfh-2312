import { useState, useMemo } from 'react'
import {
  CheckCircle,
  Camera,
  AlertTriangle,
  Snowflake,
  ChevronRight,
  ArrowLeft,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useAppStore } from '@/store/useAppStore'
import type { Appointment } from '@/types'

type FilterTab = 'all' | 'pending' | 'completed'
type ViewMode = 'list' | 'execution'

const statusConfig: Record<
  Appointment['status'],
  { label: string; className: string }
> = {
  scheduled: {
    label: '待治疗',
    className: 'bg-teal-50 text-teal-700 border border-teal-200',
  },
  checked_in: {
    label: '已签到',
    className: 'bg-blue-50 text-blue-700 border border-blue-200',
  },
  in_progress: {
    label: '治疗中',
    className: 'bg-amber-50 text-amber-700 border border-amber-200',
  },
  completed: {
    label: '已完成',
    className: 'bg-green-50 text-green-700 border border-green-200',
  },
  no_show: {
    label: '未到诊',
    className: 'bg-red-50 text-red-700 border border-red-200',
  },
  rescheduled: {
    label: '已改期',
    className: 'bg-slate-50 text-slate-500 border border-slate-200',
  },
  cancelled: {
    label: '已取消',
    className: 'bg-slate-50 text-slate-500 border border-slate-200',
  },
}

const precautionItems = [
  '近期未暴晒',
  '未使用光敏药物',
  '面部无炎症',
  '未使用酸类护肤品',
]

const reactionOptions = [
  '轻微泛红',
  '泛红明显',
  '轻度肿胀',
  '灼热感',
  '刺痛感',
  '无明显反应',
]

const careAdviceTemplate =
  '当日避免热水洗脸，注意防晒，使用医用修复面膜，3日内避免剧烈运动'

const photoAreas = [
  '额头',
  '左面颊',
  '右面颊',
  '鼻部',
  '下颌',
  '全脸',
]

export default function TreatmentList() {
  const {
    appointments,
    customers,
    doctors,
    rooms,
    equipment,
    addRecord,
    updateAppointment,
  } = useAppStore()

  const [activeTab, setActiveTab] = useState<FilterTab>('all')
  const [viewMode, setViewMode] = useState<ViewMode>('list')
  const [selectedAppointment, setSelectedAppointment] =
    useState<Appointment | null>(null)
  const [step, setStep] = useState<1 | 2>(1)

  const [consentConfirmed, setConsentConfirmed] = useState(false)
  const [precautionsConfirmed, setPrecautionsConfirmed] = useState(false)
  const [reactions, setReactions] = useState<string[]>([])
  const [iceMinutes, setIceMinutes] = useState(15)
  const [careAdvice, setCareAdvice] = useState('')
  const [isAbnormal, setIsAbnormal] = useState(false)
  const [abnormalNote, setAbnormalNote] = useState('')

  const getCustomerName = (id: string) =>
    customers.find((c) => c.id === id)?.name ?? ''
  const getCustomerAge = (id: string) =>
    customers.find((c) => c.id === id)?.age ?? 0
  const getDoctorName = (id: string) =>
    doctors.find((d) => d.id === id)?.name ?? ''
  const getRoomName = (id: string) => rooms.find((r) => r.id === id)?.name ?? ''
  const getEquipmentName = (id: string) =>
    equipment.find((e) => e.id === id)?.name ?? ''

  const filteredAppointments = useMemo(() => {
    return appointments
      .filter((a) => {
        if (activeTab === 'pending')
          return ['scheduled', 'checked_in', 'in_progress'].includes(a.status)
        if (activeTab === 'completed') return a.status === 'completed'
        return true
      })
      .sort(
        (a, b) =>
          new Date(b.scheduledAt).getTime() -
          new Date(a.scheduledAt).getTime()
      )
  }, [appointments, activeTab])

  const formatDateTime = (dateStr: string) => {
    const d = new Date(dateStr)
    const date = d.toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    })
    const time = d.toLocaleTimeString('zh-CN', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    })
    return { date, time }
  }

  const handleStartTreatment = (appt: Appointment) => {
    setSelectedAppointment(appt)
    setViewMode('execution')
    setStep(1)
    resetExecutionForm()
  }

  const resetExecutionForm = () => {
    setConsentConfirmed(false)
    setPrecautionsConfirmed(false)
    setReactions([])
    setIceMinutes(15)
    setCareAdvice('')
    setIsAbnormal(false)
    setAbnormalNote('')
  }

  const handleBackToList = () => {
    setViewMode('list')
    setSelectedAppointment(null)
    resetExecutionForm()
  }

  const toggleReaction = (reaction: string) => {
    setReactions((prev) =>
      prev.includes(reaction)
        ? prev.filter((r) => r !== reaction)
        : [...prev, reaction]
    )
  }

  const handleSubmit = () => {
    if (!selectedAppointment) return
    addRecord({
      id: `tr${Date.now()}`,
      appointmentId: selectedAppointment.id,
      customerId: selectedAppointment.customerId,
      preCheck: {
        consentConfirmed,
        precautionsConfirmed,
        prePhotos: [],
      },
      postRecord: {
        reactions,
        iceCompressMinutes: iceMinutes,
        careAdvice,
        isAbnormal,
        ...(isAbnormal && abnormalNote ? { abnormalNote } : {}),
      },
      recordedAt: new Date().toISOString().slice(0, 16).replace('T', ' '),
    })
    updateAppointment(selectedAppointment.id, { status: 'completed' })
    handleBackToList()
  }

  if (viewMode === 'execution' && selectedAppointment) {
    const appt = selectedAppointment
    const { date, time } = formatDateTime(appt.scheduledAt)

    return (
      <div className="p-6 max-w-3xl mx-auto">
        <div className="flex items-center gap-4 mb-6">
          <button
            onClick={handleBackToList}
            className="p-2 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-slate-600" />
          </button>
          <div>
            <h1 className="text-xl font-serif-title font-bold text-slate-800">
              治疗执行
            </h1>
            <p className="text-sm text-slate-500 mt-0.5">
              {getCustomerName(appt.customerId)} · 第{appt.sessionNumber}次 ·{' '}
              {date} {time}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 mb-6">
          <div
            className={cn(
              'flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all',
              step === 1
                ? 'bg-primary-600 text-white shadow-sm shadow-primary-200'
                : 'bg-slate-100 text-slate-500'
            )}
          >
            <span
              className={cn(
                'w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold',
                step === 1
                  ? 'bg-white/20 text-white'
                  : step > 1
                    ? 'bg-emerald-500 text-white'
                    : 'bg-slate-300 text-white'
              )}
            >
              {step > 1 ? '✓' : '1'}
            </span>
            术前核对
          </div>
          <ChevronRight className="w-4 h-4 text-slate-300" />
          <div
            className={cn(
              'flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all',
              step === 2
                ? 'bg-primary-600 text-white shadow-sm shadow-primary-200'
                : 'bg-slate-100 text-slate-500'
            )}
          >
            <span
              className={cn(
                'w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold',
                step === 2
                  ? 'bg-white/20 text-white'
                  : 'bg-slate-300 text-white'
              )}
            >
              2
            </span>
            术后记录
          </div>
        </div>

        {step === 1 && (
          <div className="space-y-5">
            <div className="card p-5">
              <h3 className="text-sm font-semibold text-slate-700 mb-4 flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-primary-500" />
                知情同意书确认
              </h3>
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={consentConfirmed}
                  onChange={(e) => setConsentConfirmed(e.target.checked)}
                  className="mt-0.5 w-4 h-4 rounded border-slate-300 text-primary-600 focus:ring-primary-200"
                />
                <span className="text-sm text-slate-600">
                  已向客户充分告知治疗风险及注意事项，客户已签署知情同意书
                </span>
              </label>
            </div>

            <div className="card p-5">
              <h3 className="text-sm font-semibold text-slate-700 mb-4 flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-primary-500" />
                术前注意事项确认
              </h3>
              <label className="flex items-start gap-3 cursor-pointer mb-4">
                <input
                  type="checkbox"
                  checked={precautionsConfirmed}
                  onChange={(e) => setPrecautionsConfirmed(e.target.checked)}
                  className="mt-0.5 w-4 h-4 rounded border-slate-300 text-primary-600 focus:ring-primary-200"
                />
                <span className="text-sm text-slate-600">
                  已确认以下术前注意事项
                </span>
              </label>
              <div className="grid grid-cols-2 gap-2 ml-7">
                {precautionItems.map((item) => (
                  <div
                    key={item}
                    className={cn(
                      'flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium',
                      precautionsConfirmed
                        ? 'bg-primary-50 text-primary-700 border border-primary-100'
                        : 'bg-slate-50 text-slate-500 border border-slate-100'
                    )}
                  >
                    <CheckCircle className="w-3.5 h-3.5" />
                    {item}
                  </div>
                ))}
              </div>
            </div>

            <div className="card p-5">
              <h3 className="text-sm font-semibold text-slate-700 mb-4 flex items-center gap-2">
                <Camera className="w-4 h-4 text-primary-500" />
                术前拍照记录
              </h3>
              <div className="grid grid-cols-3 gap-3">
                {photoAreas.map((area) => (
                  <div
                    key={area}
                    className="flex flex-col items-center justify-center h-24 rounded-lg border-2 border-dashed border-slate-200 bg-slate-50 hover:border-primary-300 hover:bg-primary-50/30 transition-colors cursor-pointer"
                  >
                    <Camera className="w-5 h-5 text-slate-400 mb-1" />
                    <span className="text-xs text-slate-500">{area}</span>
                  </div>
                ))}
              </div>
            </div>

            <button
              onClick={() => setStep(2)}
              disabled={!consentConfirmed || !precautionsConfirmed}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-lg bg-primary-600 text-white font-medium text-sm hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm shadow-primary-200"
            >
              确认并继续
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-5">
            <div className="card p-5">
              <h3 className="text-sm font-semibold text-slate-700 mb-4">
                术后反应
              </h3>
              <div className="flex flex-wrap gap-2">
                {reactionOptions.map((reaction) => (
                  <button
                    key={reaction}
                    type="button"
                    onClick={() => toggleReaction(reaction)}
                    className={cn(
                      'px-3 py-1.5 rounded-lg text-xs font-medium border transition-all',
                      reactions.includes(reaction)
                        ? 'bg-primary-50 border-primary-300 text-primary-700 ring-1 ring-primary-200'
                        : 'bg-white border-slate-200 text-slate-500 hover:border-slate-300'
                    )}
                  >
                    {reactions.includes(reaction) && '✓ '}
                    {reaction}
                  </button>
                ))}
              </div>
            </div>

            <div className="card p-5">
              <h3 className="text-sm font-semibold text-slate-700 mb-4 flex items-center gap-2">
                <Snowflake className="w-4 h-4 text-blue-500" />
                冰敷时长
              </h3>
              <div className="flex items-center gap-4">
                <input
                  type="range"
                  min={0}
                  max={60}
                  value={iceMinutes}
                  onChange={(e) => setIceMinutes(Number(e.target.value))}
                  className="flex-1 accent-primary-600 h-1.5"
                />
                <span className="text-sm font-semibold text-primary-700 min-w-[60px] text-right">
                  {iceMinutes} 分钟
                </span>
              </div>
              <div className="flex justify-between mt-1">
                <span className="text-[10px] text-slate-400">0</span>
                <span className="text-[10px] text-slate-400">60</span>
              </div>
            </div>

            <div className="card p-5">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-semibold text-slate-700">
                  护理建议
                </h3>
                <button
                  type="button"
                  onClick={() => setCareAdvice(careAdviceTemplate)}
                  className="text-xs text-primary-600 hover:text-primary-700 font-medium px-2 py-1 rounded-md hover:bg-primary-50 transition-colors"
                >
                  使用模板
                </button>
              </div>
              <textarea
                value={careAdvice}
                onChange={(e) => setCareAdvice(e.target.value)}
                rows={3}
                className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 placeholder:text-slate-400 focus:border-primary-300 focus:outline-none focus:ring-1 focus:ring-primary-200 resize-none"
                placeholder="请输入术后护理建议..."
              />
            </div>

            <div className="card p-5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-amber-500" />
                  <h3 className="text-sm font-semibold text-slate-700">
                    异常标记
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => setIsAbnormal(!isAbnormal)}
                  className={cn(
                    'relative inline-flex h-6 w-11 items-center rounded-full transition-colors',
                    isAbnormal ? 'bg-amber-500' : 'bg-slate-200'
                  )}
                >
                  <span
                    className={cn(
                      'inline-block h-4 w-4 transform rounded-full bg-white transition-transform shadow-sm',
                      isAbnormal ? 'translate-x-6' : 'translate-x-1'
                    )}
                  />
                </button>
              </div>
              {isAbnormal && (
                <textarea
                  value={abnormalNote}
                  onChange={(e) => setAbnormalNote(e.target.value)}
                  rows={2}
                  className="w-full mt-3 rounded-lg border border-amber-200 bg-amber-50/50 px-3 py-2 text-sm text-slate-700 placeholder:text-amber-400 focus:border-amber-300 focus:outline-none focus:ring-1 focus:ring-amber-200 resize-none"
                  placeholder="请描述异常情况..."
                />
              )}
            </div>

            <button
              onClick={handleSubmit}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-lg bg-primary-600 text-white font-medium text-sm hover:bg-primary-700 transition-colors shadow-sm shadow-primary-200"
            >
              <CheckCircle className="w-4 h-4" />
              提交记录
            </button>
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="font-serif-title text-2xl font-semibold text-slate-800">
          治疗记录
        </h1>
      </div>

      <div className="flex items-center gap-2">
        {(
          [
            { key: 'all', label: '全部' },
            { key: 'pending', label: '待治疗' },
            { key: 'completed', label: '已完成' },
          ] as { key: FilterTab; label: string }[]
        ).map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={cn(
              'px-5 py-2.5 rounded-lg text-sm font-medium transition-all duration-150',
              activeTab === tab.key
                ? 'bg-primary-600 text-white shadow-sm'
                : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="space-y-3">
        {filteredAppointments.map((appt) => {
          const { date, time } = formatDateTime(appt.scheduledAt)
          const status = statusConfig[appt.status]
          const isScheduled = ['scheduled', 'checked_in', 'in_progress'].includes(
            appt.status
          )
          const isCompleted = appt.status === 'completed'

          return (
            <div
              key={appt.id}
              className="card bg-white rounded-xl p-5 border border-slate-100 shadow-sm"
            >
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-sm font-semibold text-slate-800">
                      {getCustomerName(appt.customerId)}
                    </span>
                    <span className="text-xs text-slate-400">
                      {getCustomerAge(appt.customerId)}岁
                    </span>
                    <span
                      className={cn(
                        'px-2 py-0.5 rounded-full text-[10px] font-medium',
                        status.className
                      )}
                    >
                      {status.label}
                    </span>
                  </div>
                  <div className="flex items-center gap-4 text-xs text-slate-500">
                    <span>
                      {date} {time}
                    </span>
                    <span>
                      {getDoctorName(appt.doctorId)} · {getRoomName(appt.roomId)}{' '}
                      · {getEquipmentName(appt.equipmentId)}
                    </span>
                    <span className="text-primary-600 font-medium">
                      第{appt.sessionNumber}次
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-3 ml-4">
                  {isScheduled && (
                    <button
                      onClick={() => handleStartTreatment(appt)}
                      className="inline-flex items-center gap-1.5 px-4 py-2 bg-primary-600 text-white text-xs font-medium rounded-lg hover:bg-primary-700 transition-colors shadow-sm shadow-primary-200"
                    >
                      开始治疗
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  )}
                  {isCompleted && (
                    <span className="text-xs text-primary-600 font-medium hover:text-primary-700 cursor-pointer">
                      查看记录
                    </span>
                  )}
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {filteredAppointments.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 text-slate-400">
          <CheckCircle className="w-12 h-12 mb-3 text-slate-300" />
          <p className="text-sm">暂无匹配的治疗记录</p>
        </div>
      )}
    </div>
  )
}
