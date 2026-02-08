'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { X } from 'lucide-react'
import type { Department } from '@/lib/types'

interface AddBedProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
}

export function AddBed({ isOpen, onClose, onSuccess }: AddBedProps) {
  const [loading, setLoading] = useState(false)
  const [departments, setDepartments] = useState<Department[]>([])
  const [bulkAdd, setBulkAdd] = useState(false)
  
  const [singleBedData, setSingleBedData] = useState({
    bed_number: '',
    department_id: '',
    bed_type: 'general',
    floor_number: 1,
    room_number: '',
    status: 'available',
  })

  const [bulkBedData, setBulkBedData] = useState({
    department_id: '',
    bed_type: 'general',
    floor_number: 1,
    count: 5,
    prefix: '',
    starting_number: 1,
  })

  useEffect(() => {
    if (isOpen) {
      fetchDepartments()
    }
  }, [isOpen])

  async function fetchDepartments() {
    const supabase = createClient()
    const { data } = await supabase
      .from('departments')
      .select('*')
      .order('name')

    setDepartments(data || [])
  }

  async function handleSubmitSingle(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)

    const supabase = createClient()

    try {
      const { error } = await supabase
        .from('beds')
        .insert([singleBedData])

      if (error) throw error

      alert('Bed added successfully!')
      onSuccess()
      onClose()
      resetForm()
    } catch (error: any) {
      console.error('Error adding bed:', error)
      if (error.code === '23505') {
        alert('Bed number already exists. Please use a different number.')
      } else {
        alert('Failed to add bed. Please try again.')
      }
    } finally {
      setLoading(false)
    }
  }

  async function handleSubmitBulk(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)

    const supabase = createClient()

    try {
      const beds = []
      for (let i = 0; i < bulkBedData.count; i++) {
        const bedNumber = bulkBedData.prefix 
          ? `${bulkBedData.prefix}-${bulkBedData.starting_number + i}`
          : `${bulkBedData.starting_number + i}`
        
        beds.push({
          bed_number: bedNumber,
          department_id: bulkBedData.department_id,
          bed_type: bulkBedData.bed_type,
          floor_number: bulkBedData.floor_number,
          room_number: `R${bulkBedData.starting_number + i}`,
          status: 'available',
        })
      }

      const { error } = await supabase
        .from('beds')
        .insert(beds)

      if (error) throw error

      alert(`${bulkBedData.count} beds added successfully!`)
      onSuccess()
      onClose()
      resetForm()
    } catch (error: any) {
      console.error('Error adding beds:', error)
      if (error.code === '23505') {
        alert('Some bed numbers already exist. Please use different numbers.')
      } else {
        alert('Failed to add beds. Please try again.')
      }
    } finally {
      setLoading(false)
    }
  }

  function resetForm() {
    setSingleBedData({
      bed_number: '',
      department_id: '',
      bed_type: 'general',
      floor_number: 1,
      room_number: '',
      status: 'available',
    })
    setBulkBedData({
      department_id: '',
      bed_type: 'general',
      floor_number: 1,
      count: 5,
      prefix: '',
      starting_number: 1,
    })
    setBulkAdd(false)
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-slate-900">Add New Bed(s)</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <X className="h-6 w-6" />
          </button>
        </div>

        <div className="p-6">
          {/* Toggle Bulk/Single */}
          <div className="mb-6">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={bulkAdd}
                onChange={(e) => setBulkAdd(e.target.checked)}
                className="rounded"
              />
              <span className="text-sm font-medium text-slate-700">Add Multiple Beds at Once</span>
            </label>
          </div>

          {/* Single Bed Form */}
          {!bulkAdd ? (
            <form onSubmit={handleSubmitSingle} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label">Bed Number *</label>
                  <input
                    required
                    type="text"
                    value={singleBedData.bed_number}
                    onChange={(e) => setSingleBedData({ ...singleBedData, bed_number: e.target.value })}
                    className="input"
                    placeholder="e.g., ICU-101"
                  />
                </div>
                <div>
                  <label className="label">Department *</label>
                  <select
                    required
                    value={singleBedData.department_id}
                    onChange={(e) => setSingleBedData({ ...singleBedData, department_id: e.target.value })}
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
                    value={singleBedData.bed_type}
                    onChange={(e) => setSingleBedData({ ...singleBedData, bed_type: e.target.value })}
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
                    value={singleBedData.status}
                    onChange={(e) => setSingleBedData({ ...singleBedData, status: e.target.value })}
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
                    value={singleBedData.floor_number}
                    onChange={(e) => setSingleBedData({ ...singleBedData, floor_number: parseInt(e.target.value) })}
                    className="input"
                  />
                </div>
                <div>
                  <label className="label">Room Number</label>
                  <input
                    type="text"
                    value={singleBedData.room_number}
                    onChange={(e) => setSingleBedData({ ...singleBedData, room_number: e.target.value })}
                    className="input"
                    placeholder="e.g., R101"
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-4 border-t">
                <button type="button" onClick={onClose} className="btn btn-secondary flex-1">
                  Cancel
                </button>
                <button type="submit" disabled={loading} className="btn btn-primary flex-1">
                  {loading ? 'Adding...' : 'Add Bed'}
                </button>
              </div>
            </form>
          ) : (
            /* Bulk Add Form */
            <form onSubmit={handleSubmitBulk} className="space-y-4">
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg mb-4">
                <p className="text-sm text-blue-800">
                  <strong>Bulk Add:</strong> This will create multiple beds with sequential numbers.
                  Example: If prefix is "GEN" and starting number is 1, it will create GEN-1, GEN-2, GEN-3, etc.
                </p>
              </div>

              <div>
                <label className="label">Department *</label>
                <select
                  required
                  value={bulkBedData.department_id}
                  onChange={(e) => setBulkBedData({ ...bulkBedData, department_id: e.target.value })}
                  className="input"
                >
                  <option value="">Select department</option>
                  {departments.map(dept => (
                    <option key={dept.id} value={dept.id}>{dept.name}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label">Bed Type *</label>
                  <select
                    value={bulkBedData.bed_type}
                    onChange={(e) => setBulkBedData({ ...bulkBedData, bed_type: e.target.value })}
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
                  <label className="label">Floor Number *</label>
                  <input
                    required
                    type="number"
                    min="1"
                    value={bulkBedData.floor_number}
                    onChange={(e) => setBulkBedData({ ...bulkBedData, floor_number: parseInt(e.target.value) })}
                    className="input"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="label">Prefix (Optional)</label>
                  <input
                    type="text"
                    value={bulkBedData.prefix}
                    onChange={(e) => setBulkBedData({ ...bulkBedData, prefix: e.target.value })}
                    className="input"
                    placeholder="e.g., GEN, ICU"
                  />
                </div>
                <div>
                  <label className="label">Starting Number *</label>
                  <input
                    required
                    type="number"
                    min="1"
                    value={bulkBedData.starting_number}
                    onChange={(e) => setBulkBedData({ ...bulkBedData, starting_number: parseInt(e.target.value) })}
                    className="input"
                  />
                </div>
                <div>
                  <label className="label">Count *</label>
                  <input
                    required
                    type="number"
                    min="1"
                    max="50"
                    value={bulkBedData.count}
                    onChange={(e) => setBulkBedData({ ...bulkBedData, count: parseInt(e.target.value) })}
                    className="input"
                  />
                </div>
              </div>

              <div className="p-4 bg-slate-50 rounded-lg">
                <p className="text-sm text-slate-600 mb-2">Preview of bed numbers:</p>
                <div className="flex flex-wrap gap-2">
                  {Array.from({ length: Math.min(bulkBedData.count, 10) }, (_, i) => {
                    const bedNumber = bulkBedData.prefix 
                      ? `${bulkBedData.prefix}-${bulkBedData.starting_number + i}`
                      : `${bulkBedData.starting_number + i}`
                    return (
                      <span key={i} className="px-2 py-1 bg-primary-100 text-primary-700 rounded text-xs font-medium">
                        {bedNumber}
                      </span>
                    )
                  })}
                  {bulkBedData.count > 10 && (
                    <span className="px-2 py-1 bg-slate-200 text-slate-600 rounded text-xs">
                      +{bulkBedData.count - 10} more
                    </span>
                  )}
                </div>
              </div>

              <div className="flex gap-3 pt-4 border-t">
                <button type="button" onClick={onClose} className="btn btn-secondary flex-1">
                  Cancel
                </button>
                <button type="submit" disabled={loading} className="btn btn-primary flex-1">
                  {loading ? 'Adding...' : `Add ${bulkBedData.count} Beds`}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}