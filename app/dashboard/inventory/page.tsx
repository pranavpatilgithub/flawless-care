'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Package, AlertTriangle, TrendingDown, TrendingUp, Calendar } from 'lucide-react'
import type { InventoryItem, InventoryCategory, InventoryBatch } from '@/lib/types'
import { getStockStatus, isExpiringSoon, formatDate } from '@/lib/utils'
import { AddInventoryItem } from '@/components/AddInventoryItem'

export default function InventoryPage() {
  const [items, setItems] = useState<InventoryItem[]>([])
  const [categories, setCategories] = useState<InventoryCategory[]>([])
  const [batches, setBatches] = useState<InventoryBatch[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [selectedType, setSelectedType] = useState<string>('all')
  const [stockFilter, setStockFilter] = useState<string>('all')
  const [showAddModal, setShowAddModal] = useState(false)

  useEffect(() => {
    fetchData()

    // Real-time subscription
    const supabase = createClient()
    const channel = supabase
      .channel('inventory_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'inventory_items' }, () => {
        fetchData()
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'inventory_batches' }, () => {
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
      const { data: itemsData, error: itemsError } = await supabase
        .from('inventory_items')
        .select('*, category:inventory_categories(*)')
        .order('name')

      if (itemsError) throw itemsError

      const { data: categoriesData, error: categoriesError } = await supabase
        .from('inventory_categories')
        .select('*')
        .order('name')

      if (categoriesError) throw categoriesError

      const { data: batchesData, error: batchesError } = await supabase
        .from('inventory_batches')
        .select('*')
        .eq('status', 'active')
        .order('expiry_date')

      if (batchesError) throw batchesError

      setItems(itemsData || [])
      setCategories(categoriesData || [])
      setBatches(batchesData || [])
    } catch (error) {
      console.error('Error fetching inventory data:', error)
    } finally {
      setLoading(false)
    }
  }

  const filteredItems = items.filter(item => {
    if (selectedCategory !== 'all' && item.category_id !== selectedCategory) return false
    if (selectedType !== 'all' && item.item_type !== selectedType) return false

    if (stockFilter === 'critical') {
      return item.current_stock < item.minimum_stock
    } else if (stockFilter === 'low') {
      return item.current_stock >= item.minimum_stock && item.current_stock < item.minimum_stock * 2
    }

    return true
  })

  const stats = {
    totalItems: items.length,
    criticalStock: items.filter(i => i.current_stock < i.minimum_stock).length,
    lowStock: items.filter(i => i.current_stock >= i.minimum_stock && i.current_stock < i.minimum_stock * 2).length,
    expiringSoon: batches.filter(b => b.expiry_date && isExpiringSoon(b.expiry_date, 30)).length,
  }

  const getStockBadge = (item: InventoryItem) => {
    const status = getStockStatus(item.current_stock, item.minimum_stock)

    switch (status) {
      case 'critical':
        return (
          <div className="flex items-center gap-1 text-red-600">
            <AlertTriangle className="h-4 w-4" />
            <span className="badge badge-danger">Critical</span>
          </div>
        )
      case 'low':
        return (
          <div className="flex items-center gap-1 text-orange-600">
            <TrendingDown className="h-4 w-4" />
            <span className="badge badge-warning">Low Stock</span>
          </div>
        )
      default:
        return (
          <div className="flex items-center gap-1 text-green-600">
            <TrendingUp className="h-4 w-4" />
            <span className="badge badge-success">Healthy</span>
          </div>
        )
    }
  }

  const getExpiringBatches = (itemId: string) => {
    return batches.filter(
      b => b.item_id === itemId && b.expiry_date && isExpiringSoon(b.expiry_date, 30)
    )
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
          <h1 className="text-3xl font-bold text-slate-900">Inventory Management</h1>
          <p className="text-slate-600 mt-1">Track medicines, consumables, and equipment</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="btn btn-primary"
        >
          Add New Item
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="stat-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-600">Total Items</p>
              <p className="text-3xl font-bold text-slate-900 mt-1">{stats.totalItems}</p>
            </div>
            <Package className="h-10 w-10 text-blue-500" />
          </div>
        </div>
        <div className="stat-card border-l-4 border-red-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-600">Critical Stock</p>
              <p className="text-3xl font-bold text-red-600 mt-1">{stats.criticalStock}</p>
              <p className="text-xs text-red-600 mt-1 font-medium">Needs immediate attention</p>
            </div>
            <AlertTriangle className="h-10 w-10 text-red-500" />
          </div>
        </div>
        <div className="stat-card border-l-4 border-orange-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-600">Low Stock</p>
              <p className="text-3xl font-bold text-orange-600 mt-1">{stats.lowStock}</p>
              <p className="text-xs text-orange-600 mt-1 font-medium">Reorder soon</p>
            </div>
            <TrendingDown className="h-10 w-10 text-orange-500" />
          </div>
        </div>
        <div className="stat-card border-l-4 border-purple-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-600">Expiring Soon</p>
              <p className="text-3xl font-bold text-purple-600 mt-1">{stats.expiringSoon}</p>
              <p className="text-xs text-purple-600 mt-1 font-medium">Next 30 days</p>
            </div>
            <Calendar className="h-10 w-10 text-purple-500" />
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="label">Category</label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="input"
            >
              <option value="all">All Categories</option>
              {categories.map(cat => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="label">Item Type</label>
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="input"
            >
              <option value="all">All Types</option>
              <option value="medicine">Medicine</option>
              <option value="consumable">Consumable</option>
              <option value="equipment">Equipment</option>
            </select>
          </div>
          <div>
            <label className="label">Stock Level</label>
            <select
              value={stockFilter}
              onChange={(e) => setStockFilter(e.target.value)}
              className="input"
            >
              <option value="all">All Items</option>
              <option value="critical">Critical Stock Only</option>
              <option value="low">Low Stock Only</option>
            </select>
          </div>
        </div>
      </div>

      {/* Inventory Table */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="table">
            <thead>
              <tr>
                <th>Item Name</th>
                <th>Category</th>
                <th>Type</th>
                <th>Current Stock</th>
                <th>Min Stock</th>
                <th>Unit</th>
                <th>Status</th>
                <th>Alerts</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredItems.length === 0 ? (
                <tr>
                  <td colSpan={9} className="text-center py-8 text-slate-500">
                    No items match the selected filters
                  </td>
                </tr>
              ) : (
                filteredItems.map((item) => {
                  const expiringBatches = getExpiringBatches(item.id)
                  const stockPercentage = Math.round((item.current_stock / (item.maximum_stock || item.minimum_stock * 3)) * 100)

                  return (
                    <tr key={item.id}>
                      <td>
                        <div>
                          <p className="font-medium text-slate-900">{item.name}</p>
                          {item.manufacturer && (
                            <p className="text-xs text-slate-500">{item.manufacturer}</p>
                          )}
                        </div>
                      </td>
                      <td>{item.category?.name}</td>
                      <td>
                        <span className="badge badge-secondary capitalize">
                          {item.item_type}
                        </span>
                      </td>
                      <td>
                        <div>
                          <p className="font-semibold text-lg">{item.current_stock}</p>
                          <div className="w-full bg-slate-200 rounded-full h-2 mt-1">
                            <div
                              className={`h-2 rounded-full transition-all ${stockPercentage < 30 ? 'bg-red-600' :
                                stockPercentage < 60 ? 'bg-orange-600' : 'bg-green-600'
                                }`}
                              style={{ width: `${Math.min(stockPercentage, 100)}%` }}
                            ></div>
                          </div>
                        </div>
                      </td>
                      <td className="text-slate-600">{item.minimum_stock}</td>
                      <td className="text-slate-600">{item.unit}</td>
                      <td>{getStockBadge(item)}</td>
                      <td>
                        {expiringBatches.length > 0 && (
                          <div className="flex items-center gap-1 text-purple-600">
                            <Calendar className="h-4 w-4" />
                            <span className="text-xs font-medium">
                              {expiringBatches.length} batch{expiringBatches.length > 1 ? 'es' : ''} expiring
                            </span>
                          </div>
                        )}
                      </td>
                      <td>
                        <div className="flex gap-2">
                          <button className="text-sm px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700">
                            Update
                          </button>
                          <button className="text-sm px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700">
                            Restock
                          </button>
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
      <AddInventoryItem
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSuccess={fetchData}
      />
    </div>
  )
}
