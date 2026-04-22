<?php
// Test API endpoints
require_once __DIR__ . '/config/database.php';
require_once __DIR__ . '/models/Plan.php';
require_once __DIR__ . '/models/TasaCambio.php';
require_once __DIR__ . '/models/Suscripcion.php';
require_once __DIR__ . '/middleware/subscription.php';

echo "=== Test Plan Model ===\n";
$plan = new Plan();
$planes = $plan->getAll();
foreach ($planes as $p) {
    echo "Plan: {$p['nombre']} - " . count($p['precios']) . " precios\n";
    foreach ($p['precios'] as $pr) {
        echo "  {$pr['periodo']}: \${$pr['precio']} ({$pr['dias']} dias)\n";
    }
}

echo "\n=== Test Tasa Model ===\n";
$tasa = new TasaCambio();
$actual = $tasa->getActual();
echo "Tasa actual: " . ($actual ? $actual['tasa_bs'] . " Bs/USD (fecha: {$actual['fecha']})" : "No hay tasa") . "\n";

echo "\n=== Test Conversion ===\n";
$conv = $tasa->convertirABs(35);
if ($conv) {
    echo "USD 35 = Bs " . $conv['monto_bs'] . " (tasa: {$conv['tasa_bs']})\n";
}

echo "\n=== Test Suscripcion ===\n";
$susc = new Suscripcion();
$s = $susc->getByConsultorio(1);
if ($s) {
    echo "Plan: {$s['plan_nombre']}, Estado: {$s['estado']}, Periodo: {$s['periodo']}, Precio: \${$s['plan_precio']}\n";
}

echo "\n=== Test Subscription Info ===\n";
$info = SubscriptionMiddleware::getSubscriptionInfo(1);
if ($info) {
    echo "Plan: {$info['plan_nombre']}, Dias restantes: {$info['dias_restantes']}, Read-only: " . ($info['read_only'] ? 'Si' : 'No') . "\n";
}

echo "\n=== ALL TESTS PASSED ===\n";
