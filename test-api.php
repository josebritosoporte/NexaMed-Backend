<?php
/**
 * NexaMed - Script de Pruebas End-to-End
 * Verifica que todos los endpoints funcionen correctamente
 */

header('Content-Type: application/json');

$baseUrl = 'http://localhost/NexaMed/NexaMed-Backend';
$results = [];

// Función para hacer peticiones HTTP
function makeRequest($url, $method = 'GET', $data = null, $token = null) {
    $ch = curl_init();
    curl_setopt($ch, CURLOPT_URL, $url);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_CUSTOMREQUEST, $method);
    
    $headers = ['Content-Type: application/json'];
    if ($token) {
        $headers[] = "Authorization: Bearer $token";
    }
    curl_setopt($ch, CURLOPT_HTTPHEADER, $headers);
    
    if ($data) {
        curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($data));
    }
    
    $response = curl_exec($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);
    
    return [
        'code' => $httpCode,
        'response' => json_decode($response, true)
    ];
}

echo "🔍 Iniciando pruebas end-to-end de NexaMed API...\n\n";

// 1. Prueba de Login
echo "1️⃣ Probando Login...\n";
$loginResult = makeRequest("$baseUrl/api.php?endpoint=auth&action=login", 'POST', [
    'email' => 'dr.rodriguez@nexamed.com',
    'password' => 'admin123'
]);

if ($loginResult['code'] == 200 && $loginResult['response']['success']) {
    $token = $loginResult['response']['data']['token'];
    $results['login'] = ['status' => '✅ OK', 'message' => 'Login exitoso'];
    echo "   ✅ Login exitoso - Token obtenido\n\n";
} else {
    $results['login'] = ['status' => '❌ ERROR', 'message' => $loginResult['response']['message'] ?? 'Error desconocido'];
    echo "   ❌ Error en login: " . ($loginResult['response']['message'] ?? 'Error desconocido') . "\n\n";
    echo json_encode($results, JSON_PRETTY_PRINT);
    exit;
}

// 2. Prueba de Dashboard Stats
echo "2️⃣ Probando Dashboard Stats...\n";
$statsResult = makeRequest("$baseUrl/api.php?endpoint=dashboard&action=stats", 'GET', null, $token);
if ($statsResult['code'] == 200 && $statsResult['response']['success']) {
    $results['dashboard_stats'] = ['status' => '✅ OK', 'data' => $statsResult['response']['data']];
    echo "   ✅ Stats obtenidas: " . json_encode($statsResult['response']['data']) . "\n\n";
} else {
    $results['dashboard_stats'] = ['status' => '❌ ERROR', 'message' => $statsResult['response']['message'] ?? 'Error'];
    echo "   ❌ Error: " . ($statsResult['response']['message'] ?? 'Error') . "\n\n";
}

// 3. Prueba de Lista de Pacientes
echo "3️⃣ Probando Lista de Pacientes...\n";
$pacientesResult = makeRequest("$baseUrl/api.php?endpoint=pacientes&page=1&limit=5", 'GET', null, $token);
if ($pacientesResult['code'] == 200 && $pacientesResult['response']['success']) {
    $pacientesCount = count($pacientesResult['response']['data'] ?? []);
    $results['pacientes_list'] = ['status' => '✅ OK', 'count' => $pacientesCount];
    echo "   ✅ Pacientes obtenidos: $pacientesCount\n\n";
} else {
    $results['pacientes_list'] = ['status' => '❌ ERROR', 'message' => $pacientesResult['response']['message'] ?? 'Error'];
    echo "   ❌ Error: " . ($pacientesResult['response']['message'] ?? 'Error') . "\n\n";
}

// 4. Prueba de Obtener Paciente por ID
echo "4️⃣ Probando Obtener Paciente (ID=1)...\n";
$pacienteResult = makeRequest("$baseUrl/api.php?endpoint=pacientes&id=1", 'GET', null, $token);
if ($pacienteResult['code'] == 200 && $pacienteResult['response']['success']) {
    $results['paciente_detail'] = ['status' => '✅ OK', 'nombre' => $pacienteResult['response']['data']['nombres'] ?? 'N/A'];
    echo "   ✅ Paciente: " . ($pacienteResult['response']['data']['nombres'] ?? 'N/A') . "\n\n";
} else {
    $results['paciente_detail'] = ['status' => '❌ ERROR', 'message' => $pacienteResult['response']['message'] ?? 'Error'];
    echo "   ❌ Error: " . ($pacienteResult['response']['message'] ?? 'Error') . "\n\n";
}

// 5. Prueba de Citas por rango de fechas
echo "5️⃣ Probando Citas (rango de fechas)...\n";
$fechaInicio = date('Y-m-01');
$fechaFin = date('Y-m-t');
$citasResult = makeRequest("$baseUrl/api.php?endpoint=citas&fecha_inicio=$fechaInicio&fecha_fin=$fechaFin", 'GET', null, $token);
if ($citasResult['code'] == 200 && $citasResult['response']['success']) {
    $citasCount = count($citasResult['response']['data'] ?? []);
    $results['citas'] = ['status' => '✅ OK', 'count' => $citasCount];
    echo "   ✅ Citas obtenidas: $citasCount\n\n";
} else {
    $results['citas'] = ['status' => '❌ ERROR', 'message' => $citasResult['response']['message'] ?? 'Error'];
    echo "   ❌ Error: " . ($citasResult['response']['message'] ?? 'Error') . "\n\n";
}

// 6. Prueba de Lista de Consultas
echo "6️⃣ Probando Lista de Consultas...\n";
$consultasResult = makeRequest("$baseUrl/api.php?endpoint=consultas&page=1&limit=5", 'GET', null, $token);
if ($consultasResult['code'] == 200 && $consultasResult['response']['success']) {
    $consultasCount = count($consultasResult['response']['data'] ?? []);
    $results['consultas_list'] = ['status' => '✅ OK', 'count' => $consultasCount];
    echo "   ✅ Consultas obtenidas: $consultasCount\n\n";
} else {
    $results['consultas_list'] = ['status' => '❌ ERROR', 'message' => $consultasResult['response']['message'] ?? 'Error'];
    echo "   ❌ Error: " . ($consultasResult['response']['message'] ?? 'Error') . "\n\n";
}

// 7. Prueba de Lista de Órdenes
echo "7️⃣ Probando Lista de Órdenes...\n";
$ordenesResult = makeRequest("$baseUrl/api.php?endpoint=ordenes&page=1&limit=5", 'GET', null, $token);
if ($ordenesResult['code'] == 200 && $ordenesResult['response']['success']) {
    $ordenesCount = count($ordenesResult['response']['data'] ?? []);
    $results['ordenes_list'] = ['status' => '✅ OK', 'count' => $ordenesCount];
    echo "   ✅ Órdenes obtenidas: $ordenesCount\n\n";
} else {
    $results['ordenes_list'] = ['status' => '❌ ERROR', 'message' => $ordenesResult['response']['message'] ?? 'Error'];
    echo "   ❌ Error: " . ($ordenesResult['response']['message'] ?? 'Error') . "\n\n";
}

// Resumen
echo "\n" . str_repeat("=", 50) . "\n";
echo "📊 RESUMEN DE PRUEBAS\n";
echo str_repeat("=", 50) . "\n\n";

$total = count($results);
$passed = count(array_filter($results, fn($r) => $r['status'] === '✅ OK'));
$failed = $total - $passed;

foreach ($results as $test => $result) {
    echo sprintf("%-20s %s\n", $test, $result['status']);
}

echo "\n" . str_repeat("-", 50) . "\n";
echo "Total: $total | ✅ Pasadas: $passed | ❌ Fallidas: $failed\n";
echo str_repeat("=", 50) . "\n";

// Resultado final
if ($failed === 0) {
    echo "\n🎉 ¡Todas las pruebas pasaron exitosamente!\n";
} else {
    echo "\n⚠️  Algunas pruebas fallaron. Revise los errores arriba.\n";
}

echo "\n";
echo json_encode($results, JSON_PRETTY_PRINT);
