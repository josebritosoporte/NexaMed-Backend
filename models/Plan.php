<?php
/**
 * DaliaMed - Modelo Plan
 */

require_once __DIR__ . '/../config/database.php';

class Plan {
    private $conn;
    private $table = 'planes';

    public function __construct() {
        $database = new Database();
        $this->conn = $database->getConnection();
    }

    /**
     * Obtener todos los planes activos con sus precios
     */
    public function getAll() {
        $sql = "SELECT * FROM {$this->table} WHERE activo = TRUE ORDER BY orden ASC";
        $stmt = $this->conn->prepare($sql);
        $stmt->execute();
        $planes = $stmt->fetchAll();

        // Agregar precios a cada plan
        foreach ($planes as &$plan) {
            $plan['precios'] = $this->getPrecios($plan['id']);
        }

        return $planes;
    }

    /**
     * Obtener plan por ID
     */
    public function getById($id) {
        $sql = "SELECT * FROM {$this->table} WHERE id = :id";
        $stmt = $this->conn->prepare($sql);
        $stmt->execute([':id' => $id]);
        $plan = $stmt->fetch();
        if ($plan) {
            $plan['precios'] = $this->getPrecios($plan['id']);
        }
        return $plan;
    }

    /**
     * Obtener plan por slug
     */
    public function getBySlug($slug) {
        $sql = "SELECT * FROM {$this->table} WHERE slug = :slug AND activo = TRUE";
        $stmt = $this->conn->prepare($sql);
        $stmt->execute([':slug' => $slug]);
        $plan = $stmt->fetch();
        if ($plan) {
            $plan['precios'] = $this->getPrecios($plan['id']);
        }
        return $plan;
    }

    /**
     * Obtener precios de un plan
     */
    public function getPrecios($planId) {
        $sql = "SELECT * FROM plan_precios WHERE plan_id = :plan_id AND activo = TRUE ORDER BY dias ASC";
        $stmt = $this->conn->prepare($sql);
        $stmt->execute([':plan_id' => $planId]);
        return $stmt->fetchAll();
    }

    /**
     * Obtener precio específico de un plan por periodo
     */
    public function getPrecio($planId, $periodo) {
        $sql = "SELECT * FROM plan_precios WHERE plan_id = :plan_id AND periodo = :periodo AND activo = TRUE";
        $stmt = $this->conn->prepare($sql);
        $stmt->execute([':plan_id' => $planId, ':periodo' => $periodo]);
        return $stmt->fetch();
    }

    /**
     * Obtener precio por ID
     */
    public function getPrecioById($precioId) {
        $sql = "SELECT pp.*, p.nombre as plan_nombre, p.slug as plan_slug
                FROM plan_precios pp
                JOIN planes p ON pp.plan_id = p.id
                WHERE pp.id = :id";
        $stmt = $this->conn->prepare($sql);
        $stmt->execute([':id' => $precioId]);
        return $stmt->fetch();
    }
}
