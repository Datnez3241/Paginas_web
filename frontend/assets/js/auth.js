// Funciones de autenticación con Supabase

// Registrar un nuevo usuario
async function signUp(email, password, fullName) {
  try {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName
        }
      }
    });
    
    if (error) throw error;
    return { success: true, data };
  } catch (error) {
    console.error('Error al registrar usuario:', error);
    return { success: false, error: error.message };
  }
}

// Iniciar sesión
async function signIn(email, password) {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });
    
    if (error) throw error;
    return { success: true, data };
  } catch (error) {
    console.error('Error al iniciar sesión:', error);
    return { success: false, error: error.message };
  }
}

// Cerrar sesión
async function signOut() {
  try {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
    return { success: true };
  } catch (error) {
    console.error('Error al cerrar sesión:', error);
    return { success: false, error: error.message };
  }
}

// Obtener la sesión actual
async function getCurrentSession() {
  const { data: { session } } = await supabase.auth.getSession();
  return session;
}

// Obtener el usuario actual
async function getCurrentUser() {
  const { data: { user } } = await supabase.auth.getUser();
  return user;
}

// Escuchar cambios en el estado de autenticación
function onAuthStateChange(callback) {
  return supabase.auth.onAuthStateChange((event, session) => {
    callback(event, session);
  });
}

// Verificar si el usuario está autenticado
async function isAuthenticated() {
  const session = await getCurrentSession();
  return !!session;
}

// Exportar funciones al objeto window para acceso global
window.auth = {
  signUp,
  signIn,
  signOut,
  getCurrentSession,
  getCurrentUser,
  onAuthStateChange,
  isAuthenticated
};
