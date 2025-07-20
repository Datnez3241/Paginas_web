<?php
session_start();
header('Content-Type: application/json');

if (isset($_SESSION['usuario_id'])) {
    echo json_encode([
        'loggedIn' => true,
        'usuario' => [
            'id' => $_SESSION['usuario_id'],
            'nombre' => $_SESSION['usuario_nombre'] ?? '',
            'correo' => $_SESSION['usuario_correo'] ?? ''
        ]
    ]);
} else {
    echo json_encode(['loggedIn' => false]);
}
?>
