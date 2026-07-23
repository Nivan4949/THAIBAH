-- =========================================================
-- THAIBAH TRAVELS BOOKING MANAGEMENT SYSTEM
-- SUPABASE POSTGRESQL DATABASE INITIAL SCHEMA & MIGRATIONS
-- =========================================================

-- 1. EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. SEQUENCES FOR AUTOMATIC BOOKING CODES (TB000001, TB000002, etc.)
CREATE SEQUENCE IF NOT EXISTS booking_id_seq START WITH 1 INCREMENT BY 1;

-- Function to generate padded booking code: TB000001
CREATE OR REPLACE FUNCTION generate_booking_code()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.booking_id IS NULL OR NEW.booking_id = '' THEN
        NEW.booking_id := 'TB' || LPAD(nextval('booking_id_seq')::text, 6, '0');
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 3. TABLES DEFINITIONS

-- Table: admins
CREATE TABLE IF NOT EXISTS public.admins (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    role TEXT DEFAULT 'admin',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Table: bookings
CREATE TABLE IF NOT EXISTS public.bookings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    booking_id TEXT UNIQUE NOT NULL,
    guest_name TEXT NOT NULL,
    phone TEXT NOT NULL,
    email TEXT,
    travel_date DATE NOT NULL,
    package_name TEXT NOT NULL,
    total_pax INTEGER NOT NULL DEFAULT 1,
    adults INTEGER NOT NULL DEFAULT 1,
    children INTEGER NOT NULL DEFAULT 0,
    pickup_location TEXT NOT NULL,
    dropoff_location TEXT NOT NULL,
    reporting_time TEXT,
    departure_time TEXT,
    seat_numbers TEXT,
    package_amount NUMERIC(12,2) NOT NULL DEFAULT 0.00,
    advance_paid NUMERIC(12,2) NOT NULL DEFAULT 0.00,
    balance_amount NUMERIC(12,2) NOT NULL DEFAULT 0.00,
    payment_status TEXT NOT NULL DEFAULT 'Pending', -- 'Paid', 'Advance Paid', 'Pending'
    booking_status TEXT NOT NULL DEFAULT 'Confirmed', -- 'Confirmed', 'Pending', 'Cancelled'
    notes TEXT,
    created_by TEXT DEFAULT 'Admin',
    booking_date DATE DEFAULT CURRENT_DATE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Table: settings (Singleton Company Identity)
CREATE TABLE IF NOT EXISTS public.settings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_name TEXT NOT NULL DEFAULT 'Thaibah Travels',
    logo TEXT DEFAULT '/logo-official.svg',
    address TEXT DEFAULT 'Chenguvetty, Kottakkal, Malappuram, Kerala, India',
    phone TEXT DEFAULT '+91 98765 43210 / +91 94000 12345',
    email TEXT DEFAULT 'info@thaibahtravels.com',
    footer_text TEXT DEFAULT 'Thaibah Travels — Malappuram, Kerala, India',
    operating_by TEXT DEFAULT 'Thaibah Travels Hyderabad',
    terms_conditions TEXT DEFAULT '• Report 30 minutes before departure.
• Carry valid government ID.
• Seat numbers may change due to operational reasons.
• Company is not responsible for delays due to weather or traffic.
• Cancellation policy applies as per booking terms.
• Smoking and alcohol consumption strictly prohibited.
• Passengers are responsible for personal belongings.',
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Table: activity_logs
CREATE TABLE IF NOT EXISTS public.activity_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    action TEXT NOT NULL,
    booking_id TEXT,
    details TEXT,
    user_name TEXT DEFAULT 'Admin',
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. TRIGGERS

-- Trigger: Auto generate padded booking ID before insert
DROP TRIGGER IF EXISTS trigger_generate_booking_code ON public.bookings;
CREATE TRIGGER trigger_generate_booking_code
BEFORE INSERT ON public.bookings
FOR EACH ROW
EXECUTE FUNCTION generate_booking_code();

-- Function: Auto update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_bookings_updated_at ON public.bookings;
CREATE TRIGGER update_bookings_updated_at
BEFORE UPDATE ON public.bookings
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- 5. ROW LEVEL SECURITY (RLS) POLICIES
ALTER TABLE public.admins ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activity_logs ENABLE ROW LEVEL SECURITY;

-- Allow full public access to settings & bookings so updates persist in Supabase across all devices!
DROP POLICY IF EXISTS "Allow public full access to settings" ON public.settings;
CREATE POLICY "Allow public full access to settings"
    ON public.settings FOR ALL
    USING (true)
    WITH CHECK (true);

DROP POLICY IF EXISTS "Allow public full access to bookings" ON public.bookings;
CREATE POLICY "Allow public full access to bookings"
    ON public.bookings FOR ALL
    USING (true)
    WITH CHECK (true);

DROP POLICY IF EXISTS "Allow public full access to activity logs" ON public.activity_logs;
CREATE POLICY "Allow public full access to activity logs"
    ON public.activity_logs FOR ALL
    USING (true)
    WITH CHECK (true);

-- 6. INITIAL SEED DATA
INSERT INTO public.settings (company_name, address, phone, email, footer_text, operating_by)
VALUES (
    'Thaibah Travels',
    'Chenguvetty, Kottakkal, Malappuram, Kerala, India',
    '+91 98765 43210 / +91 94000 12345',
    'info@thaibahtravels.com',
    'Thaibah Travels — Malappuram, Kerala, India',
    'Thaibah Travels Hyderabad'
)
ON CONFLICT DO NOTHING;
