<?php
require_once __DIR__ . '/BaseController.php';
require_once __DIR__ . '/../models/User.php';

class AuthController extends BaseController {
    private $userModel;

    public function __construct() {
        $this->userModel = new User();
    }

    /**
     * Maneja el registro de usuarios
     */
    public function register() {
        // Solo permitir método POST
        if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
            return $this->jsonResponse(['success' => false, 'message' => 'Método no permitido'], 405);
        }

        // Obtener y validar datos
        $data = json_decode(file_get_contents('php://input'), true);
        
        $rules = [
            'nombre' => 'required|min:3|max:50',
            'apellido' => 'required|min:3|max:50',
            'email' => 'required|email',
            'password' => 'required|min:8',
            'telefono' => 'required',
            'direccion' => 'required'
        ];
        
        $validation = $this->validate($data, $rules);
        if ($validation !== true) {
            return $this->jsonResponse(['success' => false, 'errors' => $validation], 400);
        }
        
        // Verificar si el correo ya existe
        if ($this->userModel->findByEmail($data['email'])) {
            return $this->jsonResponse([
                'success' => false, 
                'message' => 'El correo electrónico ya está registrado'
            ], 400);
        }
        
        // Crear usuario
        $result = $this->userModel->create([
            'nombre' => $data['nombre'],
            'apellido' => $data['apellido'],
            'email' => $data['email'],
            'password' => password_hash($data['password'], PASSWORD_DEFAULT),
            'telefono' => $data['telefono'],
            'direccion' => $data['direccion']
        ]);
        
        if ($result) {
            // Iniciar sesión
            session_start();
            $_SESSION['user_id'] = $result;
            
            return $this->jsonResponse([
                'success' => true, 
                'message' => 'Usuario registrado exitosamente',
                'redirect' => 'index.html'
            ]);
        }
        
        return $this->jsonResponse([
            'success' => false, 
            'message' => 'Error al registrar el usuario'
        ], 500);
    }

    /**
     * Maneja el inicio de sesión
     */
    public function login() {
        // Solo permitir método POST
        if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
            return $this->jsonResponse(['success' => false, 'message' => 'Método no permitido'], 405);
        }

        try {
            // Obtener y validar datos
            $data = json_decode(file_get_contents('php://input'), true);
            
            if (json_last_error() !== JSON_ERROR_NONE) {
                throw new Exception('Formato de datos inválido');
            }
            
            $rules = [
                'email' => 'required|email',
                'password' => 'required'
            ];
            
            $validation = $this->validate($data, $rules);
            if ($validation !== true) {
                return $this->jsonResponse([
                    'success' => false, 
                    'message' => 'Error de validación',
                    'errors' => $validation
                ], 400);
            }
            
            // Buscar usuario
            $user = $this->userModel->findByEmail($data['email']);
            
            if (!$user) {
                return $this->jsonResponse([
                    'success' => false, 
                    'message' => 'Credenciales inválidas'
                ], 401);
            }
            
            if (!password_verify($data['password'], $user['password'])) {
                return $this->jsonResponse([
                    'success' => false, 
                    'message' => 'Credenciales inválidas'
                ], 401);
            }
            
            // Iniciar sesión
            if (session_status() === PHP_SESSION_NONE) {
                session_start([
                    'cookie_lifetime' => 86400, // 24 horas
                    'cookie_secure' => isset($_SERVER['HTTPS']),
                    'cookie_httponly' => true,
                    'cookie_samesite' => 'Lax'
                ]);
            }
            
            // Regenerar ID de sesión por seguridad
            session_regenerate_id(true);
            
            $_SESSION['user_id'] = $user['id'];
            $_SESSION['user_email'] = $user['email'];
            $_SESSION['user_name'] = $user['nombre'] . ' ' . $user['apellido'];
            $_SESSION['last_activity'] = time();
            
            // Actualizar último acceso
            $this->userModel->updateLastAccess($user['id']);
            
            // Configurar cookie de sesión si se solicitó "recordar"
            $remember = $data['remember'] ?? false;
            if ($remember) {
                $token = bin2hex(random_bytes(32));
                $expires = time() + (30 * 24 * 60 * 60); // 30 días
                $expiryDate = date('Y-m-d H:i:s', $expires);
                
                // Guardar el token en la base de datos
                if ($this->userModel->updateRememberToken($user['id'], $token, $expiryDate)) {
                    // Configurar la cookie HTTP-only segura
                    setcookie(
                        'remember_token',
                        $token,
                        [
                            'expires' => $expires,
                            'path' => '/',
                            'domain' => '',
                            'secure' => isset($_SERVER['HTTPS']),
                            'httponly' => true,
                            'samesite' => 'Lax'
                        ]
                    );
                } else {
                    error_log('No se pudo guardar el token de recordar en la base de datos');
                }
            }
            
            return $this->jsonResponse([
                'success' => true,
                'message' => 'Inicio de sesión exitoso',
                'user' => [
                    'id' => $user['id'],
                    'name' => $user['nombre'] . ' ' . $user['apellido'],
                    'email' => $user['email']
                ]
            ]);
            
        } catch (Exception $e) {
            error_log('Error en login: ' . $e->getMessage());
            return $this->jsonResponse([
                'success' => false,
                'message' => 'Error en el servidor. Por favor, inténtalo de nuevo.'
            ], 500);
        }
    }
    
    /**
     * Maneja el cierre de sesión
     */
    public function logout() {
        session_start();
        session_destroy();
        
        return $this->jsonResponse([
            'success' => true, 
            'message' => 'Sesión cerrada correctamente',
            'redirect' => 'index.html'
        ]);
    }
    
    /**
     * Verifica si hay una sesión activa
     */
    public function checkSession() {
        session_start();
        
        if (isset($_SESSION['user_id'])) {
            $user = $this->userModel->findById($_SESSION['user_id']);
            
            if ($user) {
                return $this->jsonResponse([
                    'success' => true,
                    'user' => [
                        'id' => $user['id'],
                        'nombre' => $user['nombre'],
                        'email' => $user['email']
                    ]
                ]);
            }
        }
        
        return $this->jsonResponse(['success' => false], 401);
    }
}
