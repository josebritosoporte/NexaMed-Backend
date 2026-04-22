<?php
/**
 * DaliaMed - API SuperAdmin
 * Panel de gestión global (acceso solo SuperAdmin)
 * 
 * Endpoints:
 *   POST /superadmin&action=login             - Login SuperAdmin
 *   GET  /superadmin&action=me                - Datos del SuperAdmin
 *   GET  /superadmin&action=dashboard         - Dashboard con métricas
 *   GET  /superadmin&action=suscripciones     - Listar suscripciones
 *   PUT  /superadmin&action=suscripcion&id=X  - Modificar suscripción
 *   GET  /superadmin&action=pagos             - Listar pagos
 *   GET  /superadmin&action=pagos-pendientes  - Pagos pendientes
 *   PUT  /superadmin&action=pago-aprobar&id=X - Aprobar pago
 *   PUT  /superadmin&action=pago-rechazar&id=X- Rechazar pago
 *   GET  /superadmin&action=tasa              - Tasa actual
 *   POST /superadmin&action=tasa              - Registrar tasa
 *   GET  /superadmin&action=tasas-historial   - Historial de tasas
 *   GET  /superadmin&action=consultorios      - Listar consultorios
 *   POST /superadmin&action=consultorio       - Crear consultorio + usuario + suscripción
 */

require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../models/SuperAdmin.php';
require_once __DIR__ . '/../models/Suscripcion.php';
require_once __DIR__ . '/../models/Pago.php';
require_once __DIR__ . '/../models/Plan.php';
require_once __DIR__ . '/../models/TasaCambio.php';
require_once __DIR__ . '/../models/Notificacion.php';
require_once __DIR__ . '/../utils/jwt.php';
require_once __DIR__ . '/../utils/response.php';
require_once __DIR__ . '/../middleware/cors.php';

// Aplicar CORS
$cors = new CorsMiddleware();
$cors->handle();

$method = $_SERVER['REQUEST_METHOD'];
$action = isset($_GET['action']) ? $_GET['action'] : '';
$id = isset($_GET['id']) && is_numeric($_GET['id']) ? (int)$_GET['id'] : null;

// Login no requiere autenticación
if ($action === 'login' && $method === 'POST') {
    $data = json_decode(file_get_contents('php://input'), true);
    handleLogin($data);
}

// Todo lo demás requiere autenticación SuperAdmin
$admin = authenticateSuperAdmin();

switch ($method) {
    case 'GET':
        switch ($action) {
            case 'me':
                Response::success($admin);
                break;
            case 'dashboard':
                handleDashboard();
                break;
            case 'suscripciones':
                handleListarSuscripciones();
                break;
            case 'pagos':
                handleListarPagos();
                break;
            case 'pagos-pendientes':
                handlePagosPendientes();
                break;
            case 'tasa':
                handleGetTasa();
                break;
            case 'tasas-historial':
                handleTasasHistorial();
                break;
            case 'consultorios':
                handleListarConsultorios();
                break;
            default:
                Response::error('Acción no válida', 404);
        }
        break;

    case 'POST':
        $data = json_decode(file_get_contents('php://input'), true);
        switch ($action) {
            case 'tasa':
                handleRegistrarTasa($data, $admin);
                break;
            case 'consultorio':
                handleCrearConsultorio($data);
                break;
            default:
                Response::error('Acción no válida', 404);
        }
        break;

    case 'PUT':
        $data = json_decode(file_get_contents('php://input'), true);
        switch ($action) {
            case 'suscripcion':
                if (!$id) Response::error('ID requerido', 400);
                handleModificarSuscripcion($id, $data);
                break;
            case 'pago-aprobar':
                if (!$id) Response::error('ID requerido', 400);
                handleAprobarPago($id, $data, $admin);
                break;
            case 'pago-rechazar':
                if (!$id) Response::error('ID requerido', 400);
                handleRechazarPago($id, $data, $admin);
                break;
            default:
                Response::error('Acción no válida', 404);
        }
        break;

    default:
        Response::error('Método no permitido', 405);
}

// ==========================================
// AUTENTICACIÓN
// ==========================================

function authenticateSuperAdmin() {
    $token = JWT::getBearerToken();
    if (!$token) {
        Response::unauthorized('Token no proporcionado');
    }

    $validation = JWT::validate($token);
    if (!$validation['valid']) {
        Response::unauthorized($validation['error']);
    }

    // Verificar que es un SuperAdmin (tiene flag is_superadmin)
    if (empty($validation['data']['is_superadmin'])) {
        Response::unauthorized('Acceso denegado. Se requieren permisos de SuperAdmin.');
    }

    return $validation['data'];
}

function handleLogin($data) {
    if (empty($data['email']) || empty($data['password'])) {
        Response::error('Email y contraseña son requeridos', 400);
    }

    $model = new SuperAdmin();
    $admin = $model->findByEmail(strtolower(trim($data['email'])));

    if (!$admin || !password_verify($data['password'], $admin['password_hash'])) {
        Response::error('Credenciales incorrectas', 401);
    }

    $model->updateLastAccess($admin['id']);

    $tokenData = [
        'id' => $admin['id'],
        'email' => $admin['email'],
        'name' => $admin['nombre'],
        'is_superadmin' => true
    ];

    $token = JWT::generate($tokenData);

    Response::success([
        'user' => [
            'id' => $admin['id'],
            'email' => $admin['email'],
            'name' => $admin['nombre'],
            'is_superadmin' => true
        ],
        'token' => $token
    ], 'Inicio de sesión exitoso');
}

// ==========================================
// DASHBOARD
// ==========================================

function handleDashboard() {
    $suscripcionModel = new Suscripcion();
    $stats = $suscripcionModel->getStats();
    Response::success($stats);
}

// ==========================================
// SUSCRIPCIONES
// ==========================================

function handleListarSuscripciones() {
    $estado = isset($_GET['estado']) ? $_GET['estado'] : null;
    $search = isset($_GET['search']) ? $_GET['search'] : null;
    
    $model = new Suscripcion();
    $suscripciones = $model->getAll($estado, $search);
    Response::success($suscripciones);
}

function handleModificarSuscripcion($id, $data) {
    $model = new Suscripcion();
    $suscripcion = $model->getById($id);
    
    if (!$suscripcion) {
        Response::notFound('Suscripción no encontrada');
    }

    // Cambiar estado
    if (isset($data['estado'])) {
        $estadosValidos = ['active', 'suspended', 'cancelled', 'expired'];
        if (!in_array($data['estado'], $estadosValidos)) {
            Response::error('Estado no válido', 400);
        }
        $model->updateEstado($id, $data['estado'], $data['motivo'] ?? null);
    }

    // Cambiar plan
    if (isset($data['plan_id'])) {
        $model->updatePlan($id, $data['plan_id']);
    }

    $updated = $model->getById($id);
    Response::success($updated, 'Suscripción actualizada');
}

// ==========================================
// PAGOS
// ==========================================

function handleListarPagos() {
    $estado = isset($_GET['estado']) ? $_GET['estado'] : null;
    $model = new Pago();
    $pagos = $model->getAll($estado);
    Response::success($pagos);
}

function handlePagosPendientes() {
    $model = new Pago();
    $pagos = $model->getPendientes();
    Response::success($pagos);
}

function handleAprobarPago($id, $data, $admin) {
    $pagoModel = new Pago();
    $pago = $pagoModel->getById($id);
    
    if (!$pago) {
        Response::notFound('Pago no encontrado');
    }
    if ($pago['estado'] !== 'pendiente') {
        Response::error('Este pago ya fue procesado', 400);
    }

    // Aprobar el pago
    $pagoModel->approve($id, $admin['id'], $data['notas'] ?? null);

    // Activar/renovar suscripción
    $suscripcionModel = new Suscripcion();
    $suscripcion = $suscripcionModel->getById($pago['suscripcion_id']);

    // Obtener días del periodo desde plan_precios
    $planModel = new Plan();
    $precio = null;
    if ($pago['plan_precio_id']) {
        $precio = $planModel->getPrecioById($pago['plan_precio_id']);
    }
    $dias = $precio ? $precio['dias'] : 30;
    $periodo = $precio ? $precio['periodo'] : 'mensual';

    if (in_array($suscripcion['estado'], ['trial', 'expired', 'grace_period', 'suspended'])) {
        $suscripcionModel->activate($pago['suscripcion_id'], $pago['plan_id'], $periodo, $dias);
    } else {
        $suscripcionModel->renew($pago['suscripcion_id'], $pago['plan_id'], $periodo, $dias);
    }

    $updatedPago = $pagoModel->getById($id);

    // Notificar al consultorio
    $notifModel = new Notificacion();
    $notifModel->notificarPagoAprobado($suscripcion['consultorio_id'], $pago['monto']);

    Response::success($updatedPago, 'Pago aprobado y suscripción activada');
}

function handleRechazarPago($id, $data, $admin) {
    $pagoModel = new Pago();
    $pago = $pagoModel->getById($id);
    
    if (!$pago) {
        Response::notFound('Pago no encontrado');
    }
    if ($pago['estado'] !== 'pendiente') {
        Response::error('Este pago ya fue procesado', 400);
    }

    if (empty($data['notas'])) {
        Response::error('Debe proporcionar un motivo de rechazo', 400);
    }

    $pagoModel->reject($id, $admin['id'], $data['notas']);

    // Notificar al consultorio
    $suscripcionModel = new Suscripcion();
    $suscripcion = $suscripcionModel->getById($pago['suscripcion_id']);
    $notifModel = new Notificacion();
    $notifModel->notificarPagoRechazado($suscripcion['consultorio_id'], $pago['monto'], $data['notas']);
    $updatedPago = $pagoModel->getById($id);
    Response::success($updatedPago, 'Pago rechazado');
}

// ==========================================
// TASA DE CAMBIO
// ==========================================

function handleGetTasa() {
    $model = new TasaCambio();
    $tasa = $model->getActual();
    Response::success($tasa ?: ['tasa_bs' => null, 'fecha' => null]);
}

function handleTasasHistorial() {
    $limit = isset($_GET['limit']) ? (int)$_GET['limit'] : 30;
    $model = new TasaCambio();
    $tasas = $model->getHistorial($limit);
    Response::success($tasas);
}

function handleRegistrarTasa($data, $admin) {
    if (empty($data['tasa_bs']) || !is_numeric($data['tasa_bs'])) {
        Response::error('Tasa Bs es requerida y debe ser numérica', 400);
    }

    $fecha = $data['fecha'] ?? date('Y-m-d');
    $model = new TasaCambio();
    $result = $model->registrar($fecha, $data['tasa_bs'], $admin['id']);
    
    $tasa = $model->getByFecha($fecha);
    Response::success($tasa, 'Tasa de cambio registrada exitosamente');
}

// ==========================================
// CONSULTORIOS
// ==========================================

function handleListarConsultorios() {
    $db = new Database();
    $conn = $db->getConnection();

    $sql = "SELECT c.*, 
                   s.estado as suscripcion_estado, s.fecha_fin as suscripcion_fecha_fin,
                   p.nombre as plan_nombre,
                   (SELECT COUNT(*) FROM usuarios u WHERE u.consultorio_id = c.id AND u.activo = TRUE) as total_usuarios,
                   (SELECT COUNT(*) FROM pacientes pa WHERE pa.consultorio_id = c.id AND pa.activo = TRUE) as total_pacientes
            FROM consultorios c
            LEFT JOIN suscripciones s ON s.consultorio_id = c.id 
                AND s.id = (SELECT MAX(s2.id) FROM suscripciones s2 WHERE s2.consultorio_id = c.id)
            LEFT JOIN planes p ON s.plan_id = p.id
            ORDER BY c.created_at DESC";
    $stmt = $conn->prepare($sql);
    $stmt->execute();
    Response::success($stmt->fetchAll());
}

function handleCrearConsultorio($data) {
    // Normalizar nombres de campos (frontend envía consultorio_nombre, admin_nombre, etc.)
    if (!empty($data['consultorio_nombre']) && empty($data['nombre_consultorio'])) {
        $data['nombre_consultorio'] = $data['consultorio_nombre'];
    }
    if (!empty($data['admin_nombre']) && empty($data['nombre_usuario'])) {
        $data['nombre_usuario'] = $data['admin_nombre'];
    }
    if (!empty($data['admin_email']) && empty($data['email'])) {
        $data['email'] = $data['admin_email'];
    }
    if (!empty($data['admin_password']) && empty($data['password'])) {
        $data['password'] = $data['admin_password'];
    }

    // Validar
    $required = ['nombre_consultorio', 'email', 'password', 'nombre_usuario'];
    $errors = [];
    foreach ($required as $field) {
        if (empty($data[$field])) {
            $errors[$field] = "El campo $field es requerido";
        }
    }
    if (!empty($errors)) {
        Response::error('Datos incompletos', 400, $errors);
    }

    $db = new Database();
    $conn = $db->getConnection();

    try {
        $conn->beginTransaction();

        // Crear consultorio
        $sql = "INSERT INTO consultorios (nombre, rif, email, telefono, direccion) 
                VALUES (:nombre, :rif, :email, :telefono, :direccion)";
        $stmt = $conn->prepare($sql);
        $stmt->execute([
            ':nombre' => $data['nombre_consultorio'],
            ':rif' => $data['rif'] ?? null,
            ':email' => $data['email'],
            ':telefono' => $data['telefono'] ?? null,
            ':direccion' => $data['direccion'] ?? null
        ]);
        $consultorioId = $conn->lastInsertId();

        // Crear usuario admin
        $passwordHash = password_hash($data['password'], PASSWORD_BCRYPT);
        $sql = "INSERT INTO usuarios (consultorio_id, email, password_hash, nombre, role, activo)
                VALUES (:cid, :email, :pass, :nombre, 'admin', TRUE)";
        $stmt = $conn->prepare($sql);
        $stmt->execute([
            ':cid' => $consultorioId,
            ':email' => strtolower(trim($data['email'])),
            ':pass' => $passwordHash,
            ':nombre' => $data['nombre_usuario']
        ]);

        // Crear suscripción
        $suscripcionModel = new Suscripcion();
        $planModel = new Plan();
        
        // Resolver plan_id desde plan_slug si viene del frontend
        $planId = $data['plan_id'] ?? null;
        if (!$planId && !empty($data['plan_slug'])) {
            $allPlanes = $planModel->getAll();
            foreach ($allPlanes as $p) {
                if ($p['slug'] === $data['plan_slug']) {
                    $planId = $p['id'];
                    break;
                }
            }
        }
        if (!$planId) $planId = 2; // Default: Profesional
        
        // Desde SuperAdmin siempre crear como activa
        $periodo = $data['periodo'] ?? 'mensual';
        $precio = $planModel->getPrecio($planId, $periodo);
        $dias = $precio ? $precio['dias'] : 30;
            
            $sql = "INSERT INTO suscripciones (consultorio_id, plan_id, periodo, estado, fecha_inicio, fecha_fin)
                    VALUES (:cid, :pid, :periodo, 'active', NOW(), DATE_ADD(NOW(), INTERVAL :dias DAY))";
            $stmt = $conn->prepare($sql);
            $stmt->execute([
                ':cid' => $consultorioId,
                ':pid' => $planId,
                ':periodo' => $periodo,
                ':dias' => $dias
            ]);

        $conn->commit();

        Response::success([
            'consultorio_id' => $consultorioId,
            'mensaje' => 'Consultorio, usuario y suscripción creados exitosamente'
        ], 'Consultorio creado', 201);

    } catch (Exception $e) {
        $conn->rollBack();
        
        if (strpos($e->getMessage(), 'Duplicate entry') !== false) {
            if (strpos($e->getMessage(), 'email') !== false) {
                Response::error('El email ya está registrado', 400);
            }
            if (strpos($e->getMessage(), 'rif') !== false) {
                Response::error('El RIF ya está registrado', 400);
            }
        }
        
        Response::serverError('Error al crear consultorio: ' . $e->getMessage());
    }
}
