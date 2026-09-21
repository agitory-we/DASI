import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://mqqkbudvnrlpexkonlyp.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'sb_publishable_QaJbxq7lKASow7lpdZUzfw_D2QFuPxS';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
