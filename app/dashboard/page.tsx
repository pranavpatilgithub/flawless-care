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
function ActionButton({
  icon: Icon,
  label,
  onClick,
}: {
  icon: any
  label: string
  onClick?: () => void
}) {
  return (
    <button
      onClick={onClick}
      className="
        flex items-center justify-center gap-2
        rounded-lg
        border border-slate-200
        bg-slate-50
        px-4 py-3
        text-sm font-medium text-slate-700
        hover:bg-slate-100
        transition
      "
    >
      <Icon className="h-4 w-4" />
      {label}
    </button>
  )
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
      trend: '+12%',
    },
    {
      title: 'Bed Occupancy',
      value: `${stats.bedsOccupied}/${stats.totalBeds}`,
      icon: Bed,
      subtitle: `${occupancyRate}% occupied`,
    },
    {
      title: 'Admissions Today',
      value: stats.admissionsToday,
      icon: Activity,
      trend: '+8%',
    },
    {
      title: 'Low Stock Items',
      value: stats.criticalInventory,
      icon: AlertTriangle,
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
    <div className="space-y-10">
      {/* Header */}
      <header>
        <h1 className="text-2xl font-semibold text-slate-900">
          Dashboard
        </h1>
        <p className="mt-1 text-sm text-slate-600">
          Overview of today’s hospital operations
        </p>
      </header>

      {/* Stats */}
      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, index) => (
          <div
            key={index}
            className="rounded-xl border border-slate-200 bg-white p-6"
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-slate-500">
                  {stat.title}
                </p>

                <p className="mt-2 text-3xl font-semibold text-slate-900">
                  {stat.value}
                </p>

                {stat.subtitle && (
                  <p className="mt-1 text-xs text-slate-500">
                    {stat.subtitle}
                  </p>
                )}

                {stat.trend && (
                  <p className="mt-2 inline-flex items-center text-xs font-medium text-emerald-600">
                    <TrendingUp className="mr-1 h-3.5 w-3.5" />
                    {stat.trend}
                  </p>
                )}

                {stat.alert && (
                  <p className="mt-2 text-xs font-medium text-amber-600">
                    Requires attention
                  </p>
                )}
              </div>

              <div className="rounded-lg bg-slate-100 p-2.5 text-slate-600">
                <stat.icon className="h-5 w-5" />
              </div>
            </div>
          </div>
        ))}
      </section>

      {/* Charts */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="rounded-xl border border-slate-200 bg-white p-6">
          <h3 className="mb-4 text-sm font-medium text-slate-900">
            OPD Queue Status
          </h3>

          <ResponsiveContainer width="100%" height={280}>
            <PieChart>
              <Pie
                data={queueData}
                cx="50%"
                cy="50%"
                outerRadius={90}
                dataKey="value"
                label
              >
                {queueData.map((entry, index) => (
                  <Cell key={index} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-6">
          <h3 className="mb-4 text-sm font-medium text-slate-900">
            Bed Distribution
          </h3>

          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={bedData}>
              <CartesianGrid stroke="#e5e7eb" strokeDasharray="3 3" />
              <XAxis dataKey="name" tick={{ fill: '#64748b', fontSize: 12 }} />
              <YAxis tick={{ fill: '#64748b', fontSize: 12 }} />
              <Tooltip />
              <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                {bedData.map((entry, index) => (
                  <Cell key={index} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </section>

      {/* Quick Actions */}
      <section className="rounded-xl border border-slate-200 bg-white p-6">
        <h3 className="mb-4 text-sm font-medium text-slate-900">
          Quick Actions
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <ActionButton
            icon={Users}
            label="Add Patient to OPD"
            onClick={() => setShowAddPatientModal(true)}
          />
          <ActionButton
            icon={Activity}
            label="New Admission"
            onClick={() => setShowAdmissionModal(true)}
          />
          <ActionButton
            icon={Package}
            label="Update Inventory"
          />
        </div>
      </section>

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
