<?php
/**
 * DaliaMed - API de Órdenes Médicas
 */

require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../models/Paciente.php';
require_once __DIR__ . '/../utils/response.php';
require_once __DIR__ . '/../middleware/cors.php';
require_once __DIR__ . '/../middleware/auth.php';
require_once __DIR__ . '/../middleware/subscription.php';

// Aplicar CORS
$cors = new CorsMiddleware();
$cors->handle();

// Verificar autenticación
$user = AuthMiddleware::authenticate();
$consultorioId = $user['consultorio_id'];

// Verificar suscripción
SubscriptionMiddleware::requireAccess($consultorioId);

// Obtener método y parámetros
$method = $_SERVER['REQUEST_METHOD'];
$input = json_decode(file_get_contents('php://input'), true);

// Obtener ID desde query string (api.php?endpoint=ordenes&id=1)
$id = isset($_GET['id']) && is_numeric($_GET['id']) ? (int)$_GET['id'] : null;

$database = new Database();
$conn = $database->getConnection();

switch ($method) {
    case 'GET':
        if ($id) {
            getOrden($conn, $id, $consultorioId);
        } else {
            listOrdenes($conn, $consultorioId);
        }
        break;
        
    case 'POST':
        SubscriptionMiddleware::requireActive($consultorioId);
        createOrden($conn, $input, $consultorioId, $user['id']);
        break;
        
    case 'PUT':
        if (!$id) {
            Response::error('ID de orden requerido', 400);
        }
        SubscriptionMiddleware::requireActive($consultorioId);
        updateOrden($conn, $id, $input, $consultorioId);
        break;
        
    case 'DELETE':
        if (!$id) {
            Response::error('ID de orden requerido', 400);
        }
        SubscriptionMiddleware::requireActive($consultorioId);
        deleteOrden($conn, $id, $consultorioId);
        break;
        
    default:
        Response::error('Método no permitido', 405);
}

/**
 * Listar órdenes
 */
function listOrdenes($conn, $consultorioId) {
    $page = isset($_GET['page']) ? (int)$_GET['page'] : 1;
    $limit = isset($_GET['limit']) ? (int)$_GET['limit'] : 10;
    $offset = ($page - 1) * $limit;
    
    $sql = "SELECT o.*, p.nombres as paciente_nombres, p.apellidos as paciente_apellidos,
                   p.cedula as paciente_cedula
            FROM ordenes_medicas o
            JOIN pacientes p ON o.paciente_id = p.id
            WHERE o.consultorio_id = :consultorio_id";
    
    $countSql = "SELECT COUNT(*) as total FROM ordenes_medicas 
                 WHERE consultorio_id = :consultorio_id";
    
    $params = [':consultorio_id' => $consultorioId];
    
    // Filtros
    if (!empty($_GET['estado'])) {
        $sql .= " AND o.estado = :estado";
        $countSql .= " AND estado = :estado";
        $params[':estado'] = $_GET['estado'];
    }
    
    if (!empty($_GET['tipo'])) {
        $sql .= " AND o.tipo = :tipo";
        $countSql .= " AND tipo = :tipo";
        $params[':tipo'] = $_GET['tipo'];
    }
    
    if (!empty($_GET['paciente_id'])) {
        $sql .= " AND o.paciente_id = :paciente_id";
        $countSql .= " AND paciente_id = :paciente_id";
        $params[':paciente_id'] = $_GET['paciente_id'];
    }
    
    $sql .= " ORDER BY o.fecha DESC LIMIT :limit OFFSET :offset";
    
    // Obtener total
    $countStmt = $conn->prepare($countSql);
    foreach ($params as $key => $value) {
        $countStmt->bindValue($key, $value);
    }
    $countStmt->execute();
    $total = $countStmt->fetch()['total'];
    
    // Obtener datos
    $stmt = $conn->prepare($sql);
    foreach ($params as $key => $value) {
        $stmt->bindValue($key, $value);
    }
    $stmt->bindValue(':limit', $limit, PDO::PARAM_INT);
    $stmt->bindValue(':offset', $offset, PDO::PARAM_INT);
    $stmt->execute();
    
    $ordenes = $stmt->fetchAll();
    
    // Obtener exámenes para cada orden
    foreach ($ordenes as &$orden) {
        $orden['examenes'] = getExamenes($conn, $orden['id']);
    }
    
    Response::paginated($ordenes, $page, $limit, $total, 'Órdenes obtenidas');
}

/**
 * Obtener una orden específica
 */
function getOrden($conn, $id, $consultorioId) {
    $sql = "SELECT o.*, p.nombres as paciente_nombres, p.apellidos as paciente_apellidos,
                   p.cedula as paciente_cedula, p.fecha_nacimiento, p.sexo, p.tipo_sangre,
                   u.nombre as medico_nombre, u.especialidad as medico_especialidad,
                   u.registro_medico as medico_registro,
                   c.fecha as consulta_fecha, c.subjetivo as consulta_motivo
            FROM ordenes_medicas o
            JOIN pacientes p ON o.paciente_id = p.id
            LEFT JOIN usuarios u ON o.medico_id = u.id
            LEFT JOIN consultas c ON o.consulta_id = c.id
            WHERE o.id = :id AND o.consultorio_id = :consultorio_id";
    
    $stmt = $conn->prepare($sql);
    $stmt->execute([':id' => $id, ':consultorio_id' => $consultorioId]);
    $orden = $stmt->fetch();
    
    if (!$orden) {
        Response::notFound('Orden no encontrada');
    }
    
    $orden['examenes'] = getExamenes($conn, $id);
    
    Response::success($orden);
}

/**
 * Obtener exámenes de una orden
 */
function getExamenes($conn, $ordenId) {
    $sql = "SELECT * FROM examenes_orden WHERE orden_id = :orden_id ORDER BY id";
    $stmt = $conn->prepare($sql);
    $stmt->execute([':orden_id' => $ordenId]);
    return $stmt->fetchAll();
}

/**
 * Generar número único de orden
 */
function generarNumeroOrden($conn, $consultorioId) {
    $year = date('Y');
    $prefix = 'ORD-' . $year . '-';
    
    // Obtener el último número de orden del año actual para este consultorio
    $sql = "SELECT numero_orden FROM ordenes_medicas 
            WHERE consultorio_id = :consultorio_id AND numero_orden LIKE :pattern
            ORDER BY id DESC LIMIT 1";
    $stmt = $conn->prepare($sql);
    $stmt->execute([
        ':consultorio_id' => $consultorioId,
        ':pattern' => $prefix . '%'
    ]);
    $lastOrden = $stmt->fetch();
    
    if ($lastOrden) {
        // Extraer el número secuencial
        $parts = explode('-', $lastOrden['numero_orden']);
        $lastNumber = intval(end($parts));
        $newNumber = $lastNumber + 1;
    } else {
        $newNumber = 1;
    }
    
    return $prefix . str_pad($newNumber, 4, '0', STR_PAD_LEFT);
}

/**
 * Crear nueva orden
 */
function createOrden($conn, $data, $consultorioId, $medicoId) {
    // Validar datos
    if (empty($data['paciente_id']) || empty($data['tipo'])) {
        Response::error('Paciente y tipo son requeridos', 400);
    }
    
    // Verificar paciente
    $pacienteModel = new Paciente();
    $paciente = $pacienteModel->getById($data['paciente_id'], $consultorioId);
    if (!$paciente) {
        Response::notFound('Paciente no encontrado');
    }
    
    // Validar tipo
    $tiposPermitidos = ['laboratorio', 'imagenologia', 'interconsulta'];
    if (!in_array($data['tipo'], $tiposPermitidos)) {
        Response::error('Tipo de orden no válido', 400);
    }
    
    try {
        $conn->beginTransaction();
        
        // Generar número de orden único
        $numeroOrden = generarNumeroOrden($conn, $consultorioId);
        
        // Insertar orden
        $sql = "INSERT INTO ordenes_medicas (
            numero_orden, paciente_id, consulta_id, medico_id, consultorio_id, 
            tipo, especialidad, notas, estado
        ) VALUES (
            :numero_orden, :paciente_id, :consulta_id, :medico_id, :consultorio_id, 
            :tipo, :especialidad, :notas, 'pendiente'
        )";
        
        $stmt = $conn->prepare($sql);
        $stmt->execute([
            ':numero_orden' => $numeroOrden,
            ':paciente_id' => $data['paciente_id'],
            ':consulta_id' => $data['consulta_id'] ?? null,
            ':medico_id' => $medicoId,
            ':consultorio_id' => $consultorioId,
            ':tipo' => $data['tipo'],
            ':especialidad' => $data['especialidad'] ?? null,
            ':notas' => $data['notas'] ?? null
        ]);
        
        $ordenId = $conn->lastInsertId();
        
        // Insertar exámenes si los hay
        if (!empty($data['examenes']) && is_array($data['examenes'])) {
            $examSql = "INSERT INTO examenes_orden (orden_id, codigo, nombre, categoria) 
                       VALUES (:orden_id, :codigo, :nombre, :categoria)";
            $examStmt = $conn->prepare($examSql);
            
            foreach ($data['examenes'] as $examen) {
                $examStmt->execute([
                    ':orden_id' => $ordenId,
                    ':codigo' => $examen['codigo'] ?? '',
                    ':nombre' => $examen['nombre'],
                    ':categoria' => $examen['categoria'] ?? null
                ]);
            }
        }
        
        $conn->commit();
        
        // Retornar la orden creada
        getOrden($conn, $ordenId, $consultorioId);
        
    } catch (Exception $e) {
        $conn->rollBack();
        Response::serverError('Error al crear la orden: ' . $e->getMessage());
    }
}

/**
 * Actualizar orden
 */
function updateOrden($conn, $id, $data, $consultorioId) {
    // Verificar que existe
    $checkSql = "SELECT id FROM ordenes_medicas WHERE id = :id AND consultorio_id = :consultorio_id";
    $checkStmt = $conn->prepare($checkSql);
    $checkStmt->execute([':id' => $id, ':consultorio_id' => $consultorioId]);
    
    if (!$checkStmt->fetch()) {
        Response::notFound('Orden no encontrada');
    }
    
    $sql = "UPDATE ordenes_medicas SET
        estado = :estado,
        notas = :notas
    WHERE id = :id AND consultorio_id = :consultorio_id";
    
    $stmt = $conn->prepare($sql);
    $stmt->execute([
        ':id' => $id,
        ':consultorio_id' => $consultorioId,
        ':estado' => $data['estado'] ?? 'pendiente',
        ':notas' => $data['notas'] ?? null
    ]);
    
    getOrden($conn, $id, $consultorioId);
}

/**
 * Eliminar orden
 */
function deleteOrden($conn, $id, $consultorioId) {
    $checkSql = "SELECT id FROM ordenes_medicas WHERE id = :id AND consultorio_id = :consultorio_id";
    $checkStmt = $conn->prepare($checkSql);
    $checkStmt->execute([':id' => $id, ':consultorio_id' => $consultorioId]);
    
    if (!$checkStmt->fetch()) {
        Response::notFound('Orden no encontrada');
    }
    
    try {
        $conn->beginTransaction();
        
        // Eliminar exámenes primero
        $delExamSql = "DELETE FROM examenes_orden WHERE orden_id = :orden_id";
        $delExamStmt = $conn->prepare($delExamSql);
        $delExamStmt->execute([':orden_id' => $id]);
        
        // Eliminar orden
        $delSql = "DELETE FROM ordenes_medicas WHERE id = :id AND consultorio_id = :consultorio_id";
        $delStmt = $conn->prepare($delSql);
        $delStmt->execute([':id' => $id, ':consultorio_id' => $consultorioId]);
        
        $conn->commit();
        
        Response::success(null, 'Orden eliminada exitosamente');
        
    } catch (Exception $e) {
        $conn->rollBack();
        Response::serverError('Error al eliminar la orden: ' . $e->getMessage());
    }
}
