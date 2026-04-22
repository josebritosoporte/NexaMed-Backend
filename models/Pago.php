<?php
/**
 * DaliaMed - Modelo Pago
 */

require_once __DIR__ . '/../config/database.php';

class Pago {
    private $conn;
    private $table = 'pagos';

    public function __construct() {
        $database = new Database();
        $this->conn = $database->getConnection();
    }

    /**
     * Crear comprobante de pago
     */
    public function create($data) {
        $sql = "INSERT INTO {$this->table} 
                (suscripcion_id, consultorio_id, plan_id, plan_precio_id, monto, moneda, tasa_bs_momento, monto_bs, metodo_pago, referencia, comprobante_nota, comprobante_url, fecha_pago)
                VALUES 
                (:suscripcion_id, :consultorio_id, :plan_id, :plan_precio_id, :monto, :moneda, :tasa_bs, :monto_bs, :metodo_pago, :referencia, :comprobante_nota, :comprobante_url, :fecha_pago)";
        $stmt = $this->conn->prepare($sql);
        $stmt->execute([
            ':suscripcion_id' => $data['suscripcion_id'],
            ':consultorio_id' => $data['consultorio_id'],
            ':plan_id' => $data['plan_id'],
            ':plan_precio_id' => $data['plan_precio_id'] ?? null,
            ':monto' => $data['monto'],
            ':moneda' => $data['moneda'] ?? 'USD',
            ':tasa_bs' => $data['tasa_bs_momento'] ?? null,
            ':monto_bs' => $data['monto_bs'] ?? null,
            ':metodo_pago' => $data['metodo_pago'],
            ':referencia' => $data['referencia'] ?? null,
            ':comprobante_nota' => $data['comprobante_nota'] ?? null,
            ':comprobante_url' => $data['comprobante_url'] ?? null,
            ':fecha_pago' => $data['fecha_pago']
        ]);
        return $this->conn->lastInsertId();
    }

    /**
     * Obtener pagos de un consultorio
     */
    public function getByConsultorio($consultorioId) {
        $sql = "SELECT pa.*, p.nombre as plan_nombre
                FROM {$this->table} pa
                JOIN planes p ON pa.plan_id = p.id
                WHERE pa.consultorio_id = :consultorio_id
                ORDER BY pa.created_at DESC";
        $stmt = $this->conn->prepare($sql);
        $stmt->execute([':consultorio_id' => $consultorioId]);
        return $stmt->fetchAll();
    }

    /**
     * Obtener pago por ID
     */
    public function getById($id) {
        $sql = "SELECT pa.*, p.nombre as plan_nombre, c.nombre as consultorio_nombre, c.email as consultorio_email
                FROM {$this->table} pa
                JOIN planes p ON pa.plan_id = p.id
                JOIN consultorios c ON pa.consultorio_id = c.id
                WHERE pa.id = :id";
        $stmt = $this->conn->prepare($sql);
        $stmt->execute([':id' => $id]);
        return $stmt->fetch();
    }

    /**
     * Obtener todos los pagos pendientes (SuperAdmin)
     */
    public function getPendientes() {
        $sql = "SELECT pa.*, p.nombre as plan_nombre, c.nombre as consultorio_nombre, c.email as consultorio_email
                FROM {$this->table} pa
                JOIN planes p ON pa.plan_id = p.id
                JOIN consultorios c ON pa.consultorio_id = c.id
                WHERE pa.estado = 'pendiente'
                ORDER BY pa.created_at ASC";
        $stmt = $this->conn->prepare($sql);
        $stmt->execute();
        return $stmt->fetchAll();
    }

    /**
     * Obtener todos los pagos (SuperAdmin) con filtros
     */
    public function getAll($filtroEstado = null) {
        $sql = "SELECT pa.*, p.nombre as plan_nombre, c.nombre as consultorio_nombre
                FROM {$this->table} pa
                JOIN planes p ON pa.plan_id = p.id
                JOIN consultorios c ON pa.consultorio_id = c.id";
        
        $params = [];
        if ($filtroEstado) {
            $sql .= " WHERE pa.estado = :estado";
            $params[':estado'] = $filtroEstado;
        }

        $sql .= " ORDER BY pa.created_at DESC";
        $stmt = $this->conn->prepare($sql);
        $stmt->execute($params);
        return $stmt->fetchAll();
    }

    /**
     * Aprobar pago y activar/renovar suscripción
     */
    public function approve($id, $adminId, $notas = null) {
        $sql = "UPDATE {$this->table} SET 
                    estado = 'aprobado', 
                    aprobado_por = :admin_id, 
                    aprobado_at = NOW(),
                    notas_admin = :notas
                WHERE id = :id";
        $stmt = $this->conn->prepare($sql);
        return $stmt->execute([':id' => $id, ':admin_id' => $adminId, ':notas' => $notas]);
    }

    /**
     * Rechazar pago
     */
    public function reject($id, $adminId, $notas) {
        $sql = "UPDATE {$this->table} SET 
                    estado = 'rechazado', 
                    aprobado_por = :admin_id, 
                    aprobado_at = NOW(),
                    notas_admin = :notas
                WHERE id = :id";
        $stmt = $this->conn->prepare($sql);
        return $stmt->execute([':id' => $id, ':admin_id' => $adminId, ':notas' => $notas]);
    }
}
