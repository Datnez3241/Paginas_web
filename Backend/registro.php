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

// Obtener datos del cuerpo de la petición
$json = file_get_contents('php://input');
$data = json_decode($json, true);

// Validar datos recibidos
if (json_last_error() !== JSON_ERROR_NONE) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Error en el formato de los datos']);
    exit;
}

// Validar campos requeridos
$required = ['nombre_completo', 'correo', 'contrasena', 'confirmar_contrasena'];
foreach ($required as $field) {
    if (empty($data[$field])) {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'Todos los campos son obligatorios']);
        exit;
    }
}

// Validar formato de correo
if (!filter_var($data['correo'], FILTER_VALIDATE_EMAIL)) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Correo electrónico no válido']);
    exit;
}

// Validar coincidencia de contraseñas
if ($data['contrasena'] !== $data['confirmar_contrasena']) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Las contraseñas no coinciden']);
    exit;
}

// Validar longitud mínima de contraseña
if (strlen($data['contrasena']) < 6) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'La contraseña debe tener al menos 6 caracteres']);
    exit;
}

// Incluir archivo de conexión a la base de datos
require 'db.php';

// Verificar si el correo ya existe
try {
    $stmt = $conn->prepare('SELECT id FROM usuarios WHERE correo = ? LIMIT 1');
    $stmt->bind_param('s', $data['correo']);
    $stmt->execute();
    $stmt->store_result();
    
    if ($stmt->num_rows > 0) {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'El correo ya está registrado']);
        $stmt->close();
        exit;
    }
    $stmt->close();
    
    // Hash de la contraseña
    $hash = password_hash($data['contrasena'], PASSWORD_BCRYPT);
    
    // Insertar nuevo usuario
    $stmt = $conn->prepare('INSERT INTO usuarios (nombre_completo, correo, contrasena) VALUES (?, ?, ?)');
    $stmt->bind_param('sss', $data['nombre_completo'], $data['correo'], $hash);
    
    if ($stmt->execute()) {
        // Obtener el ID del usuario recién creado
        $user_id = $stmt->insert_id;
        
        // Iniciar sesión automáticamente después del registro
        session_start();
        $_SESSION['user_id'] = $user_id;
        $_SESSION['user_email'] = $data['correo'];
        $_SESSION['user_name'] = $data['nombre_completo'];
        
        http_response_code(201);
        echo json_encode([
            'success' => true, 
            'message' => 'Registro exitoso',
            'user' => [
                'id' => $user_id,
                'nombre_completo' => $data['nombre_completo'],
                'correo' => $data['correo']
            ]
        ]);
    } else {
        http_response_code(500);
        echo json_encode([
            'success' => false, 
            'message' => 'Error al registrar el usuario: ' . $conn->error
        ]);
    }
    
    $stmt->close();
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false, 
        'message' => 'Error en el servidor: ' . $e->getMessage()
    ]);
}

// Cerrar conexión
if (isset($conn)) {
    $conn->close();
}
?>
