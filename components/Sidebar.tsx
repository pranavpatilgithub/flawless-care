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
  LogOut
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
    <div className="flex h-screen w-56 flex-col bg-slate-900 text-white">
      {/* Logo */}
      <div className="flex h-16 items-center border-b border-slate-800 px-6">
        <Activity className="h-8 w-8 text-primary-400" />
        <span className="ml-3 text-xl font-light">Flawless Care</span>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 px-3 py-4 overflow-y-auto">
        {navigation.map((item) => {
          const isActive = pathname === item.href
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                'flex items-center rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                isActive
                  ? 'bg-primary-600 text-white'
                  : 'text-slate-300 hover:bg-slate-800 hover:text-white'
              )}
            >
              <item.icon className="h-5 w-5 mr-3" />
              {item.name}
            </Link>
          )
        })}
      </nav>

      {/* User section */}
      <div className="border-t border-slate-800 p-4">
        <div className="flex items-center">
          <div className="flex-shrink-0">
            <div className="h-10 w-10 rounded-full bg-primary-600 flex items-center justify-center">
              <span className="text-sm font-medium">AD</span>
            </div>
          </div>
          <div className="ml-3 flex-1">
            <p className="text-sm font-medium">Admin User</p>
            <p className="text-xs text-slate-400">admin@hospital.com</p>
          </div>
          <button className="text-slate-400 hover:text-white">
            <LogOut className="h-5 w-5" />
          </button>
        </div>
      </div>
    </div>
  )
}
