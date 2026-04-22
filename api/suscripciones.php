<?php
/**
 * DaliaMed - API de Suscripciones (cliente autenticado)
 * Endpoints:
 *   GET  /suscripciones&action=mi-suscripcion  - Mi suscripción actual
 *   GET  /suscripciones&action=pagos            - Mis pagos
 *   POST /suscripciones&action=pago             - Enviar comprobante de pago
 */

require_once __DIR__ . '/../models/Suscripcion.php';
require_once __DIR__ . '/../models/Pago.php';
require_once __DIR__ . '/../models/Plan.php';
require_once __DIR__ . '/../models/TasaCambio.php';
require_once __DIR__ . '/../utils/response.php';
require_once __DIR__ . '/../middleware/cors.php';
require_once __DIR__ . '/../middleware/auth.php';
require_once __DIR__ . '/../middleware/subscription.php';

// Aplicar CORS
$cors = new CorsMiddleware();
$cors->handle();

// Autenticar usuario
$user = AuthMiddleware::authenticate();
$consultorioId = $user['consultorio_id'];

$method = $_SERVER['REQUEST_METHOD'];
$action = isset($_GET['action']) ? $_GET['action'] : '';

switch ($method) {
    case 'GET':
        switch ($action) {
            case 'mi-suscripcion':
                handleMiSuscripcion($consultorioId);
                break;
            case 'pagos':
                handleMisPagos($consultorioId);
                break;
            default:
                Response::error('Acción no válida', 404);
        }
        break;

    case 'POST':
        // Detectar si viene como FormData (con archivo) o JSON
        $contentType = $_SERVER['CONTENT_TYPE'] ?? '';
        if (strpos($contentType, 'multipart/form-data') !== false) {
            $data = $_POST;
        } else {
            $data = json_decode(file_get_contents('php://input'), true);
        }
        switch ($action) {
            case 'pago':
                handleEnviarPago($data, $consultorioId);
                break;
            default:
                Response::error('Acción no válida', 404);
        }
        break;

    default:
        Response::error('Método no permitido', 405);
}

/**
 * Obtener mi suscripción actual con info completa
 */
function handleMiSuscripcion($consultorioId) {
    $info = SubscriptionMiddleware::getSubscriptionInfo($consultorioId);
    
    if (!$info) {
        Response::error('No tiene suscripción activa', 404);
    }

    // Agregar precios disponibles para renovación
    $planModel = new Plan();
    $tasaModel = new TasaCambio();
    $planes = $planModel->getAll();
    $tasa = $tasaModel->getActual();

    foreach ($planes as &$plan) {
        if ($tasa) {
            foreach ($plan['precios'] as &$precio) {
                $precio['precio_bs'] = round($precio['precio'] * $tasa['tasa_bs'], 2);
            }
        }
    }

    Response::success([
        'suscripcion' => $info,
        'planes' => $planes,
        'tasa_bs' => $tasa ? (float)$tasa['tasa_bs'] : null,
        'tasa_fecha' => $tasa ? $tasa['fecha'] : null
    ]);
}

/**
 * Obtener historial de pagos del consultorio
 */
function handleMisPagos($consultorioId) {
    $pagoModel = new Pago();
    $pagos = $pagoModel->getByConsultorio($consultorioId);
    Response::success($pagos);
}

/**
 * Enviar comprobante de pago
 */
function handleEnviarPago($data, $consultorioId) {
    // Validar campos requeridos
    $required = ['plan_id', 'periodo', 'metodo_pago', 'referencia', 'fecha_pago'];
    $errors = [];
    foreach ($required as $field) {
        if (empty($data[$field])) {
            $errors[$field] = "El campo $field es requerido";
        }
    }
    if (!empty($errors)) {
        Response::error('Datos incompletos', 400, $errors);
    }

    // Validar periodo
    $periodosValidos = ['mensual', 'trimestral', 'semestral', 'anual'];
    if (!in_array($data['periodo'], $periodosValidos)) {
        Response::error('Periodo no válido', 400);
    }

    // Obtener precio del plan+periodo
    $planModel = new Plan();
    $precio = $planModel->getPrecio($data['plan_id'], $data['periodo']);
    if (!$precio) {
        Response::error('Plan o periodo no encontrado', 404);
    }

    // Procesar archivo de comprobante si existe
    $comprobanteUrl = null;
    if (isset($_FILES['comprobante']) && $_FILES['comprobante']['error'] === UPLOAD_ERR_OK) {
        $file = $_FILES['comprobante'];
        
        // Validar tipo
        $allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
        if (!in_array($file['type'], $allowedTypes)) {
            Response::error('Tipo de archivo no permitido. Solo imágenes JPG, PNG, WebP o GIF.', 400);
        }
        
        // Validar tamaño (5MB)
        if ($file['size'] > 5 * 1024 * 1024) {
            Response::error('El archivo no debe superar los 5MB', 400);
        }
        
        // Crear directorio
        $uploadDir = __DIR__ . '/../uploads/comprobantes';
        if (!is_dir($uploadDir)) {
            mkdir($uploadDir, 0755, true);
        }
        
        // Generar nombre único
        $ext = pathinfo($file['name'], PATHINFO_EXTENSION) ?: 'jpg';
        $filename = 'comp_' . $consultorioId . '_' . time() . '_' . bin2hex(random_bytes(4)) . '.' . $ext;
        $destPath = $uploadDir . '/' . $filename;
        
        if (!move_uploaded_file($file['tmp_name'], $destPath)) {
            Response::error('Error al guardar el comprobante', 500);
        }
        
        $comprobanteUrl = 'uploads/comprobantes/' . $filename;
    }

    // Obtener suscripción actual
    $suscripcionModel = new Suscripcion();
    $suscripcion = $suscripcionModel->getByConsultorio($consultorioId);
    if (!$suscripcion) {
        Response::error('No tiene suscripción', 404);
    }

    // Obtener tasa actual
    $tasaModel = new TasaCambio();
    $tasa = $tasaModel->getActual();

    // Crear comprobante de pago
    $pagoModel = new Pago();
    $pagoData = [
        'suscripcion_id' => $suscripcion['id'],
        'consultorio_id' => $consultorioId,
        'plan_id' => $data['plan_id'],
        'plan_precio_id' => $precio['id'],
        'monto' => $precio['precio'],
        'moneda' => 'USD',
        'tasa_bs_momento' => $tasa ? $tasa['tasa_bs'] : null,
        'monto_bs' => $tasa ? round($precio['precio'] * $tasa['tasa_bs'], 2) : null,
        'metodo_pago' => $data['metodo_pago'],
        'referencia' => $data['referencia'],
        'comprobante_nota' => $data['comprobante_nota'] ?? null,
        'comprobante_url' => $comprobanteUrl,
        'fecha_pago' => $data['fecha_pago']
    ];

    try {
        $pagoId = $pagoModel->create($pagoData);
        $pago = $pagoModel->getById($pagoId);
        Response::success($pago, 'Comprobante de pago enviado exitosamente. Será revisado por el administrador.', 201);
    } catch (Exception $e) {
        Response::serverError('Error al registrar el pago: ' . $e->getMessage());
    }
}
