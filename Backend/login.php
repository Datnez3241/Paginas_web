<?php
// Habilitar reporte de errores
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

// Configurar cabeceras CORS
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');
header('Content-Type: application/json; charset=utf-8');

// Manejar petición OPTIONS (preflight)
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Verificar método POST
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'message' => 'Método no permitido']);
    exit;
}

try {
    // Obtener datos del cuerpo de la petición
    $json = file_get_contents('php://input');
    $data = json_decode($json, true);

    // Validar datos recibidos
    if (json_last_error() !== JSON_ERROR_NONE) {
        throw new Exception('Error en el formato de los datos');
    }

    // Validar campos requeridos
    if (empty($data['correo']) || empty($data['password'])) {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'Todos los campos son obligatorios']);
        exit;
    }

    // Incluir archivo de conexión a la base de datos
    require 'db.php';

    // Buscar usuario por correo
    $stmt = $conn->prepare('SELECT id, nombre_completo, contrasena FROM usuarios WHERE correo = ? LIMIT 1');
    $stmt->bind_param('s', $data['correo']);
    $stmt->execute();
    $result = $stmt->get_result();
    
    if ($row = $result->fetch_assoc()) {
        // Verificar contraseña
        if (password_verify($data['password'], $row['contrasena'])) {
            // Iniciar sesión
            session_start();
            $_SESSION['user_id'] = $row['id'];
            $_SESSION['user_email'] = $data['correo'];
            $_SESSION['user_name'] = $row['nombre_completo'];
            
            // Actualizar último acceso
            $fecha_actual = date('Y-m-d H:i:s');
            $update = $conn->prepare('UPDATE usuarios SET ultimo_acceso = ? WHERE id = ?');
            $update->bind_param('si', $fecha_actual, $row['id']);
            $update->execute();
            $update->close();
            
            // Respuesta exitosa
            http_response_code(200);
            echo json_encode([
                'success' => true, 
                'message' => 'Inicio de sesión exitoso',
                'user' => [
                    'id' => $row['id'],
                    'nombre_completo' => $row['nombre_completo'],
                    'correo' => $data['correo']
                ]
            ]);
        } else {
            // Contraseña incorrecta
            http_response_code(401);
            echo json_encode(['success' => false, 'message' => 'Credenciales inválidas']);
        }
    } else {
        // Usuario no encontrado
        http_response_code(404);
        echo json_encode(['success' => false, 'message' => 'Usuario no encontrado']);
    }
    
    $stmt->close();
    $conn->close();
    
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false, 
        'message' => 'Error en el servidor: ' . $e->getMessage()
    ]);
}
