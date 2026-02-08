'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { X } from 'lucide-react'
import type { Bed, Department } from '@/lib/types'

interface EditBedProps {
  isOpen: boolean
  bed: Bed | null
  onClose: () => void
  onSuccess: () => void
}

export function EditBed({ isOpen, bed, onClose, onSuccess }: EditBedProps) {
  const [loading, setLoading] = useState(false)
  const [departments, setDepartments] = useState<Department[]>([])
  
  const [formData, setFormData] = useState({
    bed_number: '',
    department_id: '',
    bed_type: 'general',
    floor_number: 1,
    room_number: '',
    status: 'available',
  })

  useEffect(() => {
    if (isOpen && bed) {
      setFormData({
        bed_number: bed.bed_number,
        department_id: bed.department_id,
        bed_type: bed.bed_type,
        floor_number: bed.floor_number || 1,
        room_number: bed.room_number || '',
        status: bed.status,
      })
      fetchDepartments()
    }
  }, [isOpen, bed])

  async function fetchDepartments() {
    const supabase = createClient()
    const { data } = await supabase
      .from('departments')
      .select('*')
      .order('name')

    setDepartments(data || [])
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!bed) return

    setLoading(true)

    const supabase = createClient()

    try {
      const { error } = await supabase
        .from('beds')
        .update(formData)
        .eq('id', bed.id)

      if (error) throw error

      alert('Bed updated successfully!')
      onSuccess()
      onClose()
    } catch (error: any) {
      console.error('Error updating bed:', error)
      if (error.code === '23505') {
        alert('Bed number already exists. Please use a different number.')
      } else {
        alert('Failed to update bed. Please try again.')
      }
    } finally {
      setLoading(false)
    }
  }

  async function handleDelete() {
    if (!bed) return
    if (!confirm('Are you sure you want to delete this bed? This action cannot be undone.')) return

    setLoading(true)
    const supabase = createClient()

    try {
      const { error } = await supabase
        .from('beds')
        .delete()
        .eq('id', bed.id)

      if (error) throw error

      alert('Bed deleted successfully!')
      onSuccess()
      onClose()
    } catch (error: any) {
      console.error('Error deleting bed:', error)
      if (error.code === '23503') {
        alert('Cannot delete bed. It has associated admission records.')
      } else {
        alert('Failed to delete bed. Please try again.')
      }
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen || !bed) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-slate-900">Edit Bed</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <X className="h-6 w-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Bed Number *</label>
              <input
                required
                type="text"
                value={formData.bed_number}
                onChange={(e) => setFormData({ ...formData, bed_number: e.target.value })}
                className="input"
              />
            </div>
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
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Bed Type *</label>
              <select
                value={formData.bed_type}
                onChange={(e) => setFormData({ ...formData, bed_type: e.target.value })}
                className="input"
              >
                <option value="general">General</option>
                <option value="icu">ICU</option>
                <option value="private">Private</option>
                <option value="semi-private">Semi-Private</option>
                <option value="emergency">Emergency</option>
              </select>
            </div>
            <div>
              <label className="label">Status *</label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className="input"
              >
                <option value="available">Available</option>
                <option value="occupied">Occupied</option>
                <option value="maintenance">Maintenance</option>
                <option value="reserved">Reserved</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Floor Number *</label>
              <input
                required
                type="number"
                min="1"
                value={formData.floor_number}
                onChange={(e) => setFormData({ ...formData, floor_number: parseInt(e.target.value) })}
                className="input"
              />
            </div>
            <div>
              <label className="label">Room Number</label>
              <input
                type="text"
                value={formData.room_number}
                onChange={(e) => setFormData({ ...formData, room_number: e.target.value })}
                className="input"
              />
            </div>
          </div>

          <div className="flex gap-3 pt-4 border-t">
            <button
              type="button"
              onClick={handleDelete}
              disabled={loading}
              className="btn bg-red-600 text-white hover:bg-red-700"
            >
              Delete Bed
            </button>
            <div className="flex-1"></div>
            <button type="button" onClick={onClose} className="btn btn-secondary">
              Cancel
            </button>
            <button type="submit" disabled={loading} className="btn btn-primary">
              {loading ? 'Updating...' : 'Update Bed'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}