import {
  type Player,
  type GameState,
  type Board,
  type BoardResult,
} from "./types";

const WINNING_LINES = [
  [0, 1, 2],
  [3, 4, 5],
  [6, 7, 8],
  [0, 3, 6],
  [1, 4, 7],
  [2, 5, 8],
  [0, 4, 8],
  [2, 4, 6],
];

const PLAYER = {
  X: "X" as Player,
  O: "O" as Player,
} as const;

const RESULT = {
  X: PLAYER.X,
  O: PLAYER.O,
  DRAW: "DRAW",
  ONGOING: null,
} as const;

function detectWinner(board: Board): BoardResult {
  for (const [a, b, c] of WINNING_LINES) {
    if (
      board[a] !== RESULT.ONGOING &&
      board[a] === board[b] &&
      board[a] === board[c]
    ) {
      return board[a]; // Regresa el jugador ganador 'X' o 'O'
    }
  }

  // Revisar si hay un empate o si se puede seguir jugando.
  return board.every((cell) => cell !== RESULT.ONGOING)
    ? RESULT.DRAW
    : RESULT.ONGOING;
}

function createInitialState(currentPlayer?: Player): GameState {
  const macro = Array(9).fill(RESULT.ONGOING);
  const boards = Array.from({ length: 9 }, () => Array(9).fill(RESULT.ONGOING));
  const initialPlayer =
    currentPlayer ?? Object.values(PLAYER)[Math.round(Math.random())];

  return {
    boards,
    macro,
    currentPlayer: initialPlayer,
    activeBoard: -1,
    winner: null,
  };
}

function isValidMove(
  state: GameState,
  boardIndex: number,
  cellIndex: number,
): boolean {
  const cellIsEmpty = state.boards[boardIndex][cellIndex] === null;
  const boardHasNotWinner = state.macro[boardIndex] === null;
  const isInActiveBoard =
    boardIndex === state.activeBoard || state.activeBoard === -1;

  return (
    cellIsEmpty && boardHasNotWinner && state.winner === null && isInActiveBoard
  );
}

function applyMove(
  state: GameState,
  boardIndex: number,
  cellIndex: number,
): GameState {
  // Si el movimiento realizado no es válido se retorna el estado actual, o sea no se hace nada.
  if (!isValidMove(state, boardIndex, cellIndex)) return state;

  // Paso 1 - Aplicar el movimiento: Se crea una copia del estado actual y se asigna el jugador actual a la casilla de esa copia
  const newBoards = [...state.boards];
  newBoards[boardIndex] = [...state.boards[boardIndex]];
  newBoards[boardIndex][cellIndex] = state.currentPlayer;

  // Paso 2 - Revisar si el tablero actual tiene ganador
  const newMacro = [...state.macro];
  newMacro[boardIndex] = detectWinner(newBoards[boardIndex]);

  // Paso 3 - Revisar si el tablero macro tiene ganador
  const newWinner = detectWinner(newMacro);

  // Paso 4 - Calcular en qué mini tablero jugará el siguiente jugador: Aquí se debe verificar si la macro casilla nueva ya está ganada o en empate
  const newActiveBoard = newMacro[cellIndex] === null ? cellIndex : -1;

  // Paso 5 - Cambiar de turno
  const newCurrentPlayer: Player = state.currentPlayer === "O" ? "X" : "O";

  return {
    boards: newBoards,
    macro: newMacro,
    currentPlayer: newCurrentPlayer,
    activeBoard: newActiveBoard,
    winner: newWinner,
  };
}

export { isValidMove, createInitialState, applyMove };
