const { createClient } = require('@supabase/supabase-js');
const SUPABASE_URL = 'https://wexuhdsfvxccqyjphzbo.supabase.co';
const SUPABASE_SERVICE_ROLE_KEY = 'sb_secret_P4pUcv3aak7RqO0DrUojKQ_VL9_qakG';

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

module.exports = supabase;


