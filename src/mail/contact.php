<?php
    $name = $_POST["name"];
    $message = $_POST["message"];
    $title = $_POST["title"];
    $mail = $_POST["mail"];

    $messageComplete = $name . " : " . $mail . "\r\n\r\n" . $message;

    $to      = 'maxence.martin@protonmail.com';
    $subject = '[Contact - HistoAtlas] '.$title;

    $headers = 'From: ' . $mail . "\r\n" .
     'Reply-To: ' . $mail . "\r\n" .
     'X-Mailer: PHP/' . phpversion();

    mail($to, $subject, $messageComplete, $headers);

    /* Create a file with mail data */
    $fileName = "mail_" . date("d") . "_" . date("m") . "_" . date("Y") . "_" . date("H") . "_" . date("i") . "_" . date("s") . ".txt";
    echo $fileName;

    //$myfile = fopen($fileName, "w") or die("Unable to open file!");
    $myfile = fopen($fileName, "w");

    $txt = "subject : " . $subject . "\n\n" . "mail : " . $mail . "\n\n" . "message : " . $messageComplete;

    fwrite($myfile, $txt);

    fclose($myfile);
?>
