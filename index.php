<?php
/**
 * NexaMed - API Router Principal
 * Punto de entrada para todas las peticiones API
 */

// Configuración de errores (desactivar en producción)
error_reporting(E_ALL);
ini_set('display_errors', 1);

// Cargar dependencias
require_once __DIR__ . '/middleware/cors.php';
require_once __DIR__ . '/utils/response.php';

// Aplicar CORS globalmente
$cors = new CorsMiddleware();
$cors->handle();

// Obtener la ruta de la URL
$requestUri = $_SERVER['REQUEST_URI'];
$basePath = '/NexaMed-Backend/';
$path = parse_url($requestUri, PHP_URL_PATH);

// Remover basePath si existe
if (strpos($path, $basePath) === 0) {
    $path = substr($path, strlen($basePath));
}

// Remover 'api/' del inicio si existe
$path = ltrim($path, '/');
if (strpos($path, 'api/') === 0) {
    $path = substr($path, 4);
}

// Separar endpoint y acción
$parts = explode('/', $path);
$endpoint = isset($parts[0]) ? $parts[0] : '';
$action = isset($parts[1]) ? $parts[1] : '';

// Router
switch ($endpoint) {
    case 'auth':
        $_GET['action'] = $action;
        require_once __DIR__ . '/api/auth.php';
        break;
        
    case 'pacientes':
        require_once __DIR__ . '/api/pacientes.php';
        break;
        
    case 'consultas':
        require_once __DIR__ . '/api/consultas.php';
        break;
        
    case 'ordenes':
        require_once __DIR__ . '/api/ordenes.php';
        break;
        
    case 'citas':
        require_once __DIR__ . '/api/citas.php';
        break;
        
    case 'dashboard':
        require_once __DIR__ . '/api/dashboard.php';
        break;
        
    default:
        // Endpoint de prueba/health check
        if (empty($endpoint)) {
            Response::success([
                'message' => 'NexaMed API v1.0',
                'status' => 'running',
                'timestamp' => date('Y-m-d H:i:s')
            ]);
        }
        Response::notFound('Endpoint no encontrado: ' . $endpoint);
}
