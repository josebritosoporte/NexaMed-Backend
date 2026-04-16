<?php
/**
 * NexaMed - API de Consultas Médicas
 */

require_once __DIR__ . '/../models/Consulta.php';
require_once __DIR__ . '/../models/Paciente.php';
require_once __DIR__ . '/../utils/response.php';
require_once __DIR__ . '/../middleware/cors.php';
require_once __DIR__ . '/../middleware/auth.php';

// Aplicar CORS
$cors = new CorsMiddleware();
$cors->handle();

// Verificar autenticación y rol (solo doctors y admins)
$user = AuthMiddleware::requireRole(['admin', 'doctor']);
$consultorioId = $user['consultorio_id'];

// Obtener método y parámetros
$method = $_SERVER['REQUEST_METHOD'];
$input = json_decode(file_get_contents('php://input'), true);

// Obtener ID desde query string (api.php?endpoint=consultas&id=1)
$id = isset($_GET['id']) && is_numeric($_GET['id']) ? (int)$_GET['id'] : null;

$consultaModel = new Consulta();

switch ($method) {
    case 'GET':
        if ($id) {
            // Obtener consulta específica
            $consulta = $consultaModel->getById($id, $consultorioId);
            if (!$consulta) {
                Response::notFound('Consulta no encontrada');
            }
            Response::success($consulta);
        } else {
            // Listar consultas
            $page = isset($_GET['page']) ? (int)$_GET['page'] : 1;
            $limit = isset($_GET['limit']) ? (int)$_GET['limit'] : 10;
            
            $filters = [];
            if (!empty($_GET['paciente_id'])) {
                $filters['paciente_id'] = $_GET['paciente_id'];
            }
            if (!empty($_GET['fecha_desde'])) {
                $filters['fecha_desde'] = $_GET['fecha_desde'];
            }
            if (!empty($_GET['fecha_hasta'])) {
                $filters['fecha_hasta'] = $_GET['fecha_hasta'];
            }
            
            $result = $consultaModel->getAll($consultorioId, $page, $limit, $filters);
            Response::paginated($result['data'], $page, $limit, $result['total'], 'Consultas obtenidas');
        }
        break;
        
    case 'POST':
        handleCreate($input, $consultaModel, $consultorioId, $user['id']);
        break;
        
    default:
        Response::error('Método no permitido', 405);
}

/**
 * Crear nueva consulta médica
 */
function handleCreate($data, $consultaModel, $consultorioId, $medicoId) {
    // Validar datos obligatorios
    if (empty($data['paciente_id'])) {
        Response::error('El paciente es requerido', 400);
    }
    
    // Verificar que el paciente existe
    $pacienteModel = new Paciente();
    $paciente = $pacienteModel->getById($data['paciente_id'], $consultorioId);
    if (!$paciente) {
        Response::notFound('Paciente no encontrado');
    }
    
    // Preparar datos de la consulta
    $consultaData = [
        'paciente_id' => $data['paciente_id'],
        'medico_id' => $medicoId,
        'consultorio_id' => $consultorioId,
        'presion_sistolica' => $data['presion_sistolica'] ?? null,
        'presion_diastolica' => $data['presion_diastolica'] ?? null,
        'frecuencia_cardiaca' => $data['frecuencia_cardiaca'] ?? null,
        'frecuencia_respiratoria' => $data['frecuencia_respiratoria'] ?? null,
        'temperatura' => $data['temperatura'] ?? null,
        'peso' => $data['peso'] ?? null,
        'talla' => $data['talla'] ?? null,
        'imc' => $data['imc'] ?? null,
        'saturacion_oxigeno' => $data['saturacion_oxigeno'] ?? null,
        'subjetivo' => $data['subjetivo'] ?? null,
        'objetivo' => $data['objetivo'] ?? null,
        'analisis' => $data['analisis'] ?? null,
        'plan' => $data['plan'] ?? null,
        'notas_adicionales' => $data['notas_adicionales'] ?? null
    ];
    
    // Procesar diagnósticos
    $diagnosticos = [];
    if (!empty($data['diagnosticos']) && is_array($data['diagnosticos'])) {
        foreach ($data['diagnosticos'] as $diag) {
            if (!empty($diag['codigo']) && !empty($diag['descripcion'])) {
                $diagnosticos[] = [
                    'codigo' => $diag['codigo'],
                    'descripcion' => $diag['descripcion'],
                    'tipo' => $diag['tipo'] ?? 'secundario'
                ];
            }
        }
    }
    
    // Procesar medicamentos
    $medicamentos = [];
    if (!empty($data['medicamentos']) && is_array($data['medicamentos'])) {
        foreach ($data['medicamentos'] as $med) {
            if (!empty($med['nombre'])) {
                $medicamentos[] = [
                    'nombre' => $med['nombre'],
                    'dosis' => $med['dosis'] ?? null,
                    'frecuencia' => $med['frecuencia'] ?? null,
                    'duracion' => $med['duracion'] ?? null,
                    'indicaciones' => $med['indicaciones'] ?? null
                ];
            }
        }
    }
    
    try {
        $consultaId = $consultaModel->create($consultaData, $diagnosticos, $medicamentos);
        $consulta = $consultaModel->getById($consultaId, $consultorioId);
        Response::success($consulta, 'Consulta registrada exitosamente', 201);
    } catch (Exception $e) {
        Response::serverError('Error al registrar la consulta: ' . $e->getMessage());
    }
}
