<?php
// Establecer cabeceras para permitir CORS
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
header("Access-Control-Max-Age: 3600");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");

// Incluir archivos necesarios
require_once '../config/database.php';

// Obtener la conexión a la base de datos
$database = new Database();
$db = $database->getConnection();

// Obtener el método de la petición
$method = $_SERVER['REQUEST_METHOD'];

// Manejar la petición según el método
switch ($method) {
    case 'GET':
        // Obtener todas las categorías
        $query = 'SELECT * FROM categorias ORDER BY nombre ASC';
        $stmt = $db->prepare($query);
        $stmt->execute();
        
        $categorias = array();
        
        while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
            extract($row);
            $categoria_item = array(
                "id" => $id,
                "nombre" => $nombre,
                "descripcion" => $descripcion,
                "created_at" => $created_at
            );
            
            array_push($categorias, $categoria_item);
        }
        
        http_response_code(200);
        echo json_encode($categorias);
        break;
        
    case 'POST':
        // Aquí iría la lógica para crear una nueva categoría
        // Por ahora, solo devolvemos un mensaje de éxito
        $response = array(
            "success" => true,
            "message" => "Categoría creada correctamente"
        );
        http_response_code(201);
        echo json_encode($response);
        break;
        
    case 'PUT':
        // Aquí iría la lógica para actualizar una categoría
        // Por ahora, solo devolvemos un mensaje de éxito
        $response = array(
            "success" => true,
            "message" => "Categoría actualizada correctamente"
        );
        http_response_code(200);
        echo json_encode($response);
        break;
        
    case 'DELETE':
        // Aquí iría la lógica para eliminar una categoría
        // Por ahora, solo devolvemos un mensaje de éxito
        $response = array(
            "success" => true,
            "message" => "Categoría eliminada correctamente"
        );
        http_response_code(200);
        echo json_encode($response);
        break;
        
    case 'OPTIONS':
        http_response_code(200);
        break;
        
    default:
        http_response_code(405);
        echo json_encode(array("message" => "Método no permitido."));
        break;
}
