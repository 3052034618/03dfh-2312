import { CalendarCheck, PhoneOutgoing, UserPlus, AlertTriangle, Clock, User, ChevronRight } from 'lucide-react'
import { useAppStore } from '@/store/useAppStore'
import { cn } from '@/lib/utils'

const statCards = [
  { key: 'pending', label: '待治疗', icon: CalendarCheck, gradient: 'from-primary-500 to-primary-700' },
  { key: 'followUp', label: '待回访', icon: PhoneOutgoing, gradient: 'from-amber-500 to-amber-600' },
  { key: 'newFile', label: '新建档', icon: UserPlus, gradient: 'from-blue-500 to-blue-600' },
  { key: 'abnormal', label: '异常提醒', icon: AlertTriangle, gradient: 'from-rose-500 to-rose-600' },
] as const

export default function Home() {
  const { appointments, customers, followUps, records, doctors } = useAppStore()

  const today = new Date().toISOString().split('T')[0]

  const todayAppointments = appointments.filter(
    (a) => a.scheduledAt.startsWith(today) && a.status !== 'cancelled' && a.status !== 'completed'
  )

  const pendingFollowUps = followUps.filter(
    (f) => f.status === 'pending' || f.status === 'overdue'
  )

  const newFilesToday = customers.filter((c) => c.createdAt === today)

  const abnormalRecords = records.filter((r) => r.postRecord.isAbnormal)

  const statValues: Record<string, number> = {
    pending: todayAppointments.length,
    followUp: pendingFollowUps.length,
    newFile: newFilesToday.length,
    abnormal: abnormalRecords.length,
  }

  const getCustomerName = (id: string) => customers.find((c) => c.id === id)?.name ?? '—'
  const getDoctorName = (id: string) => doctors.find((d) => d.id === id)?.name ?? '—'

  const formatTime = (scheduledAt: string) => {
    const time = scheduledAt.split('T')[1]
    return time ? time.slice(0, 5) : '—'
  }

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr + 'T00:00:00')
    const year = d.getFullYear()
    const month = d.getMonth() + 1
    const day = d.getDate()
    const weekdays = ['日', '一', '二', '三', '四', '五', '六']
    const weekday = weekdays[d.getDay()]
    return `${year}年${month}月${day}日 星期${weekday}`
  }

  return (
    <div className="p-8 max-w-6xl">
      <div className="mb-8">
        <h1 className="font-serif-title text-2xl font-bold text-slate-800">工作台</h1>
        <p className="mt-1 text-sm text-slate-400">{formatDate(today)}</p>
      </div>

      <div className="grid grid-cols-4 gap-5 mb-8">
        {statCards.map((card) => {
          const Icon = card.icon
          return (
            <div
              key={card.key}
              className={cn(
                'relative overflow-hidden rounded-xl px-5 py-5 bg-gradient-to-br text-white shadow-sm',
                card.gradient
              )}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-white/80">{card.label}</p>
                  <p className="mt-2 text-3xl font-bold">{statValues[card.key]}</p>
                </div>
                <div className="w-11 h-11 rounded-lg bg-white/20 flex items-center justify-center">
                  <Icon className="w-6 h-6 text-white" />
                </div>
              </div>
              <div className="absolute -right-4 -bottom-4 w-24 h-24 rounded-full bg-white/10" />
            </div>
          )
        })}
      </div>

      <div className="grid grid-cols-5 gap-5">
        <div className="col-span-3 card p-6">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-base font-semibold text-slate-800">今日待办</h2>
            <span className="text-xs text-slate-400">{todayAppointments.length} 项预约</span>
          </div>

          {todayAppointments.length === 0 ? (
            <div className="py-12 text-center text-sm text-slate-400">今日暂无预约</div>
          ) : (
            <div className="space-y-3">
              {todayAppointments.map((apt) => (
                <div
                  key={apt.id}
                  className="flex items-center gap-4 px-4 py-3.5 rounded-lg border border-slate-100 hover:bg-slate-50/60 transition-colors cursor-pointer group"
                >
                  <div className="flex items-center gap-2 text-sm text-primary-600 font-medium min-w-[52px]">
                    <Clock className="w-3.5 h-3.5" />
                    {formatTime(apt.scheduledAt)}
                  </div>

                  <div className="w-8 h-8 rounded-full bg-primary-50 flex items-center justify-center shrink-0">
                    <User className="w-4 h-4 text-primary-600" />
                  </div>

                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-700">{getCustomerName(apt.customerId)}</p>
                    <p className="text-xs text-slate-400 mt-0.5">
                      第 {apt.sessionNumber} 次治疗 · {getDoctorName(apt.doctorId)} 医生
                    </p>
                  </div>

                  <span
                    className={cn(
                      'text-[11px] font-medium px-2 py-0.5 rounded-full',
                      apt.status === 'checked_in'
                        ? 'bg-primary-50 text-primary-700'
                        : 'bg-slate-100 text-slate-500'
                    )}
                  >
                    {apt.status === 'checked_in' ? '已签到' : '待签到'}
                  </span>

                  <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-slate-400 transition-colors" />
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="col-span-2 card p-6">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-base font-semibold text-slate-800">异常提醒</h2>
            <span className="text-xs text-rose-500 font-medium">{abnormalRecords.length} 条</span>
          </div>

          {abnormalRecords.length === 0 ? (
            <div className="py-12 text-center text-sm text-slate-400">暂无异常记录</div>
          ) : (
            <div className="space-y-3">
              {abnormalRecords.map((record) => (
                <div
                  key={record.id}
                  className="px-4 py-3.5 rounded-lg border border-rose-100 bg-rose-50/40 hover:bg-rose-50/70 transition-colors cursor-pointer"
                >
                  <div className="flex items-start gap-3">
                    <div className="w-7 h-7 rounded-lg bg-rose-100 flex items-center justify-center shrink-0 mt-0.5">
                      <AlertTriangle className="w-3.5 h-3.5 text-rose-500" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-medium text-slate-700">
                          {getCustomerName(record.customerId)}
                        </p>
                        <span className="text-[10px] text-rose-500 font-medium">异常</span>
                      </div>
                      <p className="text-xs text-slate-500 mt-1 line-clamp-2">
                        {record.postRecord.abnormalNote ?? record.postRecord.reactions.join('、')}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
