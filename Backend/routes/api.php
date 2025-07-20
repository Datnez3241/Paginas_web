<?php
// Configuración de CORS
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');
header('Access-Control-Allow-Credentials: true');

// Para peticiones OPTIONS (preflight)
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Configurar el tipo de contenido
header('Content-Type: application/json; charset=utf-8');

// Cargar controladores
require_once __DIR__ . '/../controllers/AuthController.php';

// Inicializar controladores
$authController = new AuthController();

// Obtener la ruta solicitada
$request_uri = $_SERVER['REQUEST_URI'];
$base_path = '/PROYECTO2/Backend/routes/api.php';
$route = str_replace($base_path, '', $request_uri);
$route = explode('?', $route)[0]; // Eliminar parámetros de consulta

// Rutas de la API
switch ($route) {
    case '/register':
        $authController->register();
        break;
        
    case '/login':
        $authController->login();
        break;
        
    case '/logout':
        $authController->logout();
        break;
        
    case '/check-session':
        $authController->checkSession();
        break;
        
    default:
        // Ruta no encontrada
        header('HTTP/1.1 404 Not Found');
        echo json_encode(['success' => false, 'message' => 'Ruta no encontrada']);
        break;
}
