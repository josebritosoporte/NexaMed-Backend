<?php
/**
 * DaliaMed - API de Autenticación
 * Endpoints: POST /login, POST /logout, GET /me
 */

require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../models/Usuario.php';
require_once __DIR__ . '/../models/Suscripcion.php';
require_once __DIR__ . '/../models/Plan.php';
require_once __DIR__ . '/../models/Notificacion.php';
require_once __DIR__ . '/../utils/jwt.php';
require_once __DIR__ . '/../utils/response.php';
require_once __DIR__ . '/../middleware/cors.php';
require_once __DIR__ . '/../middleware/subscription.php';

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

            case 'register':
                handleRegister($data, $usuarioModel);
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

    // Respuesta exitosa con info de suscripción
    $subscriptionInfo = SubscriptionMiddleware::getSubscriptionInfo($usuario['consultorio_id']);

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
        'token' => $token,
        'subscription' => $subscriptionInfo
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

/**
 * Manejar registro público (crea consultorio + usuario + trial)
 */
function handleRegister($data, $usuarioModel) {
    // Validar campos obligatorios
    $required = ['nombre', 'email', 'password', 'consultorio_nombre'];
    foreach ($required as $field) {
        if (empty($data[$field])) {
            Response::error("El campo '$field' es obligatorio", 400);
        }
    }

    $email = strtolower(trim($data['email']));
    $nombre = trim($data['nombre']);
    $password = $data['password'];
    $consultorioNombre = trim($data['consultorio_nombre']);
    $especialidad = isset($data['especialidad']) ? trim($data['especialidad']) : null;

    if (strlen($password) < 6) {
        Response::error('La contraseña debe tener al menos 6 caracteres', 400);
    }

    // Verificar que el email no exista
    $existing = $usuarioModel->findByEmail($email);
    if ($existing) {
        Response::error('Ya existe una cuenta con este correo electrónico', 409);
    }

    $db = (new Database())->getConnection();
    $db->beginTransaction();

    try {
        // 1. Crear consultorio
        $stmt = $db->prepare("INSERT INTO consultorios (nombre) VALUES (?)");
        $stmt->execute([$consultorioNombre]);
        $consultorioId = $db->lastInsertId();

        // 2. Crear usuario admin
        $passwordHash = password_hash($password, PASSWORD_DEFAULT);
        $stmt = $db->prepare("
            INSERT INTO usuarios (consultorio_id, nombre, email, password_hash, role, activo)
            VALUES (?, ?, ?, ?, 'admin', 1)
        ");
        $stmt->execute([$consultorioId, $nombre, $email, $passwordHash]);
        $userId = $db->lastInsertId();

        if ($especialidad) {
            $stmt = $db->prepare("UPDATE usuarios SET especialidad = ? WHERE id = ?");
            $stmt->execute([$especialidad, $userId]);
        }

        // 3. Obtener plan Profesional para trial
        $planModel = new Plan();
        $planPro = $planModel->getBySlug('profesional');
        if (!$planPro) {
            throw new Exception('Plan profesional no encontrado');
        }

        // 4. Crear suscripción trial (14 días)
        $now = date('Y-m-d H:i:s');
        $trialEnd = date('Y-m-d H:i:s', strtotime('+14 days'));
        $stmt = $db->prepare("
            INSERT INTO suscripciones (consultorio_id, plan_id, estado, periodo, fecha_inicio, fecha_fin, trial_ends_at)
            VALUES (?, ?, 'trial', 'mensual', ?, ?, ?)
        ");
        $stmt->execute([$consultorioId, $planPro['id'], $now, $trialEnd, $trialEnd]);

        // 5. Notificación de bienvenida
        $notifModel = new Notificacion();
        $notifModel->notificarBienvenida($consultorioId);

        $db->commit();

        // Generar token JWT
        $tokenData = [
            'id' => $userId,
            'email' => $email,
            'name' => $nombre,
            'role' => 'admin',
            'consultorio_id' => $consultorioId,
            'avatar' => null
        ];
        $token = JWT::generate($tokenData);

        $subscriptionInfo = SubscriptionMiddleware::getSubscriptionInfo($consultorioId);

        Response::success([
            'user' => [
                'id' => $userId,
                'email' => $email,
                'name' => $nombre,
                'role' => 'admin',
                'consultorio_id' => $consultorioId,
                'avatar' => null,
                'especialidad' => $especialidad,
                'registro' => null
            ],
            'token' => $token,
            'subscription' => $subscriptionInfo
        ], 'Registro exitoso. Tu prueba gratuita de 14 días ha comenzado.');
    } catch (Exception $e) {
        $db->rollBack();
        Response::error('Error al registrar: ' . $e->getMessage(), 500);
    }
}
