<?php
/**
 * Script para verificar configuración del servidor
 */

echo "<h1>NexaMed - Verificación del Servidor</h1>";

// Verificar mod_rewrite
$rewriteEnabled = in_array('mod_rewrite', apache_get_modules());
echo "<p><strong>mod_rewrite:</strong> " . ($rewriteEnabled ? '<span style="color:green">✓ Habilitado</span>' : '<span style="color:red">✗ Deshabilitado</span>') . "</p>";

// Verificar PDO PostgreSQL
$pdoPgsql = extension_loaded('pdo_pgsql');
echo "<p><strong>PDO PostgreSQL:</strong> " . ($pdoPgsql ? '<span style="color:green">✓ Instalado</span>' : '<span style="color:red">✗ No instalado</span>') . "</p>";

// Verificar JSON
$json = extension_loaded('json');
echo "<p><strong>JSON:</strong> " . ($json ? '<span style="color:green">✓ Instalado</span>' : '<span style="color:red">✗ No instalado</span>') . "</p>";

// Verificar si .htaccess está funcionando
$htaccessWorking = (isset($_SERVER['REDIRECT_URL']) || isset($_SERVER['REDIRECT_STATUS']));
echo "<p><strong>.htaccess funcionando:</strong> " . ($htaccessWorking ? '<span style="color:green">✓ Sí</span>' : '<span style="color:orange">⚠ No verificado</span>') . "</p>";

echo "<hr>";
echo "<h2>Información de PHP</h2>";
echo "<p>Versión: " . phpversion() . "</p>";

if (!$rewriteEnabled) {
    echo "<hr>";
    echo "<h2 style='color:red'>⚠ ATENCIÓN: mod_rewrite no está habilitado</h2>";
    echo "<p>Para habilitar mod_rewrite en XAMPP:</p>";
    echo "<ol>";
    echo "<li>Abre el archivo <code>C:\xampp\apache\conf\httpd.conf</code></li>";
    echo "<li>Busca la línea: <code>#LoadModule rewrite_module modules/mod_rewrite.so</code></li>";
    echo "<li>Quita el # al inicio para descomentarla</li>";
    echo "<li>Reinicia Apache desde el XAMPP Control Panel</li>";
    echo "</ol>";
}

if (!$pdoPgsql) {
    echo "<hr>";
    echo "<h2 style='color:red'>⚠ ATENCIÓN: PDO PostgreSQL no está instalado</h2>";
    echo "<p>Para instalar PDO PostgreSQL en XAMPP:</p>";
    echo "<ol>";
    echo "<li>Abre el archivo <code>C:\xampp\php\php.ini</code></li>";
    echo "<li>Busca y descomenta: <code>;extension=pdo_pgsql</code></li>";
    echo "<li>Busca y descomenta: <code>;extension=pgsql</code></li>";
    echo "<li>Reinicia Apache</li>";
    echo "</ol>";
}

echo "<hr>";
echo "<h2>Prueba de API (Modo Query String)</h2>";
echo "<p>El backend está configurado para funcionar SIN mod_rewrite.</p>";
echo "<p><strong>URL Base:</strong> <code>http://localhost/NexaMed-Backend/api.php</code></p>";
echo "<ul>";
echo "<li><a href='api.php'>Ver info de API</a></li>";
echo "<li><a href='api.php?endpoint=auth&action=login'>Auth Login (POST)</a></li>";
echo "<li><a href='api.php?endpoint=pacientes'>Listar Pacientes</a></li>";
echo "<li><a href='api.php?endpoint=dashboard&action=stats'>Dashboard Stats</a></li>";
echo "</ul>";
echo "<p><em>Nota: Los endpoints que requieren POST/PUT necesitan ser probados con herramientas como Postman o desde el frontend.</em></p>";
