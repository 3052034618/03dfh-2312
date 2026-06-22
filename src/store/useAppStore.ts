import { create } from 'zustand'
import type { Customer, SkinAssessment, TreatmentPlan, Appointment, TreatmentRecord, FollowUpTask, Doctor, Room, Equipment } from '@/types'
import { mockCustomers, mockAssessments, mockTreatmentPlans, mockAppointments, mockRecords, mockFollowUps, mockDoctors, mockRooms, mockEquipment } from '@/utils/mockData'

interface AppState {
  customers: Customer[]
  assessments: SkinAssessment[]
  treatmentPlans: TreatmentPlan[]
  appointments: Appointment[]
  records: TreatmentRecord[]
  followUps: FollowUpTask[]
  doctors: Doctor[]
  rooms: Room[]
  equipment: Equipment[]

  addCustomer: (customer: Customer) => void
  updateCustomer: (id: string, data: Partial<Customer>) => void

  addAssessment: (assessment: SkinAssessment) => void
  updateAssessment: (id: string, data: Partial<SkinAssessment>) => void

  addTreatmentPlan: (plan: TreatmentPlan) => void
  updateTreatmentPlan: (id: string, data: Partial<TreatmentPlan>) => void

  addAppointment: (appointment: Appointment) => void
  updateAppointment: (id: string, data: Partial<Appointment>) => void

  addRecord: (record: TreatmentRecord) => void
  updateRecord: (id: string, data: Partial<TreatmentRecord>) => void

  addFollowUp: (task: FollowUpTask) => void
  updateFollowUp: (id: string, data: Partial<FollowUpTask>) => void
}

export const useAppStore = create<AppState>((set) => ({
  customers: mockCustomers,
  assessments: mockAssessments,
  treatmentPlans: mockTreatmentPlans,
  appointments: mockAppointments,
  records: mockRecords,
  followUps: mockFollowUps,
  doctors: mockDoctors,
  rooms: mockRooms,
  equipment: mockEquipment,

  addCustomer: (customer) => set((s) => ({ customers: [...s.customers, customer] })),
  updateCustomer: (id, data) => set((s) => ({ customers: s.customers.map((c) => (c.id === id ? { ...c, ...data } : c)) })),

  addAssessment: (assessment) => set((s) => ({ assessments: [...s.assessments, assessment] })),
  updateAssessment: (id, data) => set((s) => ({ assessments: s.assessments.map((a) => (a.id === id ? { ...a, ...data } : a)) })),

  addTreatmentPlan: (plan) => set((s) => ({ treatmentPlans: [...s.treatmentPlans, plan] })),
  updateTreatmentPlan: (id, data) => set((s) => ({ treatmentPlans: s.treatmentPlans.map((p) => (p.id === id ? { ...p, ...data } : p)) })),

  addAppointment: (appointment) => set((s) => ({ appointments: [...s.appointments, appointment] })),
  updateAppointment: (id, data) => set((s) => ({ appointments: s.appointments.map((a) => (a.id === id ? { ...a, ...data } : a)) })),

  addRecord: (record) => set((s) => ({ records: [...s.records, record] })),
  updateRecord: (id, data) => set((s) => ({ records: s.records.map((r) => (r.id === id ? { ...r, ...data } : r)) })),

  addFollowUp: (task) => set((s) => ({ followUps: [...s.followUps, task] })),
  updateFollowUp: (id, data) => set((s) => ({ followUps: s.followUps.map((f) => (f.id === id ? { ...f, ...data } : f)) })),
}))
