<?php
/**
 * NexaMed - Modelo Cita
 */

require_once __DIR__ . '/../config/database.php';

class Cita {
    private $conn;
    private $table = 'citas';

    public function __construct() {
        $database = new Database();
        $this->conn = $database->getConnection();
    }

    /**
     * Obtener citas por rango de fechas
     */
    public function getByDateRange($consultorioId, $fechaInicio, $fechaFin) {
        $sql = "SELECT c.*, p.nombres as paciente_nombres, p.apellidos as paciente_apellidos,
                       p.telefono as paciente_telefono, u.nombre as medico_nombre
                FROM {$this->table} c
                JOIN pacientes p ON c.paciente_id = p.id
                LEFT JOIN usuarios u ON c.medico_id = u.id
                WHERE c.consultorio_id = :consultorio_id
                AND c.fecha BETWEEN :fecha_inicio AND :fecha_fin
                ORDER BY c.fecha, c.hora_inicio";
        
        $stmt = $this->conn->prepare($sql);
        $stmt->execute([
            ':consultorio_id' => $consultorioId,
            ':fecha_inicio' => $fechaInicio,
            ':fecha_fin' => $fechaFin
        ]);
        
        return $stmt->fetchAll();
    }

    /**
     * Obtener citas de hoy
     */
    public function getToday($consultorioId) {
        return $this->getByDateRange($consultorioId, date('Y-m-d'), date('Y-m-d'));
    }

    /**
     * Obtener cita por ID
     */
    public function getById($id, $consultorioId) {
        $sql = "SELECT c.*, p.nombres as paciente_nombres, p.apellidos as paciente_apellidos,
                       p.telefono as paciente_telefono, p.email as paciente_email
                FROM {$this->table} c
                JOIN pacientes p ON c.paciente_id = p.id
                WHERE c.id = :id AND c.consultorio_id = :consultorio_id";
        
        $stmt = $this->conn->prepare($sql);
        $stmt->execute([':id' => $id, ':consultorio_id' => $consultorioId]);
        
        return $stmt->fetch();
    }

    /**
     * Crear nueva cita
     */
    public function create($data) {
        // Verificar solapamiento
        if ($this->hasOverlap($data['consultorio_id'], $data['fecha'], $data['hora_inicio'], $data['hora_fin'])) {
            throw new Exception('Ya existe una cita en ese horario');
        }
        
        $sql = "INSERT INTO {$this->table} (
            paciente_id, medico_id, consultorio_id, fecha, hora_inicio, hora_fin,
            motivo, estado, notas, color
        ) VALUES (
            :paciente_id, :medico_id, :consultorio_id, :fecha, :hora_inicio, :hora_fin,
            :motivo, :estado, :notas, :color
        )";
        
        $stmt = $this->conn->prepare($sql);
        $stmt->execute([
            ':paciente_id' => $data['paciente_id'],
            ':medico_id' => $data['medico_id'] ?? null,
            ':consultorio_id' => $data['consultorio_id'],
            ':fecha' => $data['fecha'],
            ':hora_inicio' => $data['hora_inicio'],
            ':hora_fin' => $data['hora_fin'],
            ':motivo' => $data['motivo'],
            ':estado' => $data['estado'] ?? 'pendiente',
            ':notas' => $data['notas'] ?? null,
            ':color' => $data['color'] ?? '#0d9488'
        ]);
        
        return $this->conn->lastInsertId();
    }

    /**
     * Actualizar cita
     */
    public function update($id, $data, $consultorioId) {
        $sql = "UPDATE {$this->table} SET
            paciente_id = :paciente_id,
            medico_id = :medico_id,
            fecha = :fecha,
            hora_inicio = :hora_inicio,
            hora_fin = :hora_fin,
            motivo = :motivo,
            estado = :estado,
            notas = :notas,
            color = :color
        WHERE id = :id AND consultorio_id = :consultorio_id";
        
        $stmt = $this->conn->prepare($sql);
        return $stmt->execute([
            ':id' => $id,
            ':consultorio_id' => $consultorioId,
            ':paciente_id' => $data['paciente_id'],
            ':medico_id' => $data['medico_id'] ?? null,
            ':fecha' => $data['fecha'],
            ':hora_inicio' => $data['hora_inicio'],
            ':hora_fin' => $data['hora_fin'],
            ':motivo' => $data['motivo'],
            ':estado' => $data['estado'],
            ':notas' => $data['notas'] ?? null,
            ':color' => $data['color'] ?? '#0d9488'
        ]);
    }

    /**
     * Actualizar estado de cita
     */
    public function updateEstado($id, $estado, $consultorioId) {
        $sql = "UPDATE {$this->table} SET estado = :estado 
                WHERE id = :id AND consultorio_id = :consultorio_id";
        
        $stmt = $this->conn->prepare($sql);
        return $stmt->execute([
            ':id' => $id,
            ':estado' => $estado,
            ':consultorio_id' => $consultorioId
        ]);
    }

    /**
     * Eliminar cita
     */
    public function delete($id, $consultorioId) {
        $sql = "DELETE FROM {$this->table} WHERE id = :id AND consultorio_id = :consultorio_id";
        
        $stmt = $this->conn->prepare($sql);
        return $stmt->execute([':id' => $id, ':consultorio_id' => $consultorioId]);
    }

    /**
     * Verificar solapamiento de citas
     */
    private function hasOverlap($consultorioId, $fecha, $horaInicio, $horaFin, $excludeId = null) {
        $sql = "SELECT COUNT(*) as count FROM {$this->table} 
                WHERE consultorio_id = :consultorio_id 
                AND fecha = :fecha
                AND (
                    (hora_inicio <= :hora_inicio AND hora_fin > :hora_inicio)
                    OR (hora_inicio < :hora_fin AND hora_fin >= :hora_fin)
                    OR (hora_inicio >= :hora_inicio AND hora_fin <= :hora_fin)
                )";
        
        if ($excludeId) {
            $sql .= " AND id != :exclude_id";
        }
        
        $stmt = $this->conn->prepare($sql);
        $params = [
            ':consultorio_id' => $consultorioId,
            ':fecha' => $fecha,
            ':hora_inicio' => $horaInicio,
            ':hora_fin' => $horaFin
        ];
        
        if ($excludeId) {
            $params[':exclude_id'] = $excludeId;
        }
        
        $stmt->execute($params);
        return $stmt->fetch()['count'] > 0;
    }

    /**
     * Contar citas por estado
     */
    public function countByEstado($consultorioId, $fecha = null) {
        $sql = "SELECT estado, COUNT(*) as total FROM {$this->table} 
                WHERE consultorio_id = :consultorio_id";
        $params = [':consultorio_id' => $consultorioId];
        
        if ($fecha) {
            $sql .= " AND fecha = :fecha";
            $params[':fecha'] = $fecha;
        }
        
        $sql .= " GROUP BY estado";
        
        $stmt = $this->conn->prepare($sql);
        $stmt->execute($params);
        
        $result = [];
        foreach ($stmt->fetchAll() as $row) {
            $result[$row['estado']] = (int)$row['total'];
        }
        
        return $result;
    }
}
