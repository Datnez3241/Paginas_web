console.log('Cargando configuración...');

// Detectar automáticamente el entorno
const isLocalDevelopment = window.location.hostname === '127.0.0.1' && window.location.port === '5500';
const isXampp = window.location.hostname === 'localhost' && window.location.port === '8012';

// Configuración de entorno
const ENV = {
    MODE: isLocalDevelopment ? 'development' : (isXampp ? 'xampp' : 'production')
};

// Configuración de URLs base
const CONFIG = {
    development: {
        API_BASE_URL: 'http://localhost:8012/PROYECTO2/Backend',
        BASE_PATH: '/frontend',
        IS_LOCAL: true
    },
    xampp: {
        API_BASE_URL: '/PROYECTO2/Backend',
        BASE_PATH: '/PROYECTO2/frontend',
        IS_LOCAL: false
    },
    production: {
        API_BASE_URL: 'https://tudominio.com/PROYECTO2/Backend',
        BASE_PATH: '/PROYECTO2/frontend',
        IS_LOCAL: false
    }
};

// Configuración actual basada en el entorno
const CURRENT_CONFIG = CONFIG[ENV.MODE] || CONFIG.production;

// Hacer las variables accesibles globalmente
window.API_BASE_URL = CURRENT_CONFIG.API_BASE_URL;
window.BASE_PATH = CURRENT_CONFIG.BASE_PATH;
window.IS_LOCAL = CURRENT_CONFIG.IS_LOCAL;

console.log('Configuración cargada para entorno:', ENV.MODE, CURRENT_CONFIG);

// Endpoints de la API
const API_ENDPOINTS = {
    AUTH: {
        LOGIN: '/api.php/login',
        REGISTER: '/api.php/register',
        LOGOUT: '/api.php/logout',
        CHECK_SESSION: '/api.php/check-session',
        UPDATE_PROFILE: '/api.php/update-profile'
    },
    PRODUCTS: {
        LIST: '/api.php/products',
        DETAIL: '/api.php/product/'
    },
    CART: {
        ADD: '/api.php/cart/add',
        REMOVE: '/api.php/cart/remove',
        GET: '/api.php/cart',
        CLEAR: '/api.php/cart/clear'
    }
};

// URL base de la API según el entorno
const API_BASE_URL = API_CONFIG[ENV.MODE];

// Configuración de CORS
const CORS_CONFIG = {
    mode: 'cors',
    credentials: 'include',
    headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
    }
};

// Mostrar configuración en consola
console.group('Configuración de la aplicación:');
console.log('Modo:', ENV.MODE);
console.log('URL de la API:', API_BASE_URL);
console.log('Configuración CORS:', CORS_CONFIG);
console.groupEnd();

// Exportar configuración
window.AppConfig = {
    API: {
        BASE_URL: API_BASE_URL,
        AUTH: `${API_BASE_URL}/auth`
    },
    CORS: CORS_CONFIG
};

console.log('Configuración cargada correctamente');
