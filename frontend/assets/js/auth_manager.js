// auth-manager.js - Gestor centralizado de autenticación con recuperación de contraseña
class AuthManager {
    // Estados de autenticación
    static AUTH_STATES = {
        AUTHENTICATED: 'authenticated',
        UNAUTHENTICATED: 'unauthenticated',
        LOADING: 'loading',
        ERROR: 'error'
    };

    // Eventos personalizados
    static EVENTS = {
        AUTH_STATE_CHANGED: 'authStateChanged',
        LOGIN_SUCCESS: 'loginSuccess',
        LOGIN_ERROR: 'loginError',
        LOGOUT_SUCCESS: 'logoutSuccess',
        PROFILE_UPDATED: 'profileUpdated',
        PASSWORD_RESET_SENT: 'passwordResetSent',
        PASSWORD_RESET_ERROR: 'passwordResetError'
    };
    
    constructor() {
        this.initialized = false;
        this.currentUser = null;
        this.currentProfile = null;
        this.authState = AuthManager.AUTH_STATES.LOADING;
        this.eventTarget = new EventTarget();
    }

    // Método para suscribirse a eventos
    on(event, callback) {
        this.eventTarget.addEventListener(event, callback);
        return () => this.eventTarget.removeEventListener(event, callback);
    }

    // Disparar eventos personalizados
    _dispatchEvent(event, detail = {}) {
        const customEvent = new CustomEvent(event, { 
            detail: { ...detail, authState: this.authState, user: this.currentUser }
        });
        this.eventTarget.dispatchEvent(customEvent);
    }

    // Inicializar el gestor de autenticación
    async init() {
        if (this.initialized) return;
        
        try {
            // Verificar si Supabase está disponible
            if (typeof supabase === 'undefined') {
                const error = new Error('Supabase no está disponible');
                this._handleError(error);
                return;
            }
            
            this._setAuthState(AuthManager.AUTH_STATES.LOADING);

            // Obtener sesión actual
            const { data: { session }, error } = await supabase.auth.getSession();
            if (error) {
                this._handleError(error);
                return;
            }

            if (session) {
                this.currentUser = session.user;
                await this.loadUserProfile();
                this._setAuthState(AuthManager.AUTH_STATES.AUTHENTICATED);
            } else {
                this._setAuthState(AuthManager.AUTH_STATES.UNAUTHENTICATED);
            }

            // Configurar listener para cambios de estado
            supabase.auth.onAuthStateChange(async (event, session) => {
                console.log('Estado de auth cambió:', event);
                
                if (event === 'SIGNED_IN' && session) {
                    this.currentUser = session.user;
                    await this.loadUserProfile();
                    this._setAuthState(AuthManager.AUTH_STATES.AUTHENTICATED);
                } else if (event === 'SIGNED_OUT') {
                    this.currentUser = null;
                    this.currentProfile = null;
                    this._setAuthState(AuthManager.AUTH_STATES.UNAUTHENTICATED);
                } else if (event === 'PASSWORD_RECOVERY') {
                    console.log('🔐 Proceso de recuperación de contraseña iniciado');
                }
                
                // Actualizar UI en todas las páginas
                await this.updateHeaderUI();
            });

            // Actualizar UI inicial
            await this.updateHeaderUI();
            this.initialized = true;
            this._dispatchEvent(AuthManager.EVENTS.AUTH_STATE_CHANGED, { 
                state: this.authState 
            });
        } catch (error) {
            this._handleError(error);
        }
    }

    // Manejo de errores centralizado
    _handleError(error, context = 'Error en AuthManager') {
        console.error(`${context}:`, error);
        this._setAuthState(AuthManager.AUTH_STATES.ERROR, error);
        return { success: false, error };
    }

    // Actualizar estado de autenticación
    _setAuthState(state, error = null) {
        this.authState = state;
        this._dispatchEvent(AuthManager.EVENTS.AUTH_STATE_CHANGED, { 
            state, 
            error,
            user: this.currentUser,
            profile: this.currentProfile
        });
    }

    // Cargar perfil del usuario
    async loadUserProfile() {
        if (!this.currentUser) return { success: false, error: 'No hay usuario autenticado' };
        
        try {
            console.log('🔍 Cargando perfil del usuario:', this.currentUser.id);
            
            const { data: profile, error } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', this.currentUser.id)
                .single();

            if (error) {
                console.warn('⚠️ Perfil no encontrado, creando uno nuevo...', error);
                // Crear perfil si no existe
                return await this.createUserProfile();
            } else {
                console.log('✅ Perfil cargado:', profile);
                this.currentProfile = profile;
                this._dispatchEvent(AuthManager.EVENTS.PROFILE_UPDATED, { profile });
                return { success: true, profile };
            }
        } catch (error) {
            return this._handleError(error, 'Error al cargar perfil del usuario');
        }
    }

    // Crear perfil de usuario si no existe
    async createUserProfile() {
        if (!this.currentUser) {
            return { success: false, error: 'No hay usuario autenticado' };
        }

        try {
            console.log('📝 Creando perfil para usuario:', this.currentUser);
            
            // Obtener el nombre desde diferentes fuentes
            let nombre = 'Usuario'; // Valor por defecto
            
            // Prioridad 1: user_metadata.nombre_completo
            if (this.currentUser.user_metadata?.nombre_completo) {
                nombre = this.currentUser.user_metadata.nombre_completo;
                console.log('✅ Nombre desde user_metadata.nombre_completo:', nombre);
            }
            // Prioridad 2: user_metadata.full_name  
            else if (this.currentUser.user_metadata?.full_name) {
                nombre = this.currentUser.user_metadata.full_name;
                console.log('✅ Nombre desde user_metadata.full_name:', nombre);
            }
            // Prioridad 3: primera parte del email
            else if (this.currentUser.email) {
                const emailPart = this.currentUser.email.split('@')[0];
                if (emailPart && emailPart !== 'usuario') {
                    nombre = emailPart;
                    console.log('✅ Nombre desde email:', nombre);
                }
            }
            
            console.log('📝 Nombre final para el perfil:', nombre);

            const profileData = {
                id: this.currentUser.id,
                nombre: nombre,
                email: this.currentUser.email,
                rol: 'cliente',
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
            };

            console.log('📝 Datos del perfil a crear:', profileData);

            const { data, error } = await supabase
                .from('profiles')
                .insert([profileData])
                .select()
                .single();

            if (error) {
                console.error('❌ Error al crear perfil:', error);
                return this._handleError(error, 'Error al crear perfil');
            }    
            
            console.log('✅ Perfil creado exitosamente:', data);
            this.currentProfile = data;
            this._dispatchEvent(AuthManager.EVENTS.PROFILE_UPDATED, { profile: data });
            return { success: true, profile: data };
        } catch (error) {
            console.error('❌ Error inesperado al crear perfil:', error);
            return this._handleError(error, 'Error inesperado al crear perfil');
        }
    }

    // Actualizar interfaz del header - CORREGIDO PARA EVITAR DUPLICACIÓN
    async updateHeaderUI() {
        try {
            const isAuthenticated = !!this.currentUser;
            console.log('🔄 Actualizando UI del header. Autenticado:', isAuthenticated);
            
            // Elementos del header
            const userNameElement = document.getElementById('userName');
            const userDisplayName = document.getElementById('userDisplayName');
            const userInfoHeader = document.getElementById('userInfoHeader');
            const userMenuDivider = document.getElementById('userMenuDivider');
            const menuUserName = document.getElementById('menuUserName');
            const menuUserEmail = document.getElementById('menuUserEmail');
            
            // Elementos del menú
            const loginMenuItem = document.getElementById('loginMenuItem');
            const registerMenuItem = document.getElementById('registerMenuItem');
            const profileMenuItem = document.getElementById('profileMenuItem');
            const ordersMenuItem = document.getElementById('ordersMenuItem');
            const adminMenuItem = document.getElementById('adminMenuItem');
            const logoutDivider = document.getElementById('logoutDivider');
            const logoutMenuItem = document.getElementById('logoutMenuItem');

            if (isAuthenticated) {
                // Obtener nombre para mostrar
                const displayName = this.getDisplayName();
                console.log('👤 Nombre a mostrar:', displayName);
                
                // CORREGIDO: Solo actualizar userName, ocultar userDisplayName
                if (userNameElement) {
                    userNameElement.textContent = displayName;
                    console.log('✅ userNameElement actualizado:', displayName);
                }
                
                // IMPORTANTE: Ocultar userDisplayName para evitar duplicación
                if (userDisplayName) {
                    userDisplayName.classList.add('d-none');
                    userDisplayName.textContent = ''; // Limpiar contenido
                    console.log('✅ userDisplayName ocultado para evitar duplicación');
                }
                
                // Actualizar header del menú dropdown
                if (userInfoHeader) userInfoHeader.classList.remove('d-none');
                if (userMenuDivider) userMenuDivider.classList.remove('d-none');
                if (menuUserName) {
                    menuUserName.textContent = displayName;
                    console.log('✅ menuUserName actualizado:', displayName);
                }
                if (menuUserEmail) menuUserEmail.textContent = this.currentUser.email;
                
                // Ocultar opciones de login/register
                if (loginMenuItem) loginMenuItem.classList.add('d-none');
                if (registerMenuItem) registerMenuItem.classList.add('d-none');
                
                // Mostrar opciones de usuario autenticado
                if (profileMenuItem) profileMenuItem.classList.remove('d-none');
                if (ordersMenuItem) ordersMenuItem.classList.remove('d-none');
                if (logoutDivider) logoutDivider.classList.remove('d-none');
                if (logoutMenuItem) logoutMenuItem.classList.remove('d-none');
                
                // Mostrar panel admin si corresponde
                if (adminMenuItem) {
                    if (this.currentProfile && this.currentProfile.rol === 'admin') {
                        adminMenuItem.classList.remove('d-none');
                    } else {
                        adminMenuItem.classList.add('d-none');
                    }
                }
                
            } else {
                // Usuario no autenticado
                if (userNameElement) {
                    userNameElement.textContent = 'Cuenta';
                    console.log('✅ userNameElement resetado a "Cuenta"');
                }
                
                // Asegurarse de que userDisplayName esté oculto
                if (userDisplayName) {
                    userDisplayName.classList.add('d-none');
                    userDisplayName.textContent = '';
                }
                
                if (userInfoHeader) userInfoHeader.classList.add('d-none');
                if (userMenuDivider) userMenuDivider.classList.add('d-none');
                
                // Mostrar opciones de login/register
                if (loginMenuItem) loginMenuItem.classList.remove('d-none');
                if (registerMenuItem) registerMenuItem.classList.remove('d-none');
                
                // Ocultar opciones de usuario autenticado
                if (profileMenuItem) profileMenuItem.classList.add('d-none');
                if (ordersMenuItem) ordersMenuItem.classList.add('d-none');
                if (adminMenuItem) adminMenuItem.classList.add('d-none');
                if (logoutDivider) logoutDivider.classList.add('d-none');
                if (logoutMenuItem) logoutMenuItem.classList.add('d-none');
            }
            
        } catch (error) {
            console.error('❌ Error al actualizar UI del header:', error);
        }
    }

    // Obtener nombre para mostrar
    getDisplayName() {
        // Prioridad 1: Nombre del perfil en la base de datos
        if (this.currentProfile && this.currentProfile.nombre && this.currentProfile.nombre !== 'Usuario') {
            console.log('📛 Nombre desde perfil:', this.currentProfile.nombre);
            return this.currentProfile.nombre;
        }
        
        // Prioridad 2: user_metadata.nombre_completo
        if (this.currentUser?.user_metadata?.nombre_completo) {
            console.log('📛 Nombre desde user_metadata.nombre_completo:', this.currentUser.user_metadata.nombre_completo);
            return this.currentUser.user_metadata.nombre_completo;
        }
        
        // Prioridad 3: user_metadata.full_name
        if (this.currentUser?.user_metadata?.full_name) {
            console.log('📛 Nombre desde user_metadata.full_name:', this.currentUser.user_metadata.full_name);
            return this.currentUser.user_metadata.full_name;
        }
        
        // Prioridad 4: primera parte del email (si no es "usuario")
        if (this.currentUser?.email) {
            const emailPart = this.currentUser.email.split('@')[0];
            if (emailPart && emailPart !== 'usuario') {
                console.log('📛 Nombre desde email:', emailPart);
                return emailPart;
            }
        }
        
        console.log('📛 Usando nombre por defecto: Mi cuenta');
        return 'Mi cuenta';
    }

    // Método para login
    async login(email, password) {
        try {
            console.log('🔐 Intentando login para:', email);
            
            const { data, error } = await supabase.auth.signInWithPassword({
                email: email,
                password: password,
            });
            
            if (error) {
                console.error('❌ Error de login:', error.message);
                this._dispatchEvent(AuthManager.EVENTS.LOGIN_ERROR, { error: error.message });
                return { success: false, error: error.message };
            }
            
            console.log('✅ Login exitoso:', data);
            this._dispatchEvent(AuthManager.EVENTS.LOGIN_SUCCESS, { user: data.user });
            return { success: true, user: data.user };
        } catch (err) {
            console.error('❌ Error inesperado en login:', err);
            const errorMessage = 'Error inesperado al iniciar sesión';
            this._dispatchEvent(AuthManager.EVENTS.LOGIN_ERROR, { error: errorMessage });
            return { success: false, error: errorMessage };
        }
    }

    // Método para registro
    async register(nombre_completo, email, password) {
        try {
            console.log('📝 Intentando registro para:', { nombre_completo, email });
            
            // Validar longitud de la contraseña
            if (password.length < 8) {
                console.error('❌ La contraseña debe tener al menos 8 caracteres');
                return { 
                    success: false, 
                    error: 'La contraseña debe tener al menos 8 caracteres' 
                };
            }
            
            const { data, error } = await supabase.auth.signUp({
                email: email,
                password: password,
                options: {
                    data: {
                        nombre_completo: nombre_completo,
                        full_name: nombre_completo
                    }
                }
            });
            
            if (error) {
                console.error('❌ Error de registro:', error.message);
                return { success: false, error: error.message };
            }
            
            console.log('✅ Registro exitoso:', data);
            
            // Si el usuario se registró pero necesita confirmar email
            if (data.user && !data.user.email_confirmed_at) {
                console.log('📧 Usuario registrado, esperando confirmación de email');
                return { 
                    success: true, 
                    user: data.user, 
                    message: 'Por favor revisa tu correo para confirmar tu cuenta'
                };
            }
            
            return { success: true, user: data.user };
        } catch (err) {
            console.error('❌ Error inesperado en registro:', err);
            return { success: false, error: 'Error inesperado' };
        }
    }

    // Método para logout
    async logout() {
        try {
            console.log('🚪 Cerrando sesión...');
            const { error } = await supabase.auth.signOut();
            if (error) {
                console.error('❌ Error al cerrar sesión:', error.message);
                return { success: false, error: error.message };
            }
            console.log('✅ Sesión cerrada exitosamente');
            this._dispatchEvent(AuthManager.EVENTS.LOGOUT_SUCCESS);
            return { success: true };
        } catch (err) {
            console.error('❌ Error inesperado al cerrar sesión:', err);
            return { success: false, error: 'Error inesperado' };
        }
    }

    // NUEVA FUNCIONALIDAD: Método para recuperar contraseña
    async resetPassword(email, options = {}) {
        try {
            console.log('🔐 Enviando correo de recuperación para:', email);
            
            // Validar email
            if (!email || !email.includes('@')) {
                const error = 'Por favor ingresa un correo electrónico válido';
                this._dispatchEvent(AuthManager.EVENTS.PASSWORD_RESET_ERROR, { error });
                return { success: false, error };
            }
            
            // Configuración por defecto para el reset - CORREGIDA PARA TU ESTRUCTURA
            // Detectar la ruta correcta basada en la ubicación actual
            const currentPath = window.location.pathname;
            const basePath = currentPath.includes('/views/') ? '/views/' : '/';
            
            const resetOptions = {
                redirectTo: options.redirectTo || `${window.location.origin}${basePath}reset_password_page.html`,
                ...options
            };
            
            console.log('📧 Opciones de reset:', resetOptions);
            
            const { error } = await supabase.auth.resetPasswordForEmail(email, resetOptions);
            
            if (error) {
                console.error('❌ Error al enviar correo de recuperación:', error.message);
                
                // Interpretar diferentes tipos de errores
                let userFriendlyError = error.message;
                
                if (error.message.includes('User not found')) {
                    userFriendlyError = 'No encontramos una cuenta asociada a este correo electrónico';
                } else if (error.message.includes('rate limit') || error.message.includes('too many requests')) {
                    userFriendlyError = 'Has enviado demasiadas solicitudes. Por favor espera unos minutos e intenta de nuevo';
                } else if (error.message.includes('Email not confirmed')) {
                    userFriendlyError = 'Tu cuenta no ha sido confirmada. Por favor revisa tu correo para confirmar tu cuenta primero';
                } else {
                    userFriendlyError = 'Error al enviar el correo de recuperación. Por favor intenta de nuevo';
                }
                
                this._dispatchEvent(AuthManager.EVENTS.PASSWORD_RESET_ERROR, { 
                    error: userFriendlyError,
                    originalError: error.message,
                    email 
                });
                
                return { success: false, error: userFriendlyError };
            }
            
            console.log('✅ Correo de recuperación enviado exitosamente');
            this._dispatchEvent(AuthManager.EVENTS.PASSWORD_RESET_SENT, { email });
            
            return { 
                success: true, 
                message: 'Correo de recuperación enviado exitosamente',
                email 
            };
            
        } catch (err) {
            console.error('❌ Error inesperado al enviar correo de recuperación:', err);
            const errorMessage = 'Error inesperado al enviar el correo de recuperación';
            this._dispatchEvent(AuthManager.EVENTS.PASSWORD_RESET_ERROR, { 
                error: errorMessage,
                originalError: err.message 
            });
            return { success: false, error: errorMessage };
        }
    }

    // NUEVA FUNCIONALIDAD: Método para actualizar contraseña con token
    async updatePassword(newPassword, accessToken = null) {
        try {
            console.log('🔐 Actualizando contraseña...');
            
            // Validar longitud de la contraseña
            if (newPassword.length < 8) {
                const error = 'La contraseña debe tener al menos 8 caracteres';
                return { success: false, error };
            }
            
            // Si se proporciona un token, establecer la sesión primero
            if (accessToken) {
                const { error: sessionError } = await supabase.auth.setSession({
                    access_token: accessToken,
                    refresh_token: '' // Solo necesitamos el access_token para reset
                });
                
                if (sessionError) {
                    console.error('❌ Error al establecer sesión:', sessionError);
                    return { success: false, error: 'Token de recuperación inválido o expirado' };
                }
            }
            
            // Actualizar la contraseña
            const { error } = await supabase.auth.updateUser({
                password: newPassword
            });
            
            if (error) {
                console.error('❌ Error al actualizar contraseña:', error.message);
                
                let userFriendlyError = error.message;
                if (error.message.includes('session')) {
                    userFriendlyError = 'Sesión expirada. Por favor solicita un nuevo enlace de recuperación';
                } else if (error.message.includes('weak password')) {
                    userFriendlyError = 'La contraseña es muy débil. Debe tener al menos 8 caracteres';
                }
                
                return { success: false, error: userFriendlyError };
            }
            
            console.log('✅ Contraseña actualizada exitosamente');
            return { 
                success: true, 
                message: 'Contraseña actualizada exitosamente' 
            };
            
        } catch (err) {
            console.error('❌ Error inesperado al actualizar contraseña:', err);
            return { success: false, error: 'Error inesperado al actualizar la contraseña' };
        }
    }

    // Verificar si el usuario está autenticado
    isAuthenticated() {
        return !!this.currentUser;
    }

    // Obtener usuario actual
    getCurrentUser() {
        return this.currentUser;
    }

    // Obtener perfil actual
    getCurrentProfile() {
        return this.currentProfile;
    }
}

// Crear instancia global del gestor de autenticación
window.authManager = new AuthManager();

// Función global para cerrar sesión (compatibilidad con header existente)
window.cerrarSesion = async function() {
    try {
        const result = await window.authManager.logout();
        if (result.success) {
            // Redirigir a la página de inicio
            window.location.href = '/';
        } else {
            throw new Error(result.error);
        }
    } catch (error) {
        console.error('Error al cerrar sesión:', error);
        alert('Ocurrió un error al cerrar la sesión. Por favor, inténtalo de nuevo.');
    }
};

// Función global para recuperar contraseña
window.resetPassword = async function(email, options = {}) {
    if (window.authManager) {
        return await window.authManager.resetPassword(email, options);
    } else {
        // Fallback si authManager no está disponible
        console.warn('AuthManager no disponible, usando función legacy');
        try {
            const { error } = await supabase.auth.resetPasswordForEmail(email, {
                redirectTo: options.redirectTo || `${window.location.origin}/reset-password.html`
            });
            
            if (error) {
                return { success: false, error: error.message };
            }
            
            return { success: true };
        } catch (err) {
            return { success: false, error: 'Error inesperado' };
        }
    }
};

// Función para navegar (compatibilidad)
window.navigateTo = function(url) {
    window.location.href = url;
};

// Auto-inicializar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', async function() {
    console.log('🚀 DOM listo, inicializando AuthManager...');
    await window.authManager.init();
});

// También inicializar si el DOM ya está listo
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', async function() {
        await window.authManager.init();
    });
} else {
    // DOM ya está listo
    console.log('🚀 DOM ya listo, inicializando AuthManager...');
    window.authManager.init();
}