'use client'

import { useEffect, useState } from 'react'
import {
  Users,
  Bed,
  Activity,
  Package,
  TrendingUp,
  Clock,
  AlertTriangle,
  CheckCircle
} from 'lucide-react'
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { createClient } from '@/lib/supabase/client'
import type { Bed as BedType, OPDQueue, Admission, InventoryItem } from '@/lib/types'
import { AddPatientToQueue } from '@/components/AddPatientToQueue'
import { NewAdmission } from '@/components/NewAdmission'

interface DashboardStats {
  totalPatients: number
  opdToday: number
  bedsOccupied: number
  totalBeds: number
  criticalInventory: number
  admissionsToday: number
}

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats>({
    totalPatients: 0,
    opdToday: 0,
    bedsOccupied: 0,
    totalBeds: 0,
    criticalInventory: 0,
    admissionsToday: 0,
  })
  const [loading, setLoading] = useState(true)
  const [queueData, setQueueData] = useState<any[]>([])
  const [bedData, setBedData] = useState<any[]>([])
  const [showAddPatientModal, setShowAddPatientModal] = useState(false)
  const [showAdmissionModal, setShowAdmissionModal] = useState(false)

  useEffect(() => {
    fetchDashboardData()
  }, [])

  async function fetchDashboardData() {
    const supabase = createClient()

    try {
      // Get total patients
      const { count: patientCount } = await supabase
        .from('patients')
        .select('*', { count: 'exact', head: true })

      // Get OPD queue for today
      const today = new Date().toISOString().split('T')[0]
      const { data: opdData, count: opdCount } = await supabase
        .from('opd_queues')
        .select('*', { count: 'exact' })
        .gte('created_at', `${today}T00:00:00`)
        .lte('created_at', `${today}T23:59:59`)

      // Get bed statistics
      const { data: beds } = await supabase
        .from('beds')
        .select('*')

      const occupiedBeds = beds?.filter(bed => bed.status === 'occupied').length || 0
      const totalBeds = beds?.length || 0

      // Get admissions today
      const { count: admissionsCount } = await supabase
        .from('admissions')
        .select('*', { count: 'exact', head: true })
        .gte('admission_date', `${today}T00:00:00`)
        .eq('status', 'admitted')

      // Get critical inventory items
      const { data: inventory } = await supabase
        .from('inventory_items')
        .select('*')

      const criticalItems = inventory?.filter(
        item => item.current_stock < item.minimum_stock
      ).length || 0

      // Prepare queue status data
      const queueStatusData = [
        { name: 'Waiting', value: opdData?.filter(q => q.status === 'waiting').length || 0, color: '#f59e0b' },
        { name: 'In Consultation', value: opdData?.filter(q => q.status === 'in_consultation').length || 0, color: '#3b82f6' },
        { name: 'Completed', value: opdData?.filter(q => q.status === 'completed').length || 0, color: '#10b981' },
      ]

      // Prepare bed type data
      const bedTypeData = [
        { name: 'General', value: beds?.filter(b => b.bed_type === 'general').length || 0, color: '#06b6d4' },
        { name: 'ICU', value: beds?.filter(b => b.bed_type === 'icu').length || 0, color: '#8b5cf6' },
        { name: 'Private', value: beds?.filter(b => b.bed_type === 'private').length || 0, color: '#ec4899' },
        { name: 'Emergency', value: beds?.filter(b => b.bed_type === 'emergency').length || 0, color: '#ef4444' },
      ]

      setStats({
        totalPatients: patientCount || 0,
        opdToday: opdCount || 0,
        bedsOccupied: occupiedBeds,
        totalBeds: totalBeds,
        criticalInventory: criticalItems,
        admissionsToday: admissionsCount || 0,
      })

      setQueueData(queueStatusData)
      setBedData(bedTypeData)
    } catch (error) {
      console.error('Error fetching dashboard data:', error)
    } finally {
      setLoading(false)
    }
  }

  const occupancyRate = stats.totalBeds > 0
    ? Math.round((stats.bedsOccupied / stats.totalBeds) * 100)
    : 0

  const statCards = [
    {
      title: 'OPD Patients Today',
      value: stats.opdToday,
      icon: Users,
      color: 'bg-blue-500',
      trend: '+12%',
    },
    {
      title: 'Bed Occupancy',
      value: `${stats.bedsOccupied}/${stats.totalBeds}`,
      icon: Bed,
      color: 'bg-purple-500',
      subtitle: `${occupancyRate}% occupied`,
    },
    {
      title: 'Admissions Today',
      value: stats.admissionsToday,
      icon: Activity,
      color: 'bg-green-500',
      trend: '+8%',
    },
    {
      title: 'Low Stock Items',
      value: stats.criticalInventory,
      icon: AlertTriangle,
      color: 'bg-orange-500',
      alert: stats.criticalInventory > 0,
    },
  ]

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Dashboard</h1>
        <p className="text-slate-600 mt-1">Welcome back! Here's what's happening today.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, index) => (
          <div
            key={index}
            className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 hover:shadow-md transition-shadow"
          >
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className="text-sm font-medium text-slate-600">{stat.title}</p>
                <div className="flex items-baseline mt-2">
                  <p className="text-3xl font-bold text-slate-900">{stat.value}</p>
                  {stat.trend && (
                    <span className="ml-2 text-sm font-medium text-green-600 flex items-center">
                      <TrendingUp className="h-4 w-4 mr-1" />
                      {stat.trend}
                    </span>
                  )}
                </div>
                {stat.subtitle && (
                  <p className="text-sm text-slate-500 mt-1">{stat.subtitle}</p>
                )}
                {stat.alert && (
                  <p className="text-sm text-orange-600 mt-1 font-medium">Requires attention</p>
                )}
              </div>
              <div className={`${stat.color} rounded-lg p-3`}>
                <stat.icon className="h-6 w-6 text-white" />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* OPD Queue Status */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <h3 className="text-lg font-semibold text-slate-900 mb-4">OPD Queue Status</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={queueData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, value }) => `${name}: ${value}`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {queueData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Bed Distribution */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <h3 className="text-lg font-semibold text-slate-900 mb-4">Bed Distribution by Type</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={bedData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="name" stroke="#64748b" />
              <YAxis stroke="#64748b" />
              <Tooltip />
              <Bar dataKey="value" fill="#3b82f6" radius={[8, 8, 0, 0]}>
                {bedData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
        <h3 className="text-lg font-semibold text-slate-900 mb-4">Quick Actions</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button
            onClick={() => setShowAddPatientModal(true)}
            className="flex items-center justify-center px-6 py-4 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
          >
            <Users className="h-5 w-5 mr-2" />
            Add New Patient
          </button>
          <button
            onClick={() => setShowAdmissionModal(true)}
            className="flex items-center justify-center px-6 py-4 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            <Activity className="h-5 w-5 mr-2" />
            New Admission
          </button>
          <button className="flex items-center justify-center px-6 py-4 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors">
            <Package className="h-5 w-5 mr-2" />
            Update Inventory
          </button>
        </div>
      </div>

      <AddPatientToQueue
        isOpen={showAddPatientModal}
        onClose={() => setShowAddPatientModal(false)}
        onSuccess={fetchDashboardData}
      />
      <NewAdmission
        isOpen={showAdmissionModal}
        onClose={() => setShowAdmissionModal(false)}
        onSuccess={fetchDashboardData}
      />
    </div>
  )
}
