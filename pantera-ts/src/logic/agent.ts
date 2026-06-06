import { applyMove, isValidMove } from "./game";

import type {
  AgentConfig,
  Board,
  GameState,
  Move,
  Player,
  ScoredMove,
} from "./types";

const CENTER_CELL = 4;
const CORNER_CELLS = [0, 2, 6, 8];
const WINNING_LINES = [
  [0, 1, 2],
  [3, 4, 5],
  [6, 7, 8],
  [0, 3, 6],
  [1, 4, 7],
  [2, 5, 8],
  [0, 4, 8],
  [2, 4, 6],
] as const;

export const EASY_AGENT: AgentConfig = {
  topMoves: 4,
  includeMiddleMove: true,
  badMoves: 3,
  smallPoolLimit: 11,
  smallPoolTopMoves: 3,
};

export const NORMAL_AGENT: AgentConfig = {
  topMoves: 6,
  includeMiddleMove: true,
  badMoves: 1,
  smallPoolLimit: 11,
  smallPoolTopMoves: 3,
};

export const HARD_AGENT: AgentConfig = {
  topMoves: 2,
  includeMiddleMove: false,
  badMoves: 0,
  smallPoolLimit: 8,
  smallPoolTopMoves: 2,
};

export function getAgentMove(
  state: GameState,
  agentPlayer: Player,
  config: AgentConfig,
): Move | null {
  const validMoves = getValidMoves(state);

  if (validMoves.length === 0) {
    return null;
  }

  const scoredMoves = validMoves
    .map((move) => ({
      ...move,
      score: evaluateMove(state, move, agentPlayer),
    }))
    .sort((a, b) => b.score - a.score);

  const selectedMoves = getCandidateMoves(scoredMoves, config);

  return getRandomMove(selectedMoves);
}

function getValidMoves(state: GameState): Move[] {
  const moves: Move[] = [];

  for (let boardIndex = 0; boardIndex < 9; boardIndex++) {
    for (let cellIndex = 0; cellIndex < 9; cellIndex++) {
      if (isValidMove(state, boardIndex, cellIndex)) {
        moves.push({ boardIndex, cellIndex });
      }
    }
  }

  return moves;
}

function evaluateMove(
  state: GameState,
  move: Move,
  agentPlayer: Player,
): number {
  let score = 0;

  const nextState = applyMove(state, move.boardIndex, move.cellIndex);

  const opponent = getOpponent(agentPlayer);

  if (nextState.winner !== null) {
    score += 10000;
  }

  if (nextState.macro[move.boardIndex] === agentPlayer) {
    score += 1000;
  }

  if (move.cellIndex === CENTER_CELL) {
    score += 30;
  }

  if (CORNER_CELLS.includes(move.cellIndex)) {
    score += 20;
  }

  score += scoreMiniBoardControl(
    nextState.boards[move.boardIndex],
    agentPlayer,
  );

  score -= scoreMiniBoardControl(nextState.boards[move.boardIndex], opponent);

  score += scoreMacroControl(nextState.macro, agentPlayer);
  score -= scoreMacroControl(nextState.macro, opponent);

  score -= scoreOpponentDestinationRisk(nextState, move.cellIndex, opponent);

  return score;
}

function scoreMiniBoardControl(board: Board, player: Player): number {
  let score = 0;

  for (const line of WINNING_LINES) {
    const playerCells = line.filter(
      (cellIndex) => board[cellIndex] === player,
    ).length;

    const emptyCells = line.filter(
      (cellIndex) => board[cellIndex] === null,
    ).length;

    if (playerCells === 2 && emptyCells === 1) {
      score += 100;
    }

    if (playerCells === 1 && emptyCells === 2) {
      score += 20;
    }
  }

  return score;
}

function scoreMacroControl(
  macro: Array<Player | null | "DRAW">,
  player: Player,
): number {
  let score = 0;

  for (const line of WINNING_LINES) {
    const playerCells = line.filter(
      (cellIndex) => macro[cellIndex] === player,
    ).length;

    const emptyCells = line.filter(
      (cellIndex) => macro[cellIndex] === null,
    ).length;

    if (playerCells === 2 && emptyCells === 1) {
      score += 500;
    }

    if (playerCells === 1 && emptyCells === 2) {
      score += 80;
    }
  }

  return score;
}

function scoreOpponentDestinationRisk(
  state: GameState,
  destinationBoardIndex: number,
  opponent: Player,
): number {
  const destinationBoard = state.boards[destinationBoardIndex];

  if (state.macro[destinationBoardIndex] !== null) {
    return 0;
  }

  let risk = 0;

  for (const line of WINNING_LINES) {
    const opponentCells = line.filter(
      (cellIndex) => destinationBoard[cellIndex] === opponent,
    ).length;

    const emptyCells = line.filter(
      (cellIndex) => destinationBoard[cellIndex] === null,
    ).length;

    if (opponentCells === 2 && emptyCells === 1) {
      risk += 300;
    }
  }

  return risk;
}

function getOpponent(player: Player): Player {
  return player === "X" ? "O" : "X";
}

function getCandidateMoves(
  scoredMoves: ScoredMove[],
  config: AgentConfig,
): ScoredMove[] {
  if (scoredMoves.length <= 3) {
    return scoredMoves;
  }

  if (scoredMoves.length < config.smallPoolLimit) {
    return scoredMoves.slice(0, config.smallPoolTopMoves);
  }

  const topMoves = scoredMoves.slice(0, config.topMoves);

  const middleIndex = Math.floor(scoredMoves.length / 2);
  const middleMove = scoredMoves[middleIndex];

  const badMoves =
    config.badMoves > 0 ? scoredMoves.slice(-config.badMoves) : [];

  const candidateMoves = [...topMoves];

  if (config.includeMiddleMove) {
    candidateMoves.push(middleMove);
  }

  candidateMoves.push(...badMoves);

  return candidateMoves;
}

function getRandomMove(moves: ScoredMove[]): Move {
  const randomIndex = Math.floor(Math.random() * moves.length);

  return {
    boardIndex: moves[randomIndex].boardIndex,
    cellIndex: moves[randomIndex].cellIndex,
  };
}
