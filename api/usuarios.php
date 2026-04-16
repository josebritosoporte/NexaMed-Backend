<?php
/**
 * NexaMed - API de Usuarios
 */

require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../utils/response.php';
require_once __DIR__ . '/../middleware/cors.php';
require_once __DIR__ . '/../middleware/auth.php';
require_once __DIR__ . '/../models/Usuario.php';

// Aplicar CORS
$cors = new CorsMiddleware();
$cors->handle();

// Verificar autenticación
$user = AuthMiddleware::authenticate();
$userId = $user['id'];
$consultorioId = $user['consultorio_id'];

// Obtener método
$method = $_SERVER['REQUEST_METHOD'];

try {
    $usuarioModel = new Usuario();
    
    switch ($method) {
        case 'GET':
            // Obtener perfil del usuario actual
            $action = isset($_GET['action']) ? $_GET['action'] : 'profile';
            
            if ($action === 'profile') {
                $profile = $usuarioModel->getById($userId);
                if ($profile) {
                    Response::success($profile);
                } else {
                    Response::notFound('Usuario no encontrado');
                }
            } else {
                Response::notFound('Acción no encontrada');
            }
            break;
            
        case 'PUT':
            $data = json_decode(file_get_contents('php://input'), true);
            $action = isset($_GET['action']) ? $_GET['action'] : 'update';
            
            if ($action === 'password') {
                // Cambiar contraseña
                if (!isset($data['password_actual']) || !isset($data['password_nueva'])) {
                    Response::error('Se requiere contraseña actual y nueva', 400);
                }
                
                // Verificar contraseña actual
                $currentUser = $usuarioModel->getById($userId);
                if (!password_verify($data['password_actual'], $currentUser['password_hash'])) {
                    Response::error('Contraseña actual incorrecta', 401);
                }
                
                // Validar nueva contraseña
                if (strlen($data['password_nueva']) < 6) {
                    Response::error('La nueva contraseña debe tener al menos 6 caracteres', 400);
                }
                
                // Actualizar contraseña
                $newHash = password_hash($data['password_nueva'], PASSWORD_BCRYPT);
                if ($usuarioModel->updatePassword($userId, $newHash)) {
                    Response::success(null, 'Contraseña actualizada correctamente');
                } else {
                    Response::serverError('Error al actualizar contraseña');
                }
                
            } else {
                // Actualizar perfil
                $allowedFields = ['nombre', 'telefono', 'especialidad', 'registro_medico', 'biografia'];
                $updateData = [];
                
                foreach ($allowedFields as $field) {
                    if (isset($data[$field])) {
                        $updateData[$field] = $data[$field];
                    }
                }
                
                if (empty($updateData)) {
                    Response::error('No hay datos para actualizar', 400);
                }
                
                if ($usuarioModel->updateProfile($userId, $updateData)) {
                    // Obtener perfil actualizado
                    $updatedProfile = $usuarioModel->getById($userId);
                    Response::success($updatedProfile, 'Perfil actualizado correctamente');
                } else {
                    Response::serverError('Error al actualizar perfil');
                }
            }
            break;
            
        default:
            Response::error('Método no permitido', 405);
    }
    
} catch (Exception $e) {
    Response::serverError('Error: ' . $e->getMessage());
}
