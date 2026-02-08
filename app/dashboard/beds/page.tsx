'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Bed as BedIcon, AlertCircle, CheckCircle, Wrench, Clock } from 'lucide-react'
import type { Bed, Department } from '@/lib/types'
import { getBedOccupancyRate } from '@/lib/utils'
import { AddBed } from '@/components/AddBed'
import { EditBed } from '@/components/EditBed'
import { Edit } from 'lucide-react'

export default function BedsPage() {
  const [beds, setBeds] = useState<Bed[]>([])
  const [departments, setDepartments] = useState<Department[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedDepartment, setSelectedDepartment] = useState<string>('all')
  const [selectedType, setSelectedType] = useState<string>('all')
  const [selectedStatus, setSelectedStatus] = useState<string>('all')
  const [showAddModal, setShowAddModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [selectedBed, setSelectedBed] = useState<Bed | null>(null)
  useEffect(() => {
    fetchData()

    // Real-time subscription
    const supabase = createClient()
    const channel = supabase
      .channel('beds_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'beds' }, () => {
        fetchData()
      })
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [])

  async function fetchData() {
    const supabase = createClient()

    try {
      const { data: bedsData, error: bedsError } = await supabase
        .from('beds')
        .select('*, department:departments(*)')
        .order('bed_number')

      if (bedsError) throw bedsError

      const { data: deptData, error: deptError } = await supabase
        .from('departments')
        .select('*')
        .order('name')

      if (deptError) throw deptError

      setBeds(bedsData || [])
      setDepartments(deptData || [])
    } catch (error) {
      console.error('Error fetching beds data:', error)
    } finally {
      setLoading(false)
    }
  }
  function handleEditBed(bed: Bed) {
    setSelectedBed(bed)
    setShowEditModal(true)
  }
  async function updateBedStatus(bedId: string, status: string) {
    const supabase = createClient()

    const { error } = await supabase
      .from('beds')
      .update({ status })
      .eq('id', bedId)

    if (error) {
      console.error('Error updating bed status:', error)
    } else {
      fetchData()
    }
  }

  const filteredBeds = beds.filter(bed => {
    if (selectedDepartment !== 'all' && bed.department_id !== selectedDepartment) return false
    if (selectedType !== 'all' && bed.bed_type !== selectedType) return false
    if (selectedStatus !== 'all' && bed.status !== selectedStatus) return false
    return true
  })

  const stats = {
    total: beds.length,
    available: beds.filter(b => b.status === 'available').length,
    occupied: beds.filter(b => b.status === 'occupied').length,
    maintenance: beds.filter(b => b.status === 'maintenance').length,
    reserved: beds.filter(b => b.status === 'reserved').length,
  }

  const occupancyRate = getBedOccupancyRate(stats.occupied, stats.total)

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'available':
        return <CheckCircle className="h-5 w-5 text-green-600" />
      case 'occupied':
        return <AlertCircle className="h-5 w-5 text-red-600" />
      case 'maintenance':
        return <Wrench className="h-5 w-5 text-orange-600" />
      case 'reserved':
        return <Clock className="h-5 w-5 text-blue-600" />
      default:
        return null
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'available':
        return 'bg-green-100 border-green-300 text-green-800'
      case 'occupied':
        return 'bg-red-100 border-red-300 text-red-800'
      case 'maintenance':
        return 'bg-orange-100 border-orange-300 text-orange-800'
      case 'reserved':
        return 'bg-blue-100 border-blue-300 text-blue-800'
      default:
        return 'bg-slate-100 border-slate-300 text-slate-800'
    }
  }

  const getBedTypeColor = (type: string) => {
    switch (type) {
      case 'icu':
        return 'bg-purple-600'
      case 'private':
        return 'bg-pink-600'
      case 'emergency':
        return 'bg-red-600'
      default:
        return 'bg-blue-600'
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Bed Management</h1>
        <p className="text-slate-600 mt-1">Monitor and manage bed availability across departments</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <div className="stat-card">
          <p className="text-sm font-medium text-slate-600">Total Beds</p>
          <p className="text-3xl font-bold text-slate-900 mt-1">{stats.total}</p>
        </div>
        <div className="stat-card">
          <p className="text-sm font-medium text-slate-600">Available</p>
          <p className="text-3xl font-bold text-green-600 mt-1">{stats.available}</p>
        </div>
        <div className="stat-card">
          <p className="text-sm font-medium text-slate-600">Occupied</p>
          <p className="text-3xl font-bold text-red-600 mt-1">{stats.occupied}</p>
          <p className="text-xs text-slate-500 mt-1">{occupancyRate}% occupancy</p>
        </div>
        <div className="stat-card">
          <p className="text-sm font-medium text-slate-600">Maintenance</p>
          <p className="text-3xl font-bold text-orange-600 mt-1">{stats.maintenance}</p>
        </div>
        <div className="stat-card">
          <p className="text-sm font-medium text-slate-600">Reserved</p>
          <p className="text-3xl font-bold text-blue-600 mt-1">{stats.reserved}</p>
        </div>
      </div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Bed Management</h1>
          <p className="text-slate-600 mt-1">Monitor and manage bed availability across departments</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="btn btn-primary"
        >
          Add New Bed(s)
        </button>
      </div>
      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="label">Department</label>
            <select
              value={selectedDepartment}
              onChange={(e) => setSelectedDepartment(e.target.value)}
              className="input"
            >
              <option value="all">All Departments</option>
              {departments.map(dept => (
                <option key={dept.id} value={dept.id}>{dept.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="label">Bed Type</label>
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="input"
            >
              <option value="all">All Types</option>
              <option value="general">General</option>
              <option value="icu">ICU</option>
              <option value="private">Private</option>
              <option value="semi-private">Semi-Private</option>
              <option value="emergency">Emergency</option>
            </select>
          </div>
          <div>
            <label className="label">Status</label>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="input"
            >
              <option value="all">All Statuses</option>
              <option value="available">Available</option>
              <option value="occupied">Occupied</option>
              <option value="maintenance">Maintenance</option>
              <option value="reserved">Reserved</option>
            </select>
          </div>
        </div>
      </div>

      {/* Beds Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {filteredBeds.map((bed) => (
          <div
            key={bed.id}
            className={`border-2 rounded-xl p-4 transition-all ${getStatusColor(bed.status)}`}
          >
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-2">
                <BedIcon className="h-6 w-6" />
                <div>
                  <p className="font-bold text-lg">{bed.bed_number}</p>
                  {/* <p className="text-xs opacity-75">{bed.department?.name}</p> */}
                </div>
              </div>
              {getStatusIcon(bed.status)}
            </div>

            <div className="space-y-2 mb-3">
              <div className="flex items-center justify-between text-sm">
                <span className="opacity-75">Type:</span>
                <span className={`px-2 py-0.5 rounded text-white text-xs font-medium ${getBedTypeColor(bed.bed_type)}`}>
                  {bed.bed_type.toUpperCase()}
                </span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="opacity-75">Floor:</span>
                <span className="font-medium">{bed.floor_number || 'N/A'}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="opacity-75">Room:</span>
                <span className="font-medium">{bed.room_number || 'N/A'}</span>
              </div>
            </div>

            <div className="flex gap-2">
              {bed.status !== 'available' && (
                <button
                  onClick={() => updateBedStatus(bed.id, 'available')}
                  className="flex-1 text-xs px-2 py-1.5 bg-green-600 text-white rounded hover:bg-green-700 transition-colors"
                >
                  Available
                </button>
              )}
              {bed.status !== 'maintenance' && (
                <button
                  onClick={() => updateBedStatus(bed.id, 'maintenance')}
                  className="flex-1 text-xs px-2 py-1.5 bg-orange-600 text-white rounded hover:bg-orange-700 transition-colors"
                >
                  Maintenance
                </button>
              )}
              <button
                onClick={() => handleEditBed(bed)}
                className="text-xs px-2 py-1.5 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
              >
                <Edit className="h-3 w-3" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {filteredBeds.length === 0 && (
        <div className="text-center py-12 text-slate-500">
          No beds match the selected filters
        </div>
      )}
      {/* Modals */}
      <AddBed
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSuccess={fetchData}
      />
      <EditBed
        isOpen={showEditModal}
        bed={selectedBed}
        onClose={() => {
          setShowEditModal(false)
          setSelectedBed(null)
        }}
        onSuccess={fetchData}
      />
    </div>
  )
}
