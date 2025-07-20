// Función para formatear precios
function formatearPrecio(precio) {
    return new Intl.NumberFormat('es-CO', {
        style: 'currency',
        currency: 'COP',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
    }).format(precio);
}

// Función para generar las estrellas de valoración
function generarEstrellas(puntuacion) {
    let estrellas = '';
    const estrellasLlenas = Math.floor(puntuacion);
    const mediaEstrella = puntuacion % 1 >= 0.5;
    const estrellasVacias = 5 - Math.ceil(puntuacion);
    
    // Estrellas llenas
    for (let i = 0; i < estrellasLlenas; i++) {
        estrellas += '<i class="fa-solid fa-star"></i>';
    }
    
    // Media estrella
    if (mediaEstrella) {
        estrellas += '<i class="fa-solid fa-star-half-stroke"></i>';
    }
    
    // Estrellas vacías
    for (let i = 0; i < estrellasVacias; i++) {
        estrellas += '<i class="fa-regular fa-star"></i>';
    }
    
    return estrellas;
}

// Función para cargar productos por categoría
function cargarProductosPorCategoria(categoriaId, contenedorId) {
    const contenedor = document.getElementById(contenedorId);
    if (!contenedor) return;
    
    // Mostrar indicador de carga
    contenedor.innerHTML = '<div class="text-center py-5"><div class="spinner-border text-primary" role="status"><span class="visually-hidden">Cargando...</span></div></div>';
    
    // Obtener productos de la API
    fetch(`/PROYECTO2/api/productos.php?categoria_id=${categoriaId}`)
        .then(response => {
            if (!response.ok) {
                throw new Error('Error al cargar los productos');
            }
            return response.json();
        })
        .then(productos => {
            if (productos.length === 0) {
                contenedor.innerHTML = '<div class="col-12 text-center py-5"><h4>No hay productos disponibles en esta categoría</h4></div>';
                return;
            }
            
            // Generar el HTML de los productos
            let html = '';
            productos.forEach(producto => {
                const precioAnterior = producto.precio_anterior ? 
                    `<span class="text-decoration-line-through text-muted me-2">${formatearPrecio(parseFloat(producto.precio_anterior))}</span>` : '';
                
                // Generar estrellas (usamos una puntuación aleatoria para el ejemplo)
                const puntuacion = Math.random() * 2 + 3; // Puntuación aleatoria entre 3 y 5
                
                html += `
                    <div class="col-md-4 mb-4">
                        <div class="card h-100">
                            <div class="position-relative">
                                <img src="/PROYECTO2/frontend/assets/img/imagen/${producto.imagen_url}" class="card-img-top" alt="${producto.nombre}" style="height: 200px; object-fit: cover;">
                                ${producto.precio_anterior && parseFloat(producto.precio_anterior) > parseFloat(producto.precio) ? 
                                    `<span class="position-absolute top-0 end-0 bg-danger text-white px-2 py-1 m-2 rounded">
                                        ${Math.round((1 - parseFloat(producto.precio) / parseFloat(producto.precio_anterior)) * 100)}% OFF
                                    </span>` : ''
                                }
                                <div class="position-absolute bottom-0 start-0 w-100 bg-dark bg-opacity-50 text-white p-2">
                                    <div class="d-flex justify-content-between align-items-center">
                                        <div class="text-warning">
                                            ${generarEstrellas(puntuacion)}
                                        </div>
                                        <small>${puntuacion.toFixed(1)}</small>
                                    </div>
                                </div>
                            </div>
                            <div class="card-body d-flex flex-column">
                                <h5 class="card-title">${producto.nombre}</h5>
                                <p class="card-text flex-grow-1">${producto.descripcion || 'Sin descripción disponible.'}</p>
                                <div class="mt-auto">
                                    <div class="d-flex justify-content-between align-items-center mb-2">
                                        <div>
                                            ${precioAnterior}
                                            <span class="h5 mb-0 text-primary">${formatearPrecio(parseFloat(producto.precio))}</span>
                                        </div>
                                        <span class="badge bg-secondary">${producto.stock} disponibles</span>
                                    </div>
                                    <div class="d-grid gap-2">
                                        <button class="btn btn-primary btn-agregar-carrito" data-id="${producto.id}">
                                            <i class="fas fa-cart-plus me-2"></i> Agregar al carrito
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                `;
            });
            
            contenedor.innerHTML = html;
            
            // Agregar eventos a los botones de agregar al carrito
            document.querySelectorAll('.btn-agregar-carrito').forEach(boton => {
                boton.addEventListener('click', function() {
                    const productoId = this.getAttribute('data-id');
                    agregarAlCarrito(productoId);
                });
            });
        })
        .catch(error => {
            console.error('Error:', error);
            contenedor.innerHTML = `
                <div class="col-12 text-center py-5">
                    <div class="alert alert-danger" role="alert">
                        <i class="fas fa-exclamation-triangle me-2"></i>
                        No se pudieron cargar los productos. Por favor, intente de nuevo más tarde.
                    </div>
                    <button class="btn btn-primary mt-3" onclick="cargarProductosPorCategoria(${categoriaId}, '${contenedorId}')">
                        <i class="fas fa-sync-alt me-2"></i> Reintentar
                    </button>
                </div>
            `;
        });
}

// Función para agregar un producto al carrito
function agregarAlCarrito(productoId) {
    // Implementar lógica para agregar al carrito
    // Por ahora, mostramos un mensaje de éxito
    const toast = document.createElement('div');
    toast.className = 'position-fixed bottom-0 end-0 m-3 toast show';
    toast.role = 'alert';
    toast.style.zIndex = '1100';
    toast.innerHTML = `
        <div class="toast-header bg-success text-white">
            <strong class="me-auto">¡Producto agregado!</strong>
            <button type="button" class="btn-close btn-close-white" data-bs-dismiss="toast" aria-label="Close"></button>
        </div>
        <div class="toast-body">
            El producto ha sido agregado a tu carrito de compras.
        </div>
    `;
    
    document.body.appendChild(toast);
    
    // Eliminar el toast después de 3 segundos
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => {
            document.body.removeChild(toast);
        }, 300);
    }, 3000);
}

// Cargar productos cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', function() {
    // Cargar productos de chocolates (ID de categoría 1)
    cargarProductosPorCategoria(1, 'productos-chocolates');
    
    // Agregar eventos para cerrar toasts
    document.addEventListener('click', function(e) {
        if (e.target.classList.contains('btn-close')) {
            const toast = e.target.closest('.toast');
            if (toast) {
                toast.classList.remove('show');
                setTimeout(() => {
                    if (toast.parentNode) {
                        toast.parentNode.removeChild(toast);
                    }
                }, 300);
            }
        }
    });
});
