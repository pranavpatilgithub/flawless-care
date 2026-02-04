CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE profiles (
    id UUID REFERENCES auth.users PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    full_name TEXT NOT NULL,
    role TEXT NOT NULL CHECK (role IN ('admin', 'doctor', 'nurse', 'receptionist', 'pharmacist', 'inventory_manager')),
    department TEXT,
    phone TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);


CREATE TABLE departments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    description TEXT,
    head_doctor_id UUID REFERENCES profiles(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE beds (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    bed_number TEXT NOT NULL UNIQUE,
    department_id UUID REFERENCES departments(id),
    bed_type TEXT NOT NULL CHECK (bed_type IN ('general', 'icu', 'private', 'semi-private', 'emergency')),
    status TEXT NOT NULL CHECK (status IN ('available', 'occupied', 'maintenance', 'reserved')) DEFAULT 'available',
    floor_number INTEGER,
    room_number TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);


CREATE TABLE patients (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    patient_number TEXT NOT NULL UNIQUE,
    full_name TEXT NOT NULL,
    date_of_birth DATE NOT NULL,
    gender TEXT CHECK (gender IN ('male', 'female', 'other')),
    blood_group TEXT,
    phone TEXT,
    email TEXT,
    address TEXT,
    emergency_contact_name TEXT,
    emergency_contact_phone TEXT,
    allergies TEXT,
    chronic_conditions TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE opd_queues (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    patient_id UUID REFERENCES patients(id) NOT NULL,
    department_id UUID REFERENCES departments(id) NOT NULL,
    doctor_id UUID REFERENCES profiles(id),
    token_number INTEGER NOT NULL,
    priority TEXT CHECK (priority IN ('normal', 'urgent', 'emergency')) DEFAULT 'normal',
    status TEXT NOT NULL CHECK (status IN ('waiting', 'in_consultation', 'completed', 'cancelled')) DEFAULT 'waiting',
    check_in_time TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    consultation_start_time TIMESTAMP WITH TIME ZONE,
    consultation_end_time TIMESTAMP WITH TIME ZONE,
    symptoms TEXT,
    vitals JSONB,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE admissions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    patient_id UUID REFERENCES patients(id) NOT NULL,
    bed_id UUID REFERENCES beds(id) NOT NULL,
    department_id UUID REFERENCES departments(id) NOT NULL,
    admitting_doctor_id UUID REFERENCES profiles(id) NOT NULL,
    admission_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    discharge_date TIMESTAMP WITH TIME ZONE,
    admission_type TEXT CHECK (admission_type IN ('emergency', 'planned', 'transfer')) NOT NULL,
    status TEXT NOT NULL CHECK (status IN ('admitted', 'discharged', 'transferred')) DEFAULT 'admitted',
    diagnosis TEXT,
    treatment_plan TEXT,
    discharge_summary TEXT,
    total_cost DECIMAL(10, 2),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE inventory_categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL UNIQUE,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE inventory_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    category_id UUID REFERENCES inventory_categories(id) NOT NULL,
    item_type TEXT NOT NULL CHECK (item_type IN ('medicine', 'consumable', 'equipment')),
    description TEXT,
    unit TEXT NOT NULL,
    manufacturer TEXT,
    current_stock INTEGER NOT NULL DEFAULT 0,
    minimum_stock INTEGER NOT NULL DEFAULT 0,
    maximum_stock INTEGER,
    unit_price DECIMAL(10, 2),
    expiry_alert_days INTEGER DEFAULT 30,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE inventory_batches (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    item_id UUID REFERENCES inventory_items(id) NOT NULL,
    batch_number TEXT NOT NULL,
    quantity INTEGER NOT NULL,
    manufacturing_date DATE,
    expiry_date DATE,
    purchase_price DECIMAL(10, 2),
    supplier TEXT,
    status TEXT CHECK (status IN ('active', 'expired', 'recalled')) DEFAULT 'active',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE inventory_transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    item_id UUID REFERENCES inventory_items(id) NOT NULL,
    batch_id UUID REFERENCES inventory_batches(id),
    transaction_type TEXT NOT NULL CHECK (transaction_type IN ('purchase', 'dispensation', 'adjustment', 'return', 'wastage')),
    quantity INTEGER NOT NULL,
    unit_price DECIMAL(10, 2),
    reference_id UUID, -- Can reference admission, opd_queue, etc.
    reference_type TEXT,
    performed_by UUID REFERENCES profiles(id),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE prescriptions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    patient_id UUID REFERENCES patients(id) NOT NULL,
    doctor_id UUID REFERENCES profiles(id) NOT NULL,
    admission_id UUID REFERENCES admissions(id),
    opd_queue_id UUID REFERENCES opd_queues(id),
    status TEXT CHECK (status IN ('pending', 'dispensed', 'cancelled')) DEFAULT 'pending',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE prescription_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    prescription_id UUID REFERENCES prescriptions(id) NOT NULL,
    item_id UUID REFERENCES inventory_items(id) NOT NULL,
    dosage TEXT NOT NULL,
    frequency TEXT NOT NULL,
    duration TEXT NOT NULL,
    quantity INTEGER NOT NULL,
    instructions TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE daily_stats (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    date DATE NOT NULL UNIQUE,
    total_opd_patients INTEGER DEFAULT 0,
    total_admissions INTEGER DEFAULT 0,
    total_discharges INTEGER DEFAULT 0,
    beds_occupied INTEGER DEFAULT 0,
    beds_available INTEGER DEFAULT 0,
    revenue DECIMAL(12, 2) DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_opd_queues_status ON opd_queues(status);
CREATE INDEX idx_opd_queues_date ON opd_queues(DATE(created_at));
CREATE INDEX idx_opd_queues_department ON opd_queues(department_id);
CREATE INDEX idx_beds_status ON beds(status);
CREATE INDEX idx_beds_department ON beds(department_id);
CREATE INDEX idx_admissions_status ON admissions(status);
CREATE INDEX idx_admissions_patient ON admissions(patient_id);
CREATE INDEX idx_inventory_items_stock ON inventory_items(current_stock);
CREATE INDEX idx_inventory_batches_expiry ON inventory_batches(expiry_date);
CREATE INDEX idx_prescriptions_status ON prescriptions(status);

-- Update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_beds_updated_at BEFORE UPDATE ON beds
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_patients_updated_at BEFORE UPDATE ON patients
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_admissions_updated_at BEFORE UPDATE ON admissions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_inventory_items_updated_at BEFORE UPDATE ON inventory_items
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Update bed status when admission status changes
CREATE OR REPLACE FUNCTION update_bed_status_on_admission()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.status = 'admitted' THEN
        UPDATE beds SET status = 'occupied' WHERE id = NEW.bed_id;
    ELSIF NEW.status IN ('discharged', 'transferred') THEN
        UPDATE beds SET status = 'available' WHERE id = NEW.bed_id;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_bed_status AFTER INSERT OR UPDATE ON admissions
    FOR EACH ROW EXECUTE FUNCTION update_bed_status_on_admission();

-- Update inventory stock on transaction
CREATE OR REPLACE FUNCTION update_inventory_stock()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.transaction_type IN ('purchase', 'return') THEN
        UPDATE inventory_items 
        SET current_stock = current_stock + NEW.quantity 
        WHERE id = NEW.item_id;
    ELSIF NEW.transaction_type IN ('dispensation', 'wastage') THEN
        UPDATE inventory_items 
        SET current_stock = current_stock - NEW.quantity 
        WHERE id = NEW.item_id;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_inventory_stock AFTER INSERT ON inventory_transactions
    FOR EACH ROW EXECUTE FUNCTION update_inventory_stock();


ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE departments ENABLE ROW LEVEL SECURITY;
ALTER TABLE beds ENABLE ROW LEVEL SECURITY;
ALTER TABLE patients ENABLE ROW LEVEL SECURITY;
ALTER TABLE opd_queues ENABLE ROW LEVEL SECURITY;
ALTER TABLE admissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory_batches ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE prescriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE prescription_items ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users to read their own profile
CREATE POLICY "Users can view own profile" ON profiles
    FOR SELECT USING (auth.uid() = id);

-- Allow all authenticated users to read departments
CREATE POLICY "All users can view departments" ON departments
    FOR SELECT USING (auth.role() = 'authenticated');

-- Allow all authenticated users to view beds
CREATE POLICY "All users can view beds" ON beds
    FOR SELECT USING (auth.role() = 'authenticated');

-- Allow doctors and nurses to update beds
CREATE POLICY "Medical staff can update beds" ON beds
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE profiles.id = auth.uid() 
            AND profiles.role IN ('doctor', 'nurse', 'admin')
        )
    );

-- Allow all authenticated users to view patients
CREATE POLICY "All users can view patients" ON patients
    FOR SELECT USING (auth.role() = 'authenticated');

-- Allow medical staff to create/update patients
CREATE POLICY "Medical staff can manage patients" ON patients
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE profiles.id = auth.uid() 
            AND profiles.role IN ('doctor', 'nurse', 'receptionist', 'admin')
        )
    );

-- Insert default departments
INSERT INTO departments (name, description) VALUES
    ('Emergency', 'Emergency and trauma care'),
    ('General Medicine', 'General medical consultation'),
    ('Cardiology', 'Heart and cardiovascular care'),
    ('Orthopedics', 'Bone and joint care'),
    ('Pediatrics', 'Child healthcare'),
    ('Gynecology', 'Women health care');

-- Insert inventory categories
INSERT INTO inventory_categories (name, description) VALUES
    ('Antibiotics', 'Antibiotic medications'),
    ('Painkillers', 'Pain relief medications'),
    ('Surgical Supplies', 'Surgical consumables'),
    ('Diagnostic Equipment', 'Medical diagnostic tools'),
    ('General Consumables', 'General medical supplies');

-- Insert sample beds (you can modify based on your hospital)
DO $$
DECLARE
    dept RECORD;
    bed_count INTEGER;
    bed_type TEXT;
BEGIN
    FOR dept IN SELECT id, name FROM departments LOOP
        FOR i IN 1..10 LOOP
            IF i <= 6 THEN
                bed_type := 'general';
            ELSIF i <= 8 THEN
                bed_type := 'semi-private';
            ELSE
                bed_type := 'icu';
            END IF;
            
            INSERT INTO beds (bed_number, department_id, bed_type, floor_number, room_number)
            VALUES (
                dept.name || '-' || i,
                dept.id,
                bed_type,
                (i / 3) + 1,
                'R' || i
            );
        END LOOP;
    END LOOP;
END $$;
