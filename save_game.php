<?php
    if ($_SERVER['REQUEST_METHOD'] === 'POST') {
        if (!isset($_SESSION['user_id'])) {
            echo json_encode(['success' => false, 'message' => 'Not logged in']);
            exit;
        }
        
        $data = json_decode(file_get_contents('php://input'), true);
        
        $stmt = $db->prepare("INSERT INTO games (user_id, won, time, moves, difficulty) VALUES (?, ?, ?, ?, ?)");
        $stmt->execute([
            $_SESSION['user_id'],
            $data['won'],
            $data['time'],
            $data['moves'],
            $data['difficulty']
        ]);
        
        echo json_encode(['success' => true]);
    }
?>