<?php
/**
 * DaliaMed - Modelo TasaCambio
 * Gestión de tasa USD/Bs (BCV)
 */

require_once __DIR__ . '/../config/database.php';

class TasaCambio {
    private $conn;
    private $table = 'tasas_cambio';

    public function __construct() {
        $database = new Database();
        $this->conn = $database->getConnection();
    }

    /**
     * Obtener tasa del día actual
     * Si no hay tasa de hoy, retorna la más reciente
     */
    public function getActual() {
        $sql = "SELECT * FROM {$this->table} ORDER BY fecha DESC LIMIT 1";
        $stmt = $this->conn->prepare($sql);
        $stmt->execute();
        return $stmt->fetch();
    }

    /**
     * Obtener tasa de una fecha específica
     */
    public function getByFecha($fecha) {
        $sql = "SELECT * FROM {$this->table} WHERE fecha = :fecha";
        $stmt = $this->conn->prepare($sql);
        $stmt->execute([':fecha' => $fecha]);
        return $stmt->fetch();
    }

    /**
     * Registrar o actualizar tasa del día
     */
    public function registrar($fecha, $tasaBs, $superadminId) {
        $existing = $this->getByFecha($fecha);
        
        if ($existing) {
            $sql = "UPDATE {$this->table} SET tasa_bs = :tasa, registrada_por = :admin WHERE fecha = :fecha";
            $stmt = $this->conn->prepare($sql);
            return $stmt->execute([
                ':tasa' => $tasaBs,
                ':admin' => $superadminId,
                ':fecha' => $fecha
            ]);
        }
        
        $sql = "INSERT INTO {$this->table} (fecha, tasa_bs, registrada_por) VALUES (:fecha, :tasa, :admin)";
        $stmt = $this->conn->prepare($sql);
        $stmt->execute([
            ':fecha' => $fecha,
            ':tasa' => $tasaBs,
            ':admin' => $superadminId
        ]);
        return $this->conn->lastInsertId();
    }

    /**
     * Obtener historial de tasas (últimos N días)
     */
    public function getHistorial($limit = 30) {
        $sql = "SELECT * FROM {$this->table} ORDER BY fecha DESC LIMIT :limit";
        $stmt = $this->conn->prepare($sql);
        $stmt->bindValue(':limit', $limit, PDO::PARAM_INT);
        $stmt->execute();
        return $stmt->fetchAll();
    }

    /**
     * Convertir USD a Bs usando tasa actual
     */
    public function convertirABs($montoUsd) {
        $tasa = $this->getActual();
        if (!$tasa) return null;
        return [
            'monto_usd' => (float)$montoUsd,
            'tasa_bs' => (float)$tasa['tasa_bs'],
            'monto_bs' => round($montoUsd * $tasa['tasa_bs'], 2),
            'fecha_tasa' => $tasa['fecha']
        ];
    }
}
