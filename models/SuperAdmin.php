<?php
/**
 * DaliaMed - Modelo SuperAdmin
 */

require_once __DIR__ . '/../config/database.php';

class SuperAdmin {
    private $conn;
    private $table = 'superadmins';

    public function __construct() {
        $database = new Database();
        $this->conn = $database->getConnection();
    }

    /**
     * Buscar por email
     */
    public function findByEmail($email) {
        $sql = "SELECT * FROM {$this->table} WHERE email = :email AND activo = TRUE";
        $stmt = $this->conn->prepare($sql);
        $stmt->execute([':email' => $email]);
        return $stmt->fetch();
    }

    /**
     * Obtener por ID
     */
    public function getById($id) {
        $sql = "SELECT id, email, nombre, activo, ultimo_acceso FROM {$this->table} WHERE id = :id";
        $stmt = $this->conn->prepare($sql);
        $stmt->execute([':id' => $id]);
        return $stmt->fetch();
    }

    /**
     * Actualizar último acceso
     */
    public function updateLastAccess($id) {
        $sql = "UPDATE {$this->table} SET ultimo_acceso = NOW() WHERE id = :id";
        $stmt = $this->conn->prepare($sql);
        return $stmt->execute([':id' => $id]);
    }
}
