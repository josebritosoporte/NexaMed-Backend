<?php
/**
 * DaliaMed - Script de inicialización para Railway
 * Ejecuta el esquema de base de datos y datos iniciales
 */

header('Content-Type: text/plain; charset=utf-8');

echo "========================================\n";
echo "DaliaMed - Inicialización de Base de Datos\n";
echo "========================================\n\n";

try {
    // Cargar configuración de base de datos
    require_once __DIR__ . '/config/database.php';
    
    $database = new Database();
    $conn = $database->getConnection();
    
    echo "✓ Conexión a base de datos exitosa\n";
    echo "  Host: " . (getenv('MYSQLHOST') ?: 'localhost') . "\n";
    echo "  Database: " . (getenv('MYSQLDATABASE') ?: 'daliamed') . "\n\n";
    
    // Leer archivo SQL
    $sqlFile = __DIR__ . '/database/schema-mysql.sql';
    if (!file_exists($sqlFile)) {
        throw new Exception("Archivo SQL no encontrado: $sqlFile");
    }
    
    $sql = file_get_contents($sqlFile);
    
    // Dividir en sentencias individuales
    $statements = array_filter(array_map('trim', explode(';', $sql)));
    
    echo "Ejecutando esquema de base de datos...\n";
    echo "Total de sentencias: " . count($statements) . "\n\n";
    
    $success = 0;
    $errors = [];
    
    foreach ($statements as $i => $statement) {
        if (empty($statement)) continue;
        
        // Ignorar comentarios y CREATE DATABASE/USE
        $cleanStatement = preg_replace('/^\s*--.*$/m', '', $statement);
        $cleanStatement = trim($cleanStatement);
        
        if (empty($cleanStatement)) continue;
        if (stripos($cleanStatement, 'CREATE DATABASE') === 0) continue;
        if (stripos($cleanStatement, 'USE ') === 0) continue;
        
        try {
            $conn->exec($statement);
            $success++;
            echo "  [✓] Sentencia " . ($i + 1) . " ejecutada\n";
        } catch (PDOException $e) {
            // Ignorar errores de "already exists"
            if (strpos($e->getMessage(), 'already exists') !== false ||
                strpos($e->getMessage(), 'Duplicate entry') !== false) {
                echo "  [⚠] Sentencia " . ($i + 1) . " (ya existe)\n";
                $success++;
            } else {
                $errors[] = "Sentencia " . ($i + 1) . ": " . $e->getMessage();
                echo "  [✗] Sentencia " . ($i + 1) . " ERROR\n";
            }
        }
    }
    
    echo "\n========================================\n";
    echo "Resultado:\n";
    echo "  Exitosas: $success\n";
    echo "  Errores: " . count($errors) . "\n";
    
    if (!empty($errors)) {
        echo "\nDetalles de errores:\n";
        foreach ($errors as $error) {
            echo "  - $error\n";
        }
    }
    
    echo "\n========================================\n";
    echo "✓ Inicialización completada\n";
    echo "========================================\n";
    
    // Verificar datos
    echo "\nVerificación de datos:\n";
    
    $tables = ['consultorios', 'usuarios', 'pacientes', 'citas'];
    foreach ($tables as $table) {
        try {
            $count = $conn->query("SELECT COUNT(*) FROM $table")->fetchColumn();
            echo "  - $table: $count registros\n";
        } catch (PDOException $e) {
            echo "  - $table: ERROR - " . $e->getMessage() . "\n";
        }
    }
    
    echo "\nCredenciales de acceso demo:\n";
    echo "  Email: admin@daliamed.com\n";
    echo "  Contraseña: admin123\n";
    
} catch (Exception $e) {
    echo "\n✗ ERROR: " . $e->getMessage() . "\n";
    echo "Trace: " . $e->getTraceAsString() . "\n";
    exit(1);
}
