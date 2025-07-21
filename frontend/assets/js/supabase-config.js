// ===== CONFIGURACIÓN FINAL PARA TU PROYECTO =====

// Opción A: Para HTML puro (usando CDN)
// Usar en tu archivo HTML actual
const SUPABASE_URL = 'https://zgvrrprekjsmbsmlavaw.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpndnJycHJla2pzbWJzbWxhdmF3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTMwMzk0ODAsImV4cCI6MjA2ODYxNTQ4MH0.G68U8d3iYM6HiPV70o7rn-ebVpU0kkYYlwG-P6fNMtE';

// Inicializar cliente con CDN
const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// ===== FUNCIONES DE AUTENTICACIÓN =====

// Función de Login
async function loginUser(email, password) {
    try {
        const { data, error } = await supabase.auth.signInWithPassword({
            email: email,
            password: password,
        });
        
        if (error) {
            console.error('Error de login:', error.message);
            return { success: false, error: error.message };
        }
        
        console.log('Login exitoso:', data);
        return { success: true, user: data.user };
    } catch (err) {
        console.error('Error inesperado:', err);
        return { success: false, error: 'Error inesperado' };
    }
}

// Función de Registro
async function registerUser(nombre_completo, email, password) {
    try {
        const { data, error } = await supabase.auth.signUp({
            nombre_completo: nombre_completo,
            email: email,
            password: password,
        });
        
        if (error) {
            console.error('Error de registro:', error.message);
            return { success: false, error: error.message };
        }
        
        console.log('Registro exitoso:', data);
        return { success: true, user: data.user };
    } catch (err) {
        console.error('Error inesperado:', err);
        return { success: false, error: 'Error inesperado' };
    }
}

// Función para cerrar sesión
async function logoutUser() {
    try {
        const { error } = await supabase.auth.signOut();
        if (error) {
            console.error('Error al cerrar sesión:', error.message);
            return { success: false, error: error.message };
        }
        return { success: true };
    } catch (err) {
        console.error('Error inesperado:', err);
        return { success: false, error: 'Error inesperado' };
    }
}

// Función para recuperar contraseña
async function resetPassword(email) {
    try {
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
            redirectTo: window.location.origin + '/reset-password'
        });
        
        if (error) {
            console.error('Error al enviar email:', error.message);
            return { success: false, error: error.message };
        }
        
        return { success: true };
    } catch (err) {
        console.error('Error inesperado:', err);
        return { success: false, error: 'Error inesperado' };
    }
}

// Verificar estado de autenticación
supabase.auth.onAuthStateChange((event, session) => {
    console.log('Estado de auth cambió:', event, session);
    
    if (event === 'SIGNED_IN') {
        console.log('Usuario logueado:', session.user.email);
        // Redireccionar o actualizar UI
        // window.location.href = '/dashboard';
    } else if (event === 'SIGNED_OUT') {
        console.log('Usuario deslogueado');
        // Redireccionar a login
        // window.location.href = '/login';
    }
});

// ===== PARA PROYECTOS CON NPM/BUILD (React, Vue, etc.) =====
/*
// Opción B: Para proyectos con bundler (como React/Vue)
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://zgvrrprekjsmbsmlavaw.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpndnJycHJla2pzbWJzbWxhdmF3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTMwMzk0ODAsImV4cCI6MjA2ODYxNTQ4MH0.G68U8d3iYM6HiPV70o7rn-ebVpU0kkYYlwG-P6fNMtE'

const supabase = createClient(supabaseUrl, supabaseKey)
export default supabase;
*/