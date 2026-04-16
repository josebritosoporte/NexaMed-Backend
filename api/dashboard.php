<?php
/**
 * NexaMed - API de Dashboard y Estadísticas
 */

require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../utils/response.php';
require_once __DIR__ . '/../middleware/cors.php';
require_once __DIR__ . '/../middleware/auth.php';

// Aplicar CORS
$cors = new CorsMiddleware();
$cors->handle();

// Verificar autenticación
$user = AuthMiddleware::authenticate();
$consultorioId = $user['consultorio_id'];

// Obtener método
$method = $_SERVER['REQUEST_METHOD'];

if ($method !== 'GET') {
    Response::error('Método no permitido', 405);
}

// Obtener acción
$action = isset($_GET['action']) ? $_GET['action'] : 'stats';

try {
    $database = new Database();
    $conn = $database->getConnection();
    
    switch ($action) {
        case 'stats':
            getStats($conn, $consultorioId);
            break;
            
        case 'citas-hoy':
            getCitasHoy($conn, $consultorioId);
            break;
            
        case 'actividad':
            getActividad($conn, $consultorioId);
            break;
            
        case 'ordenes-pendientes':
            getOrdenesPendientes($conn, $consultorioId);
            break;
            
        case 'pacientes-recientes':
            getPacientesRecientes($conn, $consultorioId);
            break;
            
        default:
            Response::notFound('Acción no encontrada');
    }
    
} catch (Exception $e) {
    Response::serverError('Error al obtener estadísticas: ' . $e->getMessage());
}

/**
 * Obtener estadísticas principales
 */
function getStats($conn, $consultorioId) {
    // Total de pacientes
    $pacientesSql = "SELECT COUNT(*) as total FROM pacientes 
                     WHERE consultorio_id = :consultorio_id AND activo = TRUE";
    $pacientesStmt = $conn->prepare($pacientesSql);
    $pacientesStmt->execute([':consultorio_id' => $consultorioId]);
    $pacientesTotal = $pacientesStmt->fetch()['total'];
    
    // Pacientes nuevos este mes
    $pacientesNuevosSql = "SELECT COUNT(*) as total FROM pacientes 
                           WHERE consultorio_id = :consultorio_id 
                           AND activo = TRUE 
                           AND created_at >= DATE_FORMAT(CURDATE(), '%Y-%m-01')";
    $pacientesNuevosStmt = $conn->prepare($pacientesNuevosSql);
    $pacientesNuevosStmt->execute([':consultorio_id' => $consultorioId]);
    $pacientesNuevos = $pacientesNuevosStmt->fetch()['total'];
    
    // Consultas hoy
    $consultasHoySql = "SELECT COUNT(*) as total FROM consultas 
                        WHERE consultorio_id = :consultorio_id 
                        AND DATE(fecha) = CURDATE()";
    $consultasHoyStmt = $conn->prepare($consultasHoySql);
    $consultasHoyStmt->execute([':consultorio_id' => $consultorioId]);
    $consultasHoy = $consultasHoyStmt->fetch()['total'];
    
    // Citas hoy
    $citasHoySql = "SELECT COUNT(*) as total FROM citas 
                    WHERE consultorio_id = :consultorio_id 
                    AND fecha = CURDATE()";
    $citasHoyStmt = $conn->prepare($citasHoySql);
    $citasHoyStmt->execute([':consultorio_id' => $consultorioId]);
    $citasHoy = $citasHoyStmt->fetch()['total'];
    
    // Citas pendientes hoy
    $citasPendientesSql = "SELECT COUNT(*) as total FROM citas 
                           WHERE consultorio_id = :consultorio_id 
                           AND fecha = CURDATE() 
                           AND estado IN ('pendiente', 'confirmada')";
    $citasPendientesStmt = $conn->prepare($citasPendientesSql);
    $citasPendientesStmt->execute([':consultorio_id' => $consultorioId]);
    $citasPendientes = $citasPendientesStmt->fetch()['total'];
    
    // Órdenes pendientes
    $ordenesSql = "SELECT COUNT(*) as total FROM ordenes_medicas 
                   WHERE consultorio_id = :consultorio_id AND estado = 'pendiente'";
    $ordenesStmt = $conn->prepare($ordenesSql);
    $ordenesStmt->execute([':consultorio_id' => $consultorioId]);
    $ordenesPendientes = $ordenesStmt->fetch()['total'];
    
    Response::success([
        'pacientes_total' => (int)$pacientesTotal,
        'pacientes_nuevos_mes' => (int)$pacientesNuevos,
        'consultas_hoy' => (int)$consultasHoy,
        'citas_hoy' => (int)$citasHoy,
        'citas_pendientes_hoy' => (int)$citasPendientes,
        'ordenes_pendientes' => (int)$ordenesPendientes
    ]);
}

/**
 * Obtener citas de hoy con detalles
 */
function getCitasHoy($conn, $consultorioId) {
    $sql = "SELECT c.*, p.nombres as paciente_nombres, p.apellidos as paciente_apellidos
            FROM citas c
            JOIN pacientes p ON c.paciente_id = p.id
            WHERE c.consultorio_id = :consultorio_id 
            AND c.fecha = CURDATE()
            ORDER BY c.hora_inicio";
    
    $stmt = $conn->prepare($sql);
    $stmt->execute([':consultorio_id' => $consultorioId]);
    $citas = $stmt->fetchAll();
    
    // Formatear respuesta
    $result = [];
    foreach ($citas as $cita) {
        $result[] = [
            'id' => $cita['id'],
            'paciente' => $cita['paciente_nombres'] . ' ' . $cita['paciente_apellidos'],
            'hora' => substr($cita['hora_inicio'], 0, 5),
            'duracion' => calculateDuration($cita['hora_inicio'], $cita['hora_fin']),
            'motivo' => $cita['motivo'],
            'estado' => $cita['estado']
        ];
    }
    
    Response::success($result);
}

/**
 * Calcular duración entre dos horas
 */
function calculateDuration($start, $end) {
    $startTime = strtotime($start);
    $endTime = strtotime($end);
    $diff = $endTime - $startTime;
    $minutes = $diff / 60;
    return $minutes . ' min';
}

/**
 * Obtener actividad reciente
 */
function getActividad($conn, $consultorioId) {
    $actividad = [];
    
    // Consultas recientes
    $consultasSql = "SELECT c.id, c.fecha, 'consulta' as tipo, 
                            CONCAT(p.nombres, ' ', p.apellidos) as paciente
                     FROM consultas c
                     JOIN pacientes p ON c.paciente_id = p.id
                     WHERE c.consultorio_id = :consultorio_id
                     ORDER BY c.fecha DESC
                     LIMIT 5";
    $consultasStmt = $conn->prepare($consultasSql);
    $consultasStmt->execute([':consultorio_id' => $consultorioId]);
    
    foreach ($consultasStmt->fetchAll() as $row) {
        $actividad[] = [
            'id' => $row['id'],
            'tipo' => 'consulta',
            'descripcion' => 'Consulta completada con ' . $row['paciente'],
            'hora' => $row['fecha'],
            'icono' => 'Stethoscope'
        ];
    }
    
    // Pacientes nuevos recientes
    $pacientesSql = "SELECT id, created_at as fecha, nombres, apellidos
                     FROM pacientes
                     WHERE consultorio_id = :consultorio_id AND activo = TRUE
                     ORDER BY created_at DESC
                     LIMIT 3";
    $pacientesStmt = $conn->prepare($pacientesSql);
    $pacientesStmt->execute([':consultorio_id' => $consultorioId]);
    
    foreach ($pacientesStmt->fetchAll() as $row) {
        $actividad[] = [
            'id' => $row['id'],
            'tipo' => 'paciente',
            'descripcion' => 'Nuevo paciente registrado: ' . $row['nombres'] . ' ' . $row['apellidos'],
            'hora' => $row['fecha'],
            'icono' => 'Users'
        ];
    }
    
    // Ordenes recientes
    $ordenesSql = "SELECT o.id, o.fecha, 'orden' as tipo, o.tipo as tipo_orden,
                          CONCAT(p.nombres, ' ', p.apellidos) as paciente
                   FROM ordenes_medicas o
                   JOIN pacientes p ON o.paciente_id = p.id
                   WHERE o.consultorio_id = :consultorio_id
                   ORDER BY o.fecha DESC
                   LIMIT 3";
    $ordenesStmt = $conn->prepare($ordenesSql);
    $ordenesStmt->execute([':consultorio_id' => $consultorioId]);
    
    foreach ($ordenesStmt->fetchAll() as $row) {
        $actividad[] = [
            'id' => $row['id'],
            'tipo' => 'orden',
            'descripcion' => 'Orden de ' . $row['tipo_orden'] . ' generada para ' . $row['paciente'],
            'hora' => $row['fecha'],
            'icono' => 'FileText'
        ];
    }
    
    // Ordenar por fecha
    usort($actividad, function($a, $b) {
        return strtotime($b['hora']) - strtotime($a['hora']);
    });
    
    // Limitar a 10 items
    $actividad = array_slice($actividad, 0, 10);
    
    Response::success($actividad);
}

/**
 * Obtener órdenes pendientes
 */
function getOrdenesPendientes($conn, $consultorioId) {
    $sql = "SELECT o.*, p.nombres as paciente_nombres, p.apellidos as paciente_apellidos
            FROM ordenes_medicas o
            JOIN pacientes p ON o.paciente_id = p.id
            WHERE o.consultorio_id = :consultorio_id 
            AND o.estado = 'pendiente'
            ORDER BY o.fecha DESC
            LIMIT 10";
    
    $stmt = $conn->prepare($sql);
    $stmt->execute([':consultorio_id' => $consultorioId]);
    $ordenes = $stmt->fetchAll();
    
    $result = [];
    foreach ($ordenes as $orden) {
        $result[] = [
            'id' => $orden['id'],
            'paciente' => $orden['paciente_nombres'] . ' ' . $orden['paciente_apellidos'],
            'tipo' => $orden['tipo'],
            'fecha' => $orden['fecha'],
            'estado' => $orden['estado']
        ];
    }
    
    Response::success($result);
}

/**
 * Obtener pacientes recientes
 */
function getPacientesRecientes($conn, $consultorioId) {
    $sql = "SELECT p.*, 
                   (SELECT fecha FROM consultas WHERE paciente_id = p.id ORDER BY fecha DESC LIMIT 1) as ultima_consulta,
                   (SELECT fecha FROM citas WHERE paciente_id = p.id AND fecha >= CURRENT_DATE ORDER BY fecha ASC LIMIT 1) as proxima_cita
            FROM pacientes p
            WHERE p.consultorio_id = :consultorio_id AND p.activo = TRUE
            ORDER BY p.ultima_visita DESC
            LIMIT 10";
    
    $stmt = $conn->prepare($sql);
    $stmt->execute([':consultorio_id' => $consultorioId]);
    $pacientes = $stmt->fetchAll();
    
    $result = [];
    foreach ($pacientes as $p) {
        // Calcular edad
        $edad = null;
        if ($p['fecha_nacimiento']) {
            $birthDate = new DateTime($p['fecha_nacimiento']);
            $today = new DateTime();
            $edad = $today->diff($birthDate)->y;
        }
        
        $result[] = [
            'id' => $p['id'],
            'nombre' => $p['nombres'] . ' ' . $p['apellidos'],
            'edad' => $edad,
            'ultima_visita' => $p['ultima_visita'],
            'proxima_cita' => $p['proxima_cita']
        ];
    }
    
    Response::success($result);
}
