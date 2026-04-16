<?php
/**
 * Script para actualizar contraseñas de usuarios de prueba
 * Ejecutar: http://localhost/NexaMed/NexaMed-Backend/database/update-passwords.php
 */

require_once __DIR__ . '/../config/database.php';

try {
    $database = new Database();
    $conn = $database->getConnection();
    
    // Contraseña: admin123
    $passwordHash = '$2y$10$jR9WEPPI.HzA61KmQSwYg.C1.jL6fYhF3fEyml6BuCIIzVnMgAPZ2';
    
    // Actualizar todos los usuarios de prueba
    $sql = "UPDATE usuarios SET password_hash = :hash WHERE email IN ('dr.rodriguez@nexamed.com', 'asistente@nexamed.com', 'admin@nexamed.com')";
    $stmt = $conn->prepare($sql);
    $stmt->execute([':hash' => $passwordHash]);
    
    $rowCount = $stmt->rowCount();
    
    echo json_encode([
        'success' => true,
        'message' => "Contraseñas actualizadas correctamente",
        'usuarios_actualizados' => $rowCount
    ], JSON_PRETTY_PRINT);
    
} catch (Exception $e) {
    echo json_encode([
        'success' => false,
        'message' => 'Error: ' . $e->getMessage()
    ], JSON_PRETTY_PRINT);
}
