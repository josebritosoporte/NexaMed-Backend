<?php
/**
 * DaliaMed - Utilidad para respuestas JSON estandarizadas
 */

class Response {
    
    /**
     * Respuesta exitosa
     */
    public static function success($data = null, $message = 'Operación exitosa', $code = 200) {
        http_response_code($code);
        header('Content-Type: application/json; charset=UTF-8');
        
        echo json_encode([
            'success' => true,
            'message' => $message,
            'data' => $data,
            'timestamp' => date('Y-m-d H:i:s')
        ]);
        exit;
    }

    /**
     * Respuesta de error
     */
    public static function error($message = 'Error en la operación', $code = 400, $errors = null) {
        http_response_code($code);
        header('Content-Type: application/json; charset=UTF-8');
        
        $response = [
            'success' => false,
            'message' => $message,
            'timestamp' => date('Y-m-d H:i:s')
        ];

        if ($errors !== null) {
            $response['errors'] = $errors;
        }

        echo json_encode($response);
        exit;
    }

    /**
     * Respuesta paginada
     */
    public static function paginated($data, $page, $limit, $total, $message = 'Datos obtenidos') {
        $totalPages = ceil($total / $limit);
        
        http_response_code(200);
        header('Content-Type: application/json; charset=UTF-8');
        
        echo json_encode([
            'success' => true,
            'message' => $message,
            'data' => $data,
            'meta' => [
                'current_page' => (int)$page,
                'last_page' => (int)$totalPages,
                'per_page' => (int)$limit,
                'total' => (int)$total,
                'from' => ($page - 1) * $limit + 1,
                'to' => min($page * $limit, $total)
            ],
            'timestamp' => date('Y-m-d H:i:s')
        ]);
        exit;
    }

    /**
     * Respuesta de no autorizado
     */
    public static function unauthorized($message = 'No autorizado') {
        self::error($message, 401);
    }

    /**
     * Respuesta de no encontrado
     */
    public static function notFound($message = 'Recurso no encontrado') {
        self::error($message, 404);
    }

    /**
     * Respuesta de error del servidor
     */
    public static function serverError($message = 'Error interno del servidor') {
        self::error($message, 500);
    }
}
