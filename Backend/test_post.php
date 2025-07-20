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
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $input = file_get_contents('php://input');
    $data = json_decode($input, true);
    
    http_response_code(200);
    echo json_encode([
        'success' => true,
        'message' => 'Solicitud POST recibida correctamente',
        'method' => $_SERVER['REQUEST_METHOD'],
        'data' => $data,
        'post' => $_POST,
        'content_type' => $_SERVER['CONTENT_TYPE'] ?? 'No content type',
        'request_uri' => $_SERVER['REQUEST_URI']
    ]);
} else {
    http_response_code(405);
    echo json_encode([
        'success' => false,
        'message' => 'Método no permitido',
        'method' => $_SERVER['REQUEST_METHOD'],
        'allowed_methods' => ['POST', 'OPTIONS']
    ]);
}
?>
