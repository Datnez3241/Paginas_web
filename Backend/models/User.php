<?php
require_once __DIR__ . '/../utils/Database.php';

class User {
    private $db;
    private $table = 'usuarios';

    public function __construct() {
        $this->db = Database::getInstance()->getConnection();
    }

    /**
     * Crea un nuevo usuario
     * 
     * @param array $data Datos del usuario
     * @return int|bool ID del usuario creado o false en caso de error
     */
    public function create($data) {
        $query = "INSERT INTO {$this->table} (nombre, apellido, email, password, telefono, direccion) 
                 VALUES (:nombre, :apellido, :email, :password, :telefono, :direccion)";
        
        $stmt = $this->db->prepare($query);
        
        try {
            $this->db->beginTransaction();
            $result = $stmt->execute([
                ':nombre' => $data['nombre'],
                ':apellido' => $data['apellido'],
                ':email' => $data['email'],
                ':password' => $data['password'],
                ':telefono' => $data['telefono'],
                ':direccion' => $data['direccion']
            ]);
            $userId = $this->db->lastInsertId();
            $this->db->commit();
            
            return $userId;
        } catch (PDOException $e) {
            $this->db->rollBack();
            error_log("Error al crear usuario: " . $e->getMessage());
            return false;
        }
    }

    /**
     * Busca un usuario por su email
     * 
     * @param string $email Email del usuario a buscar
     * @return array|bool Datos del usuario o false si no se encuentra
     */
    public function findByEmail($email) {
        $query = "SELECT * FROM {$this->table} WHERE email = :email LIMIT 1";
        $stmt = $this->db->prepare($query);
        $stmt->execute([':email' => $email]);
        
        return $stmt->fetch(PDO::FETCH_ASSOC);
    }
    
    /**
     * Busca un usuario por su ID
     * 
     * @param int $id ID del usuario a buscar
     * @return array|bool Datos del usuario o false si no se encuentra
     */
    public function findById($id) {
        $query = "SELECT id, nombre, apellido, email, telefono, direccion FROM {$this->table} WHERE id = :id LIMIT 1";
        $stmt = $this->db->prepare($query);
        $stmt->execute([':id' => $id]);
        
        return $stmt->fetch(PDO::FETCH_ASSOC);
    }
    
    /**
     * Actualiza los datos de un usuario
     * 
     * @param int $id ID del usuario a actualizar
     * @param array $data Datos a actualizar
     * @return bool true si la actualización fue exitosa, false en caso contrario
     */
    /**
     * Actualiza la fecha del último acceso del usuario
     * 
     * @param int $id ID del usuario
     * @return bool true si la actualización fue exitosa
     */
    public function updateLastAccess($id) {
        $query = "UPDATE {$this->table} SET ultimo_acceso = NOW() WHERE id = :id";
        $stmt = $this->db->prepare($query);
        
        try {
            return $stmt->execute([':id' => $id]);
        } catch (PDOException $e) {
            error_log("Error al actualizar último acceso: " . $e->getMessage());
            return false;
        }
    }
    
    /**
     * Actualiza el token de recordar contraseña
     * 
     * @param int $id ID del usuario
     * @param string $token Token de recordar
     * @param string $expiry Fecha de expiración (formato Y-m-d H:i:s)
     * @return bool true si la actualización fue exitosa
     */
    public function updateRememberToken($id, $token, $expiry) {
        $query = "UPDATE {$this->table} SET 
                 remember_token = :token, 
                 remember_token_expiry = :expiry 
                 WHERE id = :id";
        
        $stmt = $this->db->prepare($query);
        
        try {
            return $stmt->execute([
                ':token' => $token,
                ':expiry' => $expiry,
                ':id' => $id
            ]);
        } catch (PDOException $e) {
            error_log("Error al actualizar token de recordar: " . $e->getMessage());
            return false;
        }
    }
    
    /**
     * Busca un usuario por su token de recordar
     * 
     * @param string $token Token de recordar
     * @return array|bool Datos del usuario o false si no se encuentra o el token expiró
     */
    public function findByRememberToken($token) {
        $query = "SELECT * FROM {$this->table} 
                 WHERE remember_token = :token 
                 AND remember_token_expiry > NOW() 
                 LIMIT 1";
        
        $stmt = $this->db->prepare($query);
        $stmt->execute([':token' => $token]);
        
        return $stmt->fetch(PDO::FETCH_ASSOC);
    }
    
    public function update($id, $data) {
        // Construir la consulta dinámicamente basada en los campos proporcionados
        $updates = [];
        $params = [':id' => $id];
        
        foreach ($data as $key => $value) {
            // No actualizar la contraseña directamente aquí
            if ($key === 'password' && !empty($value)) {
                $updates[] = "password = :password";
                $params[':password'] = password_hash($value, PASSWORD_DEFAULT);
            } elseif ($key !== 'password') {
                $updates[] = "$key = :$key";
                $params[":$key"] = $value;
            }
        }
        
        if (empty($updates)) {
            return false; // No hay nada que actualizar
        }
        
        $query = "UPDATE {$this->table} SET " . implode(', ', $updates) . " WHERE id = :id";
        $stmt = $this->db->prepare($query);
        
        try {
            $this->db->beginTransaction();
            $result = $stmt->execute($params);
            $this->db->commit();
            return $result;
        } catch (PDOException $e) {
            $this->db->rollBack();
            error_log("Error al actualizar usuario: " . $e->getMessage());
            return false;
        }
    }
}
