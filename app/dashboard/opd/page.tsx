'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Clock, User, AlertCircle, CheckCircle, XCircle, Phone } from 'lucide-react'
import type { OPDQueue, Department, Patient } from '@/lib/types'
import { formatDateTime, getTimeAgo, calculateWaitTime } from '@/lib/utils'
import { AddPatientToQueue } from '@/components/AddPatientToQueue'

export default function OPDPage() {
  const [queues, setQueues] = useState<OPDQueue[]>([])
  const [departments, setDepartments] = useState<Department[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedDepartment, setSelectedDepartment] = useState<string>('all')
  const [showAddModal, setShowAddModal] = useState(false)

  useEffect(() => {
    fetchData()

    // Set up real-time subscription
    const supabase = createClient()
    const channel = supabase
      .channel('opd_queues_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'opd_queues' }, () => {
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
      // Get today's date range
      const today = new Date().toISOString().split('T')[0]

      // Fetch OPD queues with related data
      const { data: queueData, error: queueError } = await supabase
        .from('opd_queues')
        .select(`
          *,
          patient:patients(*),
          department:departments(*),
          doctor:profiles(*)
        `)
        .gte('created_at', `${today}T00:00:00`)
        .order('token_number', { ascending: true })

      if (queueError) throw queueError

      // Fetch departments
      const { data: deptData, error: deptError } = await supabase
        .from('departments')
        .select('*')
        .order('name')

      if (deptError) throw deptError

      setQueues(queueData || [])
      setDepartments(deptData || [])
    } catch (error) {
      console.error('Error fetching OPD data:', error)
    } finally {
      setLoading(false)
    }
  }

  async function updateQueueStatus(queueId: string, status: string) {
    const supabase = createClient()

    const updates: any = { status }

    if (status === 'in_consultation') {
      updates.consultation_start_time = new Date().toISOString()
    } else if (status === 'completed') {
      updates.consultation_end_time = new Date().toISOString()
    }

    const { error } = await supabase
      .from('opd_queues')
      .update(updates)
      .eq('id', queueId)

    if (error) {
      console.error('Error updating queue status:', error)
    } else {
      fetchData()
    }
  }

  const filteredQueues = selectedDepartment === 'all'
    ? queues
    : queues.filter(q => q.department_id === selectedDepartment)

  const waitingCount = filteredQueues.filter(q => q.status === 'waiting').length
  const consultationCount = filteredQueues.filter(q => q.status === 'in_consultation').length
  const completedCount = filteredQueues.filter(q => q.status === 'completed').length

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'waiting':
        return <span className="badge badge-warning">Waiting</span>
      case 'in_consultation':
        return <span className="badge badge-info">In Consultation</span>
      case 'completed':
        return <span className="badge badge-success">Completed</span>
      case 'cancelled':
        return <span className="badge badge-danger">Cancelled</span>
      default:
        return <span className="badge badge-secondary">{status}</span>
    }
  }

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'emergency':
        return <span className="badge badge-danger">Emergency</span>
      case 'urgent':
        return <span className="badge badge-warning">Urgent</span>
      default:
        return <span className="badge badge-secondary">Normal</span>
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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">OPD Queue Management</h1>
          <p className="text-slate-600 mt-1">Monitor and manage outpatient department queues</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="btn btn-primary"
        >
          Add Patient to Queue
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="stat-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-600">Total Today</p>
              <p className="text-3xl font-bold text-slate-900 mt-1">{filteredQueues.length}</p>
            </div>
            <User className="h-10 w-10 text-blue-500" />
          </div>
        </div>
        <div className="stat-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-600">Waiting</p>
              <p className="text-3xl font-bold text-orange-600 mt-1">{waitingCount}</p>
            </div>
            <Clock className="h-10 w-10 text-orange-500" />
          </div>
        </div>
        <div className="stat-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-600">In Consultation</p>
              <p className="text-3xl font-bold text-blue-600 mt-1">{consultationCount}</p>
            </div>
            <AlertCircle className="h-10 w-10 text-blue-500" />
          </div>
        </div>
        <div className="stat-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-600">Completed</p>
              <p className="text-3xl font-bold text-green-600 mt-1">{completedCount}</p>
            </div>
            <CheckCircle className="h-10 w-10 text-green-500" />
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4">
        <div className="flex items-center gap-4">
          <label className="text-sm font-medium text-slate-700">Filter by Department:</label>
          <select
            value={selectedDepartment}
            onChange={(e) => setSelectedDepartment(e.target.value)}
            className="input max-w-xs"
          >
            <option value="all">All Departments</option>
            {departments.map(dept => (
              <option key={dept.id} value={dept.id}>{dept.name}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Queue Table */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="table">
            <thead>
              <tr>
                <th>Token</th>
                <th>Patient</th>
                <th>Department</th>
                <th>Priority</th>
                <th>Check-in Time</th>
                <th>Wait Time</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredQueues.length === 0 ? (
                <tr>
                  <td colSpan={8} className="text-center py-8 text-slate-500">
                    No patients in queue today
                  </td>
                </tr>
              ) : (
                filteredQueues.map((queue) => {
                  const waitTime = queue.status === 'waiting'
                    ? calculateWaitTime(queue.check_in_time)
                    : 0

                  return (
                    <tr key={queue.id}>
                      <td>
                        <span className="font-bold text-lg text-primary-600">
                          #{queue.token_number}
                        </span>
                      </td>
                      <td>
                        <div>
                          <p className="font-medium text-slate-900">
                            {queue.patient?.full_name}
                          </p>
                          <p className="text-sm text-slate-500">
                            {queue.patient?.patient_number}
                          </p>
                        </div>
                      </td>
                      <td>{queue.department?.name}</td>
                      <td>{getPriorityBadge(queue.priority)}</td>
                      <td className="text-sm text-slate-600">
                        {formatDateTime(queue.check_in_time)}
                      </td>
                      <td>
                        {queue.status === 'waiting' && (
                          <span className={`text-sm font-medium ${waitTime > 30 ? 'text-red-600' : 'text-slate-600'
                            }`}>
                            {waitTime} min
                          </span>
                        )}
                      </td>
                      <td>{getStatusBadge(queue.status)}</td>
                      <td>
                        <div className="flex gap-2">
                          {queue.status === 'waiting' && (
                            <button
                              onClick={() => updateQueueStatus(queue.id, 'in_consultation')}
                              className="text-sm px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700"
                            >
                              Start
                            </button>
                          )}
                          {queue.status === 'in_consultation' && (
                            <button
                              onClick={() => updateQueueStatus(queue.id, 'completed')}
                              className="text-sm px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700"
                            >
                              Complete
                            </button>
                          )}
                          {queue.status === 'waiting' && (
                            <button
                              onClick={() => updateQueueStatus(queue.id, 'cancelled')}
                              className="text-sm px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700"
                            >
                              Cancel
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
      <AddPatientToQueue
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSuccess={fetchData}
      />
    </div>
  )
}
