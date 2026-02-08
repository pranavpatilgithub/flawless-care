'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Calendar, Clock, User, Plus, Filter } from 'lucide-react'
import type { Appointment, Department, Patient, Profile } from '@/lib/types'
import { formatDate, formatDateTime } from '@/lib/utils'
import { AddAppointment } from '@/components/AddAppointment'
import { EditAppointment } from '@/components/EditAppointment'

export default function AppointmentsPage() {
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [loading, setLoading] = useState(true)
  const [showAddModal, setShowAddModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null)
  
  const [filters, setFilters] = useState({
    status: 'all',
    date: new Date().toISOString().split('T')[0],
    doctor_id: 'all',
    department_id: 'all',
  })

  const [doctors, setDoctors] = useState<Profile[]>([])
  const [departments, setDepartments] = useState<Department[]>([])

  useEffect(() => {
    fetchData()
    fetchFilterOptions()
    
    // Real-time subscription
    const supabase = createClient()
    const channel = supabase
      .channel('appointments_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'appointments' }, () => {
        fetchData()
      })
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [])

  useEffect(() => {
    fetchData()
  }, [filters])

  async function fetchFilterOptions() {
    const supabase = createClient()
    
    const [doctorsRes, deptsRes] = await Promise.all([
      supabase.from('profiles').select('*').eq('role', 'doctor').order('full_name'),
      supabase.from('departments').select('*').order('name'),
    ])

    setDoctors(doctorsRes.data || [])
    setDepartments(deptsRes.data || [])
  }

  async function fetchData() {
    const supabase = createClient()
    setLoading(true)
    
    try {
      let query = supabase
        .from('appointments')
        .select(`
          *,
          patient:patients(*),
          doctor:profiles!appointments_doctor_id_fkey(*),
          department:departments(*)
        `)
        .order('appointment_date', { ascending: true })
        .order('appointment_time', { ascending: true })

      // Apply filters
      if (filters.status !== 'all') {
        query = query.eq('status', filters.status)
      }
      if (filters.date) {
        query = query.eq('appointment_date', filters.date)
      }
      if (filters.doctor_id !== 'all') {
        query = query.eq('doctor_id', filters.doctor_id)
      }
      if (filters.department_id !== 'all') {
        query = query.eq('department_id', filters.department_id)
      }

      const { data, error } = await query

      if (error) throw error
      setAppointments(data || [])
    } catch (error) {
      console.error('Error fetching appointments:', error)
    } finally {
      setLoading(false)
    }
  }

  async function updateAppointmentStatus(appointmentId: string, status: string) {
    const supabase = createClient()
    
    const { error } = await supabase
      .from('appointments')
      .update({ status })
      .eq('id', appointmentId)

    if (error) {
      console.error('Error updating appointment status:', error)
      alert('Failed to update status')
    } else {
      fetchData()
    }
  }

  function handleEditAppointment(appointment: Appointment) {
    setSelectedAppointment(appointment)
    setShowEditModal(true)
  }

  const stats = {
    total: appointments.length,
    scheduled: appointments.filter(a => a.status === 'scheduled').length,
    confirmed: appointments.filter(a => a.status === 'confirmed').length,
    completed: appointments.filter(a => a.status === 'completed').length,
  }

  const getStatusBadge = (status: string) => {
    const badges: Record<string, string> = {
      scheduled: 'badge-warning',
      confirmed: 'badge-info',
      in_progress: 'badge-info',
      completed: 'badge-success',
      cancelled: 'badge-danger',
      no_show: 'badge-secondary',
    }
    return <span className={`badge ${badges[status] || 'badge-secondary'}`}>{status.replace('_', ' ')}</span>
  }

  const getTypeBadge = (type: string) => {
    const badges: Record<string, string> = {
      consultation: 'badge-info',
      follow_up: 'badge-warning',
      procedure: 'badge-danger',
      checkup: 'badge-success',
    }
    return <span className={`badge ${badges[type] || 'badge-secondary'}`}>{type.replace('_', ' ')}</span>
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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Appointments</h1>
          <p className="text-slate-600 mt-1">Schedule and manage patient appointments</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="btn btn-primary"
        >
          <Plus className="h-5 w-5 mr-2" />
          New Appointment
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="stat-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-600">Total Today</p>
              <p className="text-3xl font-bold text-slate-900 mt-1">{stats.total}</p>
            </div>
            <Calendar className="h-10 w-10 text-blue-500" />
          </div>
        </div>
        <div className="stat-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-600">Scheduled</p>
              <p className="text-3xl font-bold text-orange-600 mt-1">{stats.scheduled}</p>
            </div>
            <Clock className="h-10 w-10 text-orange-500" />
          </div>
        </div>
        <div className="stat-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-600">Confirmed</p>
              <p className="text-3xl font-bold text-blue-600 mt-1">{stats.confirmed}</p>
            </div>
            <User className="h-10 w-10 text-blue-500" />
          </div>
        </div>
        <div className="stat-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-600">Completed</p>
              <p className="text-3xl font-bold text-green-600 mt-1">{stats.completed}</p>
            </div>
            <Calendar className="h-10 w-10 text-green-500" />
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="label">Date</label>
            <input
              type="date"
              value={filters.date}
              onChange={(e) => setFilters({ ...filters, date: e.target.value })}
              className="input"
            />
          </div>
          <div>
            <label className="label">Status</label>
            <select
              value={filters.status}
              onChange={(e) => setFilters({ ...filters, status: e.target.value })}
              className="input"
            >
              <option value="all">All Statuses</option>
              <option value="scheduled">Scheduled</option>
              <option value="confirmed">Confirmed</option>
              <option value="in_progress">In Progress</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
          <div>
            <label className="label">Doctor</label>
            <select
              value={filters.doctor_id}
              onChange={(e) => setFilters({ ...filters, doctor_id: e.target.value })}
              className="input"
            >
              <option value="all">All Doctors</option>
              {doctors.map(doc => (
                <option key={doc.id} value={doc.id}>Dr. {doc.full_name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="label">Department</label>
            <select
              value={filters.department_id}
              onChange={(e) => setFilters({ ...filters, department_id: e.target.value })}
              className="input"
            >
              <option value="all">All Departments</option>
              {departments.map(dept => (
                <option key={dept.id} value={dept.id}>{dept.name}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Appointments Table */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="table">
            <thead>
              <tr>
                <th>Time</th>
                <th>Patient</th>
                <th>Doctor</th>
                <th>Department</th>
                <th>Type</th>
                <th>Reason</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {appointments.length === 0 ? (
                <tr>
                  <td colSpan={8} className="text-center py-8 text-slate-500">
                    No appointments found for selected filters
                  </td>
                </tr>
              ) : (
                appointments.map((appointment) => (
                  <tr key={appointment.id}>
                    <td>
                      <div>
                        <p className="font-medium">{appointment.appointment_time.slice(0, 5)}</p>
                        <p className="text-xs text-slate-500">{appointment.duration_minutes} min</p>
                      </div>
                    </td>
                    <td>
                      <div>
                        <p className="font-medium text-slate-900">{appointment.patient?.full_name}</p>
                        <p className="text-sm text-slate-500">{appointment.patient?.patient_number}</p>
                      </div>
                    </td>
                    <td>
                      <div>
                        <p className="font-medium">Dr. {appointment.doctor?.full_name}</p>
                        <p className="text-xs text-slate-500">{appointment.doctor?.department}</p>
                      </div>
                    </td>
                    <td>{appointment.department?.name}</td>
                    <td>{getTypeBadge(appointment.appointment_type)}</td>
                    <td>
                      <p className="text-sm text-slate-600 max-w-xs truncate">
                        {appointment.reason || 'N/A'}
                      </p>
                    </td>
                    <td>{getStatusBadge(appointment.status)}</td>
                    <td>
                      <div className="flex gap-2">
                        {appointment.status === 'scheduled' && (
                          <button
                            onClick={() => updateAppointmentStatus(appointment.id, 'confirmed')}
                            className="text-sm px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700"
                          >
                            Confirm
                          </button>
                        )}
                        {appointment.status === 'confirmed' && (
                          <button
                            onClick={() => updateAppointmentStatus(appointment.id, 'in_progress')}
                            className="text-sm px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700"
                          >
                            Start
                          </button>
                        )}
                        {appointment.status === 'in_progress' && (
                          <button
                            onClick={() => updateAppointmentStatus(appointment.id, 'completed')}
                            className="text-sm px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700"
                          >
                            Complete
                          </button>
                        )}
                        <button
                          onClick={() => handleEditAppointment(appointment)}
                          className="text-sm px-3 py-1 bg-slate-600 text-white rounded hover:bg-slate-700"
                        >
                          Edit
                        </button>
                        {['scheduled', 'confirmed'].includes(appointment.status) && (
                          <button
                            onClick={() => updateAppointmentStatus(appointment.id, 'cancelled')}
                            className="text-sm px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700"
                          >
                            Cancel
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modals */}
      <AddAppointment
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSuccess={fetchData}
      />
      <EditAppointment
        isOpen={showEditModal}
        appointment={selectedAppointment}
        onClose={() => {
          setShowEditModal(false)
          setSelectedAppointment(null)
        }}
        onSuccess={fetchData}
      />
    </div>
  )
}