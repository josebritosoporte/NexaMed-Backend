<?php
/**
 * NexaMed - API Router Principal (Sin mod_rewrite)
 * Punto de entrada para todas las peticiones API
 * 
 * Uso: api.php?endpoint=auth&action=login
 *      api.php?endpoint=pacientes&id=1
 */

// Configuración de errores (desactivar en producción)
error_reporting(E_ALL);
ini_set('display_errors', 0);
ini_set('log_errors', 1);

// Cargar dependencias
require_once __DIR__ . '/middleware/cors.php';
require_once __DIR__ . '/utils/response.php';

// Aplicar CORS globalmente
$cors = new CorsMiddleware();
$cors->handle();

// Obtener parámetros de la URL
$endpoint = isset($_GET['endpoint']) ? $_GET['endpoint'] : '';
$action = isset($_GET['action']) ? $_GET['action'] : '';
$id = isset($_GET['id']) ? (int)$_GET['id'] : null;

// Router
switch ($endpoint) {
    case 'auth':
        $_GET['action'] = $action;
        require_once __DIR__ . '/api/auth.php';
        break;
        
    case 'pacientes':
        $_GET['id'] = $id;
        require_once __DIR__ . '/api/pacientes.php';
        break;
        
    case 'consultas':
        $_GET['id'] = $id;
        require_once __DIR__ . '/api/consultas.php';
        break;
        
    case 'ordenes':
        $_GET['id'] = $id;
        require_once __DIR__ . '/api/ordenes.php';
        break;
        
    case 'citas':
        $_GET['id'] = $id;
        require_once __DIR__ . '/api/citas.php';
        break;
        
    case 'dashboard':
        $_GET['action'] = $action;
        require_once __DIR__ . '/api/dashboard.php';
        break;
        
    case 'usuarios':
        $_GET['action'] = $action;
        require_once __DIR__ . '/api/usuarios.php';
        break;
        
    case 'admin_usuarios':
        $_GET['id'] = $id;
        require_once __DIR__ . '/api/admin_usuarios.php';
        break;
        
    default:
        // Endpoint de prueba/health check
        if (empty($endpoint)) {
            Response::success([
                'message' => 'NexaMed API v1.0',
                'status' => 'running',
                'modo' => 'Query String (sin mod_rewrite)',
                'timestamp' => date('Y-m-d H:i:s'),
                'endpoints_disponibles' => [
                    'auth' => 'api.php?endpoint=auth&action=login (POST)',
                    'pacientes' => 'api.php?endpoint=pacientes (GET, POST)',
                    'consultas' => 'api.php?endpoint=consultas (GET, POST)',
                    'ordenes' => 'api.php?endpoint=ordenes (GET, POST)',
                    'citas' => 'api.php?endpoint=citas (GET, POST)',
                    'dashboard' => 'api.php?endpoint=dashboard&action=stats (GET)',
                    'usuarios' => 'api.php?endpoint=usuarios&action=profile (GET, PUT)',
                    'admin_usuarios' => 'api.php?endpoint=admin_usuarios (GET, POST, PUT, DELETE) - Solo admin'
                ]
            ]);
        }
        Response::notFound('Endpoint no encontrado: ' . $endpoint);
}
