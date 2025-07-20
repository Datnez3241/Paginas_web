// Servicio de autenticación
class AuthService {
    constructor() {
        this.currentUser = null;
        this.init();
    }

    /**
     * Inicializa el servicio
     */
    async init() {
        try {
            // Verificar si hay una sesión activa
            const response = await api.get(API_ENDPOINTS.AUTH.CHECK_SESSION);
            if (response.success && response.user) {
                this.currentUser = response.user;
            }
        } catch (error) {
            console.error('Error al verificar la sesión:', error);
        }
    }

    /**
     * Inicia sesión
     * @param {string} email - Correo electrónico
     * @param {string} password - Contraseña
     * @returns {Promise<Object>} - Respuesta del servidor
     */
    async login(email, password) {
        try {
            const response = await api.post(API_ENDPOINTS.AUTH.LOGIN, { email, password });
            if (response.success) {
                this.currentUser = response.user;
            }
            return response;
        } catch (error) {
            console.error('Error al iniciar sesión:', error);
            throw error;
        }
    }

    /**
     * Cierra la sesión
     * @returns {Promise<Object>} - Respuesta del servidor
     */
    async logout() {
        try {
            const response = await api.post(API_ENDPOINTS.AUTH.LOGOUT);
            if (response.success) {
                this.currentUser = null;
            }
            return response;
        } catch (error) {
            console.error('Error al cerrar sesión:', error);
            throw error;
        }
    }

    /**
     * Registra un nuevo usuario
     * @param {Object} userData - Datos del usuario
     * @returns {Promise<Object>} - Respuesta del servidor
     */
    async register(userData) {
        try {
            const response = await api.post(API_ENDPOINTS.AUTH.REGISTER, userData);
            if (response.success && response.user) {
                this.currentUser = response.user;
            }
            return response;
        } catch (error) {
            console.error('Error al registrar usuario:', error);
            throw error;
        }
    }

    /**
     * Actualiza el perfil del usuario
     * @param {Object} userData - Datos actualizados del usuario
     * @returns {Promise<Object>} - Respuesta del servidor
     */
    async updateProfile(userData) {
        try {
            const response = await api.put(API_ENDPOINTS.AUTH.UPDATE_PROFILE, userData);
            if (response.success && response.user) {
                this.currentUser = response.user;
            }
            return response;
        } catch (error) {
            console.error('Error al actualizar perfil:', error);
            throw error;
        }
    }

    /**
     * Verifica si el usuario está autenticado
     * @returns {boolean} - true si el usuario está autenticado, false en caso contrario
     */
    isAuthenticated() {
        return this.currentUser !== null;
    }

    /**
     * Obtiene el usuario actual
     * @returns {Object|null} - Datos del usuario o null si no hay sesión
     */
    getCurrentUser() {
        return this.currentUser;
    }
}

// Instancia global del servicio de autenticación
const authService = new AuthService();
