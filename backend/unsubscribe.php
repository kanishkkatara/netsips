<?php
$servername = "localhost";
$username = "root";
$password = "";
$dbname = "netsips";

// Create connection

$conn = new mysqli($servername, $username, $password, $dbname);
// Check connection
if ($conn->connect_error) 
{
    die("Connection failed: " . $conn->connect_error);
}
if(isset($_REQUEST["click"]))
{
    $email = $_REQUEST["email"];
    echo $email;
    $sql = "UPDATE user_data SET status = 'Inactive' WHERE mailid = '".$email."'";
    mysqli_query($conn, $sql);
    if (mysqli_query($conn, $sql)) 
    {
        echo "Record updated successfully";
    }
    else 
    {
        echo "Error updating record: " . $conn->error;
    }
}
mysqli_close($conn)
?>

<html>
    <body style="font-family:verdana;">
    <center>
        <img src="https://drive.google.com/uc?id=1UuFEBJAGaIthahsTfZ0SJCO6ZN56dHXL" style="width:350px;height:150px;" class="photo" />
        <h3>Enter your email id to unsubscribe</h3>
        <form method="POST">
            email id: <input type="text" name="email" id="email"><br><br>
            <input type="submit" name="click" value="Submit">
        </form>
    </center>
</body></html>
