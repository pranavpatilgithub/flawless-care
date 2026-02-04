# Quick Start Guide

Get your Hospital Management System up and running in 10 minutes!

## 🚀 Quick Setup (5 Steps)

### Step 1: Prerequisites Check
```bash
node --version  # Should be 18.x or higher
npm --version   # Should be 9.x or higher
```

### Step 2: Install Dependencies
```bash
npm install
```

### Step 3: Supabase Setup

1. **Create Account & Project**
   - Visit [supabase.com](https://supabase.com)
   - Create new project
   - Wait ~2 minutes for provisioning

2. **Run Database Schema**
   - Open SQL Editor in Supabase Dashboard
   - Copy entire `supabase/schema.sql` file
   - Paste and execute
   - ✅ Verify tables are created

3. **Get API Keys**
   - Go to Settings → API
   - Copy:
     - Project URL
     - anon/public key
     - service_role key

### Step 4: Environment Configuration
```bash
# Create environment file
cp .env.example .env.local

# Edit with your Supabase credentials
# Use your favorite editor (nano, vim, vscode)
nano .env.local
```

Paste your Supabase credentials:
```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### Step 5: Start Development Server
```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000) 🎉

## 📊 Testing with Sample Data

The database schema automatically creates sample data:
- 6 departments (Emergency, General Medicine, Cardiology, etc.)
- 60 beds across departments
- 5 inventory categories

### Add Your First Patient

1. Navigate to OPD Queue page
2. Click "Add Patient to Queue"
3. Or use the dashboard quick actions

### Manage Beds

1. Go to Beds page
2. View real-time bed availability
3. Change bed status with one click

## 🎯 Key Features to Try

### 1. OPD Queue Management
```
Dashboard → OPD Queue
- Add patient to queue
- Watch real-time updates
- Start consultation
- Complete visit
```

### 2. Bed Management
```
Dashboard → Beds
- Filter by department/type/status
- Update bed status
- View occupancy rates
```

### 3. Inventory Tracking
```
Dashboard → Inventory
- Check stock levels
- View critical items
- Monitor expiring batches
```

### 4. Patient Admissions
```
Dashboard → Admissions
- Admit new patient
- Assign bed
- Track admission duration
- Discharge patient
```

## 🔧 Common Issues & Solutions

### Issue: "Module not found"
```bash
# Solution: Reinstall dependencies
rm -rf node_modules package-lock.json
npm install
```

### Issue: "Supabase connection failed"
```bash
# Solution: Check environment variables
# 1. Verify .env.local exists
# 2. Ensure no extra spaces in values
# 3. Restart dev server after changes
```

### Issue: "Database error"
```bash
# Solution: Verify schema
# 1. Open Supabase SQL Editor
# 2. Run: SELECT * FROM pg_tables WHERE schemaname = 'public';
# 3. Ensure all tables exist
```

### Issue: Port 3000 already in use
```bash
# Solution: Use different port
PORT=3001 npm run dev
```

## 📱 Navigation Guide

```
Hospital Management System
├── Dashboard (/)
│   ├── Statistics overview
│   ├── Charts & graphs
│   └── Quick actions
├── OPD Queue (/dashboard/opd)
│   ├── Token management
│   ├── Real-time queue
│   └── Status updates
├── Patients (/dashboard/patients)
│   └── Patient records
├── Beds (/dashboard/beds)
│   ├── Availability grid
│   ├── Status management
│   └── Occupancy stats
├── Admissions (/dashboard/admissions)
│   ├── Active admissions
│   ├── Discharge management
│   └── History
├── Inventory (/dashboard/inventory)
│   ├── Stock tracking
│   ├── Critical alerts
│   └── Expiry monitoring
├── Prescriptions (/dashboard/prescriptions)
├── Appointments (/dashboard/appointments)
└── Settings (/dashboard/settings)
```

## 🎨 Customization

### Change Theme Colors
Edit `tailwind.config.js`:
```javascript
colors: {
  primary: {
    500: '#0ea5e9',  // Change this
    600: '#0284c7',  // And this
    // ...
  }
}
```

### Update Hospital Name
Edit `components/Sidebar.tsx`:
```tsx
<span className="ml-3 text-xl font-bold">Your Hospital Name</span>
```

### Add New Department
Run in Supabase SQL Editor:
```sql
INSERT INTO departments (name, description) 
VALUES ('Neurology', 'Brain and nervous system care');
```

## 📚 Next Steps

1. **Explore Features**
   - Test OPD queue workflow
   - Try bed management
   - Add inventory items

2. **Read Documentation**
   - [README.md](README.md) - Full documentation
   - [DEPLOYMENT.md](DEPLOYMENT.md) - Deployment guide

3. **Customize**
   - Add your hospital logo
   - Configure departments
   - Set up user roles

4. **Deploy**
   - Push to GitHub
   - Deploy to Vercel (free)
   - Configure production environment

## 🆘 Need Help?

- **Documentation**: See README.md
- **Database Schema**: Check supabase/schema.sql
- **Deployment**: Read DEPLOYMENT.md
- **Issues**: Open GitHub issue

## ✅ Verification Checklist

Before moving to production:

- [ ] All dependencies installed
- [ ] Database schema executed successfully
- [ ] Environment variables configured
- [ ] Development server runs without errors
- [ ] Can navigate all pages
- [ ] Can create/update records
- [ ] Real-time updates working
- [ ] No console errors

## 🎊 You're Ready!

Your Hospital Management System is now ready to use!

### What You Can Do Now:
✅ Manage OPD queues in real-time  
✅ Track bed availability  
✅ Handle patient admissions  
✅ Monitor inventory levels  
✅ View analytics and reports  

---

**Pro Tip**: Keep the Supabase dashboard open in another tab to see database changes in real-time!
