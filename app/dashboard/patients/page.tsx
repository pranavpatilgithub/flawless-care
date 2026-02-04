'use client'

import { Users } from 'lucide-react'

export default function PatientsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Patient Management</h1>
        <p className="text-slate-600 mt-1">View and manage patient records</p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-12 text-center">
        <Users className="h-16 w-16 text-slate-400 mx-auto mb-4" />
        <h3 className="text-xl font-semibold text-slate-900 mb-2">Patient Management Coming Soon</h3>
        <p className="text-slate-600">
          This page will include patient registration, medical history, and search functionality.
        </p>
      </div>
    </div>
  )
}
