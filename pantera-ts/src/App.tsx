import { useEffect, useRef, useState } from "react";
import { createInitialState, applyMove } from "./logic/game";
import { createConnection } from "./logic/socket";
import { getAgentMove } from "./logic/agent";

import type {
  AgentConfig,
  AppState,
  ClientMessage,
  Connection,
  Player,
} from "./logic/types";

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
  agentPlayer: null,
};

const EASY_AGENT: AgentConfig = {
  topMoves: 4,
  includeMiddleMove: true,
  badMoves: 3,
  smallPoolLimit: 11,
  smallPoolTopMoves: 3,
};

const NORMAL_AGENT: AgentConfig = {
  topMoves: 6,
  includeMiddleMove: true,
  badMoves: 1,
  smallPoolLimit: 11,
  smallPoolTopMoves: 3,
};

const HARD_AGENT: AgentConfig = {
  topMoves: 2,
  includeMiddleMove: false,
  badMoves: 0,
  smallPoolLimit: 8,
  smallPoolTopMoves: 2,
};

export default function App() {
  const [gameState, setGameState] = useState(createInitialState());
  const [appState, setAppState] = useState(initialAppState);
  const [toastState, setToastState] = useState(Array<string>);

  const connectionRef = useRef<Connection | null>(null);
  const pendingActionRef = useRef<ClientMessage | null>(null);
  // const myPlayerRef = useRef<Player | null>(null);

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
        // myPlayerRef.current = player;
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
    if (appState.gameMode !== "AGENT") return;
    if (appState.agentPlayer === null) return;
    if (gameState.winner !== null) return;
    if (gameState.currentPlayer !== appState.agentPlayer) return;

    const agentPlayer = appState.agentPlayer;

    const timeoutId = window.setTimeout(
      () => {
        const move = getAgentMove(gameState, agentPlayer, HARD_AGENT);

        if (move === null) return;

        setGameState((prevState) =>
          applyMove(prevState, move.boardIndex, move.cellIndex),
        );
      },
      600 + Math.random() * 300,
    );

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [appState.gameMode, appState.agentPlayer, gameState]);

  useEffect(() => {
    setTimeout(() => {
      setToastState([]);
    }, 6000);
  }, [toastState]);

  const canPlay =
    appState.gameMode === "LOCAL" ||
    appState.myPlayer === gameState.currentPlayer;

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

  function handlePlayAgent() {
    function getRandomComparation() {
      const a = Math.random();
      const b = Math.random() * 100;
      const c = Math.sqrt(a * b) ** 4;
      const d = 650;

      return c < d;
    }
    const playerStart: Player = getRandomComparation() ? "X" : "O";
    const myPlayer: Player = getRandomComparation() ? "X" : "O";
    const agentPlayer: Player = myPlayer === "X" ? "O" : "X";

    setGameState(createInitialState(playerStart));
    setAppState({
      ...initialAppState,
      screen: "GAME",
      gameMode: "AGENT",
      myPlayer: myPlayer,
      agentPlayer: agentPlayer,
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
            handlePlayAgent={handlePlayAgent}
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
            isMultiplayer={
              appState.gameMode === "ONLINE" || appState.gameMode === "AGENT"
            }
            myPlayer={appState.myPlayer}
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
