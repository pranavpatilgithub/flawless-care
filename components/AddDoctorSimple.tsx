'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { X } from 'lucide-react'

interface AddDoctorSimpleProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
}

export function AddDoctorSimple({ isOpen, onClose, onSuccess }: AddDoctorSimpleProps) {
  const [loading, setLoading] = useState(false)
  
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    department: '',
    phone: '',
  })

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)

    const supabase = createClient()

    try {
      // Create a dummy UUID for the doctor (not linked to auth)
      const dummyId = crypto.randomUUID()

      const { error } = await supabase
        .from('profiles')
        .insert([{
          id: dummyId,
          email: formData.email,
          full_name: formData.full_name,
          role: 'doctor',
          department: formData.department,
          phone: formData.phone,
        }])

      if (error) throw error

      alert('Doctor added successfully!')
      onSuccess()
      onClose()
      resetForm()
    } catch (error: any) {
      console.error('Error adding doctor:', error)
      alert(error.message || 'Failed to add doctor. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  function resetForm() {
    setFormData({
      full_name: '',
      email: '',
      department: '',
      phone: '',
    })
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-xl w-full">
        <div className="border-b border-slate-200 px-6 py-4 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-slate-900">Add New Doctor</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <X className="h-6 w-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="label">Full Name *</label>
            <input
              required
              type="text"
              value={formData.full_name}
              onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
              className="input"
              placeholder="Dr. John Smith"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Email *</label>
              <input
                required
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="input"
                placeholder="doctor@hospital.com"
              />
            </div>

            <div>
              <label className="label">Phone *</label>
              <input
                required
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="input"
                placeholder="+91 1234567890"
              />
            </div>
          </div>

          <div>
            <label className="label">Department *</label>
            <input
              required
              type="text"
              value={formData.department}
              onChange={(e) => setFormData({ ...formData, department: e.target.value })}
              className="input"
              placeholder="e.g., Cardiology"
            />
          </div>

          <div className="flex gap-3 pt-4 border-t">
            <button type="button" onClick={onClose} className="btn btn-secondary flex-1">
              Cancel
            </button>
            <button type="submit" disabled={loading} className="btn btn-primary flex-1">
              {loading ? 'Adding...' : 'Add Doctor'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}