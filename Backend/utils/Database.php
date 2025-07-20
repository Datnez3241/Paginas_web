<?php
require_once __DIR__ . '/../config/database.php';

class Database {
    private static $instance = null;
    private $connection;

    private function __construct() {
        $config = require __DIR__ . '/../config/database.php';
        
        try {
            $dsn = "mysql:host={$config['host']};dbname={$config['database']};charset={$config['charset']}";
            $this->connection = new PDO(
                $dsn,
                $config['user'],
                $config['password'],
                $config['options']
            );
        } catch (PDOException $e) {
            die("Error de conexión: " . $e->getMessage());
        }
    }

    public static function getInstance() {
        if (self::$instance === null) {
            self::$instance = new self();
        }
        return self::$instance;
    }

    public function getConnection() {
        return $this->connection;
    }

    // Prevenir la clonación del objeto
    private function __clone() {}
    
    // Prevenir la deserialización del objeto
    public function __wakeup() {
        throw new Exception("No se puede deserializar una conexión a la base de datos");
    }
}

// Función de ayuda para obtener la conexión
getDBConnection() {
    return Database::getInstance()->getConnection();
}
