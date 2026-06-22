import { useState, useMemo } from 'react'
import { BarChart3, TrendingUp, Users, AlertTriangle, Eye } from 'lucide-react'
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, BarChart, Bar, Legend,
} from 'recharts'
import { format, subDays, eachDayOfInterval } from 'date-fns'
import { useAppStore } from '@/store/useAppStore'
import { cn } from '@/lib/utils'

type TimeRange = 7 | 30 | 90

const timeRangeOptions: { label: string; value: TimeRange }[] = [
  { label: '近7天', value: 7 },
  { label: '近30天', value: 30 },
  { label: '近90天', value: 90 },
]

const REPURCHASE_COLORS: Record<string, string> = {
  high: '#10B981',
  medium: '#F59E0B',
  low: '#9CA3AF',
  none: '#64748B',
}

const REPURCHASE_LABELS: Record<string, string> = {
  high: '高',
  medium: '中',
  low: '低',
  none: '无',
}

export default function Dashboard() {
  const [range, setRange] = useState<TimeRange>(7)
  const { customers, treatmentPlans, records, followUps, appointments } = useAppStore()

  const totalCustomers = customers.length
  const inProgressCustomers = customers.filter((c) => c.treatmentStatus === 'in_progress').length

  const completedPlans = treatmentPlans.filter((p) =>
    p.sessions.every((s) => s.status === 'completed')
  ).length
  const completionRate = treatmentPlans.length > 0
    ? Math.round((completedPlans / treatmentPlans.length) * 100)
    : 0

  const abnormalCount = records.filter((r) => r.postRecord.isAbnormal).length
  const abnormalRate = records.length > 0
    ? parseFloat(((abnormalCount / records.length) * 100).toFixed(1))
    : 0

  const lineChartData = useMemo(() => {
    const today = new Date()
    const start = subDays(today, range - 1)
    const days = eachDayOfInterval({ start, end: today })

    return days.map((day) => {
      const dayStr = format(day, 'yyyy-MM-dd')
      const completedSessions = treatmentPlans.reduce((count, plan) => {
        return count + plan.sessions.filter(
          (s) => s.status === 'completed' && s.scheduledDate === dayStr
        ).length
      }, 0)
      const totalSessions = treatmentPlans.reduce((count, plan) => {
        return count + plan.sessions.filter(
          (s) => s.scheduledDate === dayStr && s.status !== 'planned'
        ).length
      }, 0)
      const rate = totalSessions > 0 ? Math.round((completedSessions / totalSessions) * 100) : 0
      return {
        date: format(day, range <= 7 ? 'M/d' : 'M/d'),
        rate,
      }
    })
  }, [treatmentPlans, range])

  const pieChartData = useMemo(() => {
    const counts: Record<string, number> = { high: 0, medium: 0, low: 0, none: 0 }
    customers.forEach((c) => {
      counts[c.repurchaseIntent] = (counts[c.repurchaseIntent] || 0) + 1
    })
    return Object.entries(counts).map(([key, value]) => ({
      name: REPURCHASE_LABELS[key],
      value,
      color: REPURCHASE_COLORS[key],
      key,
    }))
  }, [customers])

  const barChartData = useMemo(() => {
    const reactionCounts: Record<string, number> = {}
    records.forEach((r) => {
      r.postRecord.reactions.forEach((reaction) => {
        reactionCounts[reaction] = (reactionCounts[reaction] || 0) + 1
      })
    })
    return Object.entries(reactionCounts)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
  }, [records])

  const atRiskCustomers = useMemo(() => {
    const today = new Date()
    const fourteenDaysLater = new Date(today)
    fourteenDaysLater.setDate(today.getDate() + 14)

    const inProgressCustomers = customers.filter((c) => c.treatmentStatus === 'in_progress')

    return inProgressCustomers.map((c) => {
      const hasUpcomingAppointment = appointments.some(
        (a) =>
          a.customerId === c.id &&
          a.status === 'scheduled' &&
          new Date(a.scheduledAt) <= fourteenDaysLater &&
          new Date(a.scheduledAt) >= today
      )

      const overdueFollowUps = followUps.filter(
        (f) => f.customerId === c.id && f.status === 'overdue'
      )

      const lastRecord = records
        .filter((r) => r.customerId === c.id)
        .sort((a, b) => new Date(b.recordedAt).getTime() - new Date(a.recordedAt).getTime())[0]

      const riskLevel = overdueFollowUps.length > 0 ? 'overdue' : !hasUpcomingAppointment ? 'no_appointment' : null

      return {
        customer: c,
        riskLevel,
        lastTreatmentDate: lastRecord ? format(new Date(lastRecord.recordedAt), 'yyyy-MM-dd') : '—',
      }
    }).filter((item) => item.riskLevel !== null)
  }, [customers, appointments, followUps, records])

  const statCards = [
    { key: 'total', label: '总客户数', value: totalCustomers, icon: Users, gradient: 'from-primary-500 to-primary-700' },
    { key: 'inProgress', label: '治疗中客户', value: inProgressCustomers, icon: BarChart3, gradient: 'from-blue-500 to-blue-600' },
    { key: 'completion', label: '疗程完成率', value: `${completionRate}%`, icon: TrendingUp, gradient: 'from-emerald-500 to-emerald-600' },
    { key: 'abnormal', label: '异常反应率', value: `${abnormalRate}%`, icon: AlertTriangle, gradient: 'from-rose-500 to-rose-600' },
  ]

  return (
    <div className="p-8 max-w-6xl">
      <div className="flex items-center justify-between mb-8">
        <h1 className="font-serif-title text-2xl font-bold text-slate-800">运营看板</h1>
        <div className="flex items-center gap-1 bg-slate-100 rounded-lg p-1">
          {timeRangeOptions.map((opt) => (
            <button
              key={opt.value}
              onClick={() => setRange(opt.value)}
              className={cn(
                'px-3 py-1.5 text-sm rounded-md transition-colors',
                range === opt.value
                  ? 'bg-white text-slate-800 font-medium shadow-sm'
                  : 'text-slate-500 hover:text-slate-700'
              )}
            >
              {opt.label}
            </button>
          ))}
        </div>
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
                  <p className="mt-2 text-3xl font-bold">{card.value}</p>
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

      <div className="grid grid-cols-2 gap-5 mb-5">
        <div className="card p-6">
          <h2 className="text-base font-semibold text-slate-800 mb-5">疗程完成率趋势</h2>
          <ResponsiveContainer width="100%" height={280}>
            <LineChart data={lineChartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
              <XAxis dataKey="date" tick={{ fontSize: 12, fill: '#94A3B8' }} />
              <YAxis
                tick={{ fontSize: 12, fill: '#94A3B8' }}
                domain={[0, 100]}
                tickFormatter={(v: number) => `${v}%`}
              />
              <Tooltip
                formatter={(value: number) => [`${value}%`, '完成率']}
                contentStyle={{ borderRadius: 8, border: '1px solid #E2E8F0', fontSize: 13 }}
              />
              <Line
                type="monotone"
                dataKey="rate"
                stroke="#0D9488"
                strokeWidth={2}
                dot={{ r: 3, fill: '#0D9488' }}
                activeDot={{ r: 5, fill: '#0D9488' }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="card p-6">
          <h2 className="text-base font-semibold text-slate-800 mb-5">复购意向分布</h2>
          <ResponsiveContainer width="100%" height={280}>
            <PieChart>
              <Pie
                data={pieChartData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={95}
                paddingAngle={3}
                dataKey="value"
                nameKey="name"
                label={({ name, percent }: { name: string; percent: number }) =>
                  `${name} ${(percent * 100).toFixed(0)}%`
                }
              >
                {pieChartData.map((entry) => (
                  <Cell key={entry.key} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{ borderRadius: 8, border: '1px solid #E2E8F0', fontSize: 13 }}
              />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-5">
        <div className="card p-6">
          <h2 className="text-base font-semibold text-slate-800 mb-5">异常反应分布</h2>
          {barChartData.length === 0 ? (
            <div className="py-12 text-center text-sm text-slate-400">暂无异常反应记录</div>
          ) : (
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={barChartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                <XAxis dataKey="name" tick={{ fontSize: 12, fill: '#94A3B8' }} />
                <YAxis tick={{ fontSize: 12, fill: '#94A3B8' }} allowDecimals={false} />
                <Tooltip
                  contentStyle={{ borderRadius: 8, border: '1px solid #E2E8F0', fontSize: 13 }}
                />
                <Bar dataKey="count" fill="#14B8A6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        <div className="card p-6">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-base font-semibold text-slate-800">流失预警</h2>
            <span className="text-xs text-rose-500 font-medium">{atRiskCustomers.length} 位</span>
          </div>
          {atRiskCustomers.length === 0 ? (
            <div className="py-12 text-center text-sm text-slate-400">暂无流失风险客户</div>
          ) : (
            <div className="space-y-3">
              {atRiskCustomers.map(({ customer, riskLevel, lastTreatmentDate }) => (
                <div
                  key={customer.id}
                  className="flex items-center gap-4 px-4 py-3.5 rounded-lg border border-slate-100 hover:bg-slate-50/60 transition-colors"
                >
                  <div
                    className={cn(
                      'w-2.5 h-2.5 rounded-full shrink-0',
                      riskLevel === 'overdue' ? 'bg-orange-400' : 'bg-red-500'
                    )}
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-700">{customer.name}</p>
                    <p className="text-xs text-slate-400 mt-0.5">
                      末次治疗 {lastTreatmentDate}
                    </p>
                  </div>
                  <span
                    className={cn(
                      'text-[11px] font-medium px-2 py-0.5 rounded-full',
                      riskLevel === 'overdue'
                        ? 'bg-orange-50 text-orange-600'
                        : 'bg-red-50 text-red-600'
                    )}
                  >
                    {riskLevel === 'overdue' ? '回访逾期' : '无近期预约'}
                  </span>
                  <button className="flex items-center gap-1 text-xs text-primary-600 hover:text-primary-700 font-medium">
                    <Eye className="w-3.5 h-3.5" />
                    查看
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
