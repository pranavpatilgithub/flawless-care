'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { UserPlus, LogOut, ArrowRight, Activity } from 'lucide-react'
import type { Admission, Patient, Bed, Department } from '@/lib/types'
import { formatDate, formatDateTime, calculateAge } from '@/lib/utils'

export default function AdmissionsPage() {
  const [admissions, setAdmissions] = useState<Admission[]>([])
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState<string>('admitted')

  useEffect(() => {
    fetchData()
    
    // Real-time subscription
    const supabase = createClient()
    const channel = supabase
      .channel('admissions_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'admissions' }, () => {
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
      const { data, error } = await supabase
        .from('admissions')
        .select(`
          *,
          patient:patients(*),
          bed:beds(*),
          department:departments(*),
          doctor:profiles(*)
        `)
        .order('admission_date', { ascending: false })

      if (error) throw error

      setAdmissions(data || [])
    } catch (error) {
      console.error('Error fetching admissions:', error)
    } finally {
      setLoading(false)
    }
  }

  async function dischargePatient(admissionId: string) {
    const supabase = createClient()
    
    const { error } = await supabase
      .from('admissions')
      .update({
        status: 'discharged',
        discharge_date: new Date().toISOString(),
      })
      .eq('id', admissionId)

    if (error) {
      console.error('Error discharging patient:', error)
    } else {
      fetchData()
    }
  }

  const filteredAdmissions = admissions.filter(a => a.status === statusFilter)

  const stats = {
    total: admissions.filter(a => a.status === 'admitted').length,
    emergency: admissions.filter(a => a.admission_type === 'emergency' && a.status === 'admitted').length,
    planned: admissions.filter(a => a.admission_type === 'planned' && a.status === 'admitted').length,
    dischargedToday: admissions.filter(a => {
      if (!a.discharge_date) return false
      const today = new Date().toISOString().split('T')[0]
      return a.discharge_date.startsWith(today)
    }).length,
  }

  const getAdmissionTypeBadge = (type: string) => {
    switch (type) {
      case 'emergency':
        return <span className="badge badge-danger">Emergency</span>
      case 'planned':
        return <span className="badge badge-info">Planned</span>
      case 'transfer':
        return <span className="badge badge-warning">Transfer</span>
      default:
        return <span className="badge badge-secondary">{type}</span>
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'admitted':
        return <span className="badge badge-success">Admitted</span>
      case 'discharged':
        return <span className="badge badge-secondary">Discharged</span>
      case 'transferred':
        return <span className="badge badge-warning">Transferred</span>
      default:
        return <span className="badge badge-secondary">{status}</span>
    }
  }

  const calculateStayDuration = (admissionDate: string, dischargeDate?: string) => {
    const start = new Date(admissionDate)
    const end = dischargeDate ? new Date(dischargeDate) : new Date()
    const diffTime = Math.abs(end.getTime() - start.getTime())
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays
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
          <h1 className="text-3xl font-bold text-slate-900">Patient Admissions</h1>
          <p className="text-slate-600 mt-1">Manage patient admissions and discharges</p>
        </div>
        <button className="btn btn-primary flex">
          <UserPlus className="h-5 w-5 mr-2" />
          New Admission
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="stat-card border-l-4 border-green-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-600">Currently Admitted</p>
              <p className="text-3xl font-bold text-green-600 mt-1">{stats.total}</p>
            </div>
            <Activity className="h-10 w-10 text-green-500" />
          </div>
        </div>
        <div className="stat-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-600">Emergency</p>
              <p className="text-3xl font-bold text-red-600 mt-1">{stats.emergency}</p>
            </div>
            <UserPlus className="h-10 w-10 text-red-500" />
          </div>
        </div>
        <div className="stat-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-600">Planned</p>
              <p className="text-3xl font-bold text-blue-600 mt-1">{stats.planned}</p>
            </div>
            <UserPlus className="h-10 w-10 text-blue-500" />
          </div>
        </div>
        <div className="stat-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-600">Discharged Today</p>
              <p className="text-3xl font-bold text-slate-900 mt-1">{stats.dischargedToday}</p>
            </div>
            {/* <LogOut className="h-10 w-10 text-slate-500" /> */}
          </div>
        </div>
      </div>

      {/* Filter */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4">
        <div className="flex items-center gap-4">
          <label className="text-sm font-medium text-slate-700">Filter by Status:</label>
          <div className="flex gap-2">
            <button
              onClick={() => setStatusFilter('admitted')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                statusFilter === 'admitted'
                  ? 'bg-green-600 text-white'
                  : 'bg-slate-200 text-slate-700 hover:bg-slate-300'
              }`}
            >
              Admitted
            </button>
            <button
              onClick={() => setStatusFilter('discharged')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                statusFilter === 'discharged'
                  ? 'bg-slate-600 text-white'
                  : 'bg-slate-200 text-slate-700 hover:bg-slate-300'
              }`}
            >
              Discharged
            </button>
            <button
              onClick={() => setStatusFilter('transferred')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                statusFilter === 'transferred'
                  ? 'bg-orange-600 text-white'
                  : 'bg-slate-200 text-slate-700 hover:bg-slate-300'
              }`}
            >
              Transferred
            </button>
          </div>
        </div>
      </div>

      {/* Admissions Table */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="table">
            <thead>
              <tr>
                <th>Patient</th>
                <th>Department</th>
                <th>Bed</th>
                <th>Type</th>
                <th>Admission Date</th>
                <th>Duration</th>
                <th>Doctor</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredAdmissions.length === 0 ? (
                <tr>
                  <td colSpan={9} className="text-center py-8 text-slate-500">
                    No admissions found for this status
                  </td>
                </tr>
              ) : (
                filteredAdmissions.map((admission) => {
                  const stayDuration = calculateStayDuration(admission.admission_date, admission.discharge_date || undefined)
                  
                  return (
                    <tr key={admission.id}>
                      <td>
                        <div>
                          <p className="font-medium text-slate-900">
                            {admission.patient?.full_name}
                          </p>
                          <p className="text-sm text-slate-500">
                            {admission.patient?.patient_number}
                          </p>
                          <p className="text-xs text-slate-400">
                            Age: {calculateAge(admission.patient?.date_of_birth || '')} • 
                            {admission.patient?.blood_group ? ` ${admission.patient.blood_group}` : ' N/A'}
                          </p>
                        </div>
                      </td>
                      <td>{admission.department?.name}</td>
                      <td>
                        <span className="font-medium text-primary-600">
                          {admission.bed?.bed_number}
                        </span>
                        <p className="text-xs text-slate-500">
                          {admission.bed?.bed_type}
                        </p>
                      </td>
                      <td>{getAdmissionTypeBadge(admission.admission_type)}</td>
                      <td>
                        <p className="text-sm">{formatDate(admission.admission_date)}</p>
                        <p className="text-xs text-slate-500">
                          {formatDateTime(admission.admission_date).split(',')[1]}
                        </p>
                      </td>
                      <td>
                        <span className="font-medium">
                          {stayDuration} {stayDuration === 1 ? 'day' : 'days'}
                        </span>
                      </td>
                      <td>
                        <p className="text-sm">{admission.doctor?.full_name}</p>
                        <p className="text-xs text-slate-500">{admission.doctor?.department}</p>
                      </td>
                      <td>{getStatusBadge(admission.status)}</td>
                      <td>
                        <div className="flex gap-2">
                          {admission.status === 'admitted' && (
                            <>
                              <button className="text-sm px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700">
                                View
                              </button>
                              <button
                                onClick={() => dischargePatient(admission.id)}
                                className="text-sm px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700"
                              >
                                Discharge
                              </button>
                            </>
                          )}
                          {admission.status === 'discharged' && (
                            <button className="text-sm px-3 py-1 bg-slate-600 text-white rounded hover:bg-slate-700">
                              View Details
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
