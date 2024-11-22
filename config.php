<?php
    session_start();
    $db = new PDO("mysql:host=localhost;dbname=minesweeper", "your_username", "your_password");
    $db->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
?>