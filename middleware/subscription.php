<?php
/**
 * DaliaMed - Middleware de Suscripción
 * Verifica el estado de la suscripción del consultorio en cada request
 * 
 * Estados permitidos para escritura: trial, active, grace_period
 * Estados solo lectura: expired, suspended
 * Estado bloqueado total: cancelled
 */

require_once __DIR__ . '/../models/Suscripcion.php';
require_once __DIR__ . '/../utils/response.php';

class SubscriptionMiddleware {
    
    /**
     * Verificar que la suscripción existe y obtener datos
     * Retorna datos de la suscripción
     */
    public static function check($consultorioId) {
        $suscripcionModel = new Suscripcion();
        
        // Actualizar estados vencidos automáticamente
        $suscripcionModel->checkExpired();
        
        $suscripcion = $suscripcionModel->getByConsultorio($consultorioId);
        
        if (!$suscripcion) {
            Response::error('No tiene una suscripción activa. Por favor contacte al administrador.', 403);
        }
        
        // Guardar suscripción en global para uso posterior
        $GLOBALS['current_subscription'] = $suscripcion;
        
        return $suscripcion;
    }

    /**
     * Verificar que puede realizar operaciones de escritura
     * (crear, modificar, eliminar, imprimir, exportar)
     * 
     * Permitido: trial, active, grace_period
     * Bloqueado: expired, suspended, cancelled
     */
    public static function requireActive($consultorioId) {
        $suscripcion = self::check($consultorioId);
        
        $estado = $suscripcion['estado'];
        
        if (in_array($estado, ['expired', 'suspended', 'cancelled'])) {
            $msg = 'Su suscripción está ';
            switch ($estado) {
                case 'expired': $msg .= 'vencida'; break;
                case 'suspended': $msg .= 'suspendida'; break;
                case 'cancelled': $msg .= 'cancelada'; break;
            }
            $msg .= '. Solo puede consultar información existente. ';
            
            if ($estado === 'cancelled') {
                $msg .= 'Contacte al administrador para reactivar su cuenta.';
            } else {
                $msg .= 'Renueve su plan para continuar operando.';
            }
            
            Response::error($msg, 403, [
                'subscription_status' => $estado,
                'read_only' => true
            ]);
        }
        
        return $suscripcion;
    }

    /**
     * Solo verificar que tenga acceso al sistema (no cancelled)
     * Para operaciones de lectura
     */
    public static function requireAccess($consultorioId) {
        $suscripcion = self::check($consultorioId);
        
        if ($suscripcion['estado'] === 'cancelled') {
            Response::error('Su cuenta ha sido cancelada. Contacte al administrador.', 403, [
                'subscription_status' => 'cancelled',
                'blocked' => true
            ]);
        }
        
        return $suscripcion;
    }

    /**
     * Verificar límite de pacientes
     */
    public static function checkPacientesLimit($consultorioId) {
        $suscripcion = self::requireActive($consultorioId);
        
        require_once __DIR__ . '/../config/database.php';
        $db = new Database();
        $conn = $db->getConnection();
        
        $sql = "SELECT COUNT(*) FROM pacientes WHERE consultorio_id = :cid AND activo = TRUE";
        $stmt = $conn->prepare($sql);
        $stmt->execute([':cid' => $consultorioId]);
        $count = $stmt->fetchColumn();
        
        if ($count >= $suscripcion['max_pacientes']) {
            Response::error(
                "Ha alcanzado el límite de {$suscripcion['max_pacientes']} pacientes activos de su plan {$suscripcion['plan_nombre']}. Actualice su plan para agregar más.",
                403,
                ['subscription_limit' => 'pacientes', 'current' => (int)$count, 'max' => (int)$suscripcion['max_pacientes']]
            );
        }
        
        return $suscripcion;
    }

    /**
     * Verificar límite de usuarios
     */
    public static function checkUsuariosLimit($consultorioId) {
        $suscripcion = self::requireActive($consultorioId);
        
        require_once __DIR__ . '/../config/database.php';
        $db = new Database();
        $conn = $db->getConnection();
        
        $sql = "SELECT COUNT(*) FROM usuarios WHERE consultorio_id = :cid AND activo = TRUE";
        $stmt = $conn->prepare($sql);
        $stmt->execute([':cid' => $consultorioId]);
        $count = $stmt->fetchColumn();
        
        if ($count >= $suscripcion['max_usuarios']) {
            Response::error(
                "Ha alcanzado el límite de {$suscripcion['max_usuarios']} usuarios de su plan {$suscripcion['plan_nombre']}. Actualice su plan para agregar más.",
                403,
                ['subscription_limit' => 'usuarios', 'current' => (int)$count, 'max' => (int)$suscripcion['max_usuarios']]
            );
        }
        
        return $suscripcion;
    }

    /**
     * Verificar si una feature está habilitada en el plan
     */
    public static function requireFeature($consultorioId, $feature) {
        $suscripcion = self::requireActive($consultorioId);
        
        $featureKey = 'permite_' . $feature;
        
        if (!isset($suscripcion[$featureKey])) {
            return $suscripcion; // Feature no definida, permitir por defecto
        }
        
        $value = $suscripcion[$featureKey];
        
        // Para booleanos (0, false, '0')
        if ($value === '0' || $value === false || $value === 0) {
            Response::error(
                "La función '{$feature}' no está disponible en su plan {$suscripcion['plan_nombre']}. Actualice su plan para acceder.",
                403,
                ['subscription_limit' => 'feature', 'feature' => $feature, 'plan' => $suscripcion['plan_slug']]
            );
        }
        
        // Para ENUMs ('no' significa no disponible)
        if ($value === 'no') {
            Response::error(
                "La función '{$feature}' no está disponible en su plan {$suscripcion['plan_nombre']}. Actualice su plan para acceder.",
                403,
                ['subscription_limit' => 'feature', 'feature' => $feature, 'plan' => $suscripcion['plan_slug']]
            );
        }
        
        return $suscripcion;
    }

    /**
     * Obtener suscripción actual (sin bloquear, solo lectura de datos)
     */
    public static function getCurrent($consultorioId) {
        $suscripcionModel = new Suscripcion();
        $suscripcionModel->checkExpired();
        return $suscripcionModel->getByConsultorio($consultorioId);
    }

    /**
     * Obtener info de suscripción para incluir en respuesta del login
     */
    public static function getSubscriptionInfo($consultorioId) {
        $suscripcion = self::getCurrent($consultorioId);
        if (!$suscripcion) return null;

        return [
            'id' => $suscripcion['id'],
            'plan_nombre' => $suscripcion['plan_nombre'],
            'plan_slug' => $suscripcion['plan_slug'],
            'estado' => $suscripcion['estado'],
            'periodo' => $suscripcion['periodo'],
            'fecha_fin' => $suscripcion['fecha_fin'],
            'trial_ends_at' => $suscripcion['trial_ends_at'],
            'plan_precio' => $suscripcion['plan_precio'],
            'max_usuarios' => $suscripcion['max_usuarios'],
            'max_pacientes' => $suscripcion['max_pacientes'],
            'dias_restantes' => max(0, (int)((strtotime($suscripcion['fecha_fin']) - time()) / 86400)),
            'read_only' => in_array($suscripcion['estado'], ['expired', 'suspended']),
            'features' => [
                'asistente' => (bool)$suscripcion['permite_asistente'],
                'adjuntos' => (bool)$suscripcion['permite_adjuntos'],
                'branding' => $suscripcion['permite_branding'],
                'exportacion' => $suscripcion['permite_exportacion'],
                'agenda_compartida' => (bool)$suscripcion['permite_agenda_compartida'],
                'permisos_rol' => $suscripcion['permite_permisos_rol'],
                'reportes_avanzados' => (bool)$suscripcion['permite_reportes_avanzados'],
                'plantillas' => (bool)$suscripcion['permite_plantillas'],
                'respaldo' => (bool)$suscripcion['permite_respaldo'],
            ]
        ];
    }
}
