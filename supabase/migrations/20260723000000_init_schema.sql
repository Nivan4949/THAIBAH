-- ========================================================
-- THAIBAH TRAVELS BOOKING MANAGEMENT SYSTEM
-- Initial Database Migration (PostgreSQL / Supabase)
-- ========================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- --------------------------------------------------------
-- 1. ADMINS TABLE
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.admins (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- --------------------------------------------------------
-- 2. BOOKINGS TABLE
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.bookings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    booking_id TEXT UNIQUE NOT NULL,
    guest_name TEXT NOT NULL,
    phone TEXT NOT NULL,
    email TEXT,
    adults INTEGER NOT NULL DEFAULT 1,
    children INTEGER NOT NULL DEFAULT 0,
    total_pax INTEGER NOT NULL DEFAULT 1,
    package_name TEXT NOT NULL,
    booking_date DATE NOT NULL DEFAULT CURRENT_DATE,
    travel_date DATE NOT NULL,
    pickup_location TEXT NOT NULL,
    dropoff_location TEXT NOT NULL,
    seat_numbers TEXT,
    reporting_time TEXT,
    departure_time TEXT,
    package_amount NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    advance_paid NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    balance_amount NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    payment_status TEXT NOT NULL CHECK (payment_status IN ('Paid', 'Advance Paid', 'Pending')),
    booking_status TEXT NOT NULL CHECK (booking_status IN ('Confirmed', 'Pending', 'Cancelled')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for searching and filtering bookings
CREATE INDEX IF NOT EXISTS idx_bookings_booking_id ON public.bookings (booking_id);
CREATE INDEX IF NOT EXISTS idx_bookings_guest_name ON public.bookings (guest_name);
CREATE INDEX IF NOT EXISTS idx_bookings_phone ON public.bookings (phone);
CREATE INDEX IF NOT EXISTS idx_bookings_travel_date ON public.bookings (travel_date);
CREATE INDEX IF NOT EXISTS idx_bookings_status ON public.bookings (booking_status);
CREATE INDEX IF NOT EXISTS idx_bookings_payment_status ON public.bookings (payment_status);

-- --------------------------------------------------------
-- 3. SETTINGS TABLE
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.settings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_name TEXT NOT NULL DEFAULT 'Thaibah Travels',
    logo TEXT DEFAULT '',
    address TEXT DEFAULT 'Chenguvetty, Kottakkal, Malappuram, Kerala, India',
    phone TEXT DEFAULT '+91 98765 43210 / +91 94000 12345',
    email TEXT DEFAULT 'info@thaibahtravels.com',
    footer_text TEXT DEFAULT 'Thaibah Travels — Malappuram, Kerala, India',
    operating_by TEXT DEFAULT 'Thaibah Travels Hyderabad',
    terms_conditions TEXT DEFAULT '• Report 30 minutes before departure.\n• Carry valid government ID.\n• Seat numbers may change due to operational reasons.\n• Company isn''t responsible for delays due to weather or traffic.\n• Cancellation policy applies.\n• Smoking and alcohol are prohibited.\n• Passengers are responsible for their own belongings.',
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- --------------------------------------------------------
-- 4. ACTIVITY LOGS TABLE
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.activity_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    action TEXT NOT NULL,
    details TEXT NOT NULL,
    booking_id TEXT,
    user_name TEXT DEFAULT 'Admin',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- --------------------------------------------------------
-- 5. AUTO BOOKING ID GENERATOR SEQUENCE & FUNCTION
-- --------------------------------------------------------
CREATE SEQUENCE IF NOT EXISTS booking_id_seq START WITH 1;

CREATE OR REPLACE FUNCTION generate_next_booking_id()
RETURNS TEXT AS $$
DECLARE
    next_val INT;
    formatted_id TEXT;
BEGIN
    SELECT nextval('booking_id_seq') INTO next_val;
    formatted_id := 'TB' || LPAD(next_val::TEXT, 6, '0');
    RETURN formatted_id;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_bookings_updated_at
BEFORE UPDATE ON public.bookings
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- --------------------------------------------------------
-- 6. ROW LEVEL SECURITY (RLS) POLICIES
-- --------------------------------------------------------
ALTER TABLE public.admins ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activity_logs ENABLE ROW LEVEL SECURITY;

-- Allow authenticated admins full access
CREATE POLICY "Allow full access to authenticated admins"
    ON public.admins FOR ALL
    USING (auth.role() = 'authenticated');

CREATE POLICY "Allow full access to bookings for authenticated users"
    ON public.bookings FOR ALL
    USING (auth.role() = 'authenticated');

CREATE POLICY "Allow full access to settings for authenticated users"
    ON public.settings FOR ALL
    USING (auth.role() = 'authenticated');

CREATE POLICY "Allow full access to activity logs for authenticated users"
    ON public.activity_logs FOR ALL
    USING (auth.role() = 'authenticated');

-- Public read access for settings (e.g. for ticket views)
CREATE POLICY "Allow public read access to settings"
    ON public.settings FOR SELECT
    USING (true);

-- --------------------------------------------------------
-- 7. INITIAL SEED DATA
-- --------------------------------------------------------
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
