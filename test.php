<?php
/**
 * Test simple del backend
 */

echo "<h1>Test NexaMed Backend</h1>";

// Test 1: Verificar PHP funciona
echo "<p>✓ PHP está funcionando</p>";

// Test 2: Verificar archivos existen
$files = [
    'middleware/cors.php',
    'utils/response.php',
    'config/database.php',
    'api.php'
];

echo "<h2>Verificando archivos:</h2>";
foreach ($files as $file) {
    if (file_exists(__DIR__ . '/' . $file)) {
        echo "<p>✓ $file existe</p>";
    } else {
        echo "<p style='color:red'>✗ $file NO existe</p>";
    }
}

// Test 3: Intentar cargar CORS
echo "<h2>Cargando CORS:</h2>";
try {
    require_once __DIR__ . '/middleware/cors.php';
    echo "<p>✓ CORS cargado correctamente</p>";
} catch (Exception $e) {
    echo "<p style='color:red'>✗ Error CORS: " . $e->getMessage() . "</p>";
}

// Test 4: Intentar cargar Response
echo "<h2>Cargando Response:</h2>";
try {
    require_once __DIR__ . '/utils/response.php';
    echo "<p>✓ Response cargado correctamente</p>";
} catch (Exception $e) {
    echo "<p style='color:red'>✗ Error Response: " . $e->getMessage() . "</p>";
}

echo "<hr>";
echo "<p><a href='api.php'>Ir a api.php</a></p>";
