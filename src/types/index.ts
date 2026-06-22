export interface Customer {
  id: string
  name: string
  gender: 'male' | 'female'
  age: number
  phone: string
  createdAt: string
  skinType: string
  concerns: string[]
  treatmentStatus: 'none' | 'in_progress' | 'completed'
  repurchaseIntent: 'high' | 'medium' | 'low' | 'none'
}

export interface SkinAssessment {
  id: string
  customerId: string
  skinQuality: 'dry' | 'neutral' | 'oily' | 'combination'
  spots: 'none' | 'mild' | 'moderate' | 'severe'
  redness: 'none' | 'mild' | 'moderate' | 'severe'
  acneMarks: 'none' | 'mild' | 'moderate' | 'severe'
  photos: SkinPhoto[]
  notes: string
  createdAt: string
}

export interface SkinPhoto {
  id: string
  area: 'forehead' | 'left_cheek' | 'right_cheek' | 'nose' | 'chin' | 'full_face'
  url: string
  takenAt: string
}

export interface TreatmentPlan {
  id: string
  customerId: string
  type: '3_session' | '5_session' | 'custom'
  sessions: TreatmentSession[]
  contraindications: string[]
  createdAt: string
  doctorId: string
}

export interface TreatmentSession {
  sessionNumber: number
  energyLevel: number
  intervalDays: number
  status: 'planned' | 'scheduled' | 'completed' | 'skipped'
  scheduledDate?: string
}

export interface Appointment {
  id: string
  customerId: string
  doctorId: string
  roomId: string
  equipmentId: string
  scheduledAt: string
  duration: number
  status: 'scheduled' | 'checked_in' | 'in_progress' | 'completed' | 'no_show' | 'rescheduled' | 'cancelled'
  changeReason?: string
  sessionNumber: number
}

export interface TreatmentRecord {
  id: string
  appointmentId: string
  customerId: string
  preCheck: {
    consentConfirmed: boolean
    precautionsConfirmed: boolean
    prePhotos: string[]
  }
  postRecord: {
    reactions: string[]
    iceCompressMinutes: number
    careAdvice: string
    isAbnormal: boolean
    abnormalNote?: string
  }
  recordedAt: string
}

export interface FollowUpTask {
  id: string
  customerId: string
  appointmentId: string
  triggerDay: 3 | 7 | 14
  dueDate: string
  status: 'pending' | 'completed' | 'overdue'
  result?: {
    feedback: string
    satisfaction: 1 | 2 | 3 | 4 | 5
    isAbnormal: boolean
    repurchaseIntent?: 'high' | 'medium' | 'low' | 'none'
  }
  completedAt?: string
}

export interface Doctor {
  id: string
  name: string
  specialty: string
}

export interface Room {
  id: string
  name: string
  floor: number
}

export interface Equipment {
  id: string
  name: string
  type: string
}

export type UserRole = 'doctor' | 'consultant' | 'receptionist' | 'supervisor'
