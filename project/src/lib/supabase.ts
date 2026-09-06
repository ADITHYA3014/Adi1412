import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type Profile = {
  id: string;
  role: 'farmer' | 'buyer';
  full_name: string;
  farm_name: string | null;
  location: string | null;
};

export type Product = {
  id: string;
  farmer_id: string;
  name: string;
  category: string;
  price: number;
  unit: string;
  quantity_available: number;
  image_url: string | null;
  badge: string | null;
  created_at: string;
};
