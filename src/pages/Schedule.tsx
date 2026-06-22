import { useState, useMemo } from 'react'
import { format, addDays, startOfWeek, parseISO, isSameDay } from 'date-fns'
import { zhCN } from 'date-fns/locale'
import { Calendar, Plus, ChevronLeft, ChevronRight, Edit } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useAppStore } from '@/store/useAppStore'
import type { Appointment } from '@/types'

type ViewMode = 'day' | 'week' | 'month'

const HOURS = Array.from({ length: 9 }, (_, i) => i + 9)
const DAYS_ZH = ['周一', '周二', '周三', '周四', '周五', '周六', '周日']

const TIME_SLOTS: string[] = []
for (let h = 9; h <= 17; h++) {
  TIME_SLOTS.push(`${String(h).padStart(2, '0')}:00`)
  TIME_SLOTS.push(`${String(h).padStart(2, '0')}:30`)
}

function getStatusClasses(status: Appointment['status']) {
  switch (status) {
    case 'completed':
      return 'bg-green-50 border-green-300 text-green-800'
    case 'no_show':
      return 'bg-red-50 border-red-200 text-red-800'
    case 'late':
      return 'bg-amber-50 border-amber-200 text-amber-800'
    case 'rescheduled':
      return 'bg-blue-50 border-blue-200 text-blue-800'
    case 'cancelled':
      return 'bg-gray-50 border-gray-200 text-gray-800'
    default:
      return 'bg-primary-50 border-primary-300 text-primary-800'
  }
}

function getStatusLabel(status: Appointment['status']) {
  switch (status) {
    case 'scheduled': return '已预约'
    case 'checked_in': return '已签到'
    case 'in_progress': return '进行中'
    case 'completed': return '已完成'
    case 'no_show': return '漏约'
    case 'late': return '迟到'
    case 'rescheduled': return '改约'
    case 'cancelled': return '取消'
    default: return status
  }
}

export default function Schedule() {
  const { appointments, customers, doctors, rooms, equipment, treatmentPlans, addAppointment, updateAppointment, updateTreatmentPlan } = useAppStore()

  const [viewMode, setViewMode] = useState<ViewMode>('week')
  const [currentDate, setCurrentDate] = useState(new Date())
  const [filterDoctor, setFilterDoctor] = useState('')
  const [filterEquipment, setFilterEquipment] = useState('')
  const [filterRoom, setFilterRoom] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [showStatusModal, setShowStatusModal] = useState<Appointment | null>(null)
  const [selectedStatus, setSelectedStatus] = useState<'late' | 'no_show' | 'rescheduled' | 'cancelled' | null>(null)
  const [changeReason, setChangeReason] = useState('')

  const [formCustomerId, setFormCustomerId] = useState('')
  const [formDoctorId, setFormDoctorId] = useState('')
  const [formRoomId, setFormRoomId] = useState('')
  const [formEquipmentId, setFormEquipmentId] = useState('')
  const [formDate, setFormDate] = useState('')
  const [formTime, setFormTime] = useState('09:00')
  const [formSession, setFormSession] = useState(1)

  const weekStart = startOfWeek(currentDate, { weekStartsOn: 1 })
  const weekDays = useMemo(
    () => Array.from({ length: 7 }, (_, i) => addDays(weekStart, i)),
    [weekStart]
  )

  const filteredAppointments = useMemo(() => {
    return appointments.filter((a) => {
      if (filterDoctor && a.doctorId !== filterDoctor) return false
      if (filterEquipment && a.equipmentId !== filterEquipment) return false
      if (filterRoom && a.roomId !== filterRoom) return false
      return true
    })
  }, [appointments, filterDoctor, filterEquipment, filterRoom])

  const getAppointmentsForSlot = (day: Date, hour: number) => {
    return filteredAppointments.filter((a) => {
      const d = parseISO(a.scheduledAt)
      return isSameDay(d, day) && d.getHours() === hour
    })
  }

  const getCustomerName = (id: string) => customers.find((c) => c.id === id)?.name ?? ''
  const getDoctorName = (id: string) => doctors.find((d) => d.id === id)?.name ?? ''
  const getRoomName = (id: string) => rooms.find((r) => r.id === id)?.name ?? ''

  const navigatePrev = () => {
    if (viewMode === 'day') setCurrentDate(addDays(currentDate, -1))
    else if (viewMode === 'week') setCurrentDate(addDays(currentDate, -7))
    else setCurrentDate(addDays(currentDate, -30))
  }

  const navigateNext = () => {
    if (viewMode === 'day') setCurrentDate(addDays(currentDate, 1))
    else if (viewMode === 'week') setCurrentDate(addDays(currentDate, 7))
    else setCurrentDate(addDays(currentDate, 30))
  }

  const navigateToday = () => setCurrentDate(new Date())

  const resetForm = () => {
    setFormCustomerId('')
    setFormDoctorId('')
    setFormRoomId('')
    setFormEquipmentId('')
    setFormDate('')
    setFormTime('09:00')
    setFormSession(1)
  }

  const handleAddAppointment = () => {
    if (!formCustomerId || !formDoctorId || !formRoomId || !formEquipmentId || !formDate || !formTime) return
    addAppointment({
      id: `ap${Date.now()}`,
      customerId: formCustomerId,
      doctorId: formDoctorId,
      roomId: formRoomId,
      equipmentId: formEquipmentId,
      scheduledAt: `${formDate}T${formTime}`,
      duration: 45,
      status: 'scheduled',
      sessionNumber: formSession,
    })
    setShowModal(false)
    resetForm()
  }

  const handleOpenStatusModal = (appt: Appointment) => {
    setShowStatusModal(appt)
    setSelectedStatus(null)
    setChangeReason('')
  }

  const handleConfirmStatusChange = () => {
    if (!showStatusModal || !selectedStatus) return

    updateAppointment(showStatusModal.id, {
      status: selectedStatus,
      changeReason: changeReason
    })

    if (selectedStatus === 'no_show' || selectedStatus === 'cancelled' || selectedStatus === 'rescheduled') {
      const plan = treatmentPlans.find(p => p.customerId === showStatusModal.customerId)
      if (plan) {
        const updatedSessions = plan.sessions.map(s => 
          s.sessionNumber === showStatusModal.sessionNumber 
            ? { ...s, status: 'skipped' as const } 
            : s
        )
        updateTreatmentPlan(plan.id, { sessions: updatedSessions })
      }
    }

    setShowStatusModal(null)
    setSelectedStatus(null)
    setChangeReason('')
  }

  const renderApptPill = (appt: Appointment, compact = false) => (
    <div
      key={appt.id}
      className={cn(
        'px-2 py-1 rounded-md border text-[11px] leading-tight relative group',
        getStatusClasses(appt.status)
      )}
    >
      <button
        onClick={(e) => { e.stopPropagation(); handleOpenStatusModal(appt) }}
        className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 p-0.5 rounded hover:bg-black/10 transition-opacity"
        title="状态变更"
      >
        <Edit className="w-3 h-3" />
      </button>
      <div className="font-medium truncate pr-4">{getCustomerName(appt.customerId)}</div>
      {!compact && (
        <>
          <div className="opacity-70 truncate">{getDoctorName(appt.doctorId)} · {getRoomName(appt.roomId)}</div>
          <div className="opacity-60">第{appt.sessionNumber}次</div>
        </>
      )}
      {appt.changeReason && (appt.status === 'late' || appt.status === 'no_show' || appt.status === 'rescheduled' || appt.status === 'cancelled') && (
        <div className="mt-1 pt-1 border-t border-current/20 text-[10px] opacity-80">
          状态变更: {getStatusLabel(appt.status)} 原因: {appt.changeReason}
        </div>
      )}
    </div>
  )

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
        <div className="flex items-center gap-3">
          <Calendar className="w-5 h-5 text-primary-600" />
          <h1 className="font-serif-title text-xl font-semibold text-slate-800">预约排班</h1>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center bg-slate-100 rounded-lg p-0.5">
            {(['day', 'week', 'month'] as ViewMode[]).map((mode) => (
              <button
                key={mode}
                onClick={() => setViewMode(mode)}
                className={cn(
                  'px-3 py-1.5 text-xs font-medium rounded-md transition-all',
                  viewMode === mode
                    ? 'bg-white text-primary-700 shadow-sm'
                    : 'text-slate-500 hover:text-slate-700'
                )}
              >
                {mode === 'day' ? '日' : mode === 'week' ? '周' : '月'}
              </button>
            ))}
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-1.5 px-4 py-2 bg-primary-600 text-white text-sm font-medium rounded-lg hover:bg-primary-700 transition-colors shadow-sm shadow-primary-200"
          >
            <Plus className="w-4 h-4" />
            新建预约
          </button>
        </div>
      </div>

      <div className="flex items-center gap-4 px-6 py-3 border-b border-slate-100 bg-slate-50/50">
        <select
          value={filterDoctor}
          onChange={(e) => setFilterDoctor(e.target.value)}
          className="px-3 py-1.5 text-sm border border-slate-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-primary-200"
        >
          <option value="">全部医生</option>
          {doctors.map((d) => (
            <option key={d.id} value={d.id}>{d.name}</option>
          ))}
        </select>
        <select
          value={filterEquipment}
          onChange={(e) => setFilterEquipment(e.target.value)}
          className="px-3 py-1.5 text-sm border border-slate-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-primary-200"
        >
          <option value="">全部仪器</option>
          {equipment.map((eq) => (
            <option key={eq.id} value={eq.id}>{eq.name}</option>
          ))}
        </select>
        <select
          value={filterRoom}
          onChange={(e) => setFilterRoom(e.target.value)}
          className="px-3 py-1.5 text-sm border border-slate-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-primary-200"
        >
          <option value="">全部房间</option>
          {rooms.map((r) => (
            <option key={r.id} value={r.id}>{r.name}</option>
          ))}
        </select>
      </div>

      <div className="flex items-center gap-3 px-6 py-2 border-b border-slate-100">
        <button onClick={navigatePrev} className="p-1 rounded hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors">
          <ChevronLeft className="w-4 h-4" />
        </button>
        <button onClick={navigateNext} className="p-1 rounded hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors">
          <ChevronRight className="w-4 h-4" />
        </button>
        <button onClick={navigateToday} className="px-3 py-1 text-xs font-medium text-primary-600 bg-primary-50 rounded-md hover:bg-primary-100 transition-colors">
          今天
        </button>
        <span className="text-sm font-medium text-slate-700">
          {viewMode === 'week'
            ? `${format(weekStart, 'yyyy年M月d日', { locale: zhCN })} - ${format(addDays(weekStart, 6), 'M月d日', { locale: zhCN })}`
            : format(currentDate, 'yyyy年M月d日', { locale: zhCN })}
        </span>
      </div>

      {viewMode === 'week' && (
        <div className="flex-1 overflow-auto">
          <div className="min-w-[900px]">
            <div className="grid grid-cols-[60px_repeat(7,1fr)] border-b border-slate-200">
              <div className="p-2" />
              {weekDays.map((day, i) => (
                <div
                  key={i}
                  className={cn(
                    'p-2 text-center border-l border-slate-200',
                    isSameDay(day, new Date()) && 'bg-primary-50/50'
                  )}
                >
                  <div className="text-xs text-slate-400">{DAYS_ZH[i]}</div>
                  <div className={cn(
                    'text-sm font-medium',
                    isSameDay(day, new Date()) ? 'text-primary-700' : 'text-slate-700'
                  )}>
                    {format(day, 'M/d')}
                  </div>
                </div>
              ))}
            </div>
            {HOURS.map((hour) => (
              <div key={hour} className="grid grid-cols-[60px_repeat(7,1fr)] border-b border-slate-100">
                <div className="p-2 text-xs text-slate-400 text-right pr-3">
                  {String(hour).padStart(2, '0')}:00
                </div>
                {weekDays.map((day, i) => {
                  const appts = getAppointmentsForSlot(day, hour)
                  return (
                    <div
                      key={i}
                      className={cn(
                        'p-1 border-l border-slate-100 min-h-[60px]',
                        isSameDay(day, new Date()) && 'bg-primary-50/20'
                      )}
                    >
                      <div className="flex flex-col gap-1">
                        {appts.map((appt) => renderApptPill(appt))}
                      </div>
                    </div>
                  )
                })}
              </div>
            ))}
          </div>
        </div>
      )}

      {viewMode === 'day' && (
        <div className="flex-1 overflow-auto">
          <div className="max-w-2xl mx-auto">
            {HOURS.map((hour) => {
              const appts = getAppointmentsForSlot(currentDate, hour)
              return (
                <div key={hour} className="grid grid-cols-[60px_1fr] border-b border-slate-100">
                  <div className="p-2 text-xs text-slate-400 text-right pr-3">
                    {String(hour).padStart(2, '0')}:00
                  </div>
                  <div className="p-2 border-l border-slate-100 min-h-[60px]">
                    <div className="flex flex-col gap-1">
                      {appts.map((appt) => renderApptPill(appt))}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {viewMode === 'month' && (
        <div className="flex-1 overflow-auto p-4">
          <div className="grid grid-cols-7 gap-px bg-slate-200 rounded-lg overflow-hidden">
            {DAYS_ZH.map((d) => (
              <div key={d} className="bg-slate-50 p-2 text-center text-xs font-medium text-slate-500">{d}</div>
            ))}
            {(() => {
              const monthStart = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1)
              const gridStart = startOfWeek(monthStart, { weekStartsOn: 1 })
              return Array.from({ length: 35 }, (_, i) => {
                const day = addDays(gridStart, i)
                const appts = filteredAppointments.filter((a) => isSameDay(parseISO(a.scheduledAt), day))
                const isCurrentMonth = day.getMonth() === currentDate.getMonth()
                return (
                  <div
                    key={i}
                    className={cn(
                      'bg-white p-2 min-h-[80px]',
                      !isCurrentMonth && 'bg-slate-50/50',
                      isSameDay(day, new Date()) && 'bg-primary-50/30'
                    )}
                  >
                    <div className={cn(
                      'text-xs mb-1',
                      isCurrentMonth ? 'text-slate-700' : 'text-slate-300',
                      isSameDay(day, new Date()) && 'font-bold text-primary-700'
                    )}>
                      {format(day, 'd')}
                    </div>
                    <div className="flex flex-col gap-0.5">
                      {appts.slice(0, 3).map((appt) => renderApptPill(appt, true))}
                      {appts.length > 3 && (
                        <div className="text-[10px] text-slate-400">+{appts.length - 3}</div>
                      )}
                    </div>
                  </div>
                )
              })
            })()}
          </div>
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30" onClick={() => setShowModal(false)}>
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6" onClick={(e) => e.stopPropagation()}>
            <h2 className="font-serif-title text-lg font-semibold text-slate-800 mb-4">新建预约</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-600 mb-1">客户</label>
                <select
                  value={formCustomerId}
                  onChange={(e) => setFormCustomerId(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-200"
                >
                  <option value="">请选择客户</option>
                  {customers.map((c) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-600 mb-1">医生</label>
                <select
                  value={formDoctorId}
                  onChange={(e) => setFormDoctorId(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-200"
                >
                  <option value="">请选择医生</option>
                  {doctors.map((d) => (
                    <option key={d.id} value={d.id}>{d.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-600 mb-1">房间</label>
                <select
                  value={formRoomId}
                  onChange={(e) => setFormRoomId(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-200"
                >
                  <option value="">请选择房间</option>
                  {rooms.map((r) => (
                    <option key={r.id} value={r.id}>{r.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-600 mb-1">仪器</label>
                <select
                  value={formEquipmentId}
                  onChange={(e) => setFormEquipmentId(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-200"
                >
                  <option value="">请选择仪器</option>
                  {equipment.map((eq) => (
                    <option key={eq.id} value={eq.id}>{eq.name}</option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-slate-600 mb-1">日期</label>
                  <input
                    type="date"
                    value={formDate}
                    onChange={(e) => setFormDate(e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-200"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-600 mb-1">时间</label>
                  <select
                    value={formTime}
                    onChange={(e) => setFormTime(e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-200"
                  >
                    {TIME_SLOTS.map((t) => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-600 mb-1">疗程次数</label>
                <input
                  type="number"
                  min={1}
                  value={formSession}
                  onChange={(e) => setFormSession(Number(e.target.value))}
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-200"
                />
              </div>
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => { setShowModal(false); resetForm() }}
                className="px-4 py-2 text-sm text-slate-600 bg-slate-100 rounded-lg hover:bg-slate-200 transition-colors"
              >
                取消
              </button>
              <button
                onClick={handleAddAppointment}
                className="px-4 py-2 text-sm text-white bg-primary-600 rounded-lg hover:bg-primary-700 transition-colors shadow-sm shadow-primary-200"
              >
                确认预约
              </button>
            </div>
          </div>
        </div>
      )}

      {showStatusModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30" onClick={() => setShowStatusModal(null)}>
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6" onClick={(e) => e.stopPropagation()}>
            <h2 className="font-serif-title text-lg font-semibold text-slate-800 mb-4">预约状态变更</h2>
            
            <div className="mb-4 p-3 bg-slate-50 rounded-lg space-y-1 text-sm">
              <div className="flex justify-between">
                <span className="text-slate-500">客户:</span>
                <span className="font-medium">{getCustomerName(showStatusModal.customerId)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">医生:</span>
                <span className="font-medium">{getDoctorName(showStatusModal.doctorId)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">房间:</span>
                <span className="font-medium">{getRoomName(showStatusModal.roomId)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">日期时间:</span>
                <span className="font-medium">{format(parseISO(showStatusModal.scheduledAt), 'yyyy-MM-dd HH:mm')}</span>
              </div>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-slate-600 mb-2">选择状态</label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => setSelectedStatus('late')}
                  className={cn(
                    'px-3 py-2 rounded-lg text-sm font-medium transition-all border',
                    selectedStatus === 'late'
                      ? 'bg-amber-50 border-amber-300 text-amber-700 ring-2 ring-amber-200'
                      : 'bg-white border-slate-200 text-slate-600 hover:bg-amber-50 hover:border-amber-200'
                  )}
                >
                  🕒 客户迟到
                </button>
                <button
                  onClick={() => setSelectedStatus('rescheduled')}
                  className={cn(
                    'px-3 py-2 rounded-lg text-sm font-medium transition-all border',
                    selectedStatus === 'rescheduled'
                      ? 'bg-blue-50 border-blue-300 text-blue-700 ring-2 ring-blue-200'
                      : 'bg-white border-slate-200 text-slate-600 hover:bg-blue-50 hover:border-blue-200'
                  )}
                >
                  📅 改约
                </button>
                <button
                  onClick={() => setSelectedStatus('no_show')}
                  className={cn(
                    'px-3 py-2 rounded-lg text-sm font-medium transition-all border',
                    selectedStatus === 'no_show'
                      ? 'bg-red-50 border-red-300 text-red-700 ring-2 ring-red-200'
                      : 'bg-white border-slate-200 text-slate-600 hover:bg-red-50 hover:border-red-200'
                  )}
                >
                  ❌ 客户漏约
                </button>
                <button
                  onClick={() => setSelectedStatus('cancelled')}
                  className={cn(
                    'px-3 py-2 rounded-lg text-sm font-medium transition-all border',
                    selectedStatus === 'cancelled'
                      ? 'bg-gray-50 border-gray-300 text-gray-700 ring-2 ring-gray-200'
                      : 'bg-white border-slate-200 text-slate-600 hover:bg-gray-50 hover:border-gray-200'
                  )}
                >
                  ⏎ 取消预约
                </button>
              </div>
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium text-slate-600 mb-1">变更原因</label>
              <textarea
                value={changeReason}
                onChange={(e) => setChangeReason(e.target.value)}
                placeholder="请输入原因..."
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-200 resize-none"
                rows={3}
              />
            </div>

            <div className="flex justify-end gap-3">
              <button
                onClick={() => {
                  setShowStatusModal(null)
                  setSelectedStatus(null)
                  setChangeReason('')
                }}
                className="px-4 py-2 text-sm text-slate-600 bg-slate-100 rounded-lg hover:bg-slate-200 transition-colors"
              >
                取消
              </button>
              <button
                onClick={handleConfirmStatusChange}
                disabled={!selectedStatus}
                className={cn(
                  'px-4 py-2 text-sm text-white rounded-lg transition-colors shadow-sm',
                  selectedStatus
                    ? 'bg-primary-600 hover:bg-primary-700 shadow-primary-200'
                    : 'bg-slate-300 cursor-not-allowed'
                )}
              >
                确认变更
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
