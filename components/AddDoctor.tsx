'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { X } from 'lucide-react'

interface AddDoctorProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
}

export function AddDoctor({ isOpen, onClose, onSuccess }: AddDoctorProps) {
  const [loading, setLoading] = useState(false)
  
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    full_name: '',
    department: '',
    phone: '',
    specialization: '',
  })

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)

    const supabase = createClient()

    try {
      // First, create the auth user
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
      })

      if (authError) throw authError

      if (!authData.user) {
        throw new Error('User creation failed')
      }

      // Then create the profile
      const { error: profileError } = await supabase
        .from('profiles')
        .insert([{
          id: authData.user.id,
          email: formData.email,
          full_name: formData.full_name,
          role: 'doctor',
          department: formData.department,
          phone: formData.phone,
        }])

      if (profileError) throw profileError

      alert('Doctor added successfully! Login credentials sent to email.')
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
      email: '',
      password: '',
      full_name: '',
      department: '',
      phone: '',
      specialization: '',
    })
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-slate-900">Add New Doctor</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <X className="h-6 w-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Personal Information */}
          <div>
            <h3 className="text-lg font-semibold text-slate-900 mb-4">Personal Information</h3>
            
            <div className="space-y-4">
              <div>
                <label className="label">Full Name *</label>
                <input
                  required
                  type="text"
                  value={formData.full_name}
                  onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                  className="input"
                  placeholder="e.g., John Smith"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label">Email Address *</label>
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
                  <label className="label">Phone Number *</label>
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
            </div>
          </div>

          {/* Professional Information */}
          <div className="border-t pt-6">
            <h3 className="text-lg font-semibold text-slate-900 mb-4">Professional Information</h3>
            
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label">Department *</label>
                  <input
                    required
                    type="text"
                    value={formData.department}
                    onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                    className="input"
                    placeholder="e.g., Cardiology, Orthopedics"
                  />
                </div>

                <div>
                  <label className="label">Specialization</label>
                  <input
                    type="text"
                    value={formData.specialization}
                    onChange={(e) => setFormData({ ...formData, specialization: e.target.value })}
                    className="input"
                    placeholder="e.g., Heart Surgery"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Login Credentials */}
          <div className="border-t pt-6">
            <h3 className="text-lg font-semibold text-slate-900 mb-4">Login Credentials</h3>
            
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg mb-4">
              <p className="text-sm text-blue-800">
                <strong>Note:</strong> The doctor will receive an email with login instructions. 
                Please ensure the email address is correct.
              </p>
            </div>

            <div>
              <label className="label">Initial Password *</label>
              <input
                required
                type="password"
                minLength={6}
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="input"
                placeholder="Minimum 6 characters"
              />
              <p className="text-xs text-slate-500 mt-1">
                The doctor can change this password after first login
              </p>
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
              {loading ? 'Adding Doctor...' : 'Add Doctor'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}