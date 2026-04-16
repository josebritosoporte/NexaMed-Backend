<?php
/**
 * NexaMed - Modelo Consulta
 */

require_once __DIR__ . '/../config/database.php';

class Consulta {
    private $conn;
    private $table = 'consultas';

    public function __construct() {
        $database = new Database();
        $this->conn = $database->getConnection();
    }

    /**
     * Obtener todas las consultas con paginación
     */
    public function getAll($consultorioId, $page = 1, $limit = 10, $filters = []) {
        $offset = ($page - 1) * $limit;
        
        $sql = "SELECT c.*, p.nombres as paciente_nombres, p.apellidos as paciente_apellidos,
                       p.cedula as paciente_cedula, u.nombre as medico_nombre
                FROM {$this->table} c
                JOIN pacientes p ON c.paciente_id = p.id
                LEFT JOIN usuarios u ON c.medico_id = u.id
                WHERE c.consultorio_id = :consultorio_id";
        
        $countSql = "SELECT COUNT(*) as total FROM {$this->table} 
                     WHERE consultorio_id = :consultorio_id";
        
        $params = [':consultorio_id' => $consultorioId];
        
        // Filtros
        if (!empty($filters['paciente_id'])) {
            $sql .= " AND c.paciente_id = :paciente_id";
            $countSql .= " AND paciente_id = :paciente_id";
            $params[':paciente_id'] = $filters['paciente_id'];
        }
        
        if (!empty($filters['fecha_desde'])) {
            $sql .= " AND c.fecha >= :fecha_desde";
            $countSql .= " AND fecha >= :fecha_desde";
            $params[':fecha_desde'] = $filters['fecha_desde'];
        }
        
        if (!empty($filters['fecha_hasta'])) {
            $sql .= " AND c.fecha <= :fecha_hasta";
            $countSql .= " AND fecha <= :fecha_hasta";
            $params[':fecha_hasta'] = $filters['fecha_hasta'];
        }
        
        $sql .= " ORDER BY c.fecha DESC LIMIT :limit OFFSET :offset";
        
        // Obtener total
        $countStmt = $this->conn->prepare($countSql);
        foreach ($params as $key => $value) {
            $countStmt->bindValue($key, $value);
        }
        $countStmt->execute();
        $total = $countStmt->fetch()['total'];
        
        // Obtener datos
        $stmt = $this->conn->prepare($sql);
        foreach ($params as $key => $value) {
            $stmt->bindValue($key, $value);
        }
        $stmt->bindValue(':limit', $limit, PDO::PARAM_INT);
        $stmt->bindValue(':offset', $offset, PDO::PARAM_INT);
        $stmt->execute();
        
        return [
            'data' => $stmt->fetchAll(),
            'total' => $total
        ];
    }

    /**
     * Obtener consulta por ID con detalles completos
     */
    public function getById($id, $consultorioId) {
        $sql = "SELECT c.*, p.nombres as paciente_nombres, p.apellidos as paciente_apellidos,
                       p.cedula as paciente_cedula, p.fecha_nacimiento, p.sexo, p.tipo_sangre,
                       p.alergias, p.medicamentos_actuales, u.nombre as medico_nombre
                FROM {$this->table} c
                JOIN pacientes p ON c.paciente_id = p.id
                LEFT JOIN usuarios u ON c.medico_id = u.id
                WHERE c.id = :id AND c.consultorio_id = :consultorio_id";
        
        $stmt = $this->conn->prepare($sql);
        $stmt->execute([':id' => $id, ':consultorio_id' => $consultorioId]);
        $consulta = $stmt->fetch();
        
        if ($consulta) {
            $consulta['diagnosticos'] = $this->getDiagnosticos($id);
            $consulta['medicamentos'] = $this->getMedicamentos($id);
        }
        
        return $consulta;
    }

    /**
     * Obtener diagnósticos de una consulta
     */
    public function getDiagnosticos($consultaId) {
        $sql = "SELECT * FROM diagnosticos_consulta WHERE consulta_id = :consulta_id ORDER BY id";
        $stmt = $this->conn->prepare($sql);
        $stmt->execute([':consulta_id' => $consultaId]);
        return $stmt->fetchAll();
    }

    /**
     * Obtener medicamentos de una consulta
     */
    public function getMedicamentos($consultaId) {
        $sql = "SELECT * FROM receta_medicamentos WHERE consulta_id = :consulta_id ORDER BY id";
        $stmt = $this->conn->prepare($sql);
        $stmt->execute([':consulta_id' => $consultaId]);
        return $stmt->fetchAll();
    }

    /**
     * Crear nueva consulta con diagnósticos y medicamentos
     */
    public function create($data, $diagnosticos, $medicamentos) {
        try {
            $this->conn->beginTransaction();
            
            // Insertar consulta
            $sql = "INSERT INTO {$this->table} (
                paciente_id, medico_id, consultorio_id, fecha,
                presion_sistolica, presion_diastolica, frecuencia_cardiaca,
                frecuencia_respiratoria, temperatura, peso, talla, imc, saturacion_oxigeno,
                subjetivo, objetivo, analisis, plan, notas_adicionales
            ) VALUES (
                :paciente_id, :medico_id, :consultorio_id, CURRENT_TIMESTAMP,
                :presion_sistolica, :presion_diastolica, :frecuencia_cardiaca,
                :frecuencia_respiratoria, :temperatura, :peso, :talla, :imc, :saturacion_oxigeno,
                :subjetivo, :objetivo, :analisis, :plan, :notas_adicionales
            )";
            
            $stmt = $this->conn->prepare($sql);
            $stmt->execute([
                ':paciente_id' => $data['paciente_id'],
                ':medico_id' => $data['medico_id'],
                ':consultorio_id' => $data['consultorio_id'],
                ':presion_sistolica' => $data['presion_sistolica'] ?? null,
                ':presion_diastolica' => $data['presion_diastolica'] ?? null,
                ':frecuencia_cardiaca' => $data['frecuencia_cardiaca'] ?? null,
                ':frecuencia_respiratoria' => $data['frecuencia_respiratoria'] ?? null,
                ':temperatura' => $data['temperatura'] ?? null,
                ':peso' => $data['peso'] ?? null,
                ':talla' => $data['talla'] ?? null,
                ':imc' => $data['imc'] ?? null,
                ':saturacion_oxigeno' => $data['saturacion_oxigeno'] ?? null,
                ':subjetivo' => $data['subjetivo'] ?? null,
                ':objetivo' => $data['objetivo'] ?? null,
                ':analisis' => $data['analisis'] ?? null,
                ':plan' => $data['plan'] ?? null,
                ':notas_adicionales' => $data['notas_adicionales'] ?? null
            ]);
            
            $consultaId = $this->conn->lastInsertId();
            
            // Insertar diagnósticos
            if (!empty($diagnosticos)) {
                $diagSql = "INSERT INTO diagnosticos_consulta 
                           (consulta_id, codigo_cie10, descripcion, tipo) 
                           VALUES (:consulta_id, :codigo, :descripcion, :tipo)";
                $diagStmt = $this->conn->prepare($diagSql);
                
                foreach ($diagnosticos as $diag) {
                    $diagStmt->execute([
                        ':consulta_id' => $consultaId,
                        ':codigo' => $diag['codigo'],
                        ':descripcion' => $diag['descripcion'],
                        ':tipo' => $diag['tipo']
                    ]);
                }
            }
            
            // Insertar medicamentos
            if (!empty($medicamentos)) {
                $medSql = "INSERT INTO receta_medicamentos 
                          (consulta_id, nombre, dosis, frecuencia, duracion, indicaciones) 
                          VALUES (:consulta_id, :nombre, :dosis, :frecuencia, :duracion, :indicaciones)";
                $medStmt = $this->conn->prepare($medSql);
                
                foreach ($medicamentos as $med) {
                    $medStmt->execute([
                        ':consulta_id' => $consultaId,
                        ':nombre' => $med['nombre'],
                        ':dosis' => $med['dosis'] ?? null,
                        ':frecuencia' => $med['frecuencia'] ?? null,
                        ':duracion' => $med['duracion'] ?? null,
                        ':indicaciones' => $med['indicaciones'] ?? null
                    ]);
                }
            }
            
            // Actualizar última visita del paciente
            $updateSql = "UPDATE pacientes SET ultima_visita = CURRENT_DATE WHERE id = :paciente_id";
            $updateStmt = $this->conn->prepare($updateSql);
            $updateStmt->execute([':paciente_id' => $data['paciente_id']]);
            
            $this->conn->commit();
            return $consultaId;
            
        } catch (Exception $e) {
            $this->conn->rollBack();
            throw $e;
        }
    }

    /**
     * Obtener consultas de un paciente específico
     */
    public function getByPaciente($pacienteId, $consultorioId) {
        $sql = "SELECT c.*, u.nombre as medico_nombre
                FROM {$this->table} c
                LEFT JOIN usuarios u ON c.medico_id = u.id
                WHERE c.paciente_id = :paciente_id AND c.consultorio_id = :consultorio_id
                ORDER BY c.fecha DESC";
        
        $stmt = $this->conn->prepare($sql);
        $stmt->execute([
            ':paciente_id' => $pacienteId,
            ':consultorio_id' => $consultorioId
        ]);
        
        return $stmt->fetchAll();
    }
}
