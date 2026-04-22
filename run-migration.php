<?php
require_once __DIR__ . '/config/database.php';

$database = new Database();
$conn = $database->getConnection();

$sql = file_get_contents(__DIR__ . '/database/migration-suscripciones.sql');
$statements = array_filter(array_map('trim', explode(';', $sql)));

$success = 0;
$errors = [];

foreach ($statements as $i => $statement) {
    $clean = preg_replace('/^\s*--.*$/m', '', $statement);
    $clean = trim($clean);
    if (empty($clean)) continue;
    if (stripos($clean, 'CREATE DATABASE') === 0) continue;
    if (stripos($clean, 'USE ') === 0) continue;
    
    try {
        $conn->exec($statement);
        $success++;
        echo "[OK] Sentencia " . ($i + 1) . "\n";
    } catch (PDOException $e) {
        if (strpos($e->getMessage(), 'already exists') !== false || strpos($e->getMessage(), 'Duplicate entry') !== false) {
            echo "[SKIP] Sentencia " . ($i + 1) . " (ya existe)\n";
            $success++;
        } else {
            $errors[] = "Sentencia " . ($i + 1) . ": " . $e->getMessage();
            echo "[ERR] Sentencia " . ($i + 1) . ": " . $e->getMessage() . "\n";
        }
    }
}

echo "\nResultado: $success OK, " . count($errors) . " errores\n";

// Verificar
$tables = ['planes', 'plan_precios', 'tasas_cambio', 'suscripciones', 'pagos', 'superadmins'];
foreach ($tables as $t) {
    try {
        $c = $conn->query("SELECT COUNT(*) FROM $t")->fetchColumn();
        echo "$t: $c registros\n";
    } catch (PDOException $e) {
        echo "$t: ERROR\n";
    }
}
