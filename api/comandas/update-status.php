<?php
require_once __DIR__ . '/../cors.php';
require_once '../config/database.php';

try {
    $database = new Database();
    $db = $database->getConnection();

    $data = json_decode(file_get_contents("php://input"));

    if (!empty($data->comanda_id) && !empty($data->estado)) {
        
        $query = "UPDATE comandas SET 
                    estado = :estado,
                    metodo_pago = :metodo_pago,
                    nota = :nota,
                    updated_at = NOW()
                  WHERE id = :comanda_id";
        
        $stmt = $db->prepare($query);
        $stmt->bindParam(":estado", $data->estado);
        $stmt->bindParam(":metodo_pago", $data->metodo_pago ?? null);
        $stmt->bindParam(":nota", $data->nota ?? null);
        $stmt->bindParam(":comanda_id", $data->comanda_id);
        $stmt->execute();
        
        if ($stmt->rowCount() > 0) {
            echo json_encode([
                'success' => true,
                'message' => 'Estado de comanda actualizado'
            ]);
        } else {
            echo json_encode([
                'success' => false,
                'message' => 'No se pudo actualizar la comanda'
            ]);
        }
        
    } else {
        echo json_encode([
            'success' => false,
            'message' => 'Datos incompletos'
        ]);
    }
    
} catch(Exception $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'error' => 'Error al actualizar comanda',
        'details' => $e->getMessage()
    ]);
}
?>
