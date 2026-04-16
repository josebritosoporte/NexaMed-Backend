<?php
/**
 * Verificación de variables de entorno para Railway
 */

header('Content-Type: text/plain; charset=utf-8');

echo "========================================\n";
echo "Verificación de Variables de Entorno\n";
echo "========================================\n\n";

$vars = [
    'MYSQLHOST',
    'MYSQLPORT',
    'MYSQLDATABASE',
    'MYSQLUSER',
    'MYSQLPASSWORD',
    'DB_HOST',
    'DB_PORT',
    'DB_NAME',
    'DB_USER',
    'DB_PASS'
];

echo "Variables de entorno disponibles:\n\n";

foreach ($vars as $var) {
    $value = getenv($var);
    if ($value !== false) {
        // Ocultar contraseñas parcialmente
        if (stripos($var, 'PASS') !== false || stripos($var, 'PASSWORD') !== false) {
            $masked = substr($value, 0, 3) . str_repeat('*', strlen($value) - 6) . substr($value, -3);
            echo "✓ $var = $masked\n";
        } else {
            echo "✓ $var = $value\n";
        }
    } else {
        echo "✗ $var = NO DEFINIDA\n";
    }
}

echo "\n========================================\n";
echo "Detección de entorno:\n";

if (getenv('MYSQLHOST')) {
    echo "→ Entorno Railway detectado\n";
} else {
    echo "→ Entorno local/XAMPP detectado\n";
}

echo "\n========================================\n";
echo "Prueba de conexión:\n";

try {
    require_once __DIR__ . '/config/database.php';
    $db = new Database();
    $conn = $db->getConnection();
    echo "✓ Conexión exitosa\n";
} catch (Exception $e) {
    echo "✗ Error: " . $e->getMessage() . "\n";
}

echo "========================================\n";
