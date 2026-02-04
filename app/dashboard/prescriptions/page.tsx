'use client'

import { FileText } from 'lucide-react'

export default function PrescriptionsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Prescription Management</h1>
        <p className="text-slate-600 mt-1">Create and manage patient prescriptions</p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-12 text-center">
        <FileText className="h-16 w-16 text-slate-400 mx-auto mb-4" />
        <h3 className="text-xl font-semibold text-slate-900 mb-2">Prescription Management Coming Soon</h3>
        <p className="text-slate-600">
          This page will include prescription creation, tracking, and pharmacy integration.
        </p>
      </div>
    </div>
  )
}
