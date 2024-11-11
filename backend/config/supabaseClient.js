const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');

// Laden der Umgebungsvariablen
dotenv.config({ path: './backend/config/.env' });

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseAnonKey);

module.exports = supabase;
