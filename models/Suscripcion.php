<?php
/**
 * DaliaMed - Modelo Suscripcion
 */

require_once __DIR__ . '/../config/database.php';

class Suscripcion {
    private $conn;
    private $table = 'suscripciones';

    public function __construct() {
        $database = new Database();
        $this->conn = $database->getConnection();
    }

    /**
     * Obtener suscripción activa de un consultorio (la más reciente)
     */
    public function getByConsultorio($consultorioId) {
        $sql = "SELECT s.*, p.nombre as plan_nombre, p.slug as plan_slug,
                       p.max_usuarios, p.max_pacientes, p.max_storage_gb,
                       p.permite_asistente, p.permite_adjuntos, p.permite_branding,
                       p.permite_exportacion, p.permite_agenda_compartida, p.permite_permisos_rol,
                       p.permite_reportes_avanzados, p.permite_plantillas, p.permite_respaldo
                FROM {$this->table} s
                JOIN planes p ON s.plan_id = p.id
                WHERE s.consultorio_id = :consultorio_id
                ORDER BY s.created_at DESC
                LIMIT 1";
        $stmt = $this->conn->prepare($sql);
        $stmt->execute([':consultorio_id' => $consultorioId]);
        $suscripcion = $stmt->fetch();

        if ($suscripcion) {
            // Agregar precio del periodo actual
            $sqlPrecio = "SELECT precio FROM plan_precios WHERE plan_id = :plan_id AND periodo = :periodo AND activo = TRUE";
            $stmtP = $this->conn->prepare($sqlPrecio);
            $stmtP->execute([':plan_id' => $suscripcion['plan_id'], ':periodo' => $suscripcion['periodo']]);
            $precio = $stmtP->fetch();
            $suscripcion['plan_precio'] = $precio ? $precio['precio'] : null;
        }

        return $suscripcion;
    }

    /**
     * Obtener suscripción por ID
     */
    public function getById($id) {
        $sql = "SELECT s.*, p.nombre as plan_nombre, p.slug as plan_slug,
                       p.max_usuarios, p.max_pacientes, p.max_storage_gb
                FROM {$this->table} s
                JOIN planes p ON s.plan_id = p.id
                WHERE s.id = :id";
        $stmt = $this->conn->prepare($sql);
        $stmt->execute([':id' => $id]);
        return $stmt->fetch();
    }

    /**
     * Crear nueva suscripción (trial - siempre plan Profesional, 14 días)
     */
    public function createTrial($consultorioId, $planId = 2, $dias = 14) {
        $sql = "INSERT INTO {$this->table} (consultorio_id, plan_id, periodo, estado, fecha_inicio, fecha_fin, trial_ends_at)
                VALUES (:consultorio_id, :plan_id, 'mensual', 'trial', NOW(), DATE_ADD(NOW(), INTERVAL :dias DAY), DATE_ADD(NOW(), INTERVAL :dias2 DAY))";
        $stmt = $this->conn->prepare($sql);
        $stmt->execute([
            ':consultorio_id' => $consultorioId,
            ':plan_id' => $planId,
            ':dias' => $dias,
            ':dias2' => $dias
        ]);
        return $this->conn->lastInsertId();
    }

    /**
     * Activar suscripción (tras pago aprobado)
     */
    public function activate($id, $planId, $periodo = 'mensual', $dias = 30) {
        $sql = "UPDATE {$this->table} SET 
                    estado = 'active', 
                    plan_id = :plan_id,
                    periodo = :periodo,
                    fecha_inicio = NOW(), 
                    fecha_fin = DATE_ADD(NOW(), INTERVAL :dias DAY),
                    trial_ends_at = NULL
                WHERE id = :id";
        $stmt = $this->conn->prepare($sql);
        return $stmt->execute([
            ':id' => $id,
            ':plan_id' => $planId,
            ':periodo' => $periodo,
            ':dias' => $dias
        ]);
    }

    /**
     * Renovar suscripción (extender fecha_fin)
     */
    public function renew($id, $planId, $periodo = 'mensual', $dias = 30) {
        $sql = "UPDATE {$this->table} SET 
                    estado = 'active',
                    plan_id = :plan_id,
                    periodo = :periodo,
                    fecha_inicio = NOW(),
                    fecha_fin = DATE_ADD(NOW(), INTERVAL :dias DAY)
                WHERE id = :id";
        $stmt = $this->conn->prepare($sql);
        return $stmt->execute([':id' => $id, ':plan_id' => $planId, ':periodo' => $periodo, ':dias' => $dias]);
    }

    /**
     * Cambiar estado
     */
    public function updateEstado($id, $estado, $motivo = null) {
        $sql = "UPDATE {$this->table} SET estado = :estado, motivo_suspension = :motivo WHERE id = :id";
        $stmt = $this->conn->prepare($sql);
        return $stmt->execute([':id' => $id, ':estado' => $estado, ':motivo' => $motivo]);
    }

    /**
     * Cambiar plan
     */
    public function updatePlan($id, $planId) {
        $sql = "UPDATE {$this->table} SET plan_id = :plan_id WHERE id = :id";
        $stmt = $this->conn->prepare($sql);
        return $stmt->execute([':id' => $id, ':plan_id' => $planId]);
    }

    /**
     * Obtener todas las suscripciones (para SuperAdmin)
     */
    public function getAll($filtroEstado = null, $search = null) {
        $sql = "SELECT s.*, p.nombre as plan_nombre, p.slug as plan_slug,
                       c.nombre as consultorio_nombre, c.email as consultorio_email, c.telefono as consultorio_telefono, c.rif as consultorio_rif,
                       (SELECT COUNT(*) FROM usuarios u WHERE u.consultorio_id = s.consultorio_id AND u.activo = TRUE) as total_usuarios,
                       (SELECT COUNT(*) FROM pacientes pa WHERE pa.consultorio_id = s.consultorio_id AND pa.activo = TRUE) as total_pacientes
                FROM {$this->table} s
                JOIN planes p ON s.plan_id = p.id
                JOIN consultorios c ON s.consultorio_id = c.id";
        
        $params = [];
        $where = [];

        if ($filtroEstado) {
            $where[] = "s.estado = :estado";
            $params[':estado'] = $filtroEstado;
        }
        if ($search) {
            $where[] = "(c.nombre LIKE :search OR c.email LIKE :search2 OR c.rif LIKE :search3)";
            $params[':search'] = "%$search%";
            $params[':search2'] = "%$search%";
            $params[':search3'] = "%$search%";
        }

        if (!empty($where)) {
            $sql .= " WHERE " . implode(' AND ', $where);
        }

        $sql .= " ORDER BY s.created_at DESC";
        $stmt = $this->conn->prepare($sql);
        $stmt->execute($params);
        return $stmt->fetchAll();
    }

    /**
     * Verificar suscripciones vencidas y actualizar estados
     * Grace period: 7 días
     */
    public function checkExpired() {
        // Trial vencido
        $sql = "UPDATE {$this->table} SET estado = 'expired' 
                WHERE estado = 'trial' AND trial_ends_at < NOW()";
        $this->conn->exec($sql);

        // Activas vencidas -> grace_period
        $sql = "UPDATE {$this->table} SET estado = 'grace_period' 
                WHERE estado = 'active' AND fecha_fin < NOW()";
        $this->conn->exec($sql);

        // Grace period vencido (más de 7 días)
        $sql = "UPDATE {$this->table} SET estado = 'expired' 
                WHERE estado = 'grace_period' AND fecha_fin < DATE_SUB(NOW(), INTERVAL 7 DAY)";
        $this->conn->exec($sql);
    }

    /**
     * Obtener estadísticas para SuperAdmin
     */
    public function getStats() {
        $stats = [];
        
        $sql = "SELECT estado, COUNT(*) as total FROM {$this->table} GROUP BY estado";
        $stmt = $this->conn->query($sql);
        $stats['por_estado'] = $stmt->fetchAll();

        $sql = "SELECT COUNT(*) as total FROM {$this->table}";
        $stats['total'] = $this->conn->query($sql)->fetchColumn();

        $sql = "SELECT COUNT(*) as total FROM {$this->table} WHERE estado = 'active'";
        $stats['activas'] = $this->conn->query($sql)->fetchColumn();

        $sql = "SELECT COUNT(*) as total FROM {$this->table} WHERE estado = 'trial'";
        $stats['trials'] = $this->conn->query($sql)->fetchColumn();

        $sql = "SELECT COUNT(*) as total FROM {$this->table} WHERE estado IN ('expired', 'grace_period')";
        $stats['vencidas'] = $this->conn->query($sql)->fetchColumn();

        $sql = "SELECT COALESCE(SUM(monto), 0) as total FROM pagos WHERE estado = 'aprobado'";
        $stats['ingresos_total'] = $this->conn->query($sql)->fetchColumn();

        $sql = "SELECT COALESCE(SUM(monto), 0) as total FROM pagos WHERE estado = 'aprobado' AND MONTH(aprobado_at) = MONTH(NOW()) AND YEAR(aprobado_at) = YEAR(NOW())";
        $stats['ingresos_mes'] = $this->conn->query($sql)->fetchColumn();

        $sql = "SELECT COUNT(*) as total FROM pagos WHERE estado = 'pendiente'";
        $stats['pagos_pendientes'] = $this->conn->query($sql)->fetchColumn();

        $sql = "SELECT COUNT(*) as total FROM consultorios";
        $stats['total_consultorios'] = $this->conn->query($sql)->fetchColumn();

        return $stats;
    }
}
