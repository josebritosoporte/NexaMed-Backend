<?php
/**
 * NexaMed - API de Pacientes
 * Endpoints: GET /, POST /, GET /:id, PUT /:id, DELETE /:id
 */

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

// Obtener ID desde query string (api.php?endpoint=pacientes&id=1)
$id = isset($_GET['id']) && is_numeric($_GET['id']) ? (int)$_GET['id'] : null;

$pacienteModel = new Paciente();

switch ($method) {
    case 'GET':
        if ($id) {
            // Obtener paciente específico
            $paciente = $pacienteModel->getById($id, $consultorioId);
            if (!$paciente) {
                Response::notFound('Paciente no encontrado');
            }
            Response::success($paciente);
        } else {
            // Listar pacientes con paginación
            $page = isset($_GET['page']) ? (int)$_GET['page'] : 1;
            $limit = isset($_GET['limit']) ? (int)$_GET['limit'] : 10;
            $search = isset($_GET['search']) ? $_GET['search'] : '';
            
            $result = $pacienteModel->getAll($consultorioId, $page, $limit, $search);
            Response::paginated($result['data'], $page, $limit, $result['total'], 'Pacientes obtenidos');
        }
        break;
        
    case 'POST':
        handleCreate($input, $pacienteModel, $consultorioId);
        break;
        
    case 'PUT':
        if (!$id) {
            Response::error('ID de paciente requerido', 400);
        }
        handleUpdate($id, $input, $pacienteModel, $consultorioId);
        break;
        
    case 'DELETE':
        if (!$id) {
            Response::error('ID de paciente requerido', 400);
        }
        handleDelete($id, $pacienteModel, $consultorioId);
        break;
        
    default:
        Response::error('Método no permitido', 405);
}

/**
 * Crear nuevo paciente
 */
function handleCreate($data, $pacienteModel, $consultorioId) {
    // Validar campos obligatorios
    $required = ['nombres', 'apellidos', 'cedula', 'fecha_nacimiento', 'sexo', 'telefono'];
    $errors = [];
    
    foreach ($required as $field) {
        if (empty($data[$field])) {
            $errors[$field] = "El campo $field es requerido";
        }
    }
    
    if (!empty($errors)) {
        Response::error('Datos incompletos', 400, $errors);
    }
    
    // Verificar cédula duplicada
    if ($pacienteModel->cedulaExists($data['cedula'], $consultorioId)) {
        Response::error('La cédula ya está registrada', 400, ['cedula' => 'Esta cédula ya existe en el sistema']);
    }
    
    // Preparar datos
    $pacienteData = [
        'consultorio_id' => $consultorioId,
        'nombres' => trim($data['nombres']),
        'apellidos' => trim($data['apellidos']),
        'cedula' => trim($data['cedula']),
        'fecha_nacimiento' => $data['fecha_nacimiento'],
        'sexo' => $data['sexo'],
        'estado_civil' => $data['estado_civil'] ?? null,
        'ocupacion' => $data['ocupacion'] ?? null,
        'telefono' => trim($data['telefono']),
        'email' => !empty($data['email']) ? trim($data['email']) : null,
        'direccion' => $data['direccion'] ?? null,
        'ciudad' => $data['ciudad'] ?? null,
        'contacto_emergencia_nombre' => $data['contacto_emergencia_nombre'] ?? null,
        'contacto_emergencia_telefono' => $data['contacto_emergencia_telefono'] ?? null,
        'contacto_emergencia_relacion' => $data['contacto_emergencia_relacion'] ?? null,
        'alergias' => $data['alergias'] ?? null,
        'antecedentes_medicos' => $data['antecedentes_medicos'] ?? null,
        'medicamentos_actuales' => $data['medicamentos_actuales'] ?? null,
        'tipo_sangre' => $data['tipo_sangre'] ?? null
    ];
    
    try {
        $id = $pacienteModel->create($pacienteData);
        $paciente = $pacienteModel->getById($id, $consultorioId);
        Response::success($paciente, 'Paciente creado exitosamente', 201);
    } catch (Exception $e) {
        Response::serverError('Error al crear el paciente: ' . $e->getMessage());
    }
}

/**
 * Actualizar paciente
 */
function handleUpdate($id, $data, $pacienteModel, $consultorioId) {
    // Verificar que el paciente existe
    $paciente = $pacienteModel->getById($id, $consultorioId);
    if (!$paciente) {
        Response::notFound('Paciente no encontrado');
    }
    
    // Validar campos obligatorios
    $required = ['nombres', 'apellidos', 'cedula', 'fecha_nacimiento', 'sexo', 'telefono'];
    $errors = [];
    
    foreach ($required as $field) {
        if (empty($data[$field])) {
            $errors[$field] = "El campo $field es requerido";
        }
    }
    
    if (!empty($errors)) {
        Response::error('Datos incompletos', 400, $errors);
    }
    
    // Verificar cédula duplicada (excluyendo el paciente actual)
    if ($pacienteModel->cedulaExists($data['cedula'], $consultorioId, $id)) {
        Response::error('La cédula ya está registrada', 400, ['cedula' => 'Esta cédula ya existe en el sistema']);
    }
    
    // Preparar datos
    $pacienteData = [
        'nombres' => trim($data['nombres']),
        'apellidos' => trim($data['apellidos']),
        'cedula' => trim($data['cedula']),
        'fecha_nacimiento' => $data['fecha_nacimiento'],
        'sexo' => $data['sexo'],
        'estado_civil' => $data['estado_civil'] ?? null,
        'ocupacion' => $data['ocupacion'] ?? null,
        'telefono' => trim($data['telefono']),
        'email' => !empty($data['email']) ? trim($data['email']) : null,
        'direccion' => $data['direccion'] ?? null,
        'ciudad' => $data['ciudad'] ?? null,
        'contacto_emergencia_nombre' => $data['contacto_emergencia_nombre'] ?? null,
        'contacto_emergencia_telefono' => $data['contacto_emergencia_telefono'] ?? null,
        'contacto_emergencia_relacion' => $data['contacto_emergencia_relacion'] ?? null,
        'alergias' => $data['alergias'] ?? null,
        'antecedentes_medicos' => $data['antecedentes_medicos'] ?? null,
        'medicamentos_actuales' => $data['medicamentos_actuales'] ?? null,
        'tipo_sangre' => $data['tipo_sangre'] ?? null
    ];
    
    try {
        $pacienteModel->update($id, $pacienteData, $consultorioId);
        $paciente = $pacienteModel->getById($id, $consultorioId);
        Response::success($paciente, 'Paciente actualizado exitosamente');
    } catch (Exception $e) {
        Response::serverError('Error al actualizar el paciente: ' . $e->getMessage());
    }
}

/**
 * Eliminar paciente (soft delete)
 */
function handleDelete($id, $pacienteModel, $consultorioId) {
    // Verificar que el paciente existe
    $paciente = $pacienteModel->getById($id, $consultorioId);
    if (!$paciente) {
        Response::notFound('Paciente no encontrado');
    }
    
    try {
        $pacienteModel->delete($id, $consultorioId);
        Response::success(null, 'Paciente eliminado exitosamente');
    } catch (Exception $e) {
        Response::serverError('Error al eliminar el paciente: ' . $e->getMessage());
    }
}
