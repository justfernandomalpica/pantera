import type {
  ClientMessage,
  Connection,
  ConnectionCallbacks,
  ServerMessage,
} from "./types";

const WS_URL = import.meta.env.VITE_WS_URL;

export function createConnection(callbacks: ConnectionCallbacks): Connection {
  const socket = new WebSocket(WS_URL);

  function handleServerMessage(message: ServerMessage) {
    switch (message.type) {
      case "room_created":
        callbacks.onRoomCreated(message.code);
        break;

      case "game_start":
        callbacks.onGameStart(message.code, message.player, message.starts);
        break;

      case "game_restart":
        callbacks.onGameRestart(message.starts);
        break;

      case "move":
        callbacks.onMove(message.boardIndex, message.cellIndex);
        break;

      case "left_room":
        callbacks.onLeftRoom(message.message);
        break;

      case "error":
        callbacks.onError(message.message);
        break;
    }
  }

  function send(message: ClientMessage) {
    if (socket.readyState !== WebSocket.OPEN) {
      callbacks.onError("No hay una conexión abierta");
      return;
    }

    socket.send(JSON.stringify(message));
  }

  function close() {
    socket.close();
  }

  const connection: Connection = {
    send,
    close,
  };

  socket.onopen = () => {
    callbacks.onOpen(connection);
  };

  socket.onmessage = (event) => {
    const message = JSON.parse(event.data) as ServerMessage;

    handleServerMessage(message);
  };

  socket.onerror = () => {
    callbacks.onError("Error de conexión con el servidor");
  };

  socket.onclose = () => {
    console.log("Conexión con el servidor cerrada");
  };

  return connection;
}
