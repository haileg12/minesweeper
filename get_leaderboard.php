<?php
    if ($_SERVER['REQUEST_METHOD'] === 'GET') {
        $difficulty = $_GET['difficulty'] ?? 'easy';
        $sort = $_GET['sort'] ?? 'time';
        $order = $_GET['order'] ?? 'ASC';
        
        $validColumns = ['time', 'moves', 'played_at'];
        $sort = in_array($sort, $validColumns) ? $sort : 'time';
        $order = $order === 'DESC' ? 'DESC' : 'ASC';
        
        $stmt = $db->prepare("
            SELECT u.username, g.won, g.time, g.moves, g.played_at
            FROM games g
            JOIN users u ON g.user_id = u.id
            WHERE g.difficulty = ? AND g.won = 1
            ORDER BY g.$sort $order
            LIMIT 10
        ");
        $stmt->execute([$difficulty]);
        
        echo json_encode($stmt->fetchAll(PDO::FETCH_ASSOC));
    }
?>