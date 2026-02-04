# Hospital Management System (HMS)

A comprehensive, production-ready hospital management system built with Next.js 14, TypeScript, Tailwind CSS, and Supabase. This system addresses key hospital operations including OPD queue management, bed availability tracking, patient admissions, and inventory management.

## 🏥 Problem Statement

This system solves critical challenges in hospital operations:

- **OPD Queue Management**: Real-time queue tracking with priority handling and wait time monitoring
- **Bed Availability**: Live bed status tracking across all departments with occupancy analytics
- **Patient Admissions**: Streamlined admission/discharge process with comprehensive record management
- **Inventory Management**: Track medicines and consumables with automated stock alerts and expiry monitoring

## ✨ Features

### 📊 Dashboard
- Real-time statistics and analytics
- Visual charts for OPD queue status and bed distribution
- Quick action buttons for common tasks
- Department-wise metrics

### 🏥 OPD Queue Management
- Token-based queue system
- Priority handling (Normal, Urgent, Emergency)
- Real-time status updates (Waiting, In Consultation, Completed)
- Wait time tracking and alerts
- Department-wise queue filtering
- Live updates using Supabase real-time subscriptions

### 🛏️ Bed Management
- Real-time bed availability tracking
- Multiple bed types (General, ICU, Private, Semi-Private, Emergency)
- Status management (Available, Occupied, Maintenance, Reserved)
- Department-wise bed allocation
- Occupancy rate monitoring
- Visual grid view with color-coded status

### 👤 Patient Admissions
- Complete admission workflow
- Emergency, planned, and transfer admission types
- Bed assignment integration
- Admission duration tracking
- Discharge management
- Patient medical history

### 📦 Inventory Management
- Medicine, consumable, and equipment tracking
- Real-time stock level monitoring
- Critical stock alerts (below minimum threshold)
- Low stock warnings
- Batch tracking with expiry dates
- Expiry alerts (30-day warning)
- Category-based organization
- Stock level indicators with progress bars

## 🛠️ Tech Stack

- **Frontend Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **Real-time Updates**: Supabase Realtime
- **Charts**: Recharts
- **Icons**: Lucide React
- **Date Handling**: date-fns

## 📋 Prerequisites

Before you begin, ensure you have:

- Node.js 18.x or higher
- npm or yarn package manager
- A Supabase account (free tier works)
- Git (for cloning the repository)

## 🚀 Installation & Setup

### 1. Clone the Repository

```bash
git clone <your-repository-url>
cd hospital-management
```

### 2. Install Dependencies

```bash
npm install
# or
yarn install
```

### 3. Set Up Supabase

#### Create a Supabase Project

1. Go to [supabase.com](https://supabase.com)
2. Create a new project
3. Wait for the database to be provisioned

#### Run Database Schema

1. Open the Supabase SQL Editor
2. Copy the entire contents of `supabase/schema.sql`
3. Paste and execute in the SQL Editor
4. Verify all tables are created successfully

The schema includes:
- User profiles and authentication
- Departments and facilities
- Patient records
- OPD queue management
- Admissions tracking
- Bed management
- Inventory management (items, categories, batches, transactions)
- Prescription management
- Analytics and reporting
- Automated triggers for stock updates and bed status
- Row Level Security policies

### 4. Configure Environment Variables

Create a `.env.local` file in the root directory:

```bash
cp .env.example .env.local
```

Edit `.env.local` and add your Supabase credentials:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
```

You can find these values in:
- Supabase Dashboard → Settings → API

### 5. Run the Development Server

```bash
npm run dev
# or
yarn dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## 📁 Project Structure

```
hospital-management/
├── app/                          # Next.js App Router
│   ├── dashboard/               # Dashboard pages
│   │   ├── opd/                # OPD Queue Management
│   │   ├── beds/               # Bed Management
│   │   ├── admissions/         # Patient Admissions
│   │   ├── inventory/          # Inventory Management
│   │   ├── patients/           # Patient Records
│   │   ├── prescriptions/      # Prescription Management
│   │   ├── appointments/       # Appointment Scheduling
│   │   ├── settings/           # System Settings
│   │   ├── layout.tsx          # Dashboard layout
│   │   └── page.tsx            # Dashboard home
│   ├── globals.css             # Global styles
│   ├── layout.tsx              # Root layout
│   └── page.tsx                # Landing page
├── components/                  # Reusable components
│   └── Sidebar.tsx             # Navigation sidebar
├── lib/                        # Utility functions
│   ├── supabase/               # Supabase clients
│   │   ├── client.ts           # Browser client
│   │   └── server.ts           # Server client
│   ├── types.ts                # TypeScript types
│   └── utils.ts                # Helper functions
├── supabase/                   # Database schema
│   └── schema.sql              # Complete SQL schema
├── public/                     # Static assets
├── .env.example                # Environment variables template
├── next.config.js              # Next.js configuration
├── tailwind.config.js          # Tailwind CSS configuration
├── tsconfig.json               # TypeScript configuration
└── package.json                # Project dependencies
```

## 🗄️ Database Schema

### Core Tables

#### Profiles
- User authentication and role management
- Roles: admin, doctor, nurse, receptionist, pharmacist, inventory_manager

#### Departments
- Hospital department organization
- Links to head doctors

#### Beds
- Bed inventory and status tracking
- Types: general, ICU, private, semi-private, emergency
- Statuses: available, occupied, maintenance, reserved

#### Patients
- Complete patient records
- Medical history and emergency contacts

#### OPD Queues
- Queue management system
- Priority levels and status tracking
- Consultation time tracking

#### Admissions
- Patient admission records
- Bed assignment integration
- Discharge tracking

#### Inventory System
- Items, categories, batches
- Stock level tracking
- Transaction history
- Expiry date monitoring

### Automated Features

- **Real-time Updates**: Automatic UI updates when data changes
- **Stock Management**: Automatic stock updates on transactions
- **Bed Status**: Auto-update bed status on admission/discharge
- **Triggers**: Database triggers for data consistency
- **RLS Policies**: Row-level security for data protection

## 🎨 UI/UX Features

- **Responsive Design**: Works on desktop, tablet, and mobile
- **Real-time Updates**: Live data synchronization
- **Color-coded Status**: Visual indicators for quick status recognition
- **Interactive Charts**: Data visualization with Recharts
- **Loading States**: Smooth loading animations
- **Error Handling**: Graceful error messages
- **Accessibility**: ARIA labels and keyboard navigation

## 🔐 Security Features

- Row Level Security (RLS) policies
- Role-based access control
- Secure authentication with Supabase Auth
- Environment variable protection
- SQL injection prevention
- XSS protection

## 📊 Key Metrics & Analytics

- OPD patient count (daily, weekly, monthly)
- Bed occupancy rates
- Average wait times
- Inventory turnover
- Stock level alerts
- Admission/discharge statistics

## 🚧 Future Enhancements

- [ ] Patient medical records with file uploads
- [ ] Appointment scheduling system
- [ ] Billing and payment integration
- [ ] Laboratory test management
- [ ] Pharmacy integration
- [ ] Doctor scheduling and availability
- [ ] Patient portal for self-service
- [ ] Mobile app for staff
- [ ] Report generation (PDF exports)
- [ ] Email/SMS notifications
- [ ] Multi-language support
- [ ] Telemedicine integration

## 🔧 Development

### Running in Production

```bash
npm run build
npm start
```

### Linting

```bash
npm run lint
```

## 📝 Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `NEXT_PUBLIC_SUPABASE_URL` | Your Supabase project URL | Yes |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anonymous key | Yes |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role key (server-side only) | Yes |

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License.

## 🙏 Acknowledgments

- Built with [Next.js](https://nextjs.org/)
- Database powered by [Supabase](https://supabase.com/)
- UI components styled with [Tailwind CSS](https://tailwindcss.com/)
- Icons from [Lucide](https://lucide.dev/)

---
