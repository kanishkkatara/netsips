<?php
$servername = "localhost";
$username = "root";
//$password = "";
$email = $_POST['email'];
$urls = $_POST['urls'];

// Create connection
$conn = mysqli_connect($servername, $username, '', 'netsips');

// Check connection
echo "Connected successfully";

mysqli_query($conn,"INSERT INTO user_info (email, urls)
VALUES ('$email','$urls')");

mysqli_close($conn);

?>