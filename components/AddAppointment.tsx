'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { X } from 'lucide-react'
import type { Department, Patient, Profile } from '@/lib/types'

interface AddAppointmentProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
}

export function AddAppointment({ isOpen, onClose, onSuccess }: AddAppointmentProps) {
  const [loading, setLoading] = useState(false)
  const [departments, setDepartments] = useState<Department[]>([])
  const [patients, setPatients] = useState<Patient[]>([])
  const [doctors, setDoctors] = useState<Profile[]>([])
  
  const [formData, setFormData] = useState({
    patient_id: '',
    doctor_id: '',
    department_id: '',
    appointment_date: new Date().toISOString().split('T')[0],
    appointment_time: '09:00',
    duration_minutes: 30,
    appointment_type: 'consultation',
    reason: '',
    notes: '',
  })

  useEffect(() => {
    if (isOpen) {
      fetchData()
    }
  }, [isOpen])

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

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)

    const supabase = createClient()

    try {
      const { error } = await supabase
        .from('appointments')
        .insert([{
          ...formData,
          status: 'scheduled',
        }])

      if (error) throw error

      alert('Appointment scheduled successfully!')
      onSuccess()
      onClose()
      resetForm()
    } catch (error: any) {
      console.error('Error creating appointment:', error)
      if (error.message.includes('already has an appointment')) {
        alert('Doctor already has an appointment at this time. Please choose a different time.')
      } else {
        alert('Failed to create appointment. Please try again.')
      }
    } finally {
      setLoading(false)
    }
  }

  function resetForm() {
    setFormData({
      patient_id: '',
      doctor_id: '',
      department_id: '',
      appointment_date: new Date().toISOString().split('T')[0],
      appointment_time: '09:00',
      duration_minutes: 30,
      appointment_type: 'consultation',
      reason: '',
      notes: '',
    })
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-slate-900">Schedule Appointment</h2>
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

          {/* Department & Doctor */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Department *</label>
              <select
                required
                value={formData.department_id}
                onChange={(e) => setFormData({ ...formData, department_id: e.target.value })}
                className="input"
              >
                <option value="">Select department</option>
                {departments.map(dept => (
                  <option key={dept.id} value={dept.id}>{dept.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="label">Doctor *</label>
              <select
                required
                value={formData.doctor_id}
                onChange={(e) => setFormData({ ...formData, doctor_id: e.target.value })}
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
          </div>

          {/* Date & Time */}
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="label">Appointment Date *</label>
              <input
                required
                type="date"
                min={new Date().toISOString().split('T')[0]}
                value={formData.appointment_date}
                onChange={(e) => setFormData({ ...formData, appointment_date: e.target.value })}
                className="input"
              />
            </div>
            <div>
              <label className="label">Time *</label>
              <input
                required
                type="time"
                value={formData.appointment_time}
                onChange={(e) => setFormData({ ...formData, appointment_time: e.target.value })}
                className="input"
              />
            </div>
            <div>
              <label className="label">Duration (min) *</label>
              <select
                value={formData.duration_minutes}
                onChange={(e) => setFormData({ ...formData, duration_minutes: parseInt(e.target.value) })}
                className="input"
              >
                <option value={15}>15 minutes</option>
                <option value={30}>30 minutes</option>
                <option value={45}>45 minutes</option>
                <option value={60}>1 hour</option>
                <option value={90}>1.5 hours</option>
                <option value={120}>2 hours</option>
              </select>
            </div>
          </div>

          {/* Appointment Type */}
          <div>
            <label className="label">Appointment Type *</label>
            <select
              value={formData.appointment_type}
              onChange={(e) => setFormData({ ...formData, appointment_type: e.target.value })}
              className="input"
            >
              <option value="consultation">Consultation</option>
              <option value="follow_up">Follow-up</option>
              <option value="procedure">Procedure</option>
              <option value="checkup">General Checkup</option>
            </select>
          </div>

          {/* Reason */}
          <div>
            <label className="label">Reason for Visit *</label>
            <textarea
              required
              rows={3}
              value={formData.reason}
              onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
              className="input"
              placeholder="Brief description of the reason for appointment..."
            />
          </div>

          {/* Notes */}
          <div>
            <label className="label">Additional Notes</label>
            <textarea
              rows={2}
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              className="input"
              placeholder="Any special instructions or notes..."
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
              disabled={loading}
              className="btn btn-primary flex-1"
            >
              {loading ? 'Scheduling...' : 'Schedule Appointment'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}