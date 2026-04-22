<?php
/**
 * DaliaMed - API de Planes (público)
 * Endpoints: GET /planes - Listar planes con precios
 *            GET /planes&id=:id - Obtener plan específico
 *            GET /planes&action=tasa - Obtener tasa de cambio actual
 */

require_once __DIR__ . '/../models/Plan.php';
require_once __DIR__ . '/../models/TasaCambio.php';
require_once __DIR__ . '/../utils/response.php';
require_once __DIR__ . '/../middleware/cors.php';

// Aplicar CORS
$cors = new CorsMiddleware();
$cors->handle();

$method = $_SERVER['REQUEST_METHOD'];
$action = isset($_GET['action']) ? $_GET['action'] : '';
$id = isset($_GET['id']) && is_numeric($_GET['id']) ? (int)$_GET['id'] : null;

if ($method !== 'GET') {
    Response::error('Método no permitido', 405);
}

$planModel = new Plan();
$tasaModel = new TasaCambio();

switch ($action) {
    case 'tasa':
        // Obtener tasa de cambio actual
        $tasa = $tasaModel->getActual();
        if (!$tasa) {
            Response::success(['tasa_bs' => null, 'fecha' => null], 'No hay tasa registrada');
        }
        Response::success([
            'tasa_bs' => (float)$tasa['tasa_bs'],
            'fecha' => $tasa['fecha']
        ]);
        break;

    default:
        if ($id) {
            $plan = $planModel->getById($id);
            if (!$plan) {
                Response::notFound('Plan no encontrado');
            }
            // Agregar equivalente en Bs
            $tasa = $tasaModel->getActual();
            if ($tasa) {
                foreach ($plan['precios'] as &$precio) {
                    $precio['precio_bs'] = round($precio['precio'] * $tasa['tasa_bs'], 2);
                }
                $plan['tasa_bs'] = (float)$tasa['tasa_bs'];
                $plan['tasa_fecha'] = $tasa['fecha'];
            }
            Response::success($plan);
        } else {
            $planes = $planModel->getAll();
            $tasa = $tasaModel->getActual();
            
            // Agregar equivalente en Bs a todos los precios
            foreach ($planes as &$plan) {
                if ($tasa) {
                    foreach ($plan['precios'] as &$precio) {
                        $precio['precio_bs'] = round($precio['precio'] * $tasa['tasa_bs'], 2);
                    }
                }
            }
            
            Response::success([
                'planes' => $planes,
                'tasa_bs' => $tasa ? (float)$tasa['tasa_bs'] : null,
                'tasa_fecha' => $tasa ? $tasa['fecha'] : null
            ]);
        }
        break;
}
