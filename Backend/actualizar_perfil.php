<?php
session_start();
header('Content-Type: application/json');
if (!isset($_SESSION['usuario_id'])) {
    echo json_encode(['success' => false, 'message' => 'No autenticado']);
    exit;
}
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    echo json_encode(['success' => false, 'message' => 'Método no permitido']);
    exit;
}
require 'db.php';

$id = $_SESSION['usuario_id'];
$nombre = trim($_POST['nombre_completo'] ?? '');
$correo = trim($_POST['correo'] ?? '');
$contrasena = $_POST['contrasena'] ?? '';

if (!$nombre || !$correo) {
    echo json_encode(['success' => false, 'message' => 'Nombre y correo son obligatorios']);
    exit;
}

// Verificar si el correo ya existe en otro usuario
$stmt = $conn->prepare('SELECT id FROM usuarios WHERE correo = ? AND id != ? LIMIT 1');
$stmt->bind_param('si', $correo, $id);
$stmt->execute();
$stmt->store_result();
if ($stmt->num_rows > 0) {
    echo json_encode(['success' => false, 'message' => 'El correo ya está registrado por otro usuario']);
    $stmt->close();
    exit;
}
$stmt->close();

if ($contrasena) {
    $hash = password_hash($contrasena, PASSWORD_BCRYPT);
    $stmt = $conn->prepare('UPDATE usuarios SET nombre_completo = ?, correo = ?, contrasena = ? WHERE id = ?');
    $stmt->bind_param('sssi', $nombre, $correo, $hash, $id);
} else {
    $stmt = $conn->prepare('UPDATE usuarios SET nombre_completo = ?, correo = ? WHERE id = ?');
    $stmt->bind_param('ssi', $nombre, $correo, $id);
}
if ($stmt->execute()) {
    $_SESSION['usuario_nombre'] = $nombre;
    $_SESSION['usuario_correo'] = $correo;
    echo json_encode(['success' => true, 'message' => 'Perfil actualizado correctamente']);
} else {
    echo json_encode(['success' => false, 'message' => 'Error al actualizar: ' . $stmt->error]);
}
$stmt->close();
$conn->close();
?>
