/*
# Create profiles and products tables for AgriDirect marketplace

## Overview
Adds a multi-user schema with two roles (farmer and buyer). Farmers can list
and manage their own produce; buyers can browse all produce. Auth is handled by
Supabase Auth (email/password). A `profiles` table stores the user's role
(farmer/buyer) and display name. A `products` table stores produce listings
owned by farmers.

## New Tables

### profiles
- `id` (uuid, primary key, references auth.users) — one row per user
- `role` (text, not null) — either 'farmer' or 'buyer'
- `full_name` (text, not null) — display name
- `farm_name` (text, nullable) — farm/FPO name, only for farmers
- `location` (text, nullable) — location string
- `created_at` (timestamptz, default now())

### products
- `id` (uuid, primary key)
- `farmer_id` (uuid, not null, references profiles, defaults to auth.uid())
- `name` (text, not null) — product name
- `category` (text, not null) — e.g. Vegetables, Grains, Fruits, Spices
- `price` (numeric, not null) — price per unit
- `unit` (text, not null, default 'per kg')
- `quantity_available` (integer, not null, default 0)
- `image_url` (text, nullable) — product photo URL
- `badge` (text, nullable) — e.g. 'Harvested today'
- `created_at` (timestamptz, default now())

## Security

### profiles
- RLS enabled.
- Users can read all profiles (needed so buyers can see farmer info).
- Users can insert/update only their own profile row.

### products
- RLS enabled.
- Anyone (anon + authenticated) can SELECT products — marketplace browsing.
- Only the owning farmer can INSERT/UPDATE/DELETE their products.

## Notes
1. `profiles.id` defaults to `auth.uid()` so the insert from the signup flow
   succeeds even when the client omits the id.
2. `products.farmer_id` defaults to `auth.uid()` for the same reason.
3. A trigger auto-creates a profile row when a new auth user signs up.
*/

-- Profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  role text NOT NULL CHECK (role IN ('farmer', 'buyer')),
  full_name text NOT NULL,
  farm_name text,
  location text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "profiles_select_all" ON profiles;
CREATE POLICY "profiles_select_all"
  ON profiles FOR SELECT
  TO authenticated USING (true);

DROP POLICY IF EXISTS "profiles_insert_own" ON profiles;
CREATE POLICY "profiles_insert_own"
  ON profiles FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "profiles_update_own" ON profiles;
CREATE POLICY "profiles_update_own"
  ON profiles FOR UPDATE
  TO authenticated USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

-- Products table
CREATE TABLE IF NOT EXISTS products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  farmer_id uuid NOT NULL DEFAULT auth.uid() REFERENCES profiles(id) ON DELETE CASCADE,
  name text NOT NULL,
  category text NOT NULL,
  price numeric NOT NULL,
  unit text NOT NULL DEFAULT 'per kg',
  quantity_available integer NOT NULL DEFAULT 0,
  image_url text,
  badge text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE products ENABLE ROW LEVEL SECURITY;

-- Anyone can browse products (marketplace is public)
DROP POLICY IF EXISTS "products_select_all" ON products;
CREATE POLICY "products_select_all"
  ON products FOR SELECT
  TO anon, authenticated USING (true);

-- Only the owning farmer can modify their products
DROP POLICY IF EXISTS "products_insert_own" ON products;
CREATE POLICY "products_insert_own"
  ON products FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = farmer_id);

DROP POLICY IF EXISTS "products_update_own" ON products;
CREATE POLICY "products_update_own"
  ON products FOR UPDATE
  TO authenticated USING (auth.uid() = farmer_id) WITH CHECK (auth.uid() = farmer_id);

DROP POLICY IF EXISTS "products_delete_own" ON products;
CREATE POLICY "products_delete_own"
  ON products FOR DELETE
  TO authenticated USING (auth.uid() = farmer_id);

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, role, full_name)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'role', 'buyer'),
    COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1))
  );
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
