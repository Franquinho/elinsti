<?php
require_once __DIR__ . '/../cors.php';
require_once '../config/database.php';

try {
    $database = new Database();
    $db = $database->getConnection();

    $query = "SELECT id, nombre, precio, emoji, activo FROM productos WHERE activo = 1 ORDER BY nombre";
    $stmt = $db->prepare($query);
    $stmt->execute();
    
    $productos = [];
    while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
        $productos[] = [
            'id' => (int)$row['id'],
            'nombre' => $row['nombre'],
            'precio' => (float)$row['precio'],
            'emoji' => $row['emoji'],
            'activo' => (bool)$row['activo']
        ];
    }
    
    echo json_encode([
        'success' => true,
        'productos' => $productos
    ]);
    
} catch(Exception $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'error' => 'Error al obtener productos',
        'details' => $e->getMessage()
    ]);
}
?>
