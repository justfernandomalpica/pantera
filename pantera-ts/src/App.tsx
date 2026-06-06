import { useEffect, useRef, useState } from "react";
import { createInitialState, applyMove } from "./logic/game";

import type {
  AppState,
  ClientMessage,
  Connection,
  Player,
} from "./logic/types";
import { createConnection } from "./logic/socket";

import Instructions from "./components/Instructions";
import Game from "./components/Game";
import Menu from "./components/Menu";
import Wait from "./components/Wait";
import Footer from "./components/Footer";

const initialAppState: AppState = {
  screen: "MENU",
  gameMode: "LOCAL",
  roomCode: null,
  myPlayer: null,
};

export default function App() {
  const [gameState, setGameState] = useState(createInitialState());
  const [appState, setAppState] = useState(initialAppState);
  const [toastState, setToastState] = useState(Array<string>);

  const connectionRef = useRef<Connection | null>(null);
  const pendingActionRef = useRef<ClientMessage | null>(null);
  const myPlayerRef = useRef<Player | null>(null);

  useEffect(() => {
    if (appState.gameMode !== "ONLINE") return;

    const connection = createConnection({
      onOpen: (connection) => {
        if (!pendingActionRef.current) return;
        connection.send(pendingActionRef.current);
        pendingActionRef.current = null;
      },
      onRoomCreated: (code) => {
        setAppState((prevState) => ({
          ...prevState,
          roomCode: code,
        }));
      },
      onGameStart: (_code, player, starts) => {
        // if (code !== appState.roomCode) return; // Aqui puedo manejar un error de mal código
        myPlayerRef.current = player;
        setAppState((prevState) => ({
          ...prevState,
          screen: "GAME",
          myPlayer: player,
        }));
        setGameState(createInitialState(starts));
      },
      onGameRestart: (starts) => {
        setGameState(createInitialState(starts));
      },
      onMove: (boardIndex, cellIndex) => {
        setGameState((prevState) =>
          applyMove(prevState, boardIndex, cellIndex),
        );
      },
      onLeftRoom: (message) => {
        handleCreateToast(message);
        handleGoToMenu();
      },
      onError: (message) => {
        handleCreateToast(message);
        handleGoToMenu();
      },
    });

    connectionRef.current = connection;

    return () => {
      connection.close();
      connectionRef.current = null;
    };
  }, [appState.gameMode]);

  useEffect(() => {
    setTimeout(() => {
      setToastState([]);
    }, 6000);
  }, [toastState]);

  const canPlay =
    appState.gameMode === "LOCAL" ||
    myPlayerRef.current === gameState.currentPlayer;

  function handleReset() {
    if (appState.gameMode === "ONLINE") {
      connectionRef.current?.send({ type: "restart_game" });
      return;
    }

    setGameState(createInitialState());
  }

  function handlePlayLocal() {
    handleReset();
    setAppState({
      ...appState,
      screen: "GAME",
      gameMode: "LOCAL",
    });
  }

  function handleGoToMenu() {
    connectionRef.current?.close();
    connectionRef.current = null;
    pendingActionRef.current = null;

    setAppState(initialAppState);
  }

  function handleCreateRoom() {
    pendingActionRef.current = { type: "create_room" };

    setAppState({
      ...appState,
      screen: "WAIT",
      gameMode: "ONLINE",
    });
  }

  function handleJoinRoom(room: string) {
    if (!room || room.length !== 4) return;
    pendingActionRef.current = { type: "join_room", code: room };
    setAppState({
      ...appState,
      screen: "WAIT",
      gameMode: "ONLINE",
      roomCode: room,
    });
  }

  function handleMove(boardIndex: number, cellIndex: number) {
    if (!canPlay) return;
    setGameState((prevState) => applyMove(prevState, boardIndex, cellIndex));
    if (appState.gameMode === "ONLINE") {
      connectionRef.current?.send({
        type: "move",
        boardIndex,
        cellIndex,
      });
    }
  }

  function handleCreateToast(message: string) {
    setToastState((prevState) => [...prevState, message]);
  }

  function handleDeleteToast(message: string) {
    setToastState((prevState) => prevState.filter((msg) => msg !== message));
  }

  return (
    <main>
      <div id="toast-container">
        {toastState.map((message) => (
          <div className="toast">
            <p>{message}</p>
            <button type="button" onClick={() => handleDeleteToast(message)}>
              X
            </button>
          </div>
        ))}
      </div>
      <h1>PANTERA</h1>
      <div className="playground">
        {appState.screen === "MENU" && (
          <Menu
            handlePlayLocal={handlePlayLocal}
            handleCreateRoom={handleCreateRoom}
            handleJoinRoom={handleJoinRoom}
          />
        )}
        {appState.screen === "WAIT" && (
          <Wait code={appState.roomCode} handleDeleteRoom={handleGoToMenu} />
        )}
        {appState.screen === "GAME" && (
          <Game
            state={gameState}
            canPlay={canPlay}
            isOnline={appState.gameMode === "ONLINE"}
            handleReset={handleReset}
            handleGoToMenu={handleGoToMenu}
            handleDeleteRoom={handleGoToMenu}
            handleMove={handleMove}
          />
        )}
      </div>
      <Instructions />
      <Footer />
    </main>
  );
}
