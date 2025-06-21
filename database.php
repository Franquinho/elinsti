<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit(0);
}

/**
 * Adaptador de conexión MySQL con fallback de hostnames
 */
class Database {
    // Credenciales del panel Ferozo
    private $db_name  = 'c2840781_elinsti';
    private $username = 'c2840781_elinsti';
    private $password = 'wuro31NOne';

    // Lista de hosts a probar (en orden)
    private $hosts = [
        '127.0.0.1',          // suele funcionar en Ferozo
        'localhost',          // alternativa clásica
        'mysql-c2840781'      // ejemplo de hostname interno → cámbialo si tu panel muestra otro
    ];

    public $conn;
    public $connectedHost = null;

    /**
     * Devuelve una conexión PDO válida o lanza excepción
     */
    public function getConnection() {
        if ($this->conn) {
            return $this->conn;
        }

        foreach ($this->hosts as $host) {
            try {
                $pdo = new PDO(
                    "mysql:host={$host};dbname={$this->db_name};charset=utf8mb4;port=3306",
                    $this->username,
                    $this->password,
                    [
                        PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
                        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
                        PDO::MYSQL_ATTR_INIT_COMMAND => "SET NAMES utf8mb4"
                    ]
                );

                // ✅ Conexión exitosa
                $this->conn          = $pdo;
                $this->connectedHost = $host;
                return $this->conn;

            } catch (PDOException $e) {
                // Continúa con el siguiente host
            }
        }

        // Si llegamos aquí, ningún host funcionó
        throw new PDOException('No se pudo conectar a MySQL con los hostnames probados');
    }

    /**
     * Endpoint de prueba
     */
    public function testConnection() {
        try {
            $this->getConnection();
            return [
                'success' => true,
                'message' => 'Conexión exitosa a MySQL',
                'database'=> $this->db_name,
                'host'    => $this->connectedHost
            ];
        } catch (PDOException $e) {
            return [
                'success' => false,
                'error'   => 'Error de conexión a la base de datos',
                'details' => $e->getMessage(),
                'hostsTried' => $this->hosts
            ];
        }
    }
}
?>
