<?php
/**
 * Router para servidor PHP integrado (php -S)
 * Maneja enrutamiento y archivos estáticos para Railway
 */

$uri = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);

// Si es una llamada a la API, redirigir a api.php
if (strpos($uri, '/api/') === 0 || strpos($uri, '/api.php') === 0) {
    // Mantener query string
    $query = $_SERVER['QUERY_STRING'] ?? '';
    $_SERVER['SCRIPT_NAME'] = '/api.php';
    require __DIR__ . '/api.php';
    exit;
}

// Archivos estáticos (si existen en el futuro)
$staticExtensions = ['css', 'js', 'png', 'jpg', 'jpeg', 'gif', 'ico', 'svg', 'woff', 'woff2', 'ttf', 'eot'];
$ext = pathinfo($uri, PATHINFO_EXTENSION);

if (in_array($ext, $staticExtensions)) {
    $file = __DIR__ . $uri;
    if (file_exists($file) && is_file($file)) {
        $contentTypes = [
            'css' => 'text/css',
            'js' => 'application/javascript',
            'png' => 'image/png',
            'jpg' => 'image/jpeg',
            'jpeg' => 'image/jpeg',
            'gif' => 'image/gif',
            'ico' => 'image/x-icon',
            'svg' => 'image/svg+xml',
            'woff' => 'font/woff',
            'woff2' => 'font/woff2',
            'ttf' => 'font/ttf',
            'eot' => 'application/vnd.ms-fontobject'
        ];
        
        if (isset($contentTypes[$ext])) {
            header('Content-Type: ' . $contentTypes[$ext]);
        }
        
        readfile($file);
        exit;
    }
}

// Health check para Railway
if ($uri === '/health' || $uri === '/health/') {
    header('Content-Type: application/json');
    echo json_encode([
        'status' => 'ok',
        'service' => 'NexaMed API',
        'timestamp' => date('Y-m-d H:i:s')
    ]);
    exit;
}

// Seed endpoint para inicializar base de datos
if ($uri === '/seed' || $uri === '/seed/') {
    require __DIR__ . '/seed.php';
    exit;
}

// Endpoint raíz - información del API
if ($uri === '/' || $uri === '') {
    header('Content-Type: application/json');
    echo json_encode([
        'name' => 'NexaMed API',
        'version' => '1.0.0',
        'status' => 'running',
        'endpoints' => [
            'auth' => '/api.php?endpoint=auth',
            'pacientes' => '/api.php?endpoint=pacientes',
            'consultas' => '/api.php?endpoint=consultas',
            'ordenes' => '/api.php?endpoint=ordenes',
            'citas' => '/api.php?endpoint=citas',
            'dashboard' => '/api.php?endpoint=dashboard',
            'usuarios' => '/api.php?endpoint=usuarios',
            'admin_usuarios' => '/api.php?endpoint=admin_usuarios'
        ],
        'documentation' => 'https://github.com/nexamed/api-docs'
    ]);
    exit;
}

// Cualquier otra ruta va al API
$_SERVER['SCRIPT_NAME'] = '/api.php';
require __DIR__ . '/api.php';
