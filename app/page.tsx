import Link from 'next/link'
import { Activity, Bed, Users, Package, ArrowRight } from 'lucide-react'

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-700 via-primary-900 to-primary-900">
      <div className="container mx-auto px-1 py-10">
        {/* Header */}
        <nav className="flex items-center justify-between mb-20">
          <div className="flex items-center gap-3 text-white">
            <Activity className="h-10 w-10" />
            <span className="text-2xl font-light">Flawless Care</span>
          </div>
          <Link
            href="/dashboard"
            className="px-5 py-1 bg-white text-primary-700 rounded-md font-semibold hover:bg-slate-100 transition-colors"
          >
            Access Dashboard
          </Link>
        </nav>

        {/* Hero Section */}
        <div className="max-w-4xl mx-auto text-center mb-20">
          <h1 className="text-6xl font-bold text-white mb-6 leading-tight">
            The operating system for hospital care.
          </h1>
          <p className="text-xl text-primary-100 mb-8 leading-relaxed">
            Streamline OPD queuing, bed availability tracking, patient admissions, and inventory management all in one powerful platform.
          </p>
          <div className="flex items-center justify-center gap-4">
            <Link
              href="/dashboard"
              className="px-6 py-3 bg-white text-primary-700 rounded-lg font-bold text-md hover:bg-slate-100 transition-all hover:scale-105 flex items-center gap-2"
            >
              Get Started
              <ArrowRight className="h-5 w-5" />
            </Link>
            
          </div>
        </div>

        {/* Features Grid */}
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20 hover:bg-white/15 transition-all">
            <div className="bg-white/20 rounded-xl p-4 inline-block mb-4">
              <Users className="h-8 w-8 text-white" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">OPD Queue Management</h3>
            <p className="text-primary-100">
              Real-time queue tracking with priority handling and wait time monitoring.
            </p>
          </div>

          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20 hover:bg-white/15 transition-all">
            <div className="bg-white/20 rounded-xl p-4 inline-block mb-4">
              <Bed className="h-8 w-8 text-white" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">Bed Availability</h3>
            <p className="text-primary-100">
              Live bed status tracking across all departments with occupancy analytics.
            </p>
          </div>

          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20 hover:bg-white/15 transition-all">
            <div className="bg-white/20 rounded-xl p-4 inline-block mb-4">
              <Activity className="h-8 w-8 text-white" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">Patient Admissions</h3>
            <p className="text-primary-100">
              Streamlined admission process with comprehensive patient record management.
            </p>
          </div>

          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20 hover:bg-white/15 transition-all">
            <div className="bg-white/20 rounded-xl p-4 inline-block mb-4">
              <Package className="h-8 w-8 text-white" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">Inventory Management</h3>
            <p className="text-primary-100">
              Track medicines and consumables with automated stock alerts and expiry monitoring.
            </p>
          </div>
        </div>

        {/* Stats Section */}
        {/* <div className="max-w-4xl mx-auto mt-20 bg-white/10 backdrop-blur-lg rounded-2xl p-12 border border-white/20">
          <div className="grid grid-cols-3 gap-8">
            <div className="text-center">
              <p className="text-5xl font-bold text-white mb-2">99.9%</p>
              <p className="text-primary-100">System Uptime</p>
            </div>
            <div className="text-center">
              <p className="text-5xl font-bold text-white mb-2">24/7</p>
              <p className="text-primary-100">Support Available</p>
            </div>
            <div className="text-center">
              <p className="text-5xl font-bold text-white mb-2">100+</p>
              <p className="text-primary-100">Hospitals Trust Us</p>
            </div>
          </div>
        </div> */}
      </div>
    </div>
  )
}
