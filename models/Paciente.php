<?php
/**
 * NexaMed - Modelo Paciente
 */

require_once __DIR__ . '/../config/database.php';

class Paciente {
    private $conn;
    private $table = 'pacientes';

    public function __construct() {
        $database = new Database();
        $this->conn = $database->getConnection();
    }

    /**
     * Obtener todos los pacientes con paginación y búsqueda
     */
    public function getAll($consultorioId, $page = 1, $limit = 10, $search = '') {
        $offset = ($page - 1) * $limit;
        
        // Escapar el término de búsqueda para usarlo directamente en SQL
        $searchEscaped = !empty($search) ? $this->conn->quote("%$search%") : null;
        
        // Consulta para obtener el total
        if (!empty($search)) {
            $countSql = "SELECT COUNT(*) as total FROM {$this->table} 
                        WHERE consultorio_id = :consultorio_id 
                        AND activo = TRUE
                        AND (nombres LIKE $searchEscaped 
                             OR apellidos LIKE $searchEscaped 
                             OR cedula LIKE $searchEscaped 
                             OR telefono LIKE $searchEscaped)";
        } else {
            $countSql = "SELECT COUNT(*) as total FROM {$this->table} 
                        WHERE consultorio_id = :consultorio_id AND activo = TRUE";
        }
        
        $countStmt = $this->conn->prepare($countSql);
        $countStmt->execute([':consultorio_id' => $consultorioId]);
        $total = $countStmt->fetch()['total'];
        
        // Consulta principal con paginación
        if (!empty($search)) {
            $sql = "SELECT * FROM {$this->table} 
                    WHERE consultorio_id = :consultorio_id 
                    AND activo = TRUE
                    AND (nombres LIKE $searchEscaped 
                         OR apellidos LIKE $searchEscaped 
                         OR cedula LIKE $searchEscaped 
                         OR telefono LIKE $searchEscaped)
                    ORDER BY created_at DESC 
                    LIMIT :limit OFFSET :offset";
        } else {
            $sql = "SELECT * FROM {$this->table} 
                    WHERE consultorio_id = :consultorio_id AND activo = TRUE
                    ORDER BY created_at DESC 
                    LIMIT :limit OFFSET :offset";
        }
        
        $stmt = $this->conn->prepare($sql);
        $stmt->bindValue(':consultorio_id', $consultorioId, PDO::PARAM_INT);
        $stmt->bindValue(':limit', (int)$limit, PDO::PARAM_INT);
        $stmt->bindValue(':offset', (int)$offset, PDO::PARAM_INT);
        $stmt->execute();
        
        return [
            'data' => $stmt->fetchAll(),
            'total' => $total
        ];
    }

    /**
     * Buscar pacientes para autocomplete
     */
    public function search($consultorioId, $query) {
        $sql = "SELECT id, nombres, apellidos, cedula, telefono 
                FROM {$this->table} 
                WHERE consultorio_id = :consultorio_id 
                AND activo = TRUE
                AND (
                    nombres LIKE :query 
                    OR apellidos LIKE :query 
                    OR cedula LIKE :query
                )
                ORDER BY apellidos, nombres
                LIMIT 10";
        
        $stmt = $this->conn->prepare($sql);
        $stmt->execute([
            ':consultorio_id' => $consultorioId,
            ':query' => "%$query%"
        ]);
        
        return $stmt->fetchAll();
    }

    /**
     * Obtener paciente por ID
     */
    public function getById($id, $consultorioId) {
        $sql = "SELECT * FROM {$this->table} 
                WHERE id = :id AND consultorio_id = :consultorio_id AND activo = TRUE";
        
        $stmt = $this->conn->prepare($sql);
        $stmt->execute([
            ':id' => $id,
            ':consultorio_id' => $consultorioId
        ]);
        
        return $stmt->fetch();
    }

    /**
     * Crear nuevo paciente
     */
    public function create($data) {
        $sql = "INSERT INTO {$this->table} (
            consultorio_id, nombres, apellidos, cedula, fecha_nacimiento,
            sexo, estado_civil, ocupacion, telefono, email, direccion, ciudad,
            contacto_emergencia_nombre, contacto_emergencia_telefono, contacto_emergencia_relacion,
            alergias, antecedentes_medicos, medicamentos_actuales, tipo_sangre
        ) VALUES (
            :consultorio_id, :nombres, :apellidos, :cedula, :fecha_nacimiento,
            :sexo, :estado_civil, :ocupacion, :telefono, :email, :direccion, :ciudad,
            :contacto_emergencia_nombre, :contacto_emergencia_telefono, :contacto_emergencia_relacion,
            :alergias, :antecedentes_medicos, :medicamentos_actuales, :tipo_sangre
        )";
        
        $stmt = $this->conn->prepare($sql);
        $stmt->execute([
            ':consultorio_id' => $data['consultorio_id'],
            ':nombres' => $data['nombres'],
            ':apellidos' => $data['apellidos'],
            ':cedula' => $data['cedula'],
            ':fecha_nacimiento' => $data['fecha_nacimiento'],
            ':sexo' => $data['sexo'],
            ':estado_civil' => $data['estado_civil'] ?? null,
            ':ocupacion' => $data['ocupacion'] ?? null,
            ':telefono' => $data['telefono'],
            ':email' => $data['email'] ?? null,
            ':direccion' => $data['direccion'] ?? null,
            ':ciudad' => $data['ciudad'] ?? null,
            ':contacto_emergencia_nombre' => $data['contacto_emergencia_nombre'] ?? null,
            ':contacto_emergencia_telefono' => $data['contacto_emergencia_telefono'] ?? null,
            ':contacto_emergencia_relacion' => $data['contacto_emergencia_relacion'] ?? null,
            ':alergias' => $data['alergias'] ?? null,
            ':antecedentes_medicos' => $data['antecedentes_medicos'] ?? null,
            ':medicamentos_actuales' => $data['medicamentos_actuales'] ?? null,
            ':tipo_sangre' => $data['tipo_sangre'] ?? null
        ]);
        
        return $this->conn->lastInsertId();
    }

    /**
     * Actualizar paciente
     */
    public function update($id, $data, $consultorioId) {
        $sql = "UPDATE {$this->table} SET
            nombres = :nombres,
            apellidos = :apellidos,
            cedula = :cedula,
            fecha_nacimiento = :fecha_nacimiento,
            sexo = :sexo,
            estado_civil = :estado_civil,
            ocupacion = :ocupacion,
            telefono = :telefono,
            email = :email,
            direccion = :direccion,
            ciudad = :ciudad,
            contacto_emergencia_nombre = :contacto_emergencia_nombre,
            contacto_emergencia_telefono = :contacto_emergencia_telefono,
            contacto_emergencia_relacion = :contacto_emergencia_relacion,
            alergias = :alergias,
            antecedentes_medicos = :antecedentes_medicos,
            medicamentos_actuales = :medicamentos_actuales,
            tipo_sangre = :tipo_sangre
        WHERE id = :id AND consultorio_id = :consultorio_id";
        
        $stmt = $this->conn->prepare($sql);
        return $stmt->execute([
            ':id' => $id,
            ':consultorio_id' => $consultorioId,
            ':nombres' => $data['nombres'],
            ':apellidos' => $data['apellidos'],
            ':cedula' => $data['cedula'],
            ':fecha_nacimiento' => $data['fecha_nacimiento'],
            ':sexo' => $data['sexo'],
            ':estado_civil' => $data['estado_civil'] ?? null,
            ':ocupacion' => $data['ocupacion'] ?? null,
            ':telefono' => $data['telefono'],
            ':email' => $data['email'] ?? null,
            ':direccion' => $data['direccion'] ?? null,
            ':ciudad' => $data['ciudad'] ?? null,
            ':contacto_emergencia_nombre' => $data['contacto_emergencia_nombre'] ?? null,
            ':contacto_emergencia_telefono' => $data['contacto_emergencia_telefono'] ?? null,
            ':contacto_emergencia_relacion' => $data['contacto_emergencia_relacion'] ?? null,
            ':alergias' => $data['alergias'] ?? null,
            ':antecedentes_medicos' => $data['antecedentes_medicos'] ?? null,
            ':medicamentos_actuales' => $data['medicamentos_actuales'] ?? null,
            ':tipo_sangre' => $data['tipo_sangre'] ?? null
        ]);
    }

    /**
     * Eliminar paciente (soft delete)
     */
    public function delete($id, $consultorioId) {
        $sql = "UPDATE {$this->table} SET activo = FALSE 
                WHERE id = :id AND consultorio_id = :consultorio_id";
        
        $stmt = $this->conn->prepare($sql);
        return $stmt->execute([
            ':id' => $id,
            ':consultorio_id' => $consultorioId
        ]);
    }

    /**
     * Verificar si la cédula ya existe
     */
    public function cedulaExists($cedula, $consultorioId, $excludeId = null) {
        $sql = "SELECT COUNT(*) as count FROM {$this->table} 
                WHERE cedula = :cedula AND consultorio_id = :consultorio_id AND activo = TRUE";
        
        if ($excludeId) {
            $sql .= " AND id != :exclude_id";
        }
        
        $stmt = $this->conn->prepare($sql);
        $params = [
            ':cedula' => $cedula,
            ':consultorio_id' => $consultorioId
        ];
        
        if ($excludeId) {
            $params[':exclude_id'] = $excludeId;
        }
        
        $stmt->execute($params);
        return $stmt->fetch()['count'] > 0;
    }

    /**
     * Actualizar última visita del paciente
     */
    public function updateUltimaVisita($id, $fecha) {
        $sql = "UPDATE {$this->table} SET ultima_visita = :fecha WHERE id = :id";
        $stmt = $this->conn->prepare($sql);
        return $stmt->execute([':id' => $id, ':fecha' => $fecha]);
    }
}
