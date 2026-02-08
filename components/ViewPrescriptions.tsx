'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { X, Printer } from 'lucide-react'
import type { Prescription, PrescriptionItem } from '@/lib/types'
import { formatDate, formatDateTime } from '@/lib/utils'

interface ViewPrescriptionProps {
  isOpen: boolean
  prescription: Prescription | null
  onClose: () => void
}

export function ViewPrescription({ isOpen, prescription, onClose }: ViewPrescriptionProps) {
  const [items, setItems] = useState<PrescriptionItem[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (isOpen && prescription) {
      fetchItems()
    }
  }, [isOpen, prescription])

  async function fetchItems() {
    if (!prescription) return
    
    setLoading(true)
    const supabase = createClient()

    try {
      const { data, error } = await supabase
        .from('prescription_items')
        .select(`
          *,
          item:inventory_items(*)
        `)
        .eq('prescription_id', prescription.id)

      if (error) throw error
      setItems(data || [])
    } catch (error) {
      console.error('Error fetching prescription items:', error)
    } finally {
      setLoading(false)
    }
  }

  function handlePrint() {
    window.print()
  }

  if (!isOpen || !prescription) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between print:hidden">
          <h2 className="text-2xl font-bold text-slate-900">Prescription Details</h2>
          <div className="flex gap-2">
            <button
              onClick={handlePrint}
              className="btn btn-secondary"
            >
              <Printer className="h-5 w-5 mr-2" />
              Print
            </button>
            <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
              <X className="h-6 w-6" />
            </button>
          </div>
        </div>

        <div className="p-8">
          {/* Header */}
          <div className="text-center mb-8 print:mb-6">
            <h1 className="text-3xl font-bold text-slate-900">Medical Prescription</h1>
            <p className="text-slate-600 mt-2">Prescription ID: {prescription.id.slice(0, 8).toUpperCase()}</p>
          </div>

          {/* Patient & Doctor Info */}
          <div className="grid grid-cols-2 gap-6 mb-8">
            <div className="p-4 bg-slate-50 rounded-lg">
              <h3 className="font-semibold text-slate-900 mb-2">Patient Information</h3>
              <div className="space-y-1 text-sm">
                <p><strong>Name:</strong> {prescription.patient?.full_name}</p>
                <p><strong>Patient ID:</strong> {prescription.patient?.patient_number}</p>
                <p><strong>Age:</strong> {prescription.patient?.date_of_birth ? 
                  new Date().getFullYear() - new Date(prescription.patient.date_of_birth).getFullYear() : 'N/A'} years
                </p>
                <p><strong>Blood Group:</strong> {prescription.patient?.blood_group || 'N/A'}</p>
              </div>
            </div>

            <div className="p-4 bg-slate-50 rounded-lg">
              <h3 className="font-semibold text-slate-900 mb-2">Doctor Information</h3>
              <div className="space-y-1 text-sm">
                <p><strong>Name:</strong> Dr. {prescription.doctor?.full_name}</p>
                <p><strong>Department:</strong> {prescription.doctor?.department}</p>
                <p><strong>Date:</strong> {formatDate(prescription.created_at)}</p>
                <p><strong>Status:</strong> <span className="capitalize font-medium">{prescription.status}</span></p>
              </div>
            </div>
          </div>

          {/* Diagnosis */}
          {prescription.diagnosis && (
            <div className="mb-6">
              <h3 className="font-semibold text-slate-900 mb-2">Diagnosis</h3>
              <p className="text-slate-700 p-4 bg-slate-50 rounded-lg">{prescription.diagnosis}</p>
            </div>
          )}

          {/* Medications */}
          <div className="mb-6">
            <h3 className="font-semibold text-slate-900 mb-3">Prescribed Medications</h3>
            {loading ? (
              <p className="text-slate-500 text-center py-4">Loading medications...</p>
            ) : (
              <div className="border border-slate-200 rounded-lg overflow-hidden">
                <table className="w-full text-sm">
                  <thead className="bg-slate-50">
                    <tr>
                      <th className="px-4 py-3 text-left font-semibold">Medicine</th>
                      <th className="px-4 py-3 text-left font-semibold">Dosage</th>
                      <th className="px-4 py-3 text-left font-semibold">Frequency</th>
                      <th className="px-4 py-3 text-left font-semibold">Duration</th>
                      <th className="px-4 py-3 text-left font-semibold">Quantity</th>
                    </tr>
                  </thead>
                  <tbody>
                    {items.map((item, index) => (
                      <tr key={item.id} className="border-t border-slate-200">
                        <td className="px-4 py-3">
                          <div>
                            <p className="font-medium text-slate-900">{item.item?.name}</p>
                            {item.instructions && (
                              <p className="text-xs text-slate-500 italic">{item.instructions}</p>
                            )}
                          </div>
                        </td>
                        <td className="px-4 py-3">{item.dosage}</td>
                        <td className="px-4 py-3">{item.frequency}</td>
                        <td className="px-4 py-3">{item.duration}</td>
                        <td className="px-4 py-3">
                          {item.quantity}
                          {prescription.status === 'dispensed' && (
                            <span className="text-xs text-green-600 block">
                              (Dispensed: {item.dispensed_quantity})
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Additional Notes */}
          {prescription.notes && (
            <div className="mb-6">
              <h3 className="font-semibold text-slate-900 mb-2">Additional Notes</h3>
              <p className="text-slate-700 p-4 bg-slate-50 rounded-lg">{prescription.notes}</p>
            </div>
          )}

          {/* Follow-up */}
          {prescription.follow_up_date && (
            <div className="mb-6">
              <h3 className="font-semibold text-slate-900 mb-2">Follow-up Appointment</h3>
              <p className="text-slate-700 p-4 bg-blue-50 rounded-lg border border-blue-200">
                <strong>Scheduled for:</strong> {formatDate(prescription.follow_up_date)}
              </p>
            </div>
          )}

          {/* Footer */}
          <div className="mt-8 pt-6 border-t border-slate-200">
            <div className="flex justify-between items-center">
              <div className="text-sm text-slate-600">
                <p>Generated on: {formatDateTime(new Date().toISOString())}</p>
              </div>
              <div className="text-right">
                <p className="text-sm text-slate-600 mb-2">Doctor's Signature</p>
                <div className="border-t-2 border-slate-900 w-48 pt-1">
                  <p className="text-sm font-medium">Dr. {prescription.doctor?.full_name}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="px-6 py-4 bg-slate-50 border-t print:hidden">
          <button onClick={onClose} className="btn btn-secondary w-full">
            Close
          </button>
        </div>
      </div>
    </div>
  )
}