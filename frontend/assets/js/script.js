console.log('Script.js cargado correctamente');

// Importar servicios
import { authService } from './services/auth.service.js';

// Estado global para el carrito
let cart = [];

// Estado de autenticación
let isLoggedIn = authService.isAuthenticated();

// Función para manejar el cierre de sesión
async function handleLogout() {
    try {
        const response = await authService.logout();
        if (response.success) {
            // Actualizar el estado de autenticación
            isLoggedIn = false;
            // Actualizar la interfaz de usuario
            updateAuthUI();
            // Mostrar notificación
            showNotification('Sesión cerrada correctamente', 'success');
            // Redirigir a la página de inicio después de 1.5 segundos
            setTimeout(() => {
                window.location.href = 'index.html';
            }, 1500);
        } else {
            throw new Error(response.message || 'Error al cerrar sesión');
        }
    } catch (error) {
        console.error('Error al cerrar sesión:', error);
        showNotification(error.message || 'Error al cerrar sesión', 'error');
    }
}

// Actualizar la interfaz de usuario según el estado de autenticación
function updateAuthUI() {
    const loginBtn = document.getElementById('loginBtn');
    const registerBtn = document.getElementById('registerBtn');
    const logoutBtn = document.getElementById('logoutBtn');
    const userMenu = document.querySelector('.user-menu');
    const userName = document.querySelector('.user-name');
    
    if (isLoggedIn) {
        const user = authService.getCurrentUser();
        if (userName) userName.textContent = user.nombre || 'Usuario';
        if (loginBtn) loginBtn.style.display = 'none';
        if (registerBtn) registerBtn.style.display = 'none';
        if (logoutBtn) logoutBtn.style.display = 'block';
        if (userMenu) userMenu.style.display = 'block';
    } else {
        if (loginBtn) loginBtn.style.display = 'block';
        if (registerBtn) registerBtn.style.display = 'block';
        if (logoutBtn) logoutBtn.style.display = 'none';
        if (userMenu) userMenu.style.display = 'none';
    }
}

// Función para verificar si el usuario está logueado
function checkLogin() {
    if (!isLoggedIn) {
        alert('Por favor, inicia sesión para agregar productos al carrito');
        window.location.href = 'Registro/registro.html';
        return false;
    }
    return true;
}

// Función para agregar producto al carrito
function addToCart(productId, name, price, image) {
    if (!checkLogin()) {
        // Redirigir al login o mostrar modal de login
        document.querySelector('.user-icon').click();
        return;
    }

    // Buscar si el producto ya está en el carrito
    const existingProduct = cart.find(item => item.id === productId);
    
    if (existingProduct) {
        existingProduct.quantity += 1;
    } else {
        cart.push({
            id: productId,
            name: name,
            price: price,
            image: image,
            quantity: 1
        });
    }

    // Actualizar el contador del carrito
    updateCartCount();
    
    // Mostrar mensaje de éxito
    showNotification('Producto agregado al carrito');
}

// Función para actualizar el contador del carrito
function updateCartCount() {
    const cartCount = document.querySelector('.cart-count');
    const totalItems = cart.reduce((total, item) => total + item.quantity, 0);
    cartCount.textContent = totalItems;
}

// Función para mostrar notificaciones
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    
    // Crear el contenido de la notificación
    const icon = document.createElement('i');
    icon.className = type === 'error' ? 'fas fa-exclamation-circle' : 
                      type === 'success' ? 'fas fa-check-circle' : 'fas fa-info-circle';
    
    const messageElement = document.createElement('span');
    messageElement.textContent = message;
    
    notification.appendChild(icon);
    notification.appendChild(messageElement);
    
    // Agregar la notificación al documento
    document.body.appendChild(notification);
    
    // Mostrar la notificación con animación
    setTimeout(() => {
        notification.classList.add('show');
    }, 10);
    
    // Eliminar la notificación después de 5 segundos
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => {
            notification.remove();
        }, 300);
    }, 5000);
    
    // Cerrar al hacer clic
    notification.addEventListener('click', () => {
        notification.classList.remove('show');
        setTimeout(() => {
            notification.remove();
        }, 300);
    });
}

// Event listener para los botones de agregar al carrito
// Redirección al login
// Modal y autenticación
const modal = document.getElementById('loginModal');
const openModalBtn = document.getElementById('openLoginModal');
const closeBtn = document.querySelector('.close');
const tabBtns = document.querySelectorAll('.tab-btn');
const authForms = document.querySelectorAll('.auth-form');

// Abrir modal
openModalBtn.addEventListener('click', (e) => {
    e.preventDefault();
    modal.style.display = 'block';
});

// Cerrar modal
closeBtn.addEventListener('click', () => {
    modal.style.display = 'none';
});

// Cerrar modal al hacer clic fuera
window.addEventListener('click', (e) => {
    if (e.target === modal) {
        modal.style.display = 'none';
    }
});

// Cambiar entre pestañas
tabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        // Remover clase active de todos los botones
        tabBtns.forEach(b => b.classList.remove('active'));
        // Agregar clase active al botón clickeado
        btn.classList.add('active');
        
        // Mostrar el formulario correspondiente
        const formId = btn.getAttribute('data-tab') + 'Form';
        authForms.forEach(form => {
            form.classList.remove('active');
            if (form.id === formId) {
                form.classList.add('active');
            }
        });
    });
});

// Manejar envío de formularios
document.getElementById('loginForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const form = e.target;
    const correo = form.querySelector('input[type="email"]').value.trim();
    const password = form.querySelector('input[type="password"]').value;
    const submitBtn = form.querySelector('.btn-submit');
    const originalBtnText = submitBtn.textContent;

    // Validación básica
    if (!correo || !password) {
        showNotification('Por favor ingrese correo y contraseña', 'error');
        return;
    }

    try {
        // Mostrar indicador de carga
        submitBtn.disabled = true;
        submitBtn.textContent = 'Iniciando sesión...';
        submitBtn.style.opacity = '0.7';

        // URL del endpoint de login
        const apiUrl = `${window.AppConfig.API.BASE_URL}/auth/login`;
        console.log('URL de la API:', apiUrl);
        
        // Configurar opciones de la petición
        const requestOptions = {
            method: 'POST',
            body: JSON.stringify({
                correo: correo,
                password: password
            }),
            ...window.AppConfig.CORS,
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            }
        };
        console.log('Opciones de la petición:', requestOptions);

        // Enviar datos al servidor
        const response = await fetch(apiUrl, requestOptions);
        console.log('Respuesta del servidor (status):', response.status);
        
        const data = await response.json().catch(error => {
            console.error('Error al analizar la respuesta JSON:', error);
            throw new Error('Respuesta inválida del servidor');
        });
        
        console.log('Datos de respuesta:', data);

        if (!response.ok) {
            throw new Error(data.error || `Error en el servidor (${response.status})`);
        }

        // Si llegamos aquí, el inicio de sesión fue exitoso
        showNotification(data.mensaje || '¡Inicio de sesión exitoso!', 'success');
        
        // Actualizar el estado de autenticación
        isLoggedIn = true;
        
        // Cerrar el modal después de 1 segundo
        setTimeout(() => {
            modal.style.display = 'none';
            // Recargar la página para actualizar la interfaz
            window.location.href = 'index.html';
        }, 1000);
    } catch (error) {
        console.error('Error:', error);
        showNotification(error.message || 'Error al conectar con el servidor', 'error');
    } finally {
        // Restaurar el botón
        submitBtn.disabled = false;
        submitBtn.textContent = originalBtnText;
        submitBtn.style.opacity = '1';
    }
});

// Manejador del formulario de inicio de sesión
document.getElementById('loginForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const form = e.target;
    const formData = new FormData(form);
    const email = formData.get('email');
    const password = formData.get('password');
    let submitBtn;
    
    try {
        // Mostrar indicador de carga
        submitBtn = form.querySelector('button[type="submit"]');
        const originalBtnText = submitBtn.innerHTML;
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Iniciando sesión...';
        
        // Intentar iniciar sesión
        const response = await authService.login(email, password);
        
        if (response.success) {
            // Actualizar el estado de autenticación
            isLoggedIn = true;
            updateAuthUI();
            
            // Cerrar el modal
            const modal = document.getElementById('loginModal');
            if (modal) {
                modal.style.display = 'none';
                document.body.style.overflow = 'auto';
            }
            
            // Mostrar mensaje de éxito
            showNotification('Inicio de sesión exitoso', 'success');
            
            // Redirigir si es necesario
            if (response.redirect) {
                setTimeout(() => {
                    window.location.href = response.redirect;
                }, 1500);
            }
        } else {
            // Mostrar mensaje de error
            showNotification(response.message || 'Error al iniciar sesión', 'error');
        }
    } catch (error) {
        console.error('Error al iniciar sesión:', error);
        showNotification('Error al conectar con el servidor', 'error');
    } finally {
        // Restaurar el botón
        if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.innerHTML = originalBtnText || 'Iniciar sesión';
        }
    }
});

// Función para actualizar la interfaz de usuario según el estado de autenticación
function updateAuthUI(isAuthenticated) {
    const userIcon = document.querySelector('.user-icon');
    const loginBtn = document.querySelector('[data-tab="login"]');
    const registerBtn = document.querySelector('[data-tab="register"]');
    
    if (isAuthenticated) {
        // Si el usuario está autenticado
        userIcon.innerHTML = '<i class="fas fa-user-check"></i>';
        if (loginBtn) loginBtn.style.display = 'none';
        if (registerBtn) registerBtn.style.display = 'none';
    } else {
        // Si el usuario no está autenticado
        userIcon.innerHTML = '<i class="fas fa-user"></i>';
        if (loginBtn) loginBtn.style.display = 'block';
        if (registerBtn) registerBtn.style.display = 'block';
    }
}

// Función para inicializar el formulario de registro
function initRegisterForm() {
    console.log('Buscando formulario de registro...');
    const registerForm = document.getElementById('registerForm');
    
    if (!registerForm) {
        console.error('❌ No se encontró el elemento con ID "registerForm"');
        return false;
    }
    
    console.log('✅ Formulario de registro encontrado');
    
    // Remover manejadores de eventos existentes para evitar duplicados
    const newForm = registerForm.cloneNode(true);
    registerForm.parentNode.replaceChild(newForm, registerForm);
    
    // Agregar manejador de eventos al nuevo formulario
    newForm.addEventListener('submit', handleRegisterSubmit);
    console.log('✅ Manejador de envío de registro agregado');
    
    // Agregar clase para indicar que el formulario está listo
    newForm.classList.add('form-initialized');
    
    return true;
}

// Manejador del envío del formulario de registro
async function handleRegisterSubmit(e) {
    console.log('Iniciando envío del formulario de registro...');
    e.preventDefault();
    
    const form = e.target;
    const formData = new FormData(form);
    const submitBtn = form.querySelector('button[type="submit"]');
    let originalBtnText = '';
    
    try {
        // Mostrar indicador de carga
        if (submitBtn) {
            originalBtnText = submitBtn.innerHTML;
            submitBtn.disabled = true;
            submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Registrando...';
        }
        
        // Obtener y validar datos del formulario
        const data = {
            nombre: formData.get('nombre')?.trim() || '',
            apellido: formData.get('apellido')?.trim() || '',
            email: formData.get('email')?.trim() || '',
            password: formData.get('password') || '',
            telefono: formData.get('telefono')?.trim() || '',
            direccion: formData.get('direccion')?.trim() || ''
        };
        
        // Validar campos requeridos
        if (!data.nombre || !data.email || !data.password) {
            throw new Error('Por favor complete todos los campos requeridos');
        }
        
        // Validar formato de correo electrónico
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(data.email)) {
            throw new Error('Por favor ingrese un correo electrónico válido');
        }
        
        // Validar longitud mínima de la contraseña
        if (data.password.length < 8) {
            throw new Error('La contraseña debe tener al menos 8 caracteres');
        }
        
        // Intentar registrar al usuario
        const response = await authService.register(data);
        
        if (response.success) {
            // Actualizar el estado de autenticación
            isLoggedIn = true;
            updateAuthUI();
            
            // Mostrar mensaje de éxito
            showNotification('¡Registro exitoso!', 'success');
            
            // Cerrar el modal de registro si existe
            const registerModal = document.getElementById('registerModal');
            if (registerModal) {
                registerModal.style.display = 'none';
                document.body.style.overflow = 'auto';
            }
            
            // Redirigir si es necesario
            if (response.redirect) {
                setTimeout(() => {
                    window.location.href = response.redirect;
                }, 1500);
            }
        } else {
            // Mostrar mensaje de error del servidor
            throw new Error(response.message || 'Error al registrar el usuario');
        }
    } catch (error) {
        console.error('Error en el registro:', error);
        showNotification(error.message || 'Error al procesar el registro', 'error');
    }
    
    if (data.password !== data.confirmar_password) {
        showNotification('Las contraseñas no coinciden', 'error');
        console.error('Error: Las contraseñas no coinciden');
        return;
    }
    
    if (data.password.length < 6) {
        showNotification('La contraseña debe tener al menos 6 caracteres', 'error');
        console.error('Error: Contraseña demasiado corta');
        return;
    }
    
    // Validar formato de correo electrónico
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(data.correo)) {
        showNotification('Por favor ingrese un correo electrónico válido', 'error');
        console.error('Error: Formato de correo electrónico inválido');
        return;
    }
    
    // El registro ya se maneja en el bloque try-catch anterior
    // No es necesario este código duplicado
}

// Inicializar la aplicación cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM cargado, inicializando aplicación...');
    
    // Inicializar formulario de registro
    if (document.getElementById('registerForm')) {
        console.log('Inicializando formulario de registro...');
        initRegisterForm();
    } else {
        console.log('No se encontró el formulario de registro en la página actual');
    }
    
    // Inicializar menú móvil
    console.log('Inicializando menú móvil...');
    const menuBtn = document.querySelector('.menu-btn');
    const mobileMenu = document.querySelector('.mobile-menu');
    
    // Inicializar botón de cierre de sesión
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        console.log('Agregando manejador de cierre de sesión...');
        logoutBtn.addEventListener('click', async (e) => {
            e.preventDefault();
            await handleLogout();
        });
    } else {
        console.log('No se encontró el botón de cierre de sesión');
    }
    const mobileOverlay = document.querySelector('.mobile-overlay');
    const closeBtn = document.querySelector('.close-btn');
    
    // Verificar si los elementos del menú móvil existen
    if (!menuBtn || !mobileMenu || !mobileOverlay || !closeBtn) {
        console.log('No se encontraron todos los elementos del menú móvil');
    }
    
    function openMobileMenu() {
        mobileMenu.classList.add('active');
        mobileOverlay.style.display = 'block';
        document.body.style.overflow = 'hidden';
    }
    
    function closeMobileMenu() {
        mobileMenu.classList.remove('active');
        mobileOverlay.style.display = 'none';
        document.body.style.overflow = '';
    }
    
    if (menuBtn && mobileMenu && mobileOverlay && closeBtn) {
        menuBtn.addEventListener('click', openMobileMenu);
        closeBtn.addEventListener('click', closeMobileMenu);
        mobileOverlay.addEventListener('click', closeMobileMenu);
    }
    
    // Inicializar otros manejadores aquí si es necesario
    
    console.log('Aplicación inicializada correctamente');
    
    // Código existente del manejador DOMContentLoaded
    
    const addButtons = document.querySelectorAll('.add-cart');
    
    addButtons.forEach(button => {
        button.addEventListener('click', function(e) {
            e.preventDefault();
            
            const productCard = this.closest('.card-product');
            const productId = productCard.dataset.productId;
            const productName = productCard.querySelector('h3').textContent;
            const productPrice = productCard.querySelector('.price').textContent.trim();
            const productImage = productCard.querySelector('img').src;
            
            addToCart(productId, productName, productPrice, productImage);
        });
    });
});
