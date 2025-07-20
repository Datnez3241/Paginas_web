<?php
// Establecer cabeceras para permitir CORS
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
header("Access-Control-Max-Age: 3600");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");

// Incluir archivos necesarios
require_once '../config/database.php';
require_once '../models/Producto.php';

// Inicializar la base de datos y el objeto Producto
$database = new Database();
$db = $database->getConnection();
$producto = new Producto($db);

// Obtener el método de la petición
$method = $_SERVER['REQUEST_METHOD'];

// Manejar la petición según el método
switch ($method) {
    case 'GET':
        // Obtener productos por categoría si se especifica
        $categoria_id = isset($_GET['categoria_id']) ? $_GET['categoria_id'] : null;
        
        if ($categoria_id) {
            $stmt = $producto->obtenerPorCategoria($categoria_id);
        } else {
            $stmt = $producto->obtenerTodos();
        }
        
        $productos_arr = array();
        
        while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
            extract($row);
            $producto_item = array(
                "id" => $id,
                "categoria_id" => $categoria_id,
                "categoria_nombre" => $categoria_nombre,
                "nombre" => $nombre,
                "descripcion" => $descripcion,
                "precio" => (float)$precio,
                "precio_anterior" => $precio_anterior ? (float)$precio_anterior : null,
                "imagen_url" => $imagen_url,
                "destacado" => (bool)$destacado,
                "stock" => (int)$stock,
                "created_at" => $created_at
            );
            
            array_push($productos_arr, $producto_item);
        }
        
        http_response_code(200);
        echo json_encode($productos_arr);
        break;
        
    case 'POST':
        // Verificar si es para subir una imagen
        if (isset($_FILES['imagen'])) {
            $target_dir = "../frontend/assets/img/imagen/";
            $file_extension = strtolower(pathinfo($_FILES["imagen"]["name"], PATHINFO_EXTENSION));
            $new_filename = uniqid() . '.' . $file_extension;
            $target_file = $target_dir . $new_filename;
            
            // Validar tipo de archivo
            $allowed_types = array('jpg', 'jpeg', 'png', 'gif');
            if (!in_array($file_extension, $allowed_types)) {
                http_response_code(400);
                echo json_encode(array("message" => "Solo se permiten archivos JPG, JPEG, PNG y GIF."));
                exit();
            }
            
            // Mover el archivo subido
            if (move_uploaded_file($_FILES["imagen"]["tmp_name"], $target_file)) {
                echo json_encode(array(
                    "success" => true,
                    "message" => "Imagen subida correctamente.",
                    "filename" => $new_filename
                ));
            } else {
                http_response_code(500);
                echo json_encode(array("message" => "Error al subir la imagen."));
            }
            exit();
        }
        
        // Obtener datos del cuerpo de la petición
        $data = json_decode(file_get_contents("php://input"));
        
        // Validar datos
        if (
            !empty($data->categoria_id) &&
            !empty($data->nombre) &&
            isset($data->precio) &&
            !empty($data->imagen_url)
        ) {
            // Asignar valores al objeto producto
            $producto->categoria_id = $data->categoria_id;
            $producto->nombre = $data->nombre;
            $producto->descripcion = $data->descripcion ?? '';
            $producto->precio = $data->precio;
            $producto->precio_anterior = $data->precio_anterior ?? null;
            $producto->imagen_url = $data->imagen_url;
            $producto->destacado = $data->destacado ?? false;
            $producto->stock = $data->stock ?? 0;
            
            // Crear el producto
            if ($producto->crear()) {
                http_response_code(201);
                echo json_encode(array(
                    "success" => true,
                    "message" => "Producto creado correctamente.",
                    "id" => $producto->id
                ));
            } else {
                http_response_code(503);
                echo json_encode(array("message" => "No se pudo crear el producto."));
            }
        } else {
            http_response_code(400);
            echo json_encode(array("message" => "No se pudo crear el producto. Datos incompletos."));
        }
        break;
        
    case 'PUT':
        // Obtener el ID del producto de la URL
        $id = isset($_GET['id']) ? $_GET['id'] : die();
        
        // Obtener datos del cuerpo de la petición
        $data = json_decode(file_get_contents("php://input"));
        
        // Asignar ID al producto
        $producto->id = $id;
        
        // Obtener el producto actual para mantener los valores no proporcionados
        $producto_actual = $producto->obtenerPorId($id);
        
        if ($producto_actual) {
            // Actualizar solo los campos proporcionados
            $producto->categoria_id = $data->categoria_id ?? $producto_actual['categoria_id'];
            $producto->nombre = $data->nombre ?? $producto_actual['nombre'];
            $producto->descripcion = $data->descripcion ?? $producto_actual['descripcion'];
            $producto->precio = $data->precio ?? $producto_actual['precio'];
            $producto->precio_anterior = $data->precio_anterior ?? $producto_actual['precio_anterior'];
            $producto->imagen_url = $data->imagen_url ?? $producto_actual['imagen_url'];
            $producto->destacado = $data->destacado ?? $producto_actual['destacado'];
            $producto->stock = $data->stock ?? $producto_actual['stock'];
            
            // Actualizar el producto
            if ($producto->actualizar()) {
                http_response_code(200);
                echo json_encode(array(
                    "success" => true,
                    "message" => "Producto actualizado correctamente."
                ));
            } else {
                http_response_code(503);
                echo json_encode(array("message" => "No se pudo actualizar el producto."));
            }
        } else {
            http_response_code(404);
            echo json_encode(array("message" => "Producto no encontrado."));
        }
        break;
        
    case 'DELETE':
        // Obtener el ID del producto de la URL
        $id = isset($_GET['id']) ? $_GET['id'] : die();
        
        // Asignar ID al producto
        $producto->id = $id;
        
        // Eliminar el producto
        if ($producto->eliminar()) {
            http_response_code(200);
            echo json_encode(array(
                "success" => true,
                "message" => "Producto eliminado correctamente."
            ));
        } else {
            http_response_code(503);
            echo json_encode(array("message" => "No se pudo eliminar el producto."));
        }
        break;
        
    case 'OPTIONS':
        http_response_code(200);
        break;
        
    default:
        http_response_code(405);
        echo json_encode(array("message" => "Método no permitido."));
        break;
}
