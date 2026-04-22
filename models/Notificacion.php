<?php
/**
 * DaliaMed - Modelo de Notificaciones in-app
 */

require_once __DIR__ . '/../config/database.php';

class Notificacion {
    private $conn;
    private $table = 'notificaciones';

    public function __construct() {
        $db = new Database();
        $this->conn = $db->getConnection();
        $this->ensureTable();
    }

    /**
     * Crear tabla si no existe
     */
    private function ensureTable() {
        $this->conn->exec("
            CREATE TABLE IF NOT EXISTS notificaciones (
                id INT AUTO_INCREMENT PRIMARY KEY,
                consultorio_id INT NOT NULL,
                usuario_id INT DEFAULT NULL,
                tipo ENUM('info','warning','error','success') DEFAULT 'info',
                titulo VARCHAR(200) NOT NULL,
                mensaje TEXT NOT NULL,
                leida TINYINT(1) DEFAULT 0,
                link VARCHAR(255) DEFAULT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                INDEX idx_consultorio (consultorio_id),
                INDEX idx_usuario (usuario_id),
                INDEX idx_leida (leida)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
        ");
    }

    /**
     * Crear notificación
     */
    public function crear($consultorioId, $titulo, $mensaje, $tipo = 'info', $link = null, $usuarioId = null) {
        $stmt = $this->conn->prepare("
            INSERT INTO {$this->table} (consultorio_id, usuario_id, tipo, titulo, mensaje, link)
            VALUES (?, ?, ?, ?, ?, ?)
        ");
        $stmt->execute([$consultorioId, $usuarioId, $tipo, $titulo, $mensaje, $link]);
        return $this->conn->lastInsertId();
    }

    /**
     * Obtener notificaciones de un consultorio
     */
    public function getByConsultorio($consultorioId, $limit = 20, $soloNoLeidas = false) {
        $where = "WHERE consultorio_id = ?";
        if ($soloNoLeidas) $where .= " AND leida = 0";
        
        $stmt = $this->conn->prepare("
            SELECT * FROM {$this->table}
            {$where}
            ORDER BY created_at DESC
            LIMIT ?
        ");
        $stmt->execute($soloNoLeidas ? [$consultorioId, $limit] : [$consultorioId, $limit]);
        return $stmt->fetchAll();
    }

    /**
     * Contar no leídas
     */
    public function contarNoLeidas($consultorioId) {
        $stmt = $this->conn->prepare("SELECT COUNT(*) as total FROM {$this->table} WHERE consultorio_id = ? AND leida = 0");
        $stmt->execute([$consultorioId]);
        return (int)$stmt->fetch()['total'];
    }

    /**
     * Marcar como leída
     */
    public function marcarLeida($id, $consultorioId) {
        $stmt = $this->conn->prepare("UPDATE {$this->table} SET leida = 1 WHERE id = ? AND consultorio_id = ?");
        return $stmt->execute([$id, $consultorioId]);
    }

    /**
     * Marcar todas como leídas
     */
    public function marcarTodasLeidas($consultorioId) {
        $stmt = $this->conn->prepare("UPDATE {$this->table} SET leida = 1 WHERE consultorio_id = ? AND leida = 0");
        return $stmt->execute([$consultorioId]);
    }

    // === Métodos de notificaciones automáticas ===

    public function notificarPagoAprobado($consultorioId, $monto) {
        return $this->crear($consultorioId, 'Pago aprobado', 
            "Tu pago de \${$monto} ha sido aprobado. Tu suscripción ha sido activada.", 
            'success', '/app/suscripcion');
    }

    public function notificarPagoRechazado($consultorioId, $monto, $motivo) {
        return $this->crear($consultorioId, 'Pago rechazado', 
            "Tu pago de \${$monto} fue rechazado. Motivo: {$motivo}", 
            'error', '/app/suscripcion');
    }

    public function notificarTrialPorVencer($consultorioId, $dias) {
        return $this->crear($consultorioId, 'Trial por vencer', 
            "Tu período de prueba vence en {$dias} días. Selecciona un plan para continuar.", 
            'warning', '/app/suscripcion');
    }

    public function notificarSuscripcionPorVencer($consultorioId, $dias) {
        return $this->crear($consultorioId, 'Suscripción por vencer', 
            "Tu suscripción vence en {$dias} días. Renueva para mantener el acceso.", 
            'warning', '/app/suscripcion');
    }

    public function notificarSuscripcionExpirada($consultorioId) {
        return $this->crear($consultorioId, 'Suscripción expirada', 
            'Tu suscripción ha expirado. Tu cuenta está en modo solo lectura.', 
            'error', '/app/suscripcion');
    }

    public function notificarBienvenida($consultorioId) {
        return $this->crear($consultorioId, 'Bienvenido a DaliaMed', 
            'Tu cuenta ha sido creada con 14 días de prueba gratuita. Explora todas las funcionalidades.', 
            'info', '/app');
    }
}
