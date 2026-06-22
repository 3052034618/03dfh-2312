import { useState, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, Save, Camera, Zap, Calendar, User, Shield, Plus, Trash2, ImageIcon } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useAppStore } from '@/store/useAppStore'
import type { SkinAssessment, TreatmentPlan, TreatmentSession, SkinPhoto } from '@/types'

const skinQualityOptions = [
  { value: 'dry' as const, label: '干性' },
  { value: 'neutral' as const, label: '中性' },
  { value: 'oily' as const, label: '油性' },
  { value: 'combination' as const, label: '混合性' },
]

const severityOptions = [
  { value: 'none' as const, label: '无' },
  { value: 'mild' as const, label: '轻度' },
  { value: 'moderate' as const, label: '中度' },
  { value: 'severe' as const, label: '重度' },
]

const photoAreas = [
  { value: 'forehead' as const, label: '额头' },
  { value: 'left_cheek' as const, label: '左面颊' },
  { value: 'right_cheek' as const, label: '右面颊' },
  { value: 'nose' as const, label: '鼻部' },
  { value: 'chin' as const, label: '下颌' },
  { value: 'full_face' as const, label: '全脸' },
]

const planTypeOptions = [
  { value: '3_session' as const, label: '3次疗程', sessions: 3 },
  { value: '5_session' as const, label: '5次疗程', sessions: 5 },
  { value: 'custom' as const, label: '定制疗程', sessions: 1 },
]

const contraindicationItems = [
  '近期暴晒', '光敏药物', '孕期', '口服异维A酸',
  '玫瑰痤疮活跃期', '炎症活跃期', '近期化学换肤', '其他',
]

const statusLabels: Record<TreatmentSession['status'], string> = {
  planned: '待排期',
  scheduled: '已排期',
  completed: '已完成',
  skipped: '已跳过',
}

const statusColors: Record<TreatmentSession['status'], string> = {
  planned: 'bg-slate-100 text-slate-600',
  scheduled: 'bg-primary-50 text-primary-700',
  completed: 'bg-emerald-50 text-emerald-700',
  skipped: 'bg-amber-50 text-amber-700',
}

function RadioGroup<T extends string>({
  options,
  value,
  onChange,
}: {
  options: { value: T; label: string }[]
  value: T
  onChange: (v: T) => void
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((opt) => (
        <button
          key={opt.value}
          type="button"
          onClick={() => onChange(opt.value)}
          className={cn(
            'px-4 py-2 rounded-lg text-sm font-medium border transition-all duration-150',
            value === opt.value
              ? 'bg-primary-50 border-primary-300 text-primary-700 ring-1 ring-primary-200'
              : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300 hover:bg-slate-50'
          )}
        >
          {opt.label}
        </button>
      ))}
    </div>
  )
}

export default function CustomerDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { customers, assessments, treatmentPlans, doctors, addAssessment, updateAssessment, addTreatmentPlan, updateTreatmentPlan } = useAppStore()

  const customer = customers.find((c) => c.id === id)
  const existingAssessment = assessments.find((a) => a.customerId === id)
  const existingPlan = treatmentPlans.find((p) => p.customerId === id)

  const [activeTab, setActiveTab] = useState<'assessment' | 'plan'>('assessment')

  const [skinQuality, setSkinQuality] = useState<SkinAssessment['skinQuality']>(existingAssessment?.skinQuality ?? 'neutral')
  const [spots, setSpots] = useState<SkinAssessment['spots']>(existingAssessment?.spots ?? 'none')
  const [redness, setRedness] = useState<SkinAssessment['redness']>(existingAssessment?.redness ?? 'none')
  const [acneMarks, setAcneMarks] = useState<SkinAssessment['acneMarks']>(existingAssessment?.acneMarks ?? 'none')
  const [notes, setNotes] = useState(existingAssessment?.notes ?? '')

  const [planType, setPlanType] = useState<TreatmentPlan['type']>(existingPlan?.type ?? '3_session')
  const [sessions, setSessions] = useState<TreatmentSession[]>(
    existingPlan?.sessions ?? planTypeOptions[0].sessions > 0
      ? Array.from({ length: planTypeOptions[0].sessions }, (_, i) => ({
          sessionNumber: i + 1,
          energyLevel: 5,
          intervalDays: 28,
          status: 'planned' as const,
        }))
      : []
  )
  const [selectedContraindications, setSelectedContraindications] = useState<string[]>(
    existingPlan?.contraindications ?? []
  )
  const [doctorId, setDoctorId] = useState(existingPlan?.doctorId ?? '')
  const [photos, setPhotos] = useState<SkinPhoto[]>(existingAssessment?.photos ?? [])

  const fileInputRefs = useRef<Record<SkinPhoto['area'], HTMLInputElement | null>>({
    forehead: null,
    left_cheek: null,
    right_cheek: null,
    nose: null,
    chin: null,
    full_face: null,
  })

  if (!customer) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-slate-500">未找到客户信息</p>
      </div>
    )
  }

  function handlePlanTypeChange(type: TreatmentPlan['type']) {
    setPlanType(type)
    const count = planTypeOptions.find((o) => o.value === type)?.sessions ?? 1
    const customCount = type === 'custom' ? 1 : count
    setSessions(
      Array.from({ length: customCount }, (_, i) => ({
        sessionNumber: i + 1,
        energyLevel: 5,
        intervalDays: 28,
        status: 'planned' as const,
      }))
    )
  }

  function handleSessionChange(index: number, field: keyof TreatmentSession, value: number | string) {
    setSessions((prev) =>
      prev.map((s, i) => (i === index ? { ...s, [field]: value } : s))
    )
  }

  function handleContraindicationToggle(item: string) {
    setSelectedContraindications((prev) =>
      prev.includes(item) ? prev.filter((c) => c !== item) : [...prev, item]
    )
  }

  function addCustomSession() {
    setSessions((prev) => [
      ...prev,
      {
        sessionNumber: prev.length + 1,
        energyLevel: 5,
        intervalDays: 28,
        status: 'planned' as const,
      },
    ])
  }

  function handlePhotoUpload(area: SkinPhoto['area'], file: File) {
    const reader = new FileReader()
    reader.onload = (e) => {
      const url = e.target?.result as string
      const newPhoto: SkinPhoto = {
        id: `photo_${area}_${Date.now()}`,
        area,
        url,
        takenAt: new Date().toISOString(),
      }
      setPhotos((prev) => [...prev.filter((p) => p.area !== area), newPhoto])
    }
    reader.readAsDataURL(file)
  }

  function handlePhotoDelete(photoId: string) {
    setPhotos((prev) => prev.filter((p) => p.id !== photoId))
  }

  function handleSaveAssessment() {
    if (existingAssessment) {
      updateAssessment(existingAssessment.id, { skinQuality, spots, redness, acneMarks, photos, notes })
    } else {
      addAssessment({
        id: `a_${Date.now()}`,
        customerId: customer.id,
        skinQuality,
        spots,
        redness,
        acneMarks,
        photos,
        notes,
        createdAt: new Date().toISOString().split('T')[0],
      })
    }
  }

  function handleSavePlan() {
    if (existingPlan) {
      updateTreatmentPlan(existingPlan.id, { type: planType, sessions, contraindications: selectedContraindications, doctorId })
    } else {
      addTreatmentPlan({
        id: `tp_${Date.now()}`,
        customerId: customer.id,
        type: planType,
        sessions,
        contraindications: selectedContraindications,
        createdAt: new Date().toISOString().split('T')[0],
        doctorId,
      })
    }
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="flex items-center gap-4 mb-6">
        <button
          onClick={() => navigate(-1)}
          className="p-2 rounded-lg hover:bg-slate-100 transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-slate-600" />
        </button>
        <div>
          <h1 className="text-2xl font-serif-title font-bold text-slate-800">{customer.name}</h1>
          <p className="text-sm text-slate-500 mt-0.5">
            {customer.gender === 'female' ? '女' : '男'} · {customer.age}岁 · {customer.phone} · {customer.skinType}
          </p>
        </div>
      </div>

      <div className="flex gap-2 mb-6">
        <button
          onClick={() => setActiveTab('assessment')}
          className={cn(
            'px-5 py-2.5 rounded-lg text-sm font-medium transition-all duration-150',
            activeTab === 'assessment'
              ? 'bg-primary-600 text-white shadow-sm'
              : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
          )}
        >
          初诊评估
        </button>
        <button
          onClick={() => setActiveTab('plan')}
          className={cn(
            'px-5 py-2.5 rounded-lg text-sm font-medium transition-all duration-150',
            activeTab === 'plan'
              ? 'bg-primary-600 text-white shadow-sm'
              : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
          )}
        >
          疗程方案
        </button>
      </div>

      {activeTab === 'assessment' && (
        <div className="space-y-4">
          <div className="card p-5">
            <h3 className="text-sm font-semibold text-slate-700 mb-3 flex items-center gap-2">
              <Zap className="w-4 h-4 text-primary-500" />
              肤质
            </h3>
            <RadioGroup options={skinQualityOptions} value={skinQuality} onChange={(v) => setSkinQuality(v as SkinAssessment['skinQuality'])} />
          </div>

          <div className="card p-5">
            <h3 className="text-sm font-semibold text-slate-700 mb-3 flex items-center gap-2">
              <Camera className="w-4 h-4 text-primary-500" />
              斑点
            </h3>
            <RadioGroup options={severityOptions} value={spots} onChange={(v) => setSpots(v as SkinAssessment['spots'])} />
          </div>

          <div className="card p-5">
            <h3 className="text-sm font-semibold text-slate-700 mb-3 flex items-center gap-2">
              <Camera className="w-4 h-4 text-primary-500" />
              红血丝
            </h3>
            <RadioGroup options={severityOptions} value={redness} onChange={(v) => setRedness(v as SkinAssessment['redness'])} />
          </div>

          <div className="card p-5">
            <h3 className="text-sm font-semibold text-slate-700 mb-3 flex items-center gap-2">
              <Camera className="w-4 h-4 text-primary-500" />
              痘印
            </h3>
            <RadioGroup options={severityOptions} value={acneMarks} onChange={(v) => setAcneMarks(v as SkinAssessment['acneMarks'])} />
          </div>

          <div className="card p-5">
            <h3 className="text-sm font-semibold text-slate-700 mb-3 flex items-center gap-2">
              <Camera className="w-4 h-4 text-primary-500" />
              面诊照片
            </h3>
            <div className="grid grid-cols-3 gap-3">
              {photoAreas.map((area) => {
                const photo = photos.find((p) => p.area === area.value)
                return (
                  <div key={area.value} className="relative">
                    {photo ? (
                      <div className="relative h-24 rounded-lg overflow-hidden">
                        <img
                          src={photo.url}
                          alt={area.label}
                          className="w-full h-full object-cover"
                        />
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation()
                            handlePhotoDelete(photo.id)
                          }}
                          className="absolute top-1 right-1 p-1 rounded-full bg-white/90 hover:bg-red-50 text-slate-600 hover:text-red-600 shadow-sm transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                        <div className="absolute bottom-0 left-0 right-0 p-1 bg-gradient-to-t from-black/60 to-transparent">
                          <span className="text-xs text-white font-medium">{area.label}</span>
                        </div>
                      </div>
                    ) : (
                      <div
                        onClick={() => fileInputRefs.current[area.value]?.click()}
                        className="flex flex-col items-center justify-center h-24 rounded-lg border-2 border-dashed border-slate-200 bg-slate-50 hover:border-primary-300 hover:bg-primary-50/30 transition-colors cursor-pointer"
                      >
                        <ImageIcon className="w-5 h-5 text-slate-400 mb-1" />
                        <span className="text-xs text-slate-500">{area.label}</span>
                        <span className="text-xs text-slate-400 mt-0.5">点击上传</span>
                      </div>
                    )}
                    <input
                      type="file"
                      ref={(el) => {
                        fileInputRefs.current[area.value] = el
                      }}
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0]
                        if (file) {
                          handlePhotoUpload(area.value, file)
                        }
                        e.target.value = ''
                      }}
                    />
                  </div>
                )
              })}
            </div>
          </div>

          <div className="card p-5">
            <h3 className="text-sm font-semibold text-slate-700 mb-3">备注</h3>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 placeholder:text-slate-400 focus:border-primary-300 focus:outline-none focus:ring-1 focus:ring-primary-200 resize-none"
              placeholder="输入评估备注..."
            />
          </div>

          <button
            onClick={handleSaveAssessment}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-lg bg-primary-600 text-white font-medium text-sm hover:bg-primary-700 transition-colors shadow-sm"
          >
            <Save className="w-4 h-4" />
            保存评估
          </button>
        </div>
      )}

      {activeTab === 'plan' && (
        <div className="space-y-4">
          <div className="card p-5">
            <h3 className="text-sm font-semibold text-slate-700 mb-4 flex items-center gap-2">
              <Calendar className="w-4 h-4 text-primary-500" />
              疗程类型
            </h3>
            <div className="grid grid-cols-3 gap-3">
              {planTypeOptions.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => handlePlanTypeChange(opt.value)}
                  className={cn(
                    'p-4 rounded-xl border-2 text-center transition-all duration-150',
                    planType === opt.value
                      ? 'border-primary-400 bg-primary-50 shadow-sm'
                      : 'border-slate-200 bg-white hover:border-slate-300'
                  )}
                >
                  <p className={cn(
                    'text-base font-semibold',
                    planType === opt.value ? 'text-primary-700' : 'text-slate-700'
                  )}>
                    {opt.label}
                  </p>
                </button>
              ))}
            </div>
          </div>

          <div className="card p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                <Zap className="w-4 h-4 text-primary-500" />
                治疗次序
              </h3>
              {planType === 'custom' && (
                <button
                  type="button"
                  onClick={addCustomSession}
                  className="flex items-center gap-1 text-xs text-primary-600 hover:text-primary-700 font-medium"
                >
                  <Plus className="w-3.5 h-3.5" />
                  添加次序
                </button>
              )}
            </div>
            <div className="space-y-3">
              {sessions.map((session, idx) => (
                <div
                  key={idx}
                  className="flex items-center gap-4 p-3 rounded-lg bg-slate-50 border border-slate-100"
                >
                  <div className="w-8 h-8 rounded-full bg-primary-100 text-primary-700 flex items-center justify-center text-sm font-bold shrink-0">
                    {session.sessionNumber}
                  </div>
                  <div className="flex-1 grid grid-cols-3 gap-4 items-center">
                    <div>
                      <label className="text-xs text-slate-500 mb-1 block">能量等级</label>
                      <div className="flex items-center gap-2">
                        <input
                          type="range"
                          min={1}
                          max={10}
                          value={session.energyLevel}
                          onChange={(e) => handleSessionChange(idx, 'energyLevel', Number(e.target.value))}
                          className="flex-1 accent-primary-600 h-1.5"
                        />
                        <span className="text-sm font-semibold text-primary-700 w-6 text-center">{session.energyLevel}</span>
                      </div>
                    </div>
                    <div>
                      <label className="text-xs text-slate-500 mb-1 block">间隔天数</label>
                      <input
                        type="number"
                        min={1}
                        value={session.intervalDays}
                        onChange={(e) => handleSessionChange(idx, 'intervalDays', Number(e.target.value))}
                        className="w-full rounded-md border border-slate-200 bg-white px-2 py-1 text-sm text-slate-700 focus:border-primary-300 focus:outline-none focus:ring-1 focus:ring-primary-200"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-slate-500 mb-1 block">状态</label>
                      <span className={cn('inline-block px-2.5 py-1 rounded-full text-xs font-medium', statusColors[session.status])}>
                        {statusLabels[session.status]}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="card p-5">
            <h3 className="text-sm font-semibold text-slate-700 mb-4 flex items-center gap-2">
              <Shield className="w-4 h-4 text-warning-500" />
              禁忌症
            </h3>
            <div className="grid grid-cols-2 gap-2">
              {contraindicationItems.map((item) => (
                <label
                  key={item}
                  className={cn(
                    'flex items-center gap-2.5 px-3 py-2.5 rounded-lg border cursor-pointer transition-all duration-150',
                    selectedContraindications.includes(item)
                      ? 'border-warning-300 bg-warning-50'
                      : 'border-slate-200 bg-white hover:border-slate-300'
                  )}
                >
                  <input
                    type="checkbox"
                    checked={selectedContraindications.includes(item)}
                    onChange={() => handleContraindicationToggle(item)}
                    className="w-4 h-4 rounded border-slate-300 text-primary-600 focus:ring-primary-200"
                  />
                  <span className={cn(
                    'text-sm',
                    selectedContraindications.includes(item) ? 'text-warning-700 font-medium' : 'text-slate-600'
                  )}>
                    {item}
                  </span>
                </label>
              ))}
            </div>
          </div>

          <div className="card p-5">
            <h3 className="text-sm font-semibold text-slate-700 mb-3 flex items-center gap-2">
              <User className="w-4 h-4 text-primary-500" />
              主治医生
            </h3>
            <select
              value={doctorId}
              onChange={(e) => setDoctorId(e.target.value)}
              className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-700 focus:border-primary-300 focus:outline-none focus:ring-1 focus:ring-primary-200"
            >
              <option value="">请选择医生</option>
              {doctors.map((doc) => (
                <option key={doc.id} value={doc.id}>
                  {doc.name} - {doc.specialty}
                </option>
              ))}
            </select>
          </div>

          <button
            onClick={handleSavePlan}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-lg bg-primary-600 text-white font-medium text-sm hover:bg-primary-700 transition-colors shadow-sm"
          >
            <Save className="w-4 h-4" />
            保存方案
          </button>
        </div>
      )}
    </div>
  )
}
