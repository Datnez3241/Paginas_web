<?php
// Habilitar reporte de errores
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

// Configurar zona horaria
date_default_timezone_set('America/Mexico_City');

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

// Obtener la ruta solicitada
$request_uri = str_replace('/PROYECTO2/Backend', '', $_SERVER['REQUEST_URI']);
$request_uri = explode('?', $request_uri)[0]; // Eliminar parámetros de consulta

// Enrutamiento
switch ($request_uri) {
    case '/api/register':
        require 'registro.php';
        break;
        
    case '/api/login':
        require 'login.php';
        break;
        
    default:
        // Ruta no encontrada
        http_response_code(404);
        echo json_encode([
            'success' => false,
            'message' => 'Ruta no encontrada',
            'request_uri' => $request_uri
        ]);
        break;
}
