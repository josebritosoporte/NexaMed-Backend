<?php
/**
 * NexaMed - API de Autenticación
 * Endpoints: POST /login, POST /logout, GET /me
 */

require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../models/Usuario.php';
require_once __DIR__ . '/../utils/jwt.php';
require_once __DIR__ . '/../utils/response.php';
require_once __DIR__ . '/../middleware/cors.php';

// Aplicar CORS
$cors = new CorsMiddleware();
$cors->handle();

// Obtener método y ruta
$method = $_SERVER['REQUEST_METHOD'];
$path = isset($_GET['action']) ? $_GET['action'] : '';

$usuarioModel = new Usuario();

switch ($method) {
    case 'POST':
        $data = json_decode(file_get_contents('php://input'), true);
        
        switch ($path) {
            case 'login':
                handleLogin($data, $usuarioModel);
                break;
                
            case 'logout':
                // El logout se maneja en el frontend eliminando el token
                Response::success(null, 'Sesión cerrada exitosamente');
                break;
                
            default:
                Response::error('Acción no válida', 404);
        }
        break;
        
    case 'GET':
        switch ($path) {
            case 'me':
                handleGetMe($usuarioModel);
                break;
                
            default:
                Response::error('Acción no válida', 404);
        }
        break;
        
    default:
        Response::error('Método no permitido', 405);
}

/**
 * Manejar login
 */
function handleLogin($data, $usuarioModel) {
    // Validar datos
    if (empty($data['email']) || empty($data['password'])) {
        Response::error('Email y contraseña son requeridos', 400);
    }

    $email = strtolower(trim($data['email']));
    $password = $data['password'];

    // Buscar usuario
    $usuario = $usuarioModel->findByEmail($email);
    
    if (!$usuario) {
        Response::error('Correo electrónico o contraseña incorrectos', 401);
    }

    // Verificar contraseña
    if (!password_verify($password, $usuario['password_hash'])) {
        Response::error('Correo electrónico o contraseña incorrectos', 401);
    }

    // Actualizar último acceso
    $usuarioModel->updateLastAccess($usuario['id']);

    // Generar token JWT
    $tokenData = [
        'id' => $usuario['id'],
        'email' => $usuario['email'],
        'name' => $usuario['nombre'],
        'role' => $usuario['role'],
        'consultorio_id' => $usuario['consultorio_id'],
        'avatar' => $usuario['avatar_url']
    ];

    $token = JWT::generate($tokenData);

    // Respuesta exitosa
    Response::success([
        'user' => [
            'id' => $usuario['id'],
            'email' => $usuario['email'],
            'name' => $usuario['nombre'],
            'role' => $usuario['role'],
            'consultorio_id' => $usuario['consultorio_id'],
            'avatar' => $usuario['avatar_url'],
            'especialidad' => $usuario['especialidad'],
            'registro' => $usuario['registro_medico']
        ],
        'token' => $token
    ], 'Inicio de sesión exitoso');
}

/**
 * Obtener datos del usuario autenticado
 */
function handleGetMe($usuarioModel) {
    $token = JWT::getBearerToken();
    
    if (!$token) {
        Response::unauthorized('Token no proporcionado');
    }

    $validation = JWT::validate($token);
    
    if (!$validation['valid']) {
        Response::unauthorized($validation['error']);
    }

    $userId = $validation['user_id'];
    $usuario = $usuarioModel->getById($userId);

    if (!$usuario) {
        Response::notFound('Usuario no encontrado');
    }

    Response::success([
        'id' => $usuario['id'],
        'email' => $usuario['email'],
        'name' => $usuario['nombre'],
        'role' => $usuario['role'],
        'consultorio_id' => $usuario['consultorio_id'],
        'avatar' => $usuario['avatar_url'],
        'especialidad' => $usuario['especialidad'],
        'registro' => $usuario['registro_medico'],
        'biografia' => $usuario['biografia'],
        'telefono' => $usuario['telefono']
    ]);
}
