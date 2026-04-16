<?php
/**
 * NexaMed - Modelo Usuario
 */

require_once __DIR__ . '/../config/database.php';

class Usuario {
    private $conn;
    private $table = 'usuarios';

    public function __construct() {
        $database = new Database();
        $this->conn = $database->getConnection();
    }

    /**
     * Buscar usuario por email
     */
    public function findByEmail($email) {
        $sql = "SELECT * FROM {$this->table} WHERE email = :email AND activo = TRUE";
        $stmt = $this->conn->prepare($sql);
        $stmt->execute([':email' => $email]);
        return $stmt->fetch();
    }

    /**
     * Obtener usuario por ID
     */
    public function getById($id) {
        $sql = "SELECT id, consultorio_id, email, nombre, role, avatar_url, 
                       especialidad, registro_medico, biografia, telefono, ultimo_acceso, password_hash
                FROM {$this->table} WHERE id = :id AND activo = TRUE";
        $stmt = $this->conn->prepare($sql);
        $stmt->execute([':id' => $id]);
        return $stmt->fetch();
    }

    /**
     * Obtener usuario por ID (incluye inactivos)
     */
    public function getByIdWithInactive($id) {
        $sql = "SELECT id, consultorio_id, email, nombre, role, avatar_url, 
                       especialidad, registro_medico, biografia, telefono, 
                       activo, ultimo_acceso, password_hash
                FROM {$this->table} WHERE id = :id";
        $stmt = $this->conn->prepare($sql);
        $stmt->execute([':id' => $id]);
        return $stmt->fetch();
    }

    /**
     * Actualizar último acceso
     */
    public function updateLastAccess($id) {
        $sql = "UPDATE {$this->table} SET ultimo_acceso = CURRENT_TIMESTAMP WHERE id = :id";
        $stmt = $this->conn->prepare($sql);
        return $stmt->execute([':id' => $id]);
    }

    /**
     * Actualizar contraseña
     */
    public function updatePassword($id, $newPasswordHash) {
        $sql = "UPDATE {$this->table} SET password_hash = :password WHERE id = :id";
        $stmt = $this->conn->prepare($sql);
        return $stmt->execute([
            ':id' => $id,
            ':password' => $newPasswordHash
        ]);
    }

    /**
     * Actualizar perfil
     */
    public function updateProfile($id, $data) {
        $sql = "UPDATE {$this->table} SET
            nombre = :nombre,
            telefono = :telefono,
            especialidad = :especialidad,
            registro_medico = :registro_medico,
            biografia = :biografia
        WHERE id = :id";
        
        $stmt = $this->conn->prepare($sql);
        return $stmt->execute([
            ':id' => $id,
            ':nombre' => $data['nombre'],
            ':telefono' => $data['telefono'] ?? null,
            ':especialidad' => $data['especialidad'] ?? null,
            ':registro_medico' => $data['registro_medico'] ?? null,
            ':biografia' => $data['biografia'] ?? null
        ]);
    }

    /**
     * Obtener todos los usuarios del consultorio
     */
    public function getAll($consultorioId) {
        $sql = "SELECT id, consultorio_id, email, nombre, role, avatar_url, 
                       especialidad, registro_medico, biografia, telefono, 
                       activo, ultimo_acceso, created_at
                FROM {$this->table} 
                WHERE consultorio_id = :consultorio_id 
                ORDER BY nombre ASC";
        $stmt = $this->conn->prepare($sql);
        $stmt->execute([':consultorio_id' => $consultorioId]);
        return $stmt->fetchAll();
    }

    /**
     * Crear nuevo usuario
     */
    public function create($data) {
        $sql = "INSERT INTO {$this->table} 
                (consultorio_id, email, password_hash, nombre, role, 
                 especialidad, registro_medico, telefono, biografia, activo)
                VALUES 
                (:consultorio_id, :email, :password_hash, :nombre, :role,
                 :especialidad, :registro_medico, :telefono, :biografia, TRUE)";
        
        $stmt = $this->conn->prepare($sql);
        $stmt->execute([
            ':consultorio_id' => $data['consultorio_id'],
            ':email' => $data['email'],
            ':password_hash' => $data['password_hash'],
            ':nombre' => $data['nombre'],
            ':role' => $data['role'],
            ':especialidad' => $data['especialidad'] ?? null,
            ':registro_medico' => $data['registro_medico'] ?? null,
            ':telefono' => $data['telefono'] ?? null,
            ':biografia' => $data['biografia'] ?? null
        ]);
        
        return $this->conn->lastInsertId();
    }

    /**
     * Actualizar usuario completo (admin)
     */
    public function update($id, $data) {
        $sql = "UPDATE {$this->table} SET
            nombre = :nombre,
            email = :email,
            role = :role,
            telefono = :telefono,
            especialidad = :especialidad,
            registro_medico = :registro_medico,
            biografia = :biografia,
            activo = :activo
        WHERE id = :id";
        
        $stmt = $this->conn->prepare($sql);
        return $stmt->execute([
            ':id' => $id,
            ':nombre' => $data['nombre'],
            ':email' => $data['email'],
            ':role' => $data['role'],
            ':telefono' => $data['telefono'] ?? null,
            ':especialidad' => $data['especialidad'] ?? null,
            ':registro_medico' => $data['registro_medico'] ?? null,
            ':biografia' => $data['biografia'] ?? null,
            ':activo' => $data['activo'] ?? true
        ]);
    }

    /**
     * Desactivar/Activar usuario
     */
    public function toggleActive($id, $activo) {
        $sql = "UPDATE {$this->table} SET activo = :activo WHERE id = :id";
        $stmt = $this->conn->prepare($sql);
        return $stmt->execute([':id' => $id, ':activo' => $activo]);
    }
}
