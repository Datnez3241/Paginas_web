<?php
// Configuración de la base de datos
$host = 'localhost';
$dbname = 'dulceria_victoria';
$username = 'root';
$password = '';

try {
    // Crear conexión PDO
    $conn = new PDO("mysql:host=$host;dbname=$dbname", $username, $password);
    $conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    
    // Leer el archivo SQL
    $sql = file_get_contents('actualizar_usuarios.sql');
    
    // Dividir el script en consultas individuales
    $queries = explode(';', $sql);
    
    // Ejecutar cada consulta
    foreach ($queries as $query) {
        $query = trim($query);
        if (!empty($query)) {
            $conn->exec($query);
            echo "Consulta ejecutada con éxito: " . substr($query, 0, 50) . "...<br>";
        }
    }
    
    echo "<h2>¡Actualización completada con éxito!</h2>";
    
} catch(PDOException $e) {
    echo "<h2>Error al ejecutar la actualización:</h2>";
    echo "<p>" . $e->getMessage() . "</p>";
}
?>
