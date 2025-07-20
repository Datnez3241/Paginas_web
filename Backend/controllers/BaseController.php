<?php
class BaseController {
    /**
     * Envía una respuesta JSON al cliente
     * 
     * @param mixed $data Datos a enviar en la respuesta
     * @param int $statusCode Código de estado HTTP
     */
    protected function jsonResponse($data, $statusCode = 200) {
        http_response_code($statusCode);
        header('Content-Type: application/json');
        echo json_encode($data);
        exit;
    }

    /**
     * Valida los datos de entrada
     * 
     * @param array $data Datos a validar
     * @param array $rules Reglas de validación
     * @return array|bool Array de errores o true si la validación es exitosa
     */
    protected function validate($data, $rules) {
        $errors = [];
        
        foreach ($rules as $field => $validations) {
            $validations = explode('|', $validations);
            
            foreach ($validations as $validation) {
                $params = [];
                
                // Verificar si la validación tiene parámetros
                if (strpos($validation, ':') !== false) {
                    list($validation, $paramStr) = explode(':', $validation, 2);
                    $params = explode(',', $paramStr);
                }
                
                $method = 'validate' . ucfirst($validation);
                
                if (method_exists($this, $method)) {
                    $result = $this->$method($field, $data[$field] ?? null, $params);
                    if ($result !== true) {
                        $errors[$field][] = $result;
                    }
                }
            }
        }
        
        return empty($errors) ? true : $errors;
    }
    
    // Métodos de validación
    private function validateRequired($field, $value) {
        if (empty($value)) {
            return "El campo $field es requerido";
        }
        return true;
    }
    
    private function validateEmail($field, $value) {
        if (!filter_var($value, FILTER_VALIDATE_EMAIL)) {
            return "El campo $field debe ser un correo electrónico válido";
        }
        return true;
    }
    
    private function validateMin($field, $value, $params) {
        $min = (int)($params[0] ?? 0);
        if (strlen($value) < $min) {
            return "El campo $field debe tener al menos $min caracteres";
        }
        return true;
    }
    
    private function validateMax($field, $value, $params) {
        $max = (int)($params[0] ?? 0);
        if (strlen($value) > $max) {
            return "El campo $field no debe exceder los $max caracteres";
        }
        return true;
    }
}
