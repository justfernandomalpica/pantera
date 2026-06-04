<?php

require __DIR__ . '/vendor/autoload.php';

error_reporting(E_ALL & ~E_DEPRECATED);
ob_implicit_flush(true);
ob_end_flush();

use Core\PanteraServer;
use Ratchet\Server\IoServer;
use Ratchet\Http\HttpServer;
use Ratchet\WebSocket\WsServer;

$port = (int) getenv("PORT") ?: 8080;

$server = IoServer::factory(
    new HttpServer(
        new WsServer(
            new PanteraServer()
        )
    ),
    $port
);

echo "Servidor corriendo en puerto " . $port . "\n";
$server->run();