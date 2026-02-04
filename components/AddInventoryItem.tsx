'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { X } from 'lucide-react'
import type { InventoryCategory } from '@/lib/types'

interface AddInventoryItemProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
}

export function AddInventoryItem({ isOpen, onClose, onSuccess }: AddInventoryItemProps) {
  const [loading, setLoading] = useState(false)
  const [categories, setCategories] = useState<InventoryCategory[]>([])
  const [addBatch, setAddBatch] = useState(false)
  
  const [itemData, setItemData] = useState({
    name: '',
    category_id: '',
    item_type: 'medicine',
    description: '',
    unit: '',
    manufacturer: '',
    minimum_stock: 0,
    maximum_stock: 0,
    unit_price: 0,
    expiry_alert_days: 30,
  })

  const [batchData, setBatchData] = useState({
    batch_number: '',
    quantity: 0,
    manufacturing_date: '',
    expiry_date: '',
    purchase_price: 0,
    supplier: '',
  })

  useEffect(() => {
    if (isOpen) {
      fetchCategories()
    }
  }, [isOpen])

  async function fetchCategories() {
    const supabase = createClient()
    const { data } = await supabase
      .from('inventory_categories')
      .select('*')
      .order('name')

    setCategories(data || [])
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)

    const supabase = createClient()

    try {
      // Create inventory item
      const { data: newItem, error: itemError } = await supabase
        .from('inventory_items')
        .insert([{
          ...itemData,
          current_stock: addBatch ? batchData.quantity : 0,
        }])
        .select()
        .single()

      if (itemError) throw itemError

      // Create batch if provided
      if (addBatch && batchData.quantity > 0) {
        const { error: batchError } = await supabase
          .from('inventory_batches')
          .insert([{
            item_id: newItem.id,
            ...batchData,
            status: 'active',
          }])

        if (batchError) throw batchError

        // Create purchase transaction
        const { error: transactionError } = await supabase
          .from('inventory_transactions')
          .insert([{
            item_id: newItem.id,
            transaction_type: 'purchase',
            quantity: batchData.quantity,
            unit_price: batchData.purchase_price,
            notes: `Initial stock - Batch ${batchData.batch_number}`,
          }])

        if (transactionError) throw transactionError
      }

      alert('Inventory item added successfully!')
      onSuccess()
      onClose()
      resetForm()
    } catch (error) {
      console.error('Error adding inventory item:', error)
      alert('Failed to add inventory item. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  function resetForm() {
    setItemData({
      name: '',
      category_id: '',
      item_type: 'medicine',
      description: '',
      unit: '',
      manufacturer: '',
      minimum_stock: 0,
      maximum_stock: 0,
      unit_price: 0,
      expiry_alert_days: 30,
    })
    setBatchData({
      batch_number: '',
      quantity: 0,
      manufacturing_date: '',
      expiry_date: '',
      purchase_price: 0,
      supplier: '',
    })
    setAddBatch(false)
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-slate-900">Add Inventory Item</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <X className="h-6 w-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Item Details */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-slate-900">Item Information</h3>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="label">Item Name *</label>
                <input
                  required
                  type="text"
                  value={itemData.name}
                  onChange={(e) => setItemData({ ...itemData, name: e.target.value })}
                  className="input"
                  placeholder="e.g., Paracetamol 500mg"
                />
              </div>
              <div>
                <label className="label">Category *</label>
                <select
                  required
                  value={itemData.category_id}
                  onChange={(e) => setItemData({ ...itemData, category_id: e.target.value })}
                  className="input"
                >
                  <option value="">Select category</option>
                  {categories.map(cat => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="label">Item Type *</label>
                <select
                  value={itemData.item_type}
                  onChange={(e) => setItemData({ ...itemData, item_type: e.target.value })}
                  className="input"
                >
                  <option value="medicine">Medicine</option>
                  <option value="consumable">Consumable</option>
                  <option value="equipment">Equipment</option>
                </select>
              </div>
              <div>
                <label className="label">Unit *</label>
                <input
                  required
                  type="text"
                  value={itemData.unit}
                  onChange={(e) => setItemData({ ...itemData, unit: e.target.value })}
                  className="input"
                  placeholder="e.g., tablets, strips, pieces"
                />
              </div>
            </div>

            <div>
              <label className="label">Manufacturer</label>
              <input
                type="text"
                value={itemData.manufacturer}
                onChange={(e) => setItemData({ ...itemData, manufacturer: e.target.value })}
                className="input"
                placeholder="Manufacturer name"
              />
            </div>

            <div>
              <label className="label">Description</label>
              <textarea
                rows={2}
                value={itemData.description}
                onChange={(e) => setItemData({ ...itemData, description: e.target.value })}
                className="input"
                placeholder="Item description..."
              />
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="label">Minimum Stock *</label>
                <input
                  required
                  type="number"
                  min="0"
                  value={itemData.minimum_stock}
                  onChange={(e) => setItemData({ ...itemData, minimum_stock: parseInt(e.target.value) })}
                  className="input"
                />
              </div>
              <div>
                <label className="label">Maximum Stock</label>
                <input
                  type="number"
                  min="0"
                  value={itemData.maximum_stock}
                  onChange={(e) => setItemData({ ...itemData, maximum_stock: parseInt(e.target.value) })}
                  className="input"
                />
              </div>
              <div>
                <label className="label">Unit Price (₹)</label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={itemData.unit_price}
                  onChange={(e) => setItemData({ ...itemData, unit_price: parseFloat(e.target.value) })}
                  className="input"
                />
              </div>
            </div>

            <div>
              <label className="label">Expiry Alert (Days before expiry)</label>
              <input
                type="number"
                min="0"
                value={itemData.expiry_alert_days}
                onChange={(e) => setItemData({ ...itemData, expiry_alert_days: parseInt(e.target.value) })}
                className="input"
              />
            </div>
          </div>

          {/* Batch Information */}
          <div className="border-t pt-6">
            <label className="flex items-center gap-2 mb-4">
              <input
                type="checkbox"
                checked={addBatch}
                onChange={(e) => setAddBatch(e.target.checked)}
                className="rounded"
              />
              <span className="text-sm font-medium text-slate-700">Add Initial Stock Batch</span>
            </label>

            {addBatch && (
              <div className="space-y-4 p-4 bg-slate-50 rounded-lg">
                <h3 className="text-lg font-semibold text-slate-900">Batch Information</h3>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="label">Batch Number *</label>
                    <input
                      required={addBatch}
                      type="text"
                      value={batchData.batch_number}
                      onChange={(e) => setBatchData({ ...batchData, batch_number: e.target.value })}
                      className="input"
                      placeholder="e.g., BATCH001"
                    />
                  </div>
                  <div>
                    <label className="label">Quantity *</label>
                    <input
                      required={addBatch}
                      type="number"
                      min="0"
                      value={batchData.quantity}
                      onChange={(e) => setBatchData({ ...batchData, quantity: parseInt(e.target.value) })}
                      className="input"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="label">Manufacturing Date</label>
                    <input
                      type="date"
                      value={batchData.manufacturing_date}
                      onChange={(e) => setBatchData({ ...batchData, manufacturing_date: e.target.value })}
                      className="input"
                    />
                  </div>
                  <div>
                    <label className="label">Expiry Date</label>
                    <input
                      type="date"
                      value={batchData.expiry_date}
                      onChange={(e) => setBatchData({ ...batchData, expiry_date: e.target.value })}
                      className="input"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="label">Purchase Price (₹)</label>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={batchData.purchase_price}
                      onChange={(e) => setBatchData({ ...batchData, purchase_price: parseFloat(e.target.value) })}
                      className="input"
                    />
                  </div>
                  <div>
                    <label className="label">Supplier</label>
                    <input
                      type="text"
                      value={batchData.supplier}
                      onChange={(e) => setBatchData({ ...batchData, supplier: e.target.value })}
                      className="input"
                      placeholder="Supplier name"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4 border-t">
            <button
              type="button"
              onClick={onClose}
              className="btn btn-secondary flex-1"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="btn btn-primary flex-1"
            >
              {loading ? 'Adding...' : 'Add Item'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}