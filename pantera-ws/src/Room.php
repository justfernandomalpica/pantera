<?php

namespace Core;

use Ratchet\ConnectionInterface;

class Room
{
    private string $code;

    private ?ConnectionInterface $playerX = null;

    private ?ConnectionInterface $playerO = null;

    public function __construct(string $code)
    {
        $this->code = $code;
    }

    public function getCode(): string
    {
        return $this->code;
    }

    public function addPlayer(ConnectionInterface $connection): ?string
    {
        if ($this->playerX === null) {
            $this->playerX = $connection;
            return 'X';
        }

        if ($this->playerO === null) {
            $this->playerO = $connection;
            return 'O';
        }

        return null;
    }

    public function isFull(): bool
    {
        return $this->playerX !== null && $this->playerO !== null;
    }

    public function hasPlayer(ConnectionInterface $connection): bool
    {
        return $this->playerX === $connection || $this->playerO === $connection;
    }

    public function getPlayerSymbol(ConnectionInterface $connection): ?string
    {
        if ($this->playerX === $connection) {
            return 'X';
        }

        if ($this->playerO === $connection) {
            return 'O';
        }

        return null;
    }

    public function getOpponent(ConnectionInterface $connection): ?ConnectionInterface
    {
        if ($this->playerX === $connection) {
            return $this->playerO;
        }

        if ($this->playerO === $connection) {
            return $this->playerX;
        }

        return null;
    }

    public function removePlayer(ConnectionInterface $connection): void
    {
        if ($this->playerX === $connection) {
            $this->playerX = null;
            return;
        }

        if ($this->playerO === $connection) {
            $this->playerO = null;
        }
    }

    public function sendToOpponent(ConnectionInterface $sender, array $message): void
    {
        $opponent = $this->getOpponent($sender);

        if ($opponent === null) {
            return;
        }

        $opponent->send(json_encode($message));
    }

    public function sendToBoth(array $message): void
    {
        $encodedMessage = json_encode($message);

        if ($this->playerX !== null) {
            $this->playerX->send($encodedMessage);
        }

        if ($this->playerO !== null) {
            $this->playerO->send($encodedMessage);
        }
    }

    public function isEmpty(): bool
    {
        return $this->playerX === null && $this->playerO === null;
    }
}