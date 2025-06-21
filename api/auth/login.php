<?php
require_once __DIR__ . '/../cors.php';
require_once '../config/database.php';

try {
    $database = new Database();
    $db = $database->getConnection();

    $data = json_decode(file_get_contents("php://input"));

    if (!empty($data->email) && !empty($data->password)) {
        $query = "SELECT id, nombre, email, rol FROM usuarios WHERE email = :email AND activo = 1";
        $stmt = $db->prepare($query);
        $stmt->bindParam(":email", $data->email);
        $stmt->execute();
        
        if ($stmt->rowCount() > 0) {
            $row = $stmt->fetch(PDO::FETCH_ASSOC);
            
            // Verificación temporal con password fijo para desarrollo
            if ($data->password === '123456') {
                echo json_encode([
                    'success' => true,
                    'user' => [
                        'id' => (int)$row['id'],
                        'nombre' => $row['nombre'],
                        'email' => $row['email'],
                        'rol' => $row['rol']
                    ]
                ]);
            } else {
                echo json_encode([
                    'success' => false, 
                    'message' => 'Credenciales incorrectas'
                ]);
            }
        } else {
            echo json_encode([
                'success' => false, 
                'message' => 'Usuario no encontrado'
            ]);
        }
    } else {
        echo json_encode([
            'success' => false, 
            'message' => 'Email y contraseña son requeridos'
        ]);
    }
} catch(Exception $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'error' => 'Error del servidor',
        'details' => $e->getMessage()
    ]);
}
?>
