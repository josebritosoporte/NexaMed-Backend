<?php
/**
 * DaliaMed - API de Administración de Usuarios
 * Solo accesible para administradores
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
$userRole = $user['role'];

// Solo administradores pueden gestionar usuarios
if ($userRole !== 'admin') {
    Response::error('No tiene permisos para esta acción', 403);
}

// Obtener método
$method = $_SERVER['REQUEST_METHOD'];
$id = isset($_GET['id']) ? (int)$_GET['id'] : null;

try {
    $usuarioModel = new Usuario();
    
    switch ($method) {
        case 'GET':
            if ($id) {
                // Obtener usuario específico
                $usuario = $usuarioModel->getById($id);
                if ($usuario && $usuario['consultorio_id'] == $consultorioId) {
                    // Remover password_hash de la respuesta
                    unset($usuario['password_hash']);
                    Response::success($usuario);
                } else {
                    Response::notFound('Usuario no encontrado');
                }
            } else {
                // Listar todos los usuarios del consultorio
                $usuarios = $usuarioModel->getAll($consultorioId);
                // Remover password_hash de todas las respuestas
                foreach ($usuarios as &$usuario) {
                    unset($usuario['password_hash']);
                }
                Response::success($usuarios);
            }
            break;
            
        case 'POST':
            // Crear nuevo usuario
            $data = json_decode(file_get_contents('php://input'), true);
            
            // Validaciones
            if (empty($data['nombre']) || empty($data['email']) || empty($data['password']) || empty($data['role'])) {
                Response::error('Nombre, email, contraseña y rol son requeridos', 400);
            }
            
            if (!in_array($data['role'], ['admin', 'doctor', 'assistant'])) {
                Response::error('Rol no válido', 400);
            }
            
            if (strlen($data['password']) < 6) {
                Response::error('La contraseña debe tener al menos 6 caracteres', 400);
            }
            
            // Verificar email único
            $existingUser = $usuarioModel->findByEmail($data['email']);
            if ($existingUser) {
                Response::error('Ya existe un usuario con este email', 409);
            }
            
            // Preparar datos
            $userData = [
                'consultorio_id' => $consultorioId,
                'email' => $data['email'],
                'password_hash' => password_hash($data['password'], PASSWORD_BCRYPT),
                'nombre' => $data['nombre'],
                'role' => $data['role'],
                'especialidad' => $data['especialidad'] ?? null,
                'registro_medico' => $data['registro_medico'] ?? null,
                'telefono' => $data['telefono'] ?? null,
                'biografia' => $data['biografia'] ?? null
            ];
            
            $newId = $usuarioModel->create($userData);
            if ($newId) {
                $newUser = $usuarioModel->getById($newId);
                unset($newUser['password_hash']);
                Response::success($newUser, 'Usuario creado correctamente', 201);
            } else {
                Response::serverError('Error al crear usuario');
            }
            break;
            
        case 'PUT':
            if (!$id) {
                Response::error('ID de usuario requerido', 400);
            }
            
            $data = json_decode(file_get_contents('php://input'), true);
            
            // Verificar que el usuario existe y pertenece al consultorio (incluye inactivos)
            $existingUser = $usuarioModel->getByIdWithInactive($id);
            if (!$existingUser || $existingUser['consultorio_id'] != $consultorioId) {
                Response::notFound('Usuario no encontrado');
            }
            
            // No permitir desactivar el propio usuario admin
            if ($id == $userId && isset($data['activo']) && $data['activo'] == false) {
                Response::error('No puede desactivar su propia cuenta', 400);
            }
            
            // Si hay cambio de contraseña
            if (!empty($data['password'])) {
                if (strlen($data['password']) < 6) {
                    Response::error('La contraseña debe tener al menos 6 caracteres', 400);
                }
                $usuarioModel->updatePassword($id, password_hash($data['password'], PASSWORD_BCRYPT));
            }
            
            // Actualizar datos del usuario
            $updateData = [
                'nombre' => $data['nombre'] ?? $existingUser['nombre'],
                'email' => $data['email'] ?? $existingUser['email'],
                'role' => $data['role'] ?? $existingUser['role'],
                'telefono' => $data['telefono'] ?? $existingUser['telefono'],
                'especialidad' => $data['especialidad'] ?? $existingUser['especialidad'],
                'registro_medico' => $data['registro_medico'] ?? $existingUser['registro_medico'],
                'biografia' => $data['biografia'] ?? $existingUser['biografia'],
                'activo' => $data['activo'] ?? $existingUser['activo']
            ];
            
            if ($usuarioModel->update($id, $updateData)) {
                $updatedUser = $usuarioModel->getById($id);
                unset($updatedUser['password_hash']);
                Response::success($updatedUser, 'Usuario actualizado correctamente');
            } else {
                Response::serverError('Error al actualizar usuario');
            }
            break;
            
        case 'DELETE':
            if (!$id) {
                Response::error('ID de usuario requerido', 400);
            }
            
            // No permitir eliminar el propio usuario
            if ($id == $userId) {
                Response::error('No puede eliminar su propia cuenta', 400);
            }
            
            // Verificar que el usuario existe y pertenece al consultorio
            $existingUser = $usuarioModel->getById($id);
            if (!$existingUser || $existingUser['consultorio_id'] != $consultorioId) {
                Response::notFound('Usuario no encontrado');
            }
            
            // Desactivar usuario (eliminación lógica)
            if ($usuarioModel->toggleActive($id, false)) {
                Response::success(null, 'Usuario desactivado correctamente');
            } else {
                Response::serverError('Error al desactivar usuario');
            }
            break;
            
        default:
            Response::error('Método no permitido', 405);
    }
    
} catch (Exception $e) {
    Response::serverError('Error: ' . $e->getMessage());
}
