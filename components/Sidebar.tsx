'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard,
  Users,
  Bed,
  ClipboardList,
  Package,
  FileText,
  Settings,
  Activity,
  Calendar,
  LogOut,
} from 'lucide-react'
import { cn } from '@/lib/utils'

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'OPD Queue', href: '/dashboard/opd', icon: ClipboardList },
  { name: 'Patients', href: '/dashboard/patients', icon: Users },
  { name: 'Beds', href: '/dashboard/beds', icon: Bed },
  { name: 'Admissions', href: '/dashboard/admissions', icon: Activity },
  { name: 'Inventory', href: '/dashboard/inventory', icon: Package },
  { name: 'Prescriptions', href: '/dashboard/prescriptions', icon: FileText },
  { name: 'Appointments', href: '/dashboard/appointments', icon: Calendar },
  { name: 'Settings', href: '/dashboard/settings', icon: Settings },
]

export function Sidebar() {
  const pathname = usePathname()

  return (
    <aside className="flex h-screen w-64 flex-col border-r border-slate-200 bg-slate-800 text-slate-100">
      
      {/* Logo */}
      <div className="flex h-16 items-center px-6 border-b border-slate-700">
        <Activity className="h-6 w-6 text-rose-400" />
        <span className="ml-3 text-sm font-medium tracking-tight">
          Flawless Care
        </span>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {navigation.map((item) => {
          const isActive = pathname === item.href

          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                'flex items-center gap-3 rounded-md px-3 py-2 text-sm transition',
                isActive
                  ? 'bg-slate-700 text-white'
                  : 'text-slate-300 hover:bg-slate-700/60 hover:text-white'
              )}
            >
              <item.icon className="h-4 w-4" />
              {item.name}
            </Link>
          )
        })}
      </nav>

      {/* User */}
      <div className="border-t border-slate-700 p-4">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-full bg-slate-600 flex items-center justify-center">
            <span className="text-xs font-medium">AD</span>
          </div>

          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">
              Admin User
            </p>
            <p className="text-xs text-slate-400 truncate">
              admin@hospital.com
            </p>
          </div>

          <button
            className="text-slate-400 hover:text-white transition"
            aria-label="Logout"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </div>
    </aside>
  )
}
