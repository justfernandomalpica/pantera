<?php

namespace Core;

use Core\RoomManager;
use Exception;
use Ratchet\ConnectionInterface;
use Ratchet\MessageComponentInterface;

class PanteraServer implements MessageComponentInterface
{
    private RoomManager $roomManager;

    public function __construct()
    {
        $this->roomManager = new RoomManager();
    }

    public function onOpen(ConnectionInterface $conn): void
    {
        echo "New connection: {$conn->resourceId}\n";
    }

    public function onMessage(ConnectionInterface $from, $msg): void
    {   
        $data = json_decode($msg, true);

        $message = MessageValidator::validateClient($data);

        if ($message === null) {
            $this->sendError($from, '¡Mensáje inválido!');
            return;
        }

        switch ($message['type']) {
            case 'create_room':
                $this->handleCreateRoom($from);
                break;

            case 'join_room':
                $this->handleJoinRoom($from, $message);
                break;

            case 'move':
                $this->handleMove($from, $message);
                break;

            case 'restart_game':
                $this->handleRestartGame($from);
                break;
        }
    }

    public function onClose(ConnectionInterface $conn): void
    {
        $room = $this->roomManager->findRoomByConnection($conn);

        if ($room === null) {
            echo "Connection closed: {$conn->resourceId}\n";
            return;
        }

        $opponent = $room->getOpponent($conn);

        $room->removePlayer($conn);

        if ($opponent !== null) {
            $opponent->send(json_encode([
                'type' => 'left_room',
                'message' => 'El oponente abandonó la partida',
            ]));
        }

        $this->roomManager->removeRoom($room->getCode());

        echo "Connection closed: {$conn->resourceId}\n";
    }

    public function onError(ConnectionInterface $conn, Exception $e): void
    {
        echo "Error: {$e->getMessage()}\n";

        $conn->close();
    }

    private function handleCreateRoom(ConnectionInterface $conn): void
    {
        $existingRoom = $this->roomManager->findRoomByConnection($conn);

        if ($existingRoom !== null) {
            $this->sendError($conn, '¡Ya estás en una sala!');
            return;
        }

        $room = $this->roomManager->createRoom();

        $room->addPlayer($conn);

        $conn->send(json_encode([
            'type' => 'room_created',
            'code' => $room->getCode(),
        ]));
    }

    private function handleJoinRoom(ConnectionInterface $conn, array $message): void
    {
        $existingRoom = $this->roomManager->findRoomByConnection($conn);

        if ($existingRoom !== null) {
            $this->sendError($conn, '¡Ya estás en una sala!');
            return;
        }

        $room = $this->roomManager->getRoom($message['code']);

        if ($room === null) {
            $this->sendError($conn, 'No se encontró una sala con el código: ' . $message['code']);
            return;
        }

        if ($room->isFull()) {
            $this->sendError($conn, 'La sala está llena');
            return;
        }

        $player = $room->addPlayer($conn);

        if ($player === null) {
            $this->sendError($conn, 'No fue posible unirse a la sala');
            return;
        }

        $playerX = $room->getOpponent($conn);

        if ($playerX !== null) {
            $playerX->send(json_encode([
                'type' => 'game_start',
                'code' => $room->getCode(),
                'player' => 'X',
                'starts' => 'X',
            ]));
        }

        $conn->send(json_encode([
            'type' => 'game_start',
            'code' => $room->getCode(),
            'player' => $player,
            'starts' => 'X',
        ]));
    }

    private function handleMove(ConnectionInterface $from, array $message): void
    {
        $room = $this->roomManager->findRoomByConnection($from);

        if ($room === null) {
            $this->sendError($from, 'No estás en una sala');
            return;
        }

        if (!$room->isFull()) {
            $this->sendError($from, 'La sala está esperando por otro jugador');
            return;
        }

        $room->sendToOpponent($from, [
            'type' => 'move',
            'boardIndex' => $message['boardIndex'],
            'cellIndex' => $message['cellIndex'],
        ]);
    }

    private function handleRestartGame(ConnectionInterface $from): void
    {
        $room = $this->roomManager->findRoomByConnection($from);

        if ($room === null) {
            $this->sendError($from, 'No estás en una sala');
            return;
        }

        if (!$room->isFull()) {
            $this->sendError($from, 'La sala está esperando por otro jugador');
            return;
        }

        $room->sendToBoth([
            'type' => 'game_restart',
            'starts' => 'X',
        ]);
    }

    private function sendError(ConnectionInterface $conn, string $message): void
    {
        $conn->send(json_encode([
            'type' => 'error',
            'message' => $message,
        ]));
    }
}
