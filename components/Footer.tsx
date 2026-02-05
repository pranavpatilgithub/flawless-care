import Link from "next/link"
import { Activity } from "lucide-react"

export default function Footer() {
  return (
    <footer className="border-t border-slate-200 bg-slate-50 mt-[120px]">
      <div className="max-w-7xl mx-auto px-6 py-12">

        {/* Top Section */}
        <div className="grid grid-cols-1 gap-10 md:grid-cols-4">

          {/* Brand */}
          <div className="md:col-span-2">
            <div className="flex items-center gap-2 text-slate-800 mb-4">
              <Activity className="h-5 w-5 text-rose-500" />
              <span className="text-sm font-medium">
                Flawless Care
              </span>
            </div>

            <p className="text-sm text-slate-600 max-w-md leading-relaxed">
              Flawless Care is a hospital operations platform designed to
              streamline OPD workflows, patient admissions, bed management,
              and inventory tracking with reliability and precision.
            </p>
          </div>

          {/* Product */}
          <div>
            <h4 className="text-sm font-medium text-slate-900 mb-3">
              Product
            </h4>
            <ul className="space-y-2 text-sm text-slate-600">
              <li>
                <Link href="/dashboard" className="hover:text-slate-900 transition">
                  Dashboard
                </Link>
              </li>
              <li>
                <Link href="#" className="hover:text-slate-900 transition">
                  OPD Management
                </Link>
              </li>
              <li>
                <Link href="#" className="hover:text-slate-900 transition">
                  Bed Availability
                </Link>
              </li>
              <li>
                <Link href="#" className="hover:text-slate-900 transition">
                  Inventory
                </Link>
              </li>
            </ul>
          </div>

          {/* Company */}
          <div>
            <h4 className="text-sm font-medium text-slate-900 mb-3">
              Company
            </h4>
            <ul className="space-y-2 text-sm text-slate-600">
              <li>
                <Link href="#" className="hover:text-slate-900 transition">
                  About
                </Link>
              </li>
              <li>
                <Link href="#" className="hover:text-slate-900 transition">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="#" className="hover:text-slate-900 transition">
                  Terms of Service
                </Link>
              </li>
              <li>
                <a
                  href="mailto:contact@flawlesscare.io"
                  className="hover:text-slate-900 transition"
                >
                  Contact
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Divider */}
        <div className="my-8 border-t border-slate-200" />

        {/* Bottom Section */}
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">

          <p className="text-xs text-slate-500">
            © {new Date().getFullYear()} Flawless Care. All rights reserved.
          </p>

          
        </div>
      </div>
    </footer>
  )
}
