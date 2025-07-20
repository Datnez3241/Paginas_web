<?php
// Habilitar reporte de errores
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

// Configurar cabeceras CORS
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');
header('Content-Type: application/json; charset=utf-8');

// Manejar petición OPTIONS (preflight)
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Verificar método POST
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode([
        'success' => false,
        'message' => 'Método no permitido',
        'method' => $_SERVER['REQUEST_METHOD']
    ]);
    exit;
}

// Obtener datos del cuerpo de la petición
$input = file_get_contents('php://input');
$data = json_decode($input, true);

// Validar datos recibidos
if (json_last_error() !== JSON_ERROR_NONE) {
    http_response_code(400);
    echo json_encode([
        'success' => false,
        'message' => 'Error en el formato de los datos JSON',
        'error' => json_last_error_msg()
    ]);
    exit;
}

// Validar campos requeridos
$required = ['nombre_completo', 'correo', 'contrasena', 'confirmar_contrasena'];
$missing = [];
foreach ($required as $field) {
    if (empty($data[$field])) {
        $missing[] = $field;
    }
}

if (!empty($missing)) {
    http_response_code(400);
    echo json_encode([
        'success' => false,
        'message' => 'Faltan campos requeridos',
        'missing_fields' => $missing
    ]);
    exit;
}

// Validar formato de correo
if (!filter_var($data['correo'], FILTER_VALIDATE_EMAIL)) {
    http_response_code(400);
    echo json_encode([
        'success' => false,
        'message' => 'Formato de correo electrónico no válido'
    ]);
    exit;
}

// Validar coincidencia de contraseñas
if ($data['contrasena'] !== $data['confirmar_contrasena']) {
    http_response_code(400);
    echo json_encode([
        'success' => false,
        'message' => 'Las contraseñas no coinciden'
    ]);
    exit;
}

// Validar longitud mínima de contraseña
if (strlen($data['contrasena']) < 6) {
    http_response_code(400);
    echo json_encode([
        'success' => false,
        'message' => 'La contraseña debe tener al menos 6 caracteres'
    ]);
    exit;
}

// Si llegamos aquí, los datos son válidos
http_response_code(200);
echo json_encode([
    'success' => true,
    'message' => 'Datos de registro válidos',
    'data' => [
        'nombre_completo' => $data['nombre_completo'],
        'correo' => $data['correo'],
        'contrasena_length' => strlen($data['contrasena'])
    ]
]);
