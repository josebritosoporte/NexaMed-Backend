<?php
/**
 * NexaMed - Middleware de Autenticación
 */

require_once __DIR__ . '/../utils/jwt.php';
require_once __DIR__ . '/../utils/response.php';

class AuthMiddleware {
    
    /**
     * Verificar autenticación
     */
    public static function authenticate() {
        $token = JWT::getBearerToken();
        
        if (!$token) {
            Response::unauthorized('Token de autenticación no proporcionado');
        }

        $validation = JWT::validate($token);
        
        if (!$validation['valid']) {
            Response::unauthorized($validation['error']);
        }

        // Guardar usuario en variable global para uso posterior
        $GLOBALS['current_user'] = $validation['data'];
        $GLOBALS['current_user_id'] = $validation['user_id'];
        
        return $validation['data'];
    }

    /**
     * Verificar rol específico
     */
    public static function requireRole($roles) {
        $user = self::authenticate();
        
        if (!is_array($roles)) {
            $roles = [$roles];
        }

        if (!in_array($user['role'], $roles)) {
            Response::error('No tiene permisos para realizar esta acción', 403);
        }

        return $user;
    }

    /**
     * Verificar que el usuario pertenezca al mismo consultorio
     */
    public static function requireSameConsultorio($consultorioId) {
        $user = self::authenticate();
        
        if ($user['role'] !== 'admin' && $user['consultorio_id'] != $consultorioId) {
            Response::unauthorized('No tiene acceso a este recurso');
        }

        return $user;
    }

    /**
     * Obtener usuario actual
     */
    public static function getCurrentUser() {
        return $GLOBALS['current_user'] ?? null;
    }

    /**
     * Obtener ID del usuario actual
     */
    public static function getCurrentUserId() {
        return $GLOBALS['current_user_id'] ?? null;
    }

    /**
     * Obtener consultorio del usuario actual
     */
    public static function getCurrentConsultorioId() {
        $user = $GLOBALS['current_user'] ?? null;
        return $user ? $user['consultorio_id'] : null;
    }
}
