'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { X } from 'lucide-react'
import type { Department, Patient } from '@/lib/types'
import { getPatientNumber, getNextTokenNumber } from '@/lib/utils'

interface AddPatientToQueueProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
}

export function AddPatientToQueue({ isOpen, onClose, onSuccess }: AddPatientToQueueProps) {
  const [loading, setLoading] = useState(false)
  const [departments, setDepartments] = useState<Department[]>([])
  const [patients, setPatients] = useState<Patient[]>([])
  const [isNewPatient, setIsNewPatient] = useState(false)
  
  const [formData, setFormData] = useState({
    patient_id: '',
    department_id: '',
    priority: 'normal',
    symptoms: '',
    vitals: {
      temperature: '',
      blood_pressure: '',
      pulse: '',
      spo2: '',
    }
  })

  const [newPatientData, setNewPatientData] = useState({
    full_name: '',
    date_of_birth: '',
    gender: 'male',
    blood_group: '',
    phone: '',
    email: '',
    address: '',
    emergency_contact_name: '',
    emergency_contact_phone: '',
  })

  useEffect(() => {
    if (isOpen) {
      fetchData()
    }
  }, [isOpen])

  async function fetchData() {
    const supabase = createClient()
    
    const { data: deptData } = await supabase
      .from('departments')
      .select('*')
      .order('name')

    const { data: patientData } = await supabase
      .from('patients')
      .select('*')
      .order('full_name')

    setDepartments(deptData || [])
    setPatients(patientData || [])
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)

    const supabase = createClient()

    try {
      let patientId = formData.patient_id

      // Create new patient if needed
      if (isNewPatient) {
        const patientNumber = getPatientNumber()
        
        const { data: newPatient, error: patientError } = await supabase
          .from('patients')
          .insert([{
            ...newPatientData,
            patient_number: patientNumber,
          }])
          .select()
          .single()

        if (patientError) throw patientError
        patientId = newPatient.id
      }

      // Get next token number for today
      const today = new Date().toISOString().split('T')[0]
      const { data: existingQueues } = await supabase
        .from('opd_queues')
        .select('token_number')
        .gte('created_at', `${today}T00:00:00`)
        .eq('department_id', formData.department_id)

      const tokenNumbers = existingQueues?.map(q => q.token_number) || []
      const nextToken = getNextTokenNumber(tokenNumbers)

      // Create queue entry
      const { error: queueError } = await supabase
        .from('opd_queues')
        .insert([{
          patient_id: patientId,
          department_id: formData.department_id,
          token_number: nextToken,
          priority: formData.priority,
          symptoms: formData.symptoms,
          vitals: formData.vitals,
          status: 'waiting',
        }])

      if (queueError) throw queueError

      alert(`Patient added to queue successfully! Token number: ${nextToken}`)
      onSuccess()
      onClose()
      resetForm()
    } catch (error) {
      console.error('Error adding patient to queue:', error)
      alert('Failed to add patient to queue. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  function resetForm() {
    setFormData({
      patient_id: '',
      department_id: '',
      priority: 'normal',
      symptoms: '',
      vitals: {
        temperature: '',
        blood_pressure: '',
        pulse: '',
        spo2: '',
      }
    })
    setNewPatientData({
      full_name: '',
      date_of_birth: '',
      gender: 'male',
      blood_group: '',
      phone: '',
      email: '',
      address: '',
      emergency_contact_name: '',
      emergency_contact_phone: '',
    })
    setIsNewPatient(false)
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-slate-900">Add Patient to Queue</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <X className="h-6 w-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Patient Selection */}
          <div>
            <label className="flex items-center gap-2 mb-3">
              <input
                type="checkbox"
                checked={isNewPatient}
                onChange={(e) => setIsNewPatient(e.target.checked)}
                className="rounded"
              />
              <span className="text-sm font-medium text-slate-700">New Patient Registration</span>
            </label>

            {!isNewPatient ? (
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
                      {patient.full_name} - {patient.patient_number}
                    </option>
                  ))}
                </select>
              </div>
            ) : (
              <div className="space-y-4 p-4 bg-slate-50 rounded-lg">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="label">Full Name *</label>
                    <input
                      required
                      type="text"
                      value={newPatientData.full_name}
                      onChange={(e) => setNewPatientData({ ...newPatientData, full_name: e.target.value })}
                      className="input"
                    />
                  </div>
                  <div>
                    <label className="label">Date of Birth *</label>
                    <input
                      required
                      type="date"
                      value={newPatientData.date_of_birth}
                      onChange={(e) => setNewPatientData({ ...newPatientData, date_of_birth: e.target.value })}
                      className="input"
                    />
                  </div>
                  <div>
                    <label className="label">Gender *</label>
                    <select
                      value={newPatientData.gender}
                      onChange={(e) => setNewPatientData({ ...newPatientData, gender: e.target.value })}
                      className="input"
                    >
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                  <div>
                    <label className="label">Blood Group</label>
                    <input
                      type="text"
                      placeholder="e.g., O+, A-, B+"
                      value={newPatientData.blood_group}
                      onChange={(e) => setNewPatientData({ ...newPatientData, blood_group: e.target.value })}
                      className="input"
                    />
                  </div>
                  <div>
                    <label className="label">Phone *</label>
                    <input
                      required
                      type="tel"
                      value={newPatientData.phone}
                      onChange={(e) => setNewPatientData({ ...newPatientData, phone: e.target.value })}
                      className="input"
                    />
                  </div>
                  <div>
                    <label className="label">Email</label>
                    <input
                      type="email"
                      value={newPatientData.email}
                      onChange={(e) => setNewPatientData({ ...newPatientData, email: e.target.value })}
                      className="input"
                    />
                  </div>
                </div>
                <div>
                  <label className="label">Address</label>
                  <textarea
                    rows={2}
                    value={newPatientData.address}
                    onChange={(e) => setNewPatientData({ ...newPatientData, address: e.target.value })}
                    className="input"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="label">Emergency Contact Name</label>
                    <input
                      type="text"
                      value={newPatientData.emergency_contact_name}
                      onChange={(e) => setNewPatientData({ ...newPatientData, emergency_contact_name: e.target.value })}
                      className="input"
                    />
                  </div>
                  <div>
                    <label className="label">Emergency Contact Phone</label>
                    <input
                      type="tel"
                      value={newPatientData.emergency_contact_phone}
                      onChange={(e) => setNewPatientData({ ...newPatientData, emergency_contact_phone: e.target.value })}
                      className="input"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Department Selection */}
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

          {/* Priority */}
          <div>
            <label className="label">Priority *</label>
            <select
              value={formData.priority}
              onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
              className="input"
            >
              <option value="normal">Normal</option>
              <option value="urgent">Urgent</option>
              <option value="emergency">Emergency</option>
            </select>
          </div>

          {/* Symptoms */}
          <div>
            <label className="label">Symptoms</label>
            <textarea
              rows={3}
              value={formData.symptoms}
              onChange={(e) => setFormData({ ...formData, symptoms: e.target.value })}
              className="input"
              placeholder="Describe patient symptoms..."
            />
          </div>

          {/* Vitals */}
          <div>
            <label className="label mb-3">Vital Signs</label>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs text-slate-600">Temperature (°F)</label>
                <input
                  type="text"
                  placeholder="98.6"
                  value={formData.vitals.temperature}
                  onChange={(e) => setFormData({ 
                    ...formData, 
                    vitals: { ...formData.vitals, temperature: e.target.value }
                  })}
                  className="input"
                />
              </div>
              <div>
                <label className="text-xs text-slate-600">Blood Pressure (mmHg)</label>
                <input
                  type="text"
                  placeholder="120/80"
                  value={formData.vitals.blood_pressure}
                  onChange={(e) => setFormData({ 
                    ...formData, 
                    vitals: { ...formData.vitals, blood_pressure: e.target.value }
                  })}
                  className="input"
                />
              </div>
              <div>
                <label className="text-xs text-slate-600">Pulse (bpm)</label>
                <input
                  type="text"
                  placeholder="72"
                  value={formData.vitals.pulse}
                  onChange={(e) => setFormData({ 
                    ...formData, 
                    vitals: { ...formData.vitals, pulse: e.target.value }
                  })}
                  className="input"
                />
              </div>
              <div>
                <label className="text-xs text-slate-600">SpO2 (%)</label>
                <input
                  type="text"
                  placeholder="98"
                  value={formData.vitals.spo2}
                  onChange={(e) => setFormData({ 
                    ...formData, 
                    vitals: { ...formData.vitals, spo2: e.target.value }
                  })}
                  className="input"
                />
              </div>
            </div>
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
              {loading ? 'Adding...' : 'Add to Queue'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}