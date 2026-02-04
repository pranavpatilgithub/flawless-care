'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { X } from 'lucide-react'
import type { Department, Patient, Bed, Profile } from '@/lib/types'

interface NewAdmissionProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
}

export function NewAdmission({ isOpen, onClose, onSuccess }: NewAdmissionProps) {
  const [loading, setLoading] = useState(false)
  const [departments, setDepartments] = useState<Department[]>([])
  const [patients, setPatients] = useState<Patient[]>([])
  const [availableBeds, setAvailableBeds] = useState<Bed[]>([])
  const [doctors, setDoctors] = useState<Profile[]>([])
  
  const [formData, setFormData] = useState({
    patient_id: '',
    department_id: '',
    bed_id: '',
    admitting_doctor_id: '',
    admission_type: 'planned',
    diagnosis: '',
    treatment_plan: '',
  })

  useEffect(() => {
    if (isOpen) {
      fetchData()
    }
  }, [isOpen])

  useEffect(() => {
    if (formData.department_id) {
      fetchAvailableBeds(formData.department_id)
    }
  }, [formData.department_id])

  async function fetchData() {
    const supabase = createClient()
    
    const [deptRes, patientRes, doctorRes] = await Promise.all([
      supabase.from('departments').select('*').order('name'),
      supabase.from('patients').select('*').order('full_name'),
      supabase.from('profiles').select('*').eq('role', 'doctor').order('full_name'),
    ])

    setDepartments(deptRes.data || [])
    setPatients(patientRes.data || [])
    setDoctors(doctorRes.data || [])
  }

  async function fetchAvailableBeds(departmentId: string) {
    const supabase = createClient()
    
    const { data } = await supabase
      .from('beds')
      .select('*')
      .eq('department_id', departmentId)
      .eq('status', 'available')
      .order('bed_number')

    setAvailableBeds(data || [])
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)

    const supabase = createClient()

    try {
      const { error } = await supabase
        .from('admissions')
        .insert([{
          ...formData,
          status: 'admitted',
          admission_date: new Date().toISOString(),
        }])

      if (error) throw error

      alert('Patient admitted successfully!')
      onSuccess()
      onClose()
      resetForm()
    } catch (error) {
      console.error('Error admitting patient:', error)
      alert('Failed to admit patient. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  function resetForm() {
    setFormData({
      patient_id: '',
      department_id: '',
      bed_id: '',
      admitting_doctor_id: '',
      admission_type: 'planned',
      diagnosis: '',
      treatment_plan: '',
    })
    setAvailableBeds([])
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-slate-900">New Patient Admission</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <X className="h-6 w-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Patient Selection */}
          <div>
            <label className="label">Select Patient *</label>
            <select
              required
              value={formData.patient_id}
              onChange={(e) => setFormData({ ...formData, patient_id: e.target.value })}
              className="input"
            >
              <option value="">Choose a patient</option>
              {patients.map(patient => (
                <option key={patient.id} value={patient.id}>
                  {patient.full_name} - {patient.patient_number} - {patient.phone}
                </option>
              ))}
            </select>
          </div>

          {/* Department Selection */}
          <div>
            <label className="label">Department *</label>
            <select
              required
              value={formData.department_id}
              onChange={(e) => setFormData({ ...formData, department_id: e.target.value, bed_id: '' })}
              className="input"
            >
              <option value="">Select department</option>
              {departments.map(dept => (
                <option key={dept.id} value={dept.id}>{dept.name}</option>
              ))}
            </select>
          </div>

          {/* Bed Selection */}
          <div>
            <label className="label">Assign Bed *</label>
            <select
              required
              value={formData.bed_id}
              onChange={(e) => setFormData({ ...formData, bed_id: e.target.value })}
              className="input"
              disabled={!formData.department_id}
            >
              <option value="">Select available bed</option>
              {availableBeds.map(bed => (
                <option key={bed.id} value={bed.id}>
                  {bed.bed_number} - {bed.bed_type.toUpperCase()} - Floor {bed.floor_number}
                </option>
              ))}
            </select>
            {formData.department_id && availableBeds.length === 0 && (
              <p className="text-sm text-red-600 mt-1">No available beds in this department</p>
            )}
          </div>

          {/* Doctor Selection */}
          <div>
            <label className="label">Admitting Doctor *</label>
            <select
              required
              value={formData.admitting_doctor_id}
              onChange={(e) => setFormData({ ...formData, admitting_doctor_id: e.target.value })}
              className="input"
            >
              <option value="">Select doctor</option>
              {doctors.map(doctor => (
                <option key={doctor.id} value={doctor.id}>
                  Dr. {doctor.full_name} - {doctor.department}
                </option>
              ))}
            </select>
          </div>

          {/* Admission Type */}
          <div>
            <label className="label">Admission Type *</label>
            <select
              value={formData.admission_type}
              onChange={(e) => setFormData({ ...formData, admission_type: e.target.value })}
              className="input"
            >
              <option value="planned">Planned</option>
              <option value="emergency">Emergency</option>
              <option value="transfer">Transfer</option>
            </select>
          </div>

          {/* Diagnosis */}
          <div>
            <label className="label">Diagnosis *</label>
            <textarea
              required
              rows={3}
              value={formData.diagnosis}
              onChange={(e) => setFormData({ ...formData, diagnosis: e.target.value })}
              className="input"
              placeholder="Enter preliminary diagnosis..."
            />
          </div>

          {/* Treatment Plan */}
          <div>
            <label className="label">Treatment Plan *</label>
            <textarea
              required
              rows={3}
              value={formData.treatment_plan}
              onChange={(e) => setFormData({ ...formData, treatment_plan: e.target.value })}
              className="input"
              placeholder="Enter treatment plan..."
            />
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4 border-t">
            <button
              type="button"
              onClick={onClose}
              className="btn btn-secondary flex-1"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || !formData.bed_id}
              className="btn btn-primary flex-1"
            >
              {loading ? 'Admitting...' : 'Admit Patient'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}