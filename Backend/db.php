<?php
// Configuración de la conexión a la base de datos
define('DB_HOST', 'localhost');
define('DB_PORT', '3306'); // Puerto predeterminado de MySQL
define('DB_USER', 'root');
define('DB_PASS', '');
define('DB_NAME', 'dulceria_victoria');
// Ruta al socket de MySQL (importante para conexiones locales)
define('DB_SOCKET', 'C:/xampp/mysql/mysql.sock');

// Función para conectar a la base de datos
function connectToDatabase() {
    $connection = null;
    
    // Intentar conexión usando socket (más confiable en local)
    try {
        // Intentar con socket primero (más rápido para conexiones locales)
        $connection = new mysqli(
            'localhost', 
            DB_USER, 
            DB_PASS, 
            DB_NAME,
            null, // Sin puerto
            DB_SOCKET // Usar socket
        );
        
        if ($connection->connect_error) {
            throw new Exception("Error de conexión (socket): " . $connection->connect_error);
        }
        
        // Configurar el juego de caracteres
        $connection->set_charset('utf8mb4');
        return $connection;
        
    } catch (Exception $e) {
        error_log("Error al conectar vía socket: " . $e->getMessage());
        
        // Si falla, intentar con TCP/IP
        try {
            $connection = new mysqli(DB_HOST, DB_USER, DB_PASS, DB_NAME, DB_PORT);
            
            if ($connection->connect_error) {
                throw new Exception("Error de conexión (TCP/IP): " . $connection->connect_error);
            }
            
            $connection->set_charset('utf8mb4');
            return $connection;
            
        } catch (Exception $tcpError) {
            error_log("Error en conexión TCP/IP: " . $tcpError->getMessage());
            
            // Último intento: sin puerto
            try {
                $connection = new mysqli(DB_HOST, DB_USER, DB_PASS, DB_NAME);
                
                if ($connection->connect_error) {
                    throw new Exception("Error de conexión (sin puerto): " . $connection->connect_error);
                }
                
                $connection->set_charset('utf8mb4');
                return $connection;
                
            } catch (Exception $lastError) {
                error_log("Error en último intento de conexión: " . $lastError->getMessage());
                return null;
            }
        }
    }
}

// Establecer conexión global
$conn = connectToDatabase();

// Verificar si la conexión se estableció correctamente
if (!$conn) {
    // Obtener el último error de MySQL si está disponible
    $errorMsg = "No se pudo conectar a la base de datos. ";
    $errorMsg .= "Por favor, verifica la configuración del servidor.";
    
    if (function_exists('mysqli_connect_error')) {
        $errorMsg .= " Detalles: " . mysqli_connect_error();
    }
    
    // Registrar el error
    error_log($errorMsg);
    
    // Mostrar mensaje de error detallado en desarrollo
    $showDetailedErrors = (in_array($_SERVER['REMOTE_ADDR'], ['127.0.0.1', '::1']));
    
    die(json_encode([
        'success' => false,
        'message' => $showDetailedErrors ? $errorMsg : 'Error de conexión con la base de datos.',
        'error' => $showDetailedErrors ? [
            'host' => DB_HOST,
            'port' => DB_PORT,
            'user' => DB_USER,
            'database' => DB_NAME,
            'error' => mysqli_connect_error()
        ] : null
    ]));
}
?>
