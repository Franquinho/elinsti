<?php
require_once __DIR__ . '/../cors.php';
require_once '../config/database.php';

try {
    $database = new Database();
    $db = $database->getConnection();

    $data = json_decode(file_get_contents("php://input"));

    if (!empty($data->usuario_id) && !empty($data->productos) && !empty($data->total)) {
        
        // Iniciar transacción
        $db->beginTransaction();
        
        // Insertar comanda
        $query = "INSERT INTO comandas (usuario_id, evento_id, total, nombre_cliente, estado, created_at) 
                  VALUES (:usuario_id, :evento_id, :total, :nombre_cliente, 'pendiente', NOW())";
        $stmt = $db->prepare($query);
        $stmt->bindParam(":usuario_id", $data->usuario_id);
        $stmt->bindParam(":evento_id", $data->evento_id ?? 1);
        $stmt->bindParam(":total", $data->total);
        $stmt->bindParam(":nombre_cliente", $data->nombre_cliente);
        $stmt->execute();
        
        $comanda_id = $db->lastInsertId();
        
        // Insertar detalles de la comanda
        $query_detalle = "INSERT INTO comanda_detalle (comanda_id, producto_id, cantidad, precio_unitario, subtotal) 
                          VALUES (:comanda_id, :producto_id, :cantidad, :precio_unitario, :subtotal)";
        $stmt_detalle = $db->prepare($query_detalle);
        
        foreach ($data->productos as $producto) {
            $subtotal = $producto->cantidad * $producto->precio;
            $stmt_detalle->bindParam(":comanda_id", $comanda_id);
            $stmt_detalle->bindParam(":producto_id", $producto->id);
            $stmt_detalle->bindParam(":cantidad", $producto->cantidad);
            $stmt_detalle->bindParam(":precio_unitario", $producto->precio);
            $stmt_detalle->bindParam(":subtotal", $subtotal);
            $stmt_detalle->execute();
        }
        
        // Confirmar transacción
        $db->commit();
        
        echo json_encode([
            'success' => true,
            'comanda_id' => $comanda_id,
            'message' => 'Comanda creada exitosamente'
        ]);
        
    } else {
        echo json_encode([
            'success' => false,
            'message' => 'Datos incompletos para crear la comanda'
        ]);
    }
    
} catch(Exception $e) {
    if ($db->inTransaction()) {
        $db->rollback();
    }
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'error' => 'Error al crear comanda',
        'details' => $e->getMessage()
    ]);
}
?>
