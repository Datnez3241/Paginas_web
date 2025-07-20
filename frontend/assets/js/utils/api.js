// Utilidad para realizar peticiones HTTP
class ApiClient {
    constructor() {
        this.baseUrl = API_BASE_URL;
    }

    /**
     * Realiza una petición HTTP
     * @param {string} endpoint - Endpoint de la API
     * @param {string} method - Método HTTP (GET, POST, PUT, DELETE)
     * @param {Object} data - Datos a enviar en el cuerpo de la petición
     * @param {Object} headers - Cabeceras adicionales
     * @returns {Promise<Object>} - Respuesta de la API
     */
    async request(endpoint, method = 'GET', data = null, headers = {}) {
        const url = `${this.baseUrl}${endpoint}`;
        
        // Configuración por defecto
        const config = {
            method,
            headers: {
                'Content-Type': 'application/json',
                ...headers
            },
            credentials: 'include' // Incluir cookies en la petición
        };

        // Añadir el cuerpo si es necesario
        if (data && (method === 'POST' || method === 'PUT' || method === 'PATCH')) {
            config.body = JSON.stringify(data);
        }

        try {
            const response = await fetch(url, config);
            const responseData = await response.json().catch(() => ({}));

            if (!response.ok) {
                throw new Error(responseData.message || 'Error en la petición');
            }

            return responseData;
        } catch (error) {
            console.error('Error en la petición:', error);
            throw error;
        }
    }

    // Métodos HTTP específicos
    get(endpoint, headers = {}) {
        return this.request(endpoint, 'GET', null, headers);
    }

    post(endpoint, data = {}, headers = {}) {
        return this.request(endpoint, 'POST', data, headers);
    }

    put(endpoint, data = {}, headers = {}) {
        return this.request(endpoint, 'PUT', data, headers);
    }

    delete(endpoint, headers = {}) {
        return this.request(endpoint, 'DELETE', null, headers);
    }
}

// Instancia global de la API
const api = new ApiClient();
