-- Modificar la tabla usuarios para que coincida con los requisitos
ALTER TABLE usuarios
CHANGE COLUMN nombre_completo nombre VARCHAR(50) NOT NULL,
ADD COLUMN apellido VARCHAR(50) NOT NULL AFTER nombre,
CHANGE COLUMN correo email VARCHAR(100) NOT NULL,
CHANGE COLUMN contrasena password VARCHAR(255) NOT NULL,
ADD COLUMN telefono VARCHAR(20) NOT NULL AFTER email,
ADD COLUMN direccion TEXT NOT NULL AFTER telefono,
ADD COLUMN remember_token VARCHAR(100) DEFAULT NULL AFTER direccion,
ADD COLUMN remember_token_expiry DATETIME DEFAULT NULL AFTER remember_token,
ADD COLUMN ultimo_acceso DATETIME DEFAULT NULL AFTER remember_token_expiry,
ADD COLUMN activo TINYINT(1) DEFAULT 1 AFTER ultimo_acceso,
ADD COLUMN created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP AFTER activo,
ADD COLUMN updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP AFTER created_at,
ADD INDEX idx_email (email),
ADD INDEX idx_remember_token (remember_token);
