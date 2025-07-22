console.log('Script.js cargado correctamente');

// Estado global simple
let cart = [];

// Función simple para verificar autenticación
function isUserLoggedIn() {
    try {
        if (window.authManager && window.authManager.isAuthenticated) {
            return window.authManager.isAuthenticated();
        }
        return false;
    } catch (error) {
        console.log('No se pudo verificar autenticación:', error);
        return false;
    }
}

// Función para agregar al carrito
function addToCart(productId, name, price, image) {
    if (!isUserLoggedIn()) {
        alert('Por favor, inicia sesión para agregar productos al carrito');
        return;
    }

    // Buscar si ya existe
    const existing = cart.find(item => item.id === productId);
    
    if (existing) {
        existing.quantity += 1;
    } else {
        cart.push({
            id: productId,
            name: name,
            price: price,
            image: image,
            quantity: 1
        });
    }

    updateCartCount();
    showSimpleNotification('Producto agregado al carrito');
}

// Actualizar contador del carrito
function updateCartCount() {
    const badge = document.getElementById('cart-badge');
    if (badge) {
        const total = cart.reduce((sum, item) => sum + item.quantity, 0);
        badge.textContent = total;
    }
}

// Notificación simple
function showSimpleNotification(message) {
    // Crear notificación simple
    const notification = document.createElement('div');
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: #4CAF50;
        color: white;
        padding: 15px;
        border-radius: 5px;
        z-index: 9999;
        box-shadow: 0 2px 5px rgba(0,0,0,0.2);
    `;
    notification.textContent = message;
    
    document.body.appendChild(notification);
    
    // Remover después de 3 segundos
    setTimeout(() => {
        if (notification.parentNode) {
            notification.remove();
        }
    }, 3000);
}

// Funciones de modal simples
function showLoginModal() {
    const modal = document.getElementById('loginModal');
    if (modal) {
        modal.style.display = 'block';
    }
}

function showRegisterModal() {
    const modal = document.getElementById('registerModal');
    if (modal) {
        modal.style.display = 'block';
    }
}

function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.style.display = 'none';
    }
}

// Inicialización cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM listo, inicializando funciones básicas...');
    
    // Agregar eventos a botones de carrito
    const cartButtons = document.querySelectorAll('.btn[onclick*="carrito"], .add-to-cart, button[data-action="add-cart"]');
    cartButtons.forEach(button => {
        button.addEventListener('click', function(e) {
            e.preventDefault();
            
            // Datos del producto (simplificado)
            const card = this.closest('.card, .card-product');
            if (card) {
                const id = 'prod_' + Math.random().toString(36).substr(2, 9);
                const name = card.querySelector('h5, h6, .card-title')?.textContent || 'Producto';
                const price = card.querySelector('.fw-bold, .price')?.textContent || '$0';
                const img = card.querySelector('img')?.src || '';
                
                addToCart(id, name, price, img);
            }
        });
    });
    
    // Eventos para cerrar modales
    document.addEventListener('click', function(e) {
        if (e.target.classList.contains('close')) {
            const modal = e.target.closest('.modal');
            if (modal) modal.style.display = 'none';
        }
        
        if (e.target.classList.contains('modal')) {
            e.target.style.display = 'none';
        }
    });
    
    // Menú móvil básico
    const menuBtn = document.querySelector('.menu-btn, .mobile-menu-btn');
    const mobileMenu = document.querySelector('.mobile-menu');
    const overlay = document.querySelector('.mobile-overlay, .mobile-menu-overlay');
    const closeBtn = document.querySelector('.close-btn, .mobile-menu-close');
    
    if (menuBtn && mobileMenu) {
        menuBtn.addEventListener('click', () => {
            mobileMenu.classList.add('active');
            if (overlay) overlay.style.display = 'block';
        });
    }
    
    if (closeBtn && mobileMenu) {
        closeBtn.addEventListener('click', () => {
            mobileMenu.classList.remove('active');
            if (overlay) overlay.style.display = 'none';
        });
    }
    
    if (overlay && mobileMenu) {
        overlay.addEventListener('click', () => {
            mobileMenu.classList.remove('active');
            overlay.style.display = 'none';
        });
    }
    
    console.log('Funciones básicas inicializadas');
});

// Hacer funciones disponibles globalmente
window.addToCart = addToCart;
window.showLoginModal = showLoginModal;
window.showRegisterModal = showRegisterModal;
window.closeModal = closeModal;