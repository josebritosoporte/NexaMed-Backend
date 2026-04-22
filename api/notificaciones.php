<?php
/**
 * DaliaMed - API de Notificaciones
 * Endpoints: GET (listar, contar), PUT (marcar leída/todas)
 */

require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../models/Notificacion.php';
require_once __DIR__ . '/../utils/jwt.php';
require_once __DIR__ . '/../utils/response.php';
require_once __DIR__ . '/../middleware/cors.php';

$cors = new CorsMiddleware();
$cors->handle();

$method = $_SERVER['REQUEST_METHOD'];
$action = isset($_GET['action']) ? $_GET['action'] : '';
$id = isset($_GET['id']) ? (int)$_GET['id'] : null;

// Autenticar
$token = JWT::getBearerToken();
if (!$token) Response::unauthorized('Token no proporcionado');
$validation = JWT::validate($token);
if (!$validation['valid']) Response::unauthorized($validation['error']);

$consultorioId = $validation['consultorio_id'];
$notificacionModel = new Notificacion();

switch ($method) {
    case 'GET':
        if ($action === 'count') {
            $count = $notificacionModel->contarNoLeidas($consultorioId);
            Response::success(['count' => $count]);
        } else {
            $soloNoLeidas = isset($_GET['no_leidas']) && $_GET['no_leidas'] === '1';
            $limit = isset($_GET['limit']) ? (int)$_GET['limit'] : 20;
            $notificaciones = $notificacionModel->getByConsultorio($consultorioId, $limit, $soloNoLeidas);
            Response::success($notificaciones);
        }
        break;

    case 'PUT':
        if ($action === 'leer-todas') {
            $notificacionModel->marcarTodasLeidas($consultorioId);
            Response::success(null, 'Todas las notificaciones marcadas como leídas');
        } elseif ($id) {
            $notificacionModel->marcarLeida($id, $consultorioId);
            Response::success(null, 'Notificación marcada como leída');
        } else {
            Response::error('ID de notificación requerido', 400);
        }
        break;

    default:
        Response::error('Método no permitido', 405);
}
