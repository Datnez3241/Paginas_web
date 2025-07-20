<?php
// Configuración de la base de datos
return [
    'host' => 'localhost',
    'user' => 'root',
    'password' => '',
    'database' => 'dulceria_victoria',
    'charset' => 'utf8mb4',
    'options' => [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
        PDO::ATTR_EMULATE_PREPARES => false,
    ],
];
