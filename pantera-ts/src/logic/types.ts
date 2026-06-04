type Player = "X" | "O";
type CellState = Player | null;
type BoardResult = CellState | "DRAW";
type Board = Array<BoardResult>;

type GameMode = "LOCAL" | "ONLINE";
type Screen = "MENU" | "WAIT" | "GAME";

type MoveMessage = { type: "move"; boardIndex: number; cellIndex: number };
type ClientMessage =
  | { type: "create_room" }
  | { type: "join_room"; code: string }
  | { type: "restart_game" }
  | MoveMessage;

type ServerMessage =
  | { type: "room_created"; code: string }
  | { type: "game_start"; code: string; player: Player; starts: Player }
  | { type: "game_restart"; starts: Player }
  | MoveMessage
  | { type: "left_room"; message: string }
  | { type: "error"; message: string };

type Connection = {
  send: (message: ClientMessage) => void;
  close: () => void;
};

type ConnectionCallbacks = {
  onOpen: (connection: Connection) => void;
  onRoomCreated: (code: string) => void;
  onGameStart: (code: string, player: Player, starts: Player) => void;
  onGameRestart: (starts: Player) => void;
  onMove: (boardIndex: number, cellIndex: number) => void;
  onLeftRoom: (message: string) => void;
  onError: (message: string) => void;
};

interface GameState {
  boards: Array<Board>;
  macro: Board;
  currentPlayer: Player;
  activeBoard: number;
  winner: BoardResult;
}

interface AppState {
  screen: Screen;
  myPlayer: Player | null;
  roomCode: string | null;
  gameMode: GameMode;
}

export type {
  Player,
  CellState,
  Board,
  BoardResult,
  GameState,
  AppState,
  ConnectionCallbacks,
  Connection,
  ClientMessage,
  ServerMessage,
};
