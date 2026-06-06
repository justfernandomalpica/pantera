import { isValidMove } from "../logic/game";
import type { GameState } from "../logic/types";
import DeleteRoom from "./DeleteRoom";

interface GameProps {
  state: GameState;
  canPlay: boolean;
  isMultiplayer: boolean;
  myPlayer: "X" | "O" | null;
  handleMove: (boardIndex: number, cellIndex: number) => void;
  handleGoToMenu: () => void;
  handleReset: () => void;
  handleDeleteRoom: () => void;
}

export default function Game({
  state,
  canPlay,
  isMultiplayer,
  myPlayer,
  handleMove,
  handleGoToMenu,
  handleReset,
  handleDeleteRoom,
}: GameProps) {
  return (
    <section className="screen-game">
      <div className="controls">
        <div className="game-status">
          <div className="current-player">
            <p className="label">
              {state.winner === "DRAW"
                ? "¡Empate!"
                : state.winner === null
                  ? "Actual"
                  : "¡Ganador!"}
            </p>
            <p
              className={`player-box ${state.winner === "DRAW" ? "" : (state.winner ?? state.currentPlayer)}`}
            >
              {state.winner === "DRAW"
                ? "-"
                : (state.winner ?? state.currentPlayer)}
            </p>
          </div>
          {isMultiplayer && (
            <div className="my-player">
              <p className="label">Yo</p>
              <p className={`my-player-box ${myPlayer}`}>
                {state.winner === "DRAW"
                  ? ":|"
                  : state.winner !== null
                    ? state.winner === myPlayer
                      ? ":)"
                      : ":("
                    : myPlayer}
              </p>
            </div>
          )}
        </div>
        <div className="buttons">
          {!isMultiplayer && (
            <button
              className="reset-game"
              type="button"
              aria-label="Botón para reiniciar la partida"
              onClick={handleGoToMenu}
            >
              Menu
            </button>
          )}
          {(!isMultiplayer || (isMultiplayer && state.winner !== null)) && (
            <button
              className="reset-game"
              type="button"
              aria-label="Botón para reiniciar la partida"
              onClick={handleReset}
            >
              Reiniciar
            </button>
          )}
          {isMultiplayer && <DeleteRoom handleDeleteRoom={handleDeleteRoom} />}
        </div>
      </div>
      <div className={`game${state.winner ? ` winner-${state.winner}` : ""}`}>
        {state.boards.map((board, boardIndex) => (
          <div
            className={`mini-board${
              state.macro[boardIndex] === null
                ? ""
                : ` ${state.macro[boardIndex]}`
            }`}
            key={boardIndex}
          >
            {board.map((cell, cellIndex) => {
              const isAvailable = isValidMove(state, boardIndex, cellIndex);

              const cellClassName = `cell ${
                canPlay && isAvailable
                  ? "active"
                  : !canPlay && isAvailable
                    ? `opponent-available ${state.currentPlayer}`
                    : "inactive"
              }`;

              return (
                <button
                  className={cellClassName}
                  aria-label={`Casilla ${cellIndex + 1} del tablero ${boardIndex + 1}`}
                  type="button"
                  key={cellIndex}
                  onClick={() => handleMove(boardIndex, cellIndex)}
                >
                  {cell}
                </button>
              );
            })}
          </div>
        ))}
      </div>
    </section>
  );
}
