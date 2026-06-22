import type { Customer, SkinAssessment, TreatmentPlan, Appointment, TreatmentRecord, FollowUpTask, Doctor, Room, Equipment } from '@/types'

export const mockDoctors: Doctor[] = [
  { id: 'd1', name: '王雅琳', specialty: '皮肤科主治' },
  { id: 'd2', name: '陈思远', specialty: '皮肤科主任' },
  { id: 'd3', name: '刘晓薇', specialty: '皮肤科医师' },
]

export const mockRooms: Room[] = [
  { id: 'r1', name: 'A01治疗室', floor: 2 },
  { id: 'r2', name: 'A02治疗室', floor: 2 },
  { id: 'r3', name: 'B01治疗室', floor: 3 },
]

export const mockEquipment: Equipment[] = [
  { id: 'e1', name: 'M22王者之心', type: 'IPL' },
  { id: 'e2', name: 'BBL青春之光', type: 'IPL' },
  { id: 'e3', name: 'AOPT超光子', type: 'IPL' },
]

export const mockCustomers: Customer[] = [
  { id: 'c1', name: '张美琪', gender: 'female', age: 32, phone: '138****6701', createdAt: '2025-05-12', skinType: '干性', concerns: ['色斑', '暗沉'], treatmentStatus: 'in_progress', repurchaseIntent: 'high' },
  { id: 'c2', name: '李思涵', gender: 'female', age: 28, phone: '139****2345', createdAt: '2025-05-18', skinType: '混合性', concerns: ['红血丝', '痘印'], treatmentStatus: 'in_progress', repurchaseIntent: 'medium' },
  { id: 'c3', name: '王晓燕', gender: 'female', age: 35, phone: '136****8901', createdAt: '2025-06-01', skinType: '油性', concerns: ['毛孔粗大', '痘印'], treatmentStatus: 'in_progress', repurchaseIntent: 'low' },
  { id: 'c4', name: '赵雪莹', gender: 'female', age: 41, phone: '137****5678', createdAt: '2025-06-05', skinType: '干性', concerns: ['色斑', '细纹'], treatmentStatus: 'completed', repurchaseIntent: 'high' },
  { id: 'c5', name: '孙婉清', gender: 'female', age: 26, phone: '135****3456', createdAt: '2025-06-10', skinType: '中性', concerns: ['暗沉'], treatmentStatus: 'none', repurchaseIntent: 'none' },
  { id: 'c6', name: '周芷萱', gender: 'female', age: 30, phone: '133****7890', createdAt: '2025-06-12', skinType: '混合性', concerns: ['红血丝', '色斑'], treatmentStatus: 'in_progress', repurchaseIntent: 'medium' },
  { id: 'c7', name: '吴雨桐', gender: 'female', age: 38, phone: '131****1234', createdAt: '2025-06-15', skinType: '干性', concerns: ['细纹', '暗沉'], treatmentStatus: 'in_progress', repurchaseIntent: 'high' },
  { id: 'c8', name: '郑可欣', gender: 'female', age: 24, phone: '132****5678', createdAt: '2025-06-18', skinType: '油性', concerns: ['痘印', '毛孔粗大'], treatmentStatus: 'none', repurchaseIntent: 'none' },
]

export const mockAssessments: SkinAssessment[] = [
  { id: 'a1', customerId: 'c1', skinQuality: 'dry', spots: 'moderate', redness: 'mild', acneMarks: 'none', photos: [{ id: 'p1', area: 'full_face', url: '', takenAt: '2025-05-12' }, { id: 'p2', area: 'left_cheek', url: '', takenAt: '2025-05-12' }], notes: '面部色斑集中在颧骨两侧，建议3次疗程观察效果', createdAt: '2025-05-12' },
  { id: 'a2', customerId: 'c2', skinQuality: 'combination', spots: 'none', redness: 'moderate', acneMarks: 'mild', photos: [{ id: 'p3', area: 'full_face', url: '', takenAt: '2025-05-18' }], notes: '面颊红血丝明显，下颌痘印，建议5次疗程', createdAt: '2025-05-18' },
  { id: 'a3', customerId: 'c3', skinQuality: 'oily', spots: 'none', redness: 'none', acneMarks: 'moderate', photos: [{ id: 'p4', area: 'chin', url: '', takenAt: '2025-06-01' }], notes: 'T区出油明显，下颌痘印较深', createdAt: '2025-06-01' },
  { id: 'a4', customerId: 'c4', skinQuality: 'dry', spots: 'severe', redness: 'mild', acneMarks: 'none', photos: [{ id: 'p5', area: 'full_face', url: '', takenAt: '2025-06-05' }], notes: '色斑面积较大，干性皮肤需注意保湿', createdAt: '2025-06-05' },
  { id: 'a5', customerId: 'c5', skinQuality: 'neutral', spots: 'mild', redness: 'none', acneMarks: 'none', photos: [], notes: '整体肤质较好，暗沉可通过1-2次改善', createdAt: '2025-06-10' },
  { id: 'a6', customerId: 'c6', skinQuality: 'combination', spots: 'moderate', redness: 'moderate', acneMarks: 'none', photos: [{ id: 'p6', area: 'right_cheek', url: '', takenAt: '2025-06-12' }], notes: '右侧面颊红血丝与色斑并存', createdAt: '2025-06-12' },
  { id: 'a7', customerId: 'c7', skinQuality: 'dry', spots: 'mild', redness: 'none', acneMarks: 'none', photos: [], notes: '干性皮肤伴细纹，需温和能量档位', createdAt: '2025-06-15' },
  { id: 'a8', customerId: 'c8', skinQuality: 'oily', spots: 'none', redness: 'mild', acneMarks: 'severe', photos: [], notes: '痘印较深，建议5次疗程逐步改善', createdAt: '2025-06-18' },
]

export const mockTreatmentPlans: TreatmentPlan[] = [
  { id: 'tp1', customerId: 'c1', type: '3_session', sessions: [{ sessionNumber: 1, energyLevel: 6, intervalDays: 28, status: 'completed', scheduledDate: '2025-05-15' }, { sessionNumber: 2, energyLevel: 7, intervalDays: 28, status: 'completed', scheduledDate: '2025-06-12' }, { sessionNumber: 3, energyLevel: 7, intervalDays: 28, status: 'scheduled', scheduledDate: '2025-07-10' }], contraindications: ['近期暴晒', '光敏药物'], createdAt: '2025-05-12', doctorId: 'd1' },
  { id: 'tp2', customerId: 'c2', type: '5_session', sessions: [{ sessionNumber: 1, energyLevel: 5, intervalDays: 21, status: 'completed', scheduledDate: '2025-05-22' }, { sessionNumber: 2, energyLevel: 6, intervalDays: 21, status: 'scheduled', scheduledDate: '2025-06-12' }, { sessionNumber: 3, energyLevel: 6, intervalDays: 21, status: 'planned' }, { sessionNumber: 4, energyLevel: 7, intervalDays: 21, status: 'planned' }, { sessionNumber: 5, energyLevel: 7, intervalDays: 21, status: 'planned' }], contraindications: ['玫瑰痤疮活跃期'], createdAt: '2025-05-18', doctorId: 'd2' },
  { id: 'tp3', customerId: 'c3', type: '5_session', sessions: [{ sessionNumber: 1, energyLevel: 5, intervalDays: 21, status: 'completed', scheduledDate: '2025-06-05' }, { sessionNumber: 2, energyLevel: 6, intervalDays: 21, status: 'scheduled', scheduledDate: '2025-06-26' }, { sessionNumber: 3, energyLevel: 7, intervalDays: 21, status: 'planned' }, { sessionNumber: 4, energyLevel: 7, intervalDays: 21, status: 'planned' }, { sessionNumber: 5, energyLevel: 8, intervalDays: 21, status: 'planned' }], contraindications: ['口服异维A酸'], createdAt: '2025-06-01', doctorId: 'd1' },
  { id: 'tp4', customerId: 'c4', type: '3_session', sessions: [{ sessionNumber: 1, energyLevel: 5, intervalDays: 28, status: 'completed', scheduledDate: '2025-06-08' }, { sessionNumber: 2, energyLevel: 6, intervalDays: 28, status: 'completed', scheduledDate: '2025-07-06' }, { sessionNumber: 3, energyLevel: 6, intervalDays: 28, status: 'completed', scheduledDate: '2025-08-03' }], contraindications: ['近期暴晒'], createdAt: '2025-06-05', doctorId: 'd2' },
  { id: 'tp5', customerId: 'c6', type: '5_session', sessions: [{ sessionNumber: 1, energyLevel: 5, intervalDays: 21, status: 'completed', scheduledDate: '2025-06-15' }, { sessionNumber: 2, energyLevel: 6, intervalDays: 21, status: 'scheduled', scheduledDate: '2025-07-06' }, { sessionNumber: 3, energyLevel: 6, intervalDays: 21, status: 'planned' }, { sessionNumber: 4, energyLevel: 7, intervalDays: 21, status: 'planned' }, { sessionNumber: 5, energyLevel: 7, intervalDays: 21, status: 'planned' }], contraindications: ['光敏药物', '孕期'], createdAt: '2025-06-12', doctorId: 'd3' },
  { id: 'tp6', customerId: 'c7', type: '3_session', sessions: [{ sessionNumber: 1, energyLevel: 4, intervalDays: 28, status: 'scheduled', scheduledDate: '2025-06-22' }, { sessionNumber: 2, energyLevel: 5, intervalDays: 28, status: 'planned' }, { sessionNumber: 3, energyLevel: 5, intervalDays: 28, status: 'planned' }], contraindications: ['干性皮肤注意保湿', '近期化学换肤'], createdAt: '2025-06-15', doctorId: 'd1' },
  { id: 'tp7', customerId: 'c8', type: '5_session', sessions: [{ sessionNumber: 1, energyLevel: 5, intervalDays: 21, status: 'scheduled', scheduledDate: '2025-06-25' }, { sessionNumber: 2, energyLevel: 6, intervalDays: 21, status: 'planned' }, { sessionNumber: 3, energyLevel: 7, intervalDays: 21, status: 'planned' }, { sessionNumber: 4, energyLevel: 7, intervalDays: 21, status: 'planned' }, { sessionNumber: 5, energyLevel: 8, intervalDays: 21, status: 'planned' }], contraindications: ['炎症活跃期'], createdAt: '2025-06-18', doctorId: 'd3' },
]

export const mockAppointments: Appointment[] = [
  { id: 'ap1', customerId: 'c1', doctorId: 'd1', roomId: 'r1', equipmentId: 'e1', scheduledAt: '2025-06-22T09:00', duration: 45, status: 'scheduled', sessionNumber: 3 },
  { id: 'ap2', customerId: 'c2', doctorId: 'd2', roomId: 'r2', equipmentId: 'e2', scheduledAt: '2025-06-22T10:00', duration: 45, status: 'scheduled', sessionNumber: 2 },
  { id: 'ap3', customerId: 'c3', doctorId: 'd1', roomId: 'r1', equipmentId: 'e1', scheduledAt: '2025-06-26T14:00', duration: 45, status: 'scheduled', sessionNumber: 2 },
  { id: 'ap4', customerId: 'c6', doctorId: 'd3', roomId: 'r3', equipmentId: 'e3', scheduledAt: '2025-07-06T10:00', duration: 45, status: 'scheduled', sessionNumber: 2 },
  { id: 'ap5', customerId: 'c7', doctorId: 'd1', roomId: 'r1', equipmentId: 'e1', scheduledAt: '2025-06-22T14:00', duration: 45, status: 'scheduled', sessionNumber: 1 },
  { id: 'ap6', customerId: 'c8', doctorId: 'd3', roomId: 'r2', equipmentId: 'e2', scheduledAt: '2025-06-25T09:00', duration: 45, status: 'scheduled', sessionNumber: 1 },
  { id: 'ap7', customerId: 'c1', doctorId: 'd1', roomId: 'r1', equipmentId: 'e1', scheduledAt: '2025-05-15T09:00', duration: 45, status: 'completed', sessionNumber: 1 },
  { id: 'ap8', customerId: 'c1', doctorId: 'd1', roomId: 'r1', equipmentId: 'e1', scheduledAt: '2025-06-12T09:00', duration: 45, status: 'completed', sessionNumber: 2 },
  { id: 'ap9', customerId: 'c2', doctorId: 'd2', roomId: 'r2', equipmentId: 'e2', scheduledAt: '2025-05-22T10:00', duration: 45, status: 'completed', sessionNumber: 1 },
  { id: 'ap10', customerId: 'c3', doctorId: 'd1', roomId: 'r1', equipmentId: 'e1', scheduledAt: '2025-06-05T14:00', duration: 45, status: 'completed', sessionNumber: 1 },
  { id: 'ap11', customerId: 'c4', doctorId: 'd2', roomId: 'r2', equipmentId: 'e2', scheduledAt: '2025-06-08T09:00', duration: 45, status: 'completed', sessionNumber: 1 },
  { id: 'ap12', customerId: 'c6', doctorId: 'd3', roomId: 'r3', equipmentId: 'e3', scheduledAt: '2025-06-15T10:00', duration: 45, status: 'completed', sessionNumber: 1 },
]

export const mockRecords: TreatmentRecord[] = [
  { id: 'tr1', appointmentId: 'ap7', customerId: 'c1', preCheck: { consentConfirmed: true, precautionsConfirmed: true, prePhotos: ['photo_c1_s1_pre'] }, postRecord: { reactions: ['轻微泛红'], iceCompressMinutes: 15, careAdvice: '当日避免热水洗脸，使用医用修复面膜', isAbnormal: false }, recordedAt: '2025-05-15T09:45' },
  { id: 'tr2', appointmentId: 'ap8', customerId: 'c1', preCheck: { consentConfirmed: true, precautionsConfirmed: true, prePhotos: ['photo_c1_s2_pre'] }, postRecord: { reactions: ['轻微泛红', '轻度肿胀'], iceCompressMinutes: 20, careAdvice: '加强保湿，3日内避免剧烈运动', isAbnormal: false }, recordedAt: '2025-06-12T09:50' },
  { id: 'tr3', appointmentId: 'ap9', customerId: 'c2', preCheck: { consentConfirmed: true, precautionsConfirmed: true, prePhotos: ['photo_c2_s1_pre'] }, postRecord: { reactions: ['泛红明显'], iceCompressMinutes: 25, careAdvice: '冰敷后使用修复霜，避免辛辣食物', isAbnormal: true, abnormalNote: '红血丝区域反应较重，下次降低能量档位' }, recordedAt: '2025-05-22T10:50' },
  { id: 'tr4', appointmentId: 'ap10', customerId: 'c3', preCheck: { consentConfirmed: true, precautionsConfirmed: true, prePhotos: ['photo_c3_s1_pre'] }, postRecord: { reactions: ['轻微泛红'], iceCompressMinutes: 15, careAdvice: '注意控油，避免使用含酸类护肤品', isAbnormal: false }, recordedAt: '2025-06-05T14:50' },
  { id: 'tr5', appointmentId: 'ap11', customerId: 'c4', preCheck: { consentConfirmed: true, precautionsConfirmed: true, prePhotos: ['photo_c4_s1_pre'] }, postRecord: { reactions: ['轻微泛红'], iceCompressMinutes: 15, careAdvice: '加强保湿防晒，色斑区域注意观察', isAbnormal: false }, recordedAt: '2025-06-08T09:45' },
  { id: 'tr6', appointmentId: 'ap12', customerId: 'c6', preCheck: { consentConfirmed: true, precautionsConfirmed: true, prePhotos: ['photo_c6_s1_pre'] }, postRecord: { reactions: ['泛红', '灼热感'], iceCompressMinutes: 30, careAdvice: '持续冰敷观察，如灼热感持续请来电', isAbnormal: true, abnormalNote: '红血丝区域灼热感较强，需持续观察' }, recordedAt: '2025-06-15T10:55' },
]

export const mockFollowUps: FollowUpTask[] = [
  { id: 'fu1', customerId: 'c1', appointmentId: 'ap8', triggerDay: 3, dueDate: '2025-06-15', status: 'completed', result: { feedback: '皮肤恢复良好，色斑有淡化趋势', satisfaction: 4, isAbnormal: false, repurchaseIntent: 'high' }, completedAt: '2025-06-15' },
  { id: 'fu2', customerId: 'c1', appointmentId: 'ap8', triggerDay: 7, dueDate: '2025-06-19', status: 'completed', result: { feedback: '效果满意，期待下次治疗', satisfaction: 5, isAbnormal: false, repurchaseIntent: 'high' }, completedAt: '2025-06-19' },
  { id: 'fu3', customerId: 'c1', appointmentId: 'ap8', triggerDay: 14, dueDate: '2025-06-26', status: 'pending' },
  { id: 'fu4', customerId: 'c2', appointmentId: 'ap9', triggerDay: 3, dueDate: '2025-05-25', status: 'completed', result: { feedback: '泛红已消退，红血丝稍有改善', satisfaction: 3, isAbnormal: true, repurchaseIntent: 'medium' }, completedAt: '2025-05-25' },
  { id: 'fu5', customerId: 'c2', appointmentId: 'ap9', triggerDay: 7, dueDate: '2025-05-29', status: 'completed', result: { feedback: '改善明显，期待继续治疗', satisfaction: 4, isAbnormal: false, repurchaseIntent: 'medium' }, completedAt: '2025-05-29' },
  { id: 'fu6', customerId: 'c2', appointmentId: 'ap9', triggerDay: 14, dueDate: '2025-06-05', status: 'completed', result: { feedback: '效果稳定，痘印淡化', satisfaction: 4, isAbnormal: false, repurchaseIntent: 'medium' }, completedAt: '2025-06-05' },
  { id: 'fu7', customerId: 'c3', appointmentId: 'ap10', triggerDay: 3, dueDate: '2025-06-08', status: 'completed', result: { feedback: '恢复良好，T区出油有改善', satisfaction: 4, isAbnormal: false, repurchaseIntent: 'low' }, completedAt: '2025-06-08' },
  { id: 'fu8', customerId: 'c3', appointmentId: 'ap10', triggerDay: 7, dueDate: '2025-06-12', status: 'completed', result: { feedback: '痘印有淡化', satisfaction: 3, isAbnormal: false, repurchaseIntent: 'low' }, completedAt: '2025-06-12' },
  { id: 'fu9', customerId: 'c3', appointmentId: 'ap10', triggerDay: 14, dueDate: '2025-06-19', status: 'overdue' },
  { id: 'fu10', customerId: 'c6', appointmentId: 'ap12', triggerDay: 3, dueDate: '2025-06-18', status: 'completed', result: { feedback: '灼热感已消退，红血丝有改善', satisfaction: 3, isAbnormal: true, repurchaseIntent: 'medium' }, completedAt: '2025-06-18' },
  { id: 'fu11', customerId: 'c6', appointmentId: 'ap12', triggerDay: 7, dueDate: '2025-06-22', status: 'pending' },
  { id: 'fu12', customerId: 'c6', appointmentId: 'ap12', triggerDay: 14, dueDate: '2025-06-29', status: 'pending' },
]
