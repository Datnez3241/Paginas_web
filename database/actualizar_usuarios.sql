-- Asegurarse de que la tabla usuarios tenga la estructura correcta
-- Primero, verificar si la tabla existe
SET @dbname = DATABASE();
SET @tablename = 'usuarios';
SET @preparedStatement = (SELECT IF(
    (
        SELECT COUNT(*) FROM INFORMATION_SCHEMA.TABLES 
        WHERE TABLE_SCHEMA = @dbname 
        AND TABLE_NAME = @tablename
    ) > 0, 'SELECT 1', CONCAT('CREATE TABLE ', @tablename, ' (
        id INT AUTO_INCREMENT PRIMARY KEY,
        nombre_completo VARCHAR(100) NOT NULL,
        correo VARCHAR(100) NOT NULL UNIQUE,
        contrasena VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;'
)));

PREPARE stmt FROM @preparedStatement;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Agregar columnas si no existen
SET @dbname = DATABASE();
SET @tablename = 'usuarios';

-- Verificar y agregar columna 'nombre_completo' si no existe
SET @column_name = 'nombre_completo';
SET @preparedStatement = (SELECT IF(
    (
        SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS
        WHERE TABLE_SCHEMA = @dbname
        AND TABLE_NAME = @tablename
        AND COLUMN_NAME = @column_name
    ) = 0,
    CONCAT('ALTER TABLE ', @tablename, ' ADD COLUMN ', @column_name, ' VARCHAR(100) NOT NULL AFTER id;'),
    'SELECT 1'
));

PREPARE stmt FROM @preparedStatement;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Verificar y agregar columna 'correo' si no existe
SET @column_name = 'correo';
SET @preparedStatement = (SELECT IF(
    (
        SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS
        WHERE TABLE_SCHEMA = @dbname
        AND TABLE_NAME = @tablename
        AND COLUMN_NAME = @column_name
    ) = 0,
    CONCAT('ALTER TABLE ', @tablename, ' ADD COLUMN ', @column_name, ' VARCHAR(100) NOT NULL AFTER nombre_completo, ADD UNIQUE INDEX idx_', @column_name, ' (', @column_name, ');'),
    'SELECT 1'
));

PREPARE stmt FROM @preparedStatement;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Verificar y agregar columna 'contrasena' si no existe
SET @column_name = 'contrasena';
SET @preparedStatement = (SELECT IF(
    (
        SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS
        WHERE TABLE_SCHEMA = @dbname
        AND TABLE_NAME = @tablename
        AND COLUMN_NAME = @column_name
    ) = 0,
    CONCAT('ALTER TABLE ', @tablename, ' ADD COLUMN ', @column_name, ' VARCHAR(255) NOT NULL AFTER correo;'),
    'SELECT 1'
));

PREPARE stmt FROM @preparedStatement;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Verificar y agregar columna 'created_at' si no existe
SET @column_name = 'created_at';
SET @preparedStatement = (SELECT IF(
    (
        SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS
        WHERE TABLE_SCHEMA = @dbname
        AND TABLE_NAME = @tablename
        AND COLUMN_NAME = @column_name
    ) = 0,
    CONCAT('ALTER TABLE ', @tablename, ' ADD COLUMN ', @column_name, ' TIMESTAMP DEFAULT CURRENT_TIMESTAMP;'),
    'SELECT 1'
));

PREPARE stmt FROM @preparedStatement;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Verificar y agregar columna 'updated_at' si no existe
SET @column_name = 'updated_at';
SET @preparedStatement = (SELECT IF(
    (
        SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS
        WHERE TABLE_SCHEMA = @dbname
        AND TABLE_NAME = @tablename
        AND COLUMN_NAME = @column_name
    ) = 0,
    CONCAT('ALTER TABLE ', @tablename, ' ADD COLUMN ', @column_name, ' TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP;'),
    'SELECT 1'
));

PREPARE stmt FROM @preparedStatement;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Crear índices si no existen
-- Índice para búsqueda por correo
SET @index_name = 'idx_correo';
SET @preparedStatement = (SELECT IF(
    (
        SELECT COUNT(*) FROM INFORMATION_SCHEMA.STATISTICS
        WHERE TABLE_SCHEMA = @dbname
        AND TABLE_NAME = @tablename
        AND INDEX_NAME = @index_name
    ) = 0,
    CONCAT('CREATE INDEX ', @index_name, ' ON ', @tablename, '(correo);'),
    'SELECT 1'
));

PREPARE stmt FROM @preparedStatement;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Mostrar la estructura final de la tabla
SELECT * FROM INFORMATION_SCHEMA.COLUMNS 
WHERE TABLE_SCHEMA = @dbname 
AND TABLE_NAME = @tablename
ORDER BY ORDINAL_POSITION;
