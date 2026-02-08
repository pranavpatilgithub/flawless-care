'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Save, Users, Building2, Package, Bell, Shield, Database } from 'lucide-react'
import { UserPlus, Users as UsersIcon } from 'lucide-react'
import { AddDoctorSimple } from '@/components/AddDoctorSimple'

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState('general')
  const [loading, setLoading] = useState(false)
  const [departments, setDepartments] = useState<any[]>([])
  const [categories, setCategories] = useState<any[]>([])
  const [doctors, setDoctors] = useState<any[]>([])
  const [showAddDoctorModal, setShowAddDoctorModal] = useState(false)
  const [generalSettings, setGeneralSettings] = useState({
    hospital_name: 'MediCare Hospital',
    hospital_address: '123 Healthcare Street, Medical City',
    contact_phone: '+91 1234567890',
    contact_email: 'info@medicarehospital.com',
    emergency_phone: '+91 9876543210',
  })

  const [newDepartment, setNewDepartment] = useState({
    name: '',
    description: '',
  })

  const [newCategory, setNewCategory] = useState({
    name: '',
    description: '',
  })

  const [notificationSettings, setNotificationSettings] = useState({
    low_stock_alert: true,
    expiry_alert: true,
    bed_availability_alert: true,
    appointment_reminders: true,
    alert_days_before_expiry: 30,
  })

  useEffect(() => {
    fetchData()
  }, [])

  async function fetchData() {
    const supabase = createClient()

    const [deptRes, catRes, doctorsRes] = await Promise.all([
      supabase.from('departments').select('*').order('name'),
      supabase.from('inventory_categories').select('*').order('name'),
      supabase.from('profiles').select('*').eq('role', 'doctor').order('full_name'),
    ])

    setDepartments(deptRes.data || [])
    setCategories(catRes.data || [])
    setDoctors(doctorsRes.data || [])
  }




  async function handleAddDepartment(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)

    const supabase = createClient()

    try {
      const { error } = await supabase
        .from('departments')
        .insert([newDepartment])

      if (error) throw error

      alert('Department added successfully!')
      setNewDepartment({ name: '', description: '' })
      fetchData()
    } catch (error) {
      console.error('Error adding department:', error)
      alert('Failed to add department')
    } finally {
      setLoading(false)
    }
  }


  async function handleDeleteDoctor(id: string) {
    if (!confirm('Are you sure you want to delete this doctor? This will remove their access.')) return

    const supabase = createClient()

    try {
      // Delete from profiles (auth user will remain but won't have profile)
      const { error } = await supabase
        .from('profiles')
        .delete()
        .eq('id', id)

      if (error) throw error

      alert('Doctor removed successfully')
      fetchData()
    } catch (error: any) {
      console.error('Error deleting doctor:', error)
      if (error.code === '23503') {
        alert('Cannot delete doctor. They have associated records (appointments, prescriptions, etc.)')
      } else {
        alert('Failed to delete doctor')
      }
    }
  }

  async function handleAddCategory(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)

    const supabase = createClient()

    try {
      const { error } = await supabase
        .from('inventory_categories')
        .insert([newCategory])

      if (error) throw error

      alert('Category added successfully!')
      setNewCategory({ name: '', description: '' })
      fetchData()
    } catch (error) {
      console.error('Error adding category:', error)
      alert('Failed to add category')
    } finally {
      setLoading(false)
    }
  }

  async function handleDeleteDepartment(id: string) {
    if (!confirm('Are you sure you want to delete this department?')) return

    const supabase = createClient()
    const { error } = await supabase
      .from('departments')
      .delete()
      .eq('id', id)

    if (error) {
      alert('Cannot delete department. It may have associated records.')
    } else {
      fetchData()
    }
  }

  async function handleDeleteCategory(id: string) {
    if (!confirm('Are you sure you want to delete this category?')) return

    const supabase = createClient()
    const { error } = await supabase
      .from('inventory_categories')
      .delete()
      .eq('id', id)

    if (error) {
      alert('Cannot delete category. It may have associated items.')
    } else {
      fetchData()
    }
  }

  function handleSaveGeneralSettings() {
    alert('General settings saved! (This would typically save to a settings table)')
  }

  function handleSaveNotifications() {
    alert('Notification settings saved! (This would typically save to a settings table)')
  }

  const tabs = [
    { id: 'general', name: 'General', icon: Building2 },
    { id: 'departments', name: 'Departments', icon: Building2 },
    { id: 'doctors', name: 'Doctors', icon: UsersIcon },
    { id: 'categories', name: 'Inventory Categories', icon: Package },
    { id: 'notifications', name: 'Notifications', icon: Bell },
    { id: 'security', name: 'Security', icon: Shield },
    { id: 'database', name: 'Database', icon: Database },
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Settings</h1>
        <p className="text-slate-600 mt-1">Manage system configuration and preferences</p>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200">
        <div className="border-b border-slate-200">
          <div className="flex overflow-x-auto">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-6 py-4 font-medium transition-colors border-b-2 ${activeTab === tab.id
                  ? 'border-primary-600 text-primary-600'
                  : 'border-transparent text-slate-600 hover:text-slate-900'
                  }`}
              >
                <tab.icon className="h-5 w-5" />
                {tab.name}
              </button>
            ))}
          </div>
        </div>

        <div className="p-6">
          {/* General Settings */}
          {activeTab === 'general' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-slate-900 mb-4">Hospital Information</h3>
                <div className="space-y-4">
                  <div>
                    <label className="label">Hospital Name</label>
                    <input
                      type="text"
                      value={generalSettings.hospital_name}
                      onChange={(e) => setGeneralSettings({ ...generalSettings, hospital_name: e.target.value })}
                      className="input"
                    />
                  </div>
                  <div>
                    <label className="label">Address</label>
                    <textarea
                      rows={2}
                      value={generalSettings.hospital_address}
                      onChange={(e) => setGeneralSettings({ ...generalSettings, hospital_address: e.target.value })}
                      className="input"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="label">Contact Phone</label>
                      <input
                        type="tel"
                        value={generalSettings.contact_phone}
                        onChange={(e) => setGeneralSettings({ ...generalSettings, contact_phone: e.target.value })}
                        className="input"
                      />
                    </div>
                    <div>
                      <label className="label">Emergency Phone</label>
                      <input
                        type="tel"
                        value={generalSettings.emergency_phone}
                        onChange={(e) => setGeneralSettings({ ...generalSettings, emergency_phone: e.target.value })}
                        className="input"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="label">Email</label>
                    <input
                      type="email"
                      value={generalSettings.contact_email}
                      onChange={(e) => setGeneralSettings({ ...generalSettings, contact_email: e.target.value })}
                      className="input"
                    />
                  </div>
                </div>
              </div>
              <button onClick={handleSaveGeneralSettings} className="btn btn-primary">
                <Save className="h-5 w-5 mr-2" />
                Save Changes
              </button>
            </div>
          )}

          {/* Departments */}
          {activeTab === 'departments' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-slate-900 mb-4">Add New Department</h3>
                <form onSubmit={handleAddDepartment} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="label">Department Name *</label>
                      <input
                        required
                        type="text"
                        value={newDepartment.name}
                        onChange={(e) => setNewDepartment({ ...newDepartment, name: e.target.value })}
                        className="input"
                        placeholder="e.g., Cardiology"
                      />
                    </div>
                    <div>
                      <label className="label">Description</label>
                      <input
                        type="text"
                        value={newDepartment.description}
                        onChange={(e) => setNewDepartment({ ...newDepartment, description: e.target.value })}
                        className="input"
                        placeholder="Brief description"
                      />
                    </div>
                  </div>
                  <button type="submit" disabled={loading} className="btn btn-primary">
                    Add Department
                  </button>
                </form>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-slate-900 mb-4">Existing Departments</h3>
                <div className="space-y-2">
                  {departments.map((dept) => (
                    <div key={dept.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
                      <div>
                        <p className="font-medium text-slate-900">{dept.name}</p>
                        <p className="text-sm text-slate-600">{dept.description}</p>
                      </div>
                      <button
                        onClick={() => handleDeleteDepartment(dept.id)}
                        className="text-sm px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700"
                      >
                        Delete
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Doctors Management */}
          {activeTab === 'doctors' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-slate-900">Doctor Management</h3>
                <button
                  onClick={() => setShowAddDoctorModal(true)}
                  className="btn btn-primary"
                >
                  <UserPlus className="h-5 w-5 mr-2" />
                  Add New Doctor
                </button>
              </div>

              <div className="space-y-2">
                {doctors.length === 0 ? (
                  <div className="text-center py-12 text-slate-500">
                    <UsersIcon className="h-12 w-12 mx-auto mb-4 text-slate-400" />
                    <p>No doctors registered yet</p>
                  </div>
                ) : (
                  doctors.map((doctor) => (
                    <div key={doctor.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors">
                      <div className="flex items-center gap-4">
                        <div className="h-12 w-12 rounded-full bg-primary-600 flex items-center justify-center text-white font-semibold">
                          {doctor.full_name.split(' ').map((n: string) => n[0]).join('').slice(0, 2)}
                        </div>
                        <div>
                          <p className="font-medium text-slate-900">Dr. {doctor.full_name}</p>
                          <p className="text-sm text-slate-600">{doctor.department}</p>
                          <p className="text-xs text-slate-500">{doctor.email} • {doctor.phone}</p>
                        </div>
                      </div>
                      <button
                        onClick={() => handleDeleteDoctor(doctor.id)}
                        className="text-sm px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700"
                      >
                        Remove
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* Categories */}
          {activeTab === 'categories' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-slate-900 mb-4">Add New Category</h3>
                <form onSubmit={handleAddCategory} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="label">Category Name *</label>
                      <input
                        required
                        type="text"
                        value={newCategory.name}
                        onChange={(e) => setNewCategory({ ...newCategory, name: e.target.value })}
                        className="input"
                        placeholder="e.g., Antibiotics"
                      />
                    </div>
                    <div>
                      <label className="label">Description</label>
                      <input
                        type="text"
                        value={newCategory.description}
                        onChange={(e) => setNewCategory({ ...newCategory, description: e.target.value })}
                        className="input"
                        placeholder="Brief description"
                      />
                    </div>
                  </div>
                  <button type="submit" disabled={loading} className="btn btn-primary">
                    Add Category
                  </button>
                </form>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-slate-900 mb-4">Existing Categories</h3>
                <div className="space-y-2">
                  {categories.map((cat) => (
                    <div key={cat.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
                      <div>
                        <p className="font-medium text-slate-900">{cat.name}</p>
                        <p className="text-sm text-slate-600">{cat.description}</p>
                      </div>
                      <button
                        onClick={() => handleDeleteCategory(cat.id)}
                        className="text-sm px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700"
                      >
                        Delete
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Notifications */}
          {activeTab === 'notifications' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-slate-900 mb-4">Alert Preferences</h3>
                <div className="space-y-4">
                  <label className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={notificationSettings.low_stock_alert}
                      onChange={(e) => setNotificationSettings({ ...notificationSettings, low_stock_alert: e.target.checked })}
                      className="rounded"
                    />
                    <div>
                      <p className="font-medium text-slate-900">Low Stock Alerts</p>
                      <p className="text-sm text-slate-600">Get notified when inventory falls below minimum stock</p>
                    </div>
                  </label>
                  <label className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={notificationSettings.expiry_alert}
                      onChange={(e) => setNotificationSettings({ ...notificationSettings, expiry_alert: e.target.checked })}
                      className="rounded"
                    />
                    <div>
                      <p className="font-medium text-slate-900">Expiry Alerts</p>
                      <p className="text-sm text-slate-600">Alert for items approaching expiry date</p>
                    </div>
                  </label>
                  <label className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={notificationSettings.bed_availability_alert}
                      onChange={(e) => setNotificationSettings({ ...notificationSettings, bed_availability_alert: e.target.checked })}
                      className="rounded"
                    />
                    <div>
                      <p className="font-medium text-slate-900">Bed Availability Alerts</p>
                      <p className="text-sm text-slate-600">Notify when bed occupancy reaches threshold</p>
                    </div>
                  </label>
                  <label className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={notificationSettings.appointment_reminders}
                      onChange={(e) => setNotificationSettings({ ...notificationSettings, appointment_reminders: e.target.checked })}
                      className="rounded"
                    />
                    <div>
                      <p className="font-medium text-slate-900">Appointment Reminders</p>
                      <p className="text-sm text-slate-600">Send reminders for upcoming appointments</p>
                    </div>
                  </label>
                  <div>
                    <label className="label">Alert Days Before Expiry</label>
                    <input
                      type="number"
                      min="1"
                      value={notificationSettings.alert_days_before_expiry}
                      onChange={(e) => setNotificationSettings({ ...notificationSettings, alert_days_before_expiry: parseInt(e.target.value) })}
                      className="input max-w-xs"
                    />
                  </div>
                </div>
              </div>
              <button onClick={handleSaveNotifications} className="btn btn-primary">
                <Save className="h-5 w-5 mr-2" />
                Save Preferences
              </button>
            </div>
          )}

          {/* Security */}
          {activeTab === 'security' && (
            <div className="space-y-6">
              <div className="p-6 bg-blue-50 border border-blue-200 rounded-lg">
                <h3 className="text-lg font-semibold text-blue-900 mb-2">Security Settings</h3>
                <p className="text-blue-700">
                  Security settings are managed through Supabase Authentication.
                  Visit your Supabase dashboard to configure:
                </p>
                <ul className="list-disc list-inside mt-3 space-y-1 text-blue-700">
                  <li>Password policies</li>
                  <li>Multi-factor authentication</li>
                  <li>Session management</li>
                  <li>Row Level Security policies</li>
                </ul>
              </div>
            </div>
          )}

          {/* Database */}
          {activeTab === 'database' && (
            <div className="space-y-6">
              <div className="p-6 bg-purple-50 border border-purple-200 rounded-lg">
                <h3 className="text-lg font-semibold text-purple-900 mb-2">Database Management</h3>
                <p className="text-purple-700">
                  Database operations are managed through Supabase. Access your Supabase dashboard for:
                </p>
                <ul className="list-disc list-inside mt-3 space-y-1 text-purple-700">
                  <li>Automatic backups (daily)</li>
                  <li>Database migrations</li>
                  <li>Performance monitoring</li>
                  <li>Query optimization</li>
                  <li>Connection pooling</li>
                </ul>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div className="p-4 bg-white border rounded-lg">
                  <p className="text-sm text-slate-600">Total Tables</p>
                  <p className="text-2xl font-bold text-slate-900">15+</p>
                </div>
                <div className="p-4 bg-white border rounded-lg">
                  <p className="text-sm text-slate-600">Active Connections</p>
                  <p className="text-2xl font-bold text-green-600">Live</p>
                </div>
                <div className="p-4 bg-white border rounded-lg">
                  <p className="text-sm text-slate-600">Last Backup</p>
                  <p className="text-2xl font-bold text-blue-600">Auto</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
      <AddDoctorSimple
        isOpen={showAddDoctorModal}
        onClose={() => setShowAddDoctorModal(false)}
        onSuccess={fetchData}
      />
    </div>
  )
}