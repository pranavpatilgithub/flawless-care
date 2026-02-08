'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { FileText, Plus, Eye, Package } from 'lucide-react'
import type { Prescription, Patient, Profile } from '@/lib/types'
import { formatDate, formatDateTime } from '@/lib/utils'
import { AddPrescription } from '@/components/AddPrescription'
import { ViewPrescription } from '@/components/ViewPrescriptions'
// import { DispensePrescription } from '@/components/DispensePrescription'

export default function PrescriptionsPage() {
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([])
  const [loading, setLoading] = useState(true)
  const [showAddModal, setShowAddModal] = useState(false)
  const [showViewModal, setShowViewModal] = useState(false)
  const [showDispenseModal, setShowDispenseModal] = useState(false)
  const [selectedPrescription, setSelectedPrescription] = useState<Prescription | null>(null)
  
  const [filters, setFilters] = useState({
    status: 'all',
    date_from: '',
    date_to: '',
  })

  useEffect(() => {
    fetchData()
    
    // Real-time subscription
    const supabase = createClient()
    const channel = supabase
      .channel('prescriptions_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'prescriptions' }, () => {
        fetchData()
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'prescription_items' }, () => {
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

  async function fetchData() {
    const supabase = createClient()
    setLoading(true)
    
    try {
      let query = supabase
        .from('prescriptions')
        .select(`
          *,
          patient:patients(*),
          doctor:profiles!prescriptions_doctor_id_fkey(*)
        `)
        .order('created_at', { ascending: false })

      // Apply filters
      if (filters.status !== 'all') {
        query = query.eq('status', filters.status)
      }
      if (filters.date_from) {
        query = query.gte('created_at', `${filters.date_from}T00:00:00`)
      }
      if (filters.date_to) {
        query = query.lte('created_at', `${filters.date_to}T23:59:59`)
      }

      const { data, error } = await query

      if (error) throw error
      setPrescriptions(data || [])
    } catch (error) {
      console.error('Error fetching prescriptions:', error)
    } finally {
      setLoading(false)
    }
  }

  function handleViewPrescription(prescription: Prescription) {
    setSelectedPrescription(prescription)
    setShowViewModal(true)
  }

  function handleDispensePrescription(prescription: Prescription) {
    setSelectedPrescription(prescription)
    setShowDispenseModal(true)
  }

  const stats = {
    total: prescriptions.length,
    pending: prescriptions.filter(p => p.status === 'pending').length,
    dispensed: prescriptions.filter(p => p.status === 'dispensed').length,
    cancelled: prescriptions.filter(p => p.status === 'cancelled').length,
  }

  const getStatusBadge = (status: string) => {
    const badges: Record<string, string> = {
      pending: 'badge-warning',
      dispensed: 'badge-success',
      cancelled: 'badge-danger',
    }
    return <span className={`badge ${badges[status] || 'badge-secondary'}`}>{status}</span>
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
          <h1 className="text-3xl font-bold text-slate-900">Prescriptions</h1>
          <p className="text-slate-600 mt-1">Manage patient prescriptions and medication dispensing</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="btn btn-primary"
        >
          <Plus className="h-5 w-5 mr-2" />
          New Prescription
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="stat-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-600">Total Prescriptions</p>
              <p className="text-3xl font-bold text-slate-900 mt-1">{stats.total}</p>
            </div>
            <FileText className="h-10 w-10 text-blue-500" />
          </div>
        </div>
        <div className="stat-card border-l-4 border-orange-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-600">Pending</p>
              <p className="text-3xl font-bold text-orange-600 mt-1">{stats.pending}</p>
              <p className="text-xs text-orange-600 mt-1 font-medium">Awaiting dispensing</p>
            </div>
            <Package className="h-10 w-10 text-orange-500" />
          </div>
        </div>
        <div className="stat-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-600">Dispensed</p>
              <p className="text-3xl font-bold text-green-600 mt-1">{stats.dispensed}</p>
            </div>
            <FileText className="h-10 w-10 text-green-500" />
          </div>
        </div>
        <div className="stat-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-600">Cancelled</p>
              <p className="text-3xl font-bold text-red-600 mt-1">{stats.cancelled}</p>
            </div>
            <FileText className="h-10 w-10 text-red-500" />
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="label">Status</label>
            <select
              value={filters.status}
              onChange={(e) => setFilters({ ...filters, status: e.target.value })}
              className="input"
            >
              <option value="all">All Statuses</option>
              <option value="pending">Pending</option>
              <option value="dispensed">Dispensed</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
          <div>
            <label className="label">From Date</label>
            <input
              type="date"
              value={filters.date_from}
              onChange={(e) => setFilters({ ...filters, date_from: e.target.value })}
              className="input"
            />
          </div>
          <div>
            <label className="label">To Date</label>
            <input
              type="date"
              value={filters.date_to}
              onChange={(e) => setFilters({ ...filters, date_to: e.target.value })}
              className="input"
            />
          </div>
        </div>
      </div>

      {/* Prescriptions Table */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Patient</th>
                <th>Doctor</th>
                <th>Diagnosis</th>
                <th>Status</th>
                <th>Follow-up</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {prescriptions.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-8 text-slate-500">
                    No prescriptions found
                  </td>
                </tr>
              ) : (
                prescriptions.map((prescription) => (
                  <tr key={prescription.id}>
                    <td>
                      <div>
                        <p className="font-medium">{formatDate(prescription.created_at)}</p>
                        <p className="text-xs text-slate-500">
                          {formatDateTime(prescription.created_at).split(',')[1]}
                        </p>
                      </div>
                    </td>
                    <td>
                      <div>
                        <p className="font-medium text-slate-900">{prescription.patient?.full_name}</p>
                        <p className="text-sm text-slate-500">{prescription.patient?.patient_number}</p>
                      </div>
                    </td>
                    <td>
                      <div>
                        <p className="font-medium">Dr. {prescription.doctor?.full_name}</p>
                        <p className="text-xs text-slate-500">{prescription.doctor?.department}</p>
                      </div>
                    </td>
                    <td>
                      <p className="text-sm text-slate-600 max-w-xs truncate">
                        {prescription.diagnosis || 'N/A'}
                      </p>
                    </td>
                    <td>{getStatusBadge(prescription.status)}</td>
                    <td>
                      {prescription.follow_up_date ? (
                        <p className="text-sm text-slate-600">{formatDate(prescription.follow_up_date)}</p>
                      ) : (
                        <span className="text-slate-400">-</span>
                      )}
                    </td>
                    <td>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleViewPrescription(prescription)}
                          className="text-sm px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700"
                          title="View Details"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                        {prescription.status === 'pending' && (
                          <button
                            onClick={() => handleDispensePrescription(prescription)}
                            className="text-sm px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700"
                          >
                            Dispense
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
      <AddPrescription
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSuccess={fetchData}
      />
      <ViewPrescription
        isOpen={showViewModal}
        prescription={selectedPrescription}
        onClose={() => {
          setShowViewModal(false)
          setSelectedPrescription(null)
        }}
      />
      {/* <DispensePrescription
        isOpen={showDispenseModal}
        prescription={selectedPrescription}
        onClose={() => {
          setShowDispenseModal(false)
          setSelectedPrescription(null)
        }}
        onSuccess={fetchData}
      /> */}
    </div>
  )
}