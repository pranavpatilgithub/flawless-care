import Link from "next/link"
import { Activity, Bed, Users, Package, ArrowRight } from "lucide-react"

export default function Home() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <div className="max-w-7xl mx-auto px-6 py-10">

        {/* Header */}
        <nav className="flex items-center justify-between mb-24">
          <div className="flex items-center gap-3">
            <Activity className="h-7 w-7 text-rose-500" />
            <span className="text-lg font-medium tracking-tight">
              Flawless Care
            </span>
          </div>

          <Link
            href="/dashboard"
            className="rounded-md px-4 py-2 text-sm font-medium bg-slate-900 text-white hover:bg-slate-800 transition"
          >
            Dashboard
          </Link>
        </nav>

        {/* Hero */}
        <section className="max-w-3xl mx-auto text-center mb-28">
          <h1 className="text-5xl font-semibold tracking-tight leading-tight mb-6">
            The operating system <br /> for hospital care
          </h1>

          <p className="text-lg text-slate-600 leading-relaxed mb-10">
            Manage OPD queues, patient admissions, bed availability,
            and inventory — all from a single, reliable platform.
          </p>



          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 rounded-lg bg-rose-500 px-6 py-3 text-white text-sm font-medium hover:bg-rose-600 transition"
          >
            Get Started
            <ArrowRight className="h-4 w-4" />
          </Link>
        </section>

        <div className="flex items-center justify-center mb-5">
          <p className="mt-6 inline-flex gap-2 rounded-md  bg-yellow-50  border border-yellow-200  px-3 py-2  text-xs  text-yellow-800">
          <span className="font-medium">Note:</span>
          This hosted UI is for demo purposes only. For full product access,
          please contact us.
        </p>
        </div>
        



        {/* Features */}
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <FeatureCard
            icon={<Users />}
            title="OPD Queue Management"
            description="Real-time patient flow with priority handling and wait-time insights."
          />
          <FeatureCard
            icon={<Bed />}
            title="Bed Availability"
            description="Live occupancy tracking across departments with analytics."
          />
          <FeatureCard
            icon={<Activity />}
            title="Patient Admissions"
            description="Smooth admissions with centralized patient records."
          />
          <FeatureCard
            icon={<Package />}
            title="Inventory Management"
            description="Medicine & consumable tracking with low-stock alerts."
          />
        </section>
      </div>
    </div>
  )
}

/* Feature Card Component */
function FeatureCard({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode
  title: string
  description: string
}) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-6 hover:shadow-sm transition">
      <div className="mb-4 inline-flex h-10 w-10 items-center justify-center rounded-lg bg-slate-100 text-slate-700">
        {icon}
      </div>

      <h3 className="text-base font-semibold mb-2">
        {title}
      </h3>

      <p className="text-sm text-slate-600 leading-relaxed">
        {description}
      </p>
    </div>
  )
}
