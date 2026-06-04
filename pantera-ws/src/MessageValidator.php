<?php declare(strict_types=1);

namespace Core;

class MessageValidator {
    public static function validateClient(array $msg) : array | null {
        $validTypes = ["create_room","join_room", "move", "restart_game"];

        if(!array_key_exists("type", $msg)) return null;
        if(!is_string($msg["type"])) return null;
        if(!in_array($msg["type"], $validTypes, true)) return null;

        switch($msg["type"]) {
            case "join_room":
                if(!array_key_exists("code", $msg)) return null;
                if(!is_string($msg["code"])) return null;
                return self::isRoomCodeValid($msg["code"]) ? $msg : null;

            case "move":
                if(
                    !array_key_exists("boardIndex", $msg) ||
                    !array_key_exists("cellIndex", $msg)
                ) return null;
                if(!is_int($msg["boardIndex"]) || !is_int($msg["cellIndex"])) return null;
                if($msg["boardIndex"] < 0 || $msg["boardIndex"] > 8) return null;
                if($msg["cellIndex"] < 0 || $msg["cellIndex"] > 8) return null;
                return $msg;
                
        }

        return $msg;
    }

    private static function isRoomCodeValid(string $code) : bool {
        if(strlen($code) !== 4) return false;
        if(!preg_match("/^[A-Z0-9]+$/", $code)) return false;
        return true;
    }
}
