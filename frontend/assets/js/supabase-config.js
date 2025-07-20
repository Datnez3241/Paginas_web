// Configuración de Supabase
const SUPABASE_URL = 'https://zgvrrprekjsmbsmlavaw.supabase.co';
const SUPABASE_ANON_KEY = 'tu_clave_anonima_aqui'; // Reemplaza con tu clave anónima

// Inicializa el cliente Supabase
const supabase = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  }
});

// Exporta la instancia de Supabase para usarla en otros archivos
window.supabase = supabase;
