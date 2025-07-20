-- Primero, hacer una copia de seguridad de los datos existentes
CREATE TABLE IF NOT EXISTS usuarios_backup LIKE usuarios;
INSERT INTO usuarios_backup SELECT * FROM usuarios;

-- Eliminar la tabla existente
DROP TABLE IF EXISTS usuarios;

-- Crear la tabla con la estructura correcta
CREATE TABLE usuarios (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre_completo VARCHAR(100) NOT NULL,
    correo VARCHAR(100) NOT NULL UNIQUE,
    contrasena VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Crear índices
CREATE INDEX idx_correo ON usuarios(correo);

-- Mostrar la estructura final
DESCRIBE usuarios;
