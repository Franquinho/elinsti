<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With');

if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    http_response_code(200);
    exit(0);
}

class Database {
    // Configuración real para Ferozo
    private $host = 'localhost';
    private $db_name = 'c2840781_elinsti';
    private $username = 'c2840781_elinsti';
    private $password = 'wuro31NOne';
    public $conn;

    public function getConnection() {
        $this->conn = null;
        try {
            $this->conn = new PDO(
                "mysql:host=" . $this->host . ";dbname=" . $this->db_name . ";charset=utf8mb4",
                $this->username,
                $this->password,
                array(
                    PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
                    PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
                    PDO::MYSQL_ATTR_INIT_COMMAND => "SET NAMES utf8mb4"
                )
            );
        } catch(PDOException $exception) {
            http_response_code(500);
            echo json_encode([
                'success' => false,
                'error' => 'Error de conexión a la base de datos',
                'details' => $exception->getMessage()
            ]);
            exit();
        }
        return $this->conn;
    }

    public function testConnection() {
        try {
            $conn = $this->getConnection();
            if ($conn) {
                return [
                    'success' => true,
                    'message' => 'Conexión exitosa a MySQL Ferozo',
                    'database' => $this->db_name,
                    'host' => $this->host
                ];
            }
        } catch(Exception $e) {
            return [
                'success' => false,
                'error' => 'Error de conexión',
                'details' => $e->getMessage()
            ];
        }
    }
}
?>
