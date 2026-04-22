<?php
/**
 * DaliaMed - API de Citas (Agenda)
 */

require_once __DIR__ . '/../models/Cita.php';
require_once __DIR__ . '/../models/Paciente.php';
require_once __DIR__ . '/../utils/response.php';
require_once __DIR__ . '/../middleware/cors.php';
require_once __DIR__ . '/../middleware/auth.php';

// Aplicar CORS
$cors = new CorsMiddleware();
$cors->handle();

// Verificar autenticación
$user = AuthMiddleware::authenticate();
$consultorioId = $user['consultorio_id'];

// Obtener método y parámetros
$method = $_SERVER['REQUEST_METHOD'];
$input = json_decode(file_get_contents('php://input'), true);

// Obtener ID y acción desde query string (api.php?endpoint=citas&id=1&action=estado)
$id = isset($_GET['id']) && is_numeric($_GET['id']) ? (int)$_GET['id'] : null;
$action = isset($_GET['action']) ? $_GET['action'] : '';

$citaModel = new Cita();

switch ($method) {
    case 'GET':
        if ($id) {
            $cita = $citaModel->getById($id, $consultorioId);
            if (!$cita) {
                Response::notFound('Cita no encontrada');
            }
            Response::success($cita);
        } else {
            // Obtener citas por rango de fechas
            $fechaInicio = isset($_GET['fecha_inicio']) ? $_GET['fecha_inicio'] : date('Y-m-01');
            $fechaFin = isset($_GET['fecha_fin']) ? $_GET['fecha_fin'] : date('Y-m-t');
            
            $citas = $citaModel->getByDateRange($consultorioId, $fechaInicio, $fechaFin);
            Response::success($citas, 'Citas obtenidas');
        }
        break;
        
    case 'POST':
        handleCreate($input, $citaModel, $consultorioId, $user['id']);
        break;
        
    case 'PUT':
        if (!$id) {
            Response::error('ID de cita requerido', 400);
        }
        if ($action === 'estado') {
            handleUpdateEstado($id, $input, $citaModel, $consultorioId);
        } else {
            handleUpdate($id, $input, $citaModel, $consultorioId, $user['id']);
        }
        break;
        
    case 'DELETE':
        if (!$id) {
            Response::error('ID de cita requerido', 400);
        }
        handleDelete($id, $citaModel, $consultorioId);
        break;
        
    default:
        Response::error('Método no permitido', 405);
}

/**
 * Crear nueva cita
 */
function handleCreate($data, $citaModel, $consultorioId, $medicoId) {
    // Validar campos obligatorios
    $required = ['paciente_id', 'fecha', 'hora_inicio', 'hora_fin', 'motivo'];
    $errors = [];
    
    foreach ($required as $field) {
        if (empty($data[$field])) {
            $errors[$field] = "El campo $field es requerido";
        }
    }
    
    if (!empty($errors)) {
        Response::error('Datos incompletos', 400, $errors);
    }
    
    // Verificar que el paciente existe
    $pacienteModel = new Paciente();
    $paciente = $pacienteModel->getById($data['paciente_id'], $consultorioId);
    if (!$paciente) {
        Response::notFound('Paciente no encontrado');
    }
    
    // Validar que la fecha no sea pasada (permitir hoy)
    if ($data['fecha'] < date('Y-m-d')) {
        Response::error('No se pueden crear citas en fechas pasadas', 400);
    }
    
    // Preparar datos
    $citaData = [
        'paciente_id' => $data['paciente_id'],
        'medico_id' => $data['medico_id'] ?? $medicoId,
        'consultorio_id' => $consultorioId,
        'fecha' => $data['fecha'],
        'hora_inicio' => $data['hora_inicio'],
        'hora_fin' => $data['hora_fin'],
        'motivo' => trim($data['motivo']),
        'estado' => $data['estado'] ?? 'pendiente',
        'notas' => $data['notas'] ?? null,
        'color' => $data['color'] ?? '#0d9488'
    ];
    
    try {
        $citaId = $citaModel->create($citaData);
        $cita = $citaModel->getById($citaId, $consultorioId);
        Response::success($cita, 'Cita creada exitosamente', 201);
    } catch (Exception $e) {
        Response::error('Error al crear la cita: ' . $e->getMessage(), 400);
    }
}

/**
 * Actualizar cita
 */
function handleUpdate($id, $data, $citaModel, $consultorioId, $medicoId) {
    // Verificar que existe
    $cita = $citaModel->getById($id, $consultorioId);
    if (!$cita) {
        Response::notFound('Cita no encontrada');
    }
    
    // Validar campos
    $required = ['paciente_id', 'fecha', 'hora_inicio', 'hora_fin', 'motivo', 'estado'];
    $errors = [];
    
    foreach ($required as $field) {
        if (empty($data[$field])) {
            $errors[$field] = "El campo $field es requerido";
        }
    }
    
    if (!empty($errors)) {
        Response::error('Datos incompletos', 400, $errors);
    }
    
    // Preparar datos
    $citaData = [
        'paciente_id' => $data['paciente_id'],
        'medico_id' => $data['medico_id'] ?? $medicoId,
        'fecha' => $data['fecha'],
        'hora_inicio' => $data['hora_inicio'],
        'hora_fin' => $data['hora_fin'],
        'motivo' => trim($data['motivo']),
        'estado' => $data['estado'],
        'notas' => $data['notas'] ?? null,
        'color' => $data['color'] ?? '#0d9488'
    ];
    
    try {
        $citaModel->update($id, $citaData, $consultorioId);
        $cita = $citaModel->getById($id, $consultorioId);
        Response::success($cita, 'Cita actualizada exitosamente');
    } catch (Exception $e) {
        Response::error('Error al actualizar la cita: ' . $e->getMessage(), 400);
    }
}

/**
 * Actualizar estado de cita
 */
function handleUpdateEstado($id, $data, $citaModel, $consultorioId) {
    if (empty($data['estado'])) {
        Response::error('El estado es requerido', 400);
    }
    
    $estadosPermitidos = ['pendiente', 'confirmada', 'completada', 'cancelada'];
    if (!in_array($data['estado'], $estadosPermitidos)) {
        Response::error('Estado no válido', 400);
    }
    
    $cita = $citaModel->getById($id, $consultorioId);
    if (!$cita) {
        Response::notFound('Cita no encontrada');
    }
    
    $citaModel->updateEstado($id, $data['estado'], $consultorioId);
    Response::success(['id' => $id, 'estado' => $data['estado']], 'Estado actualizado');
}

/**
 * Eliminar cita
 */
function handleDelete($id, $citaModel, $consultorioId) {
    $cita = $citaModel->getById($id, $consultorioId);
    if (!$cita) {
        Response::notFound('Cita no encontrada');
    }
    
    $citaModel->delete($id, $consultorioId);
    Response::success(null, 'Cita eliminada exitosamente');
}
