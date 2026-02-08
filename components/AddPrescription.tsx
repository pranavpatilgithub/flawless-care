'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { X, Plus, Trash2 } from 'lucide-react'
import type { Patient, Profile, InventoryItem } from '@/lib/types'

interface AddPrescriptionProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
}

interface PrescriptionItemForm {
  item_id: string
  dosage: string
  frequency: string
  duration: string
  quantity: number
  instructions: string
}

export function AddPrescription({ isOpen, onClose, onSuccess }: AddPrescriptionProps) {
  const [loading, setLoading] = useState(false)
  const [patients, setPatients] = useState<Patient[]>([])
  const [doctors, setDoctors] = useState<Profile[]>([])
  const [medicines, setMedicines] = useState<InventoryItem[]>([])
  
  const [formData, setFormData] = useState({
    patient_id: '',
    doctor_id: '',
    diagnosis: '',
    notes: '',
    follow_up_date: '',
  })

  const [items, setItems] = useState<PrescriptionItemForm[]>([
    {
      item_id: '',
      dosage: '',
      frequency: '',
      duration: '',
      quantity: 0,
      instructions: '',
    }
  ])

  useEffect(() => {
    if (isOpen) {
      fetchData()
    }
  }, [isOpen])

  async function fetchData() {
    const supabase = createClient()
    
    const [patientRes, doctorRes, medicineRes] = await Promise.all([
      supabase.from('patients').select('*').order('full_name'),
      supabase.from('profiles').select('*').eq('role', 'doctor').order('full_name'),
      supabase.from('inventory_items').select('*').eq('item_type', 'medicine').order('name'),
    ])

    setPatients(patientRes.data || [])
    setDoctors(doctorRes.data || [])
    setMedicines(medicineRes.data || [])
  }

  function addItem() {
    setItems([...items, {
      item_id: '',
      dosage: '',
      frequency: '',
      duration: '',
      quantity: 0,
      instructions: '',
    }])
  }

  function removeItem(index: number) {
    setItems(items.filter((_, i) => i !== index))
  }

  function updateItem(index: number, field: keyof PrescriptionItemForm, value: any) {
    const newItems = [...items]
    newItems[index] = { ...newItems[index], [field]: value }
    setItems(newItems)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    
    // Validate items
    const validItems = items.filter(item => item.item_id && item.dosage && item.frequency && item.duration && item.quantity > 0)
    
    if (validItems.length === 0) {
      alert('Please add at least one medication')
      return
    }

    setLoading(true)

    const supabase = createClient()

    try {
      // Create prescription
      const { data: prescription, error: prescriptionError } = await supabase
        .from('prescriptions')
        .insert([{
          ...formData,
          status: 'pending',
        }])
        .select()
        .single()

      if (prescriptionError) throw prescriptionError

      // Create prescription items
      const prescriptionItems = validItems.map(item => ({
        prescription_id: prescription.id,
        ...item,
        dispensed_quantity: 0,
      }))

      const { error: itemsError } = await supabase
        .from('prescription_items')
        .insert(prescriptionItems)

      if (itemsError) throw itemsError

      alert('Prescription created successfully!')
      onSuccess()
      onClose()
      resetForm()
    } catch (error) {
      console.error('Error creating prescription:', error)
      alert('Failed to create prescription. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  function resetForm() {
    setFormData({
      patient_id: '',
      doctor_id: '',
      diagnosis: '',
      notes: '',
      follow_up_date: '',
    })
    setItems([{
      item_id: '',
      dosage: '',
      frequency: '',
      duration: '',
      quantity: 0,
      instructions: '',
    }])
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between z-10">
          <h2 className="text-2xl font-bold text-slate-900">New Prescription</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <X className="h-6 w-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Patient & Doctor Selection */}
          <div className="grid grid-cols-2 gap-4">
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
            <div>
              <label className="label">Prescribing Doctor *</label>
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

          {/* Diagnosis */}
          <div>
            <label className="label">Diagnosis *</label>
            <textarea
              required
              rows={2}
              value={formData.diagnosis}
              onChange={(e) => setFormData({ ...formData, diagnosis: e.target.value })}
              className="input"
              placeholder="Enter diagnosis..."
            />
          </div>

          {/* Medications */}
          <div className="border-t pt-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-slate-900">Medications</h3>
              <button
                type="button"
                onClick={addItem}
                className="btn btn-secondary btn-sm"
              >
                <Plus className="h-4 w-4 mr-1" />
                Add Medication
              </button>
            </div>

            <div className="space-y-4">
              {items.map((item, index) => (
                <div key={index} className="p-4 bg-slate-50 rounded-lg border border-slate-200">
                  <div className="flex items-start justify-between mb-4">
                    <h4 className="font-medium text-slate-900">Medication {index + 1}</h4>
                    {items.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeItem(index)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="col-span-2">
                      <label className="label">Medicine *</label>
                      <select
                        required
                        value={item.item_id}
                        onChange={(e) => updateItem(index, 'item_id', e.target.value)}
                        className="input"
                      >
                        <option value="">Select medicine</option>
                        {medicines.map(med => (
                          <option key={med.id} value={med.id}>
                            {med.name} - {med.manufacturer} (Stock: {med.current_stock})
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="label">Dosage *</label>
                      <input
                        required
                        type="text"
                        value={item.dosage}
                        onChange={(e) => updateItem(index, 'dosage', e.target.value)}
                        className="input"
                        placeholder="e.g., 500mg"
                      />
                    </div>

                    <div>
                      <label className="label">Frequency *</label>
                      <input
                        required
                        type="text"
                        value={item.frequency}
                        onChange={(e) => updateItem(index, 'frequency', e.target.value)}
                        className="input"
                        placeholder="e.g., 3 times daily"
                      />
                    </div>

                    <div>
                      <label className="label">Duration *</label>
                      <input
                        required
                        type="text"
                        value={item.duration}
                        onChange={(e) => updateItem(index, 'duration', e.target.value)}
                        className="input"
                        placeholder="e.g., 7 days"
                      />
                    </div>

                    <div>
                      <label className="label">Quantity *</label>
                      <input
                        required
                        type="number"
                        min="1"
                        value={item.quantity}
                        onChange={(e) => updateItem(index, 'quantity', parseInt(e.target.value))}
                        className="input"
                        placeholder="Total tablets/units"
                      />
                    </div>

                    <div className="col-span-2">
                      <label className="label">Instructions</label>
                      <input
                        type="text"
                        value={item.instructions}
                        onChange={(e) => updateItem(index, 'instructions', e.target.value)}
                        className="input"
                        placeholder="e.g., Take after meals"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Additional Info */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Follow-up Date</label>
              <input
                type="date"
                value={formData.follow_up_date}
                onChange={(e) => setFormData({ ...formData, follow_up_date: e.target.value })}
                className="input"
              />
            </div>
            <div>
              <label className="label">Additional Notes</label>
              <input
                type="text"
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                className="input"
                placeholder="Any special instructions..."
              />
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
              {loading ? 'Creating...' : 'Create Prescription'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}