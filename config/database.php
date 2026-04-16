<?php
/**
 * NexaMed - Configuración de Base de Datos MySQL
 * Compatible con XAMPP local y Railway (producción)
 */

class Database {
    private $host;
    private $port;
    private $db_name;
    private $username;
    private $password;
    public $conn;

    public function __construct() {
        // Detectar si estamos en Railway (usa variables MYSQL*)
        if (getenv('MYSQLHOST')) {
            // Configuración Railway
            $this->host = getenv('MYSQLHOST');
            $this->port = getenv('MYSQLPORT') ?: '3306';
            $this->db_name = getenv('MYSQLDATABASE') ?: 'railway';
            $this->username = getenv('MYSQLUSER') ?: 'root';
            $this->password = getenv('MYSQLPASSWORD') ?: '';
        } else {
            // Configuración XAMPP local
            $this->host = getenv('DB_HOST') ?: 'localhost';
            $this->port = getenv('DB_PORT') ?: '3306';
            $this->db_name = getenv('DB_NAME') ?: 'nexamed';
            $this->username = getenv('DB_USER') ?: 'root';
            $this->password = getenv('DB_PASS') ?: '';
        }
    }

    /**
     * Establecer conexión con MySQL
     */
    public function getConnection() {
        $this->conn = null;

        try {
            $dsn = "mysql:host={$this->host};port={$this->port};dbname={$this->db_name};charset=utf8mb4";
            $options = [
                PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
                PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
                PDO::ATTR_EMULATE_PREPARES => false
            ];
            
            // Agregar opción MySQL solo si está disponible
            if (defined('PDO::MYSQL_ATTR_INIT_COMMAND')) {
                $options[PDO::MYSQL_ATTR_INIT_COMMAND] = "SET NAMES utf8mb4 COLLATE utf8mb4_unicode_ci";
            }

            $this->conn = new PDO($dsn, $this->username, $this->password, $options);
            
            // Configurar charset manualmente si no se pudo con MYSQL_ATTR_INIT_COMMAND
            if (!defined('PDO::MYSQL_ATTR_INIT_COMMAND')) {
                $this->conn->exec("SET NAMES utf8mb4 COLLATE utf8mb4_unicode_ci");
            }
            
            // Configurar zona horaria
            $this->conn->exec("SET time_zone = '-05:00'");
            
        } catch(PDOException $e) {
            error_log("Error de conexión MySQL: " . $e->getMessage());
            throw new Exception("Error de conexión a la base de datos: " . $e->getMessage());
        }

        return $this->conn;
    }

    /**
     * Verificar si la conexión está activa
     */
    public function isConnected() {
        try {
            $this->conn->query('SELECT 1');
            return true;
        } catch (PDOException $e) {
            return false;
        }
    }
}
