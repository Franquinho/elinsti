<?php
require_once 'config/database.php';

$database = new Database();
$result = $database->testConnection();

echo json_encode($result, JSON_PRETTY_PRINT);
?>
