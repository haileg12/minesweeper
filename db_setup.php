<?php
// db_setup.php
$host = 'localhost';
$dbname = 'minesweeper';
$username = 'your_username';
$password = 'your_password';

try {
    $pdo = new PDO("mysql:host=$host", $username, $password);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    
    // Create database if it doesn't exist
    $sql = "CREATE DATABASE IF NOT EXISTS $dbname";
    $pdo->exec($sql);
    
    // Use the database
    $pdo->exec("USE $dbname");
    
    // Create users table
    $sql = "CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        username VARCHAR(50) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )";
    $pdo->exec($sql);
    
    // Create games table
    $sql = "CREATE TABLE IF NOT EXISTS games (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT,
        won BOOLEAN NOT NULL,
        time INT NOT NULL,
        moves INT NOT NULL,
        difficulty VARCHAR(10) NOT NULL,
        played_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id)
    )";
    $pdo->exec($sql);
    
    echo "Database and tables created successfully";
} catch(PDOException $e) {
    echo "Error: " . $e->getMessage();
}
?>