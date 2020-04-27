<?php

    $param = file_get_contents('php://input');
    echo $param;

    file_put_contents('./data.json', $param);
?>