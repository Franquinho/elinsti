<?php
require_once __DIR__ . '/../cors.php';
require_once '../config/database.php';

try {
    $database = new Database();
    $db = $database->getConnection();

    $query = "SELECT 
                c.id,
                c.usuario_id,
                u.nombre as usuario_nombre,
                c.nombre_cliente,
                c.total,
                c.estado,
                c.metodo_pago,
                c.nota,
                c.created_at
              FROM comandas c
              LEFT JOIN usuarios u ON c.usuario_id = u.id
              ORDER BY c.created_at DESC
              LIMIT 100";
    
    $stmt = $db->prepare($query);
    $stmt->execute();
    
    $comandas = [];
    while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
        // Obtener productos de la comanda
        $query_productos = "SELECT 
                              p.nombre,
                              p.emoji,
                              cd.cantidad,
                              cd.precio_unitario as precio
                            FROM comanda_detalle cd
                            LEFT JOIN productos p ON cd.producto_id = p.id
                            WHERE cd.comanda_id = :comanda_id";
        
        $stmt_productos = $db->prepare($query_productos);
        $stmt_productos->bindParam(":comanda_id", $row['id']);
        $stmt_productos->execute();
        
        $productos = [];
        while ($producto = $stmt_productos->fetch(PDO::FETCH_ASSOC)) {
            $productos[] = [
                'nombre' => $producto['nombre'],
                'emoji' => $producto['emoji'],
                'cantidad' => (int)$producto['cantidad'],
                'precio' => (float)$producto['precio']
            ];
        }
        
        $comandas[] = [
            'id' => (int)$row['id'],
            'usuario_nombre' => $row['usuario_nombre'],
            'nombre_cliente' => $row['nombre_cliente'],
            'productos' => $productos,
            'total' => (float)$row['total'],
            'estado' => $row['estado'],
            'metodo_pago' => $row['metodo_pago'],
            'nota' => $row['nota'],
            'created_at' => $row['created_at']
        ];
    }
    
    echo json_encode([
        'success' => true,
        'comandas' => $comandas
    ]);
    
} catch(Exception $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'error' => 'Error al obtener comandas',
        'details' => $e->getMessage()
    ]);
}
?>
