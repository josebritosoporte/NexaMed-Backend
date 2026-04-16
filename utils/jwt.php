<?php
/**
 * NexaMed - Utilidad para manejo de JWT (JSON Web Tokens)
 */

class JWT {
    private static $secret_key;
    private static $encrypt_method = 'HS256';
    private static $token_expiration = 86400; // 24 horas

    public static function init() {
        self::$secret_key = getenv('JWT_SECRET') ?: 'nexamed_secret_key_2026_segura_para_produccion';
    }

    /**
     * Generar un nuevo token JWT
     */
    public static function generate($data) {
        self::init();
        
        $header = json_encode(['typ' => 'JWT', 'alg' => self::$encrypt_method]);
        $time = time();
        $payload = json_encode([
            'iss' => 'nexamed_api',
            'iat' => $time,
            'exp' => $time + self::$token_expiration,
            'sub' => $data['id'],
            'data' => $data
        ]);

        $base64_header = str_replace(['+', '/', '='], ['-', '_', ''], base64_encode($header));
        $base64_payload = str_replace(['+', '/', '='], ['-', '_', ''], base64_encode($payload));

        $signature = hash_hmac('sha256', $base64_header . "." . $base64_payload, self::$secret_key, true);
        $base64_signature = str_replace(['+', '/', '='], ['-', '_', ''], base64_encode($signature));

        return $base64_header . "." . $base64_payload . "." . $base64_signature;
    }

    /**
     * Validar y decodificar un token JWT
     */
    public static function validate($token) {
        self::init();
        
        if (empty($token)) {
            return ['valid' => false, 'error' => 'Token no proporcionado'];
        }

        $token_parts = explode('.', $token);
        if (count($token_parts) != 3) {
            return ['valid' => false, 'error' => 'Token malformado'];
        }

        $header = base64_decode(str_replace(['-', '_'], ['+', '/'], $token_parts[0]));
        $payload = base64_decode(str_replace(['-', '_'], ['+', '/'], $token_parts[1]));
        $signature_provided = $token_parts[2];

        // Verificar firma
        $signature = hash_hmac('sha256', $token_parts[0] . "." . $token_parts[1], self::$secret_key, true);
        $base64_signature = str_replace(['+', '/', '='], ['-', '_', ''], base64_encode($signature));

        if (!hash_equals($base64_signature, $signature_provided)) {
            return ['valid' => false, 'error' => 'Firma inválida'];
        }

        $payload_data = json_decode($payload, true);

        // Verificar expiración
        if (isset($payload_data['exp']) && $payload_data['exp'] < time()) {
            return ['valid' => false, 'error' => 'Token expirado'];
        }

        return [
            'valid' => true,
            'data' => $payload_data['data'],
            'user_id' => $payload_data['sub']
        ];
    }

    /**
     * Extraer token del header Authorization
     */
    public static function getBearerToken() {
        $headers = null;
        
        if (isset($_SERVER['Authorization'])) {
            $headers = trim($_SERVER["Authorization"]);
        } elseif (isset($_SERVER['HTTP_AUTHORIZATION'])) {
            $headers = trim($_SERVER["HTTP_AUTHORIZATION"]);
        } elseif (function_exists('apache_request_headers')) {
            $requestHeaders = apache_request_headers();
            $requestHeaders = array_combine(
                array_map('ucwords', array_keys($requestHeaders)),
                array_values($requestHeaders)
            );
            if (isset($requestHeaders['Authorization'])) {
                $headers = trim($requestHeaders['Authorization']);
            }
        }

        if (!empty($headers) && preg_match('/Bearer\s+(\S+)/', $headers, $matches)) {
            return $matches[1];
        }

        return null;
    }
}
