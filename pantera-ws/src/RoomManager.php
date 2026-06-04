<?php

namespace Core;

use Ratchet\ConnectionInterface;
use Core\Room;

class RoomManager
{
    /**
     * @var array<string, Room>
     */
    private array $rooms = [];

    public function createRoom(): Room
    {
        $code = $this->generateUniqueCode();

        $room = new Room($code);

        $this->rooms[$code] = $room;

        return $room;
    }

    public function getRoom(string $code): ?Room
    {
        return $this->rooms[$code] ?? null;
    }

    public function roomExists(string $code): bool
    {
        return isset($this->rooms[$code]);
    }

    public function removeRoom(string $code): void
    {
        unset($this->rooms[$code]);
    }

    public function findRoomByConnection(ConnectionInterface $connection): ?Room
    {
        foreach ($this->rooms as $room) {
            if ($room->hasPlayer($connection)) {
                return $room;
            }
        }

        return null;
    }

    public function removeEmptyRooms(): void
    {
        foreach ($this->rooms as $code => $room) {
            if ($room->isEmpty()) {
                unset($this->rooms[$code]);
            }
        }
    }

    private function generateUniqueCode(): string
    {
        do {
            $code = $this->generateCode();
        } while ($this->roomExists($code));

        return $code;
    }

    private function generateCode(): string
    {
        $characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';

        $code = '';

        for ($i = 0; $i < 4; $i++) {
            $randomIndex = random_int(0, strlen($characters) - 1);

            $code .= $characters[$randomIndex];
        }

        return $code;
    }
}