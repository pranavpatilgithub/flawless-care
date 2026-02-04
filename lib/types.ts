export type UserRole = 'admin' | 'doctor' | 'nurse' | 'receptionist' | 'pharmacist' | 'inventory_manager'

export type BedType = 'general' | 'icu' | 'private' | 'semi-private' | 'emergency'
export type BedStatus = 'available' | 'occupied' | 'maintenance' | 'reserved'

export type QueuePriority = 'normal' | 'urgent' | 'emergency'
export type QueueStatus = 'waiting' | 'in_consultation' | 'completed' | 'cancelled'

export type AdmissionType = 'emergency' | 'planned' | 'transfer'
export type AdmissionStatus = 'admitted' | 'discharged' | 'transferred'

export type ItemType = 'medicine' | 'consumable' | 'equipment'
export type TransactionType = 'purchase' | 'dispensation' | 'adjustment' | 'return' | 'wastage'
export type PrescriptionStatus = 'pending' | 'dispensed' | 'cancelled'

export interface Profile {
  id: string
  email: string
  full_name: string
  role: UserRole
  department?: string
  phone?: string
  created_at: string
  updated_at: string
}

export interface Department {
  id: string
  name: string
  description?: string
  head_doctor_id?: string
  created_at: string
}

export interface Bed {
  id: string
  bed_number: string
  department_id: string
  bed_type: BedType
  status: BedStatus
  floor_number?: number
  room_number?: string
  created_at: string
  updated_at: string
}

export interface Patient {
  id: string
  patient_number: string
  full_name: string
  date_of_birth: string
  gender?: 'male' | 'female' | 'other'
  blood_group?: string
  phone?: string
  email?: string
  address?: string
  emergency_contact_name?: string
  emergency_contact_phone?: string
  allergies?: string
  chronic_conditions?: string
  created_at: string
  updated_at: string
}

export interface OPDQueue {
  id: string
  patient_id: string
  department_id: string
  doctor_id?: string
  token_number: number
  priority: QueuePriority
  status: QueueStatus
  check_in_time: string
  consultation_start_time?: string
  consultation_end_time?: string
  symptoms?: string
  vitals?: Record<string, any>
  notes?: string
  created_at: string
  patient?: Patient
  department?: Department
  doctor?: Profile
}

export interface Admission {
  id: string
  patient_id: string
  bed_id: string
  department_id: string
  admitting_doctor_id: string
  admission_date: string
  discharge_date?: string
  admission_type: AdmissionType
  status: AdmissionStatus
  diagnosis?: string
  treatment_plan?: string
  discharge_summary?: string
  total_cost?: number
  created_at: string
  updated_at: string
  patient?: Patient
  bed?: Bed
  department?: Department
  doctor?: Profile
}

export interface InventoryCategory {
  id: string
  name: string
  description?: string
  created_at: string
}

export interface InventoryItem {
  id: string
  name: string
  category_id: string
  item_type: ItemType
  description?: string
  unit: string
  manufacturer?: string
  current_stock: number
  minimum_stock: number
  maximum_stock?: number
  unit_price?: number
  expiry_alert_days: number
  created_at: string
  updated_at: string
  category?: InventoryCategory
}

export interface InventoryBatch {
  id: string
  item_id: string
  batch_number: string
  quantity: number
  manufacturing_date?: string
  expiry_date?: string
  purchase_price?: number
  supplier?: string
  status: 'active' | 'expired' | 'recalled'
  created_at: string
}

export interface InventoryTransaction {
  id: string
  item_id: string
  batch_id?: string
  transaction_type: TransactionType
  quantity: number
  unit_price?: number
  reference_id?: string
  reference_type?: string
  performed_by?: string
  notes?: string
  created_at: string
  item?: InventoryItem
  performer?: Profile
}

export interface Prescription {
  id: string
  patient_id: string
  doctor_id: string
  admission_id?: string
  opd_queue_id?: string
  status: PrescriptionStatus
  created_at: string
  patient?: Patient
  doctor?: Profile
}

export interface PrescriptionItem {
  id: string
  prescription_id: string
  item_id: string
  dosage: string
  frequency: string
  duration: string
  quantity: number
  instructions?: string
  created_at: string
  item?: InventoryItem
}

export interface DailyStats {
  id: string
  date: string
  total_opd_patients: number
  total_admissions: number
  total_discharges: number
  beds_occupied: number
  beds_available: number
  revenue: number
  created_at: string
}
