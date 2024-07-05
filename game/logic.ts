import { produce } from "immer";

const addLog = (message: string, logs: GameState["log"]): GameState["log"] => {
  return [{ dt: new Date().getTime(), message: message }, ...logs].slice(
    0,
    MAX_LOG_SIZE
  );
};

export interface User {
  id: string;
}

export type Action = DefaultAction | GameAction;

export type ServerAction = WithUser<DefaultAction> | WithUser<GameAction>;

const MAX_LOG_SIZE = 4;

type WithUser<T> = T & { user: User };

export type DefaultAction = { type: "USER_ENTERED" } | { type: "USER_EXIT" };

export const COLORS = [
  "red",
  "yellow",
  "green",
  "blue",
  "orange",
  "purple",
] as const;

export type Color = (typeof COLORS)[number];

export const COLUMNS_COUNT = 4;
export const ROWS_COUNT = 10;

export type Code = [Color, Color, Color, Color];

export type Cell = Color | null;
export type Row = [Cell, Cell, Cell, Cell];

type Peg = "black" | "white";
type Results = Peg[];

export type RowState =
  | { type: "UNLOCKED"; state: Row }
  | { type: "LOCKED"; state: Code; results: Results };

export type Board = [
  RowState,
  RowState,
  RowState,
  RowState,
  RowState,
  RowState,
  RowState,
  RowState,
  RowState,
  RowState
];

// This interface holds all the information about your game
export interface GameState {
  board: Board;
  users: User[];
  log: {
    dt: number;
    message: string;
  }[];
}

export function generateCode(): Code {
  return new Array(COLUMNS_COUNT).fill(true).map(() => {
    const randomIndex = Math.floor(Math.random() * COLORS.length);
    return COLORS[randomIndex];
  }) as Code;
}

export function generateBoard(): Board {
  return new Array(ROWS_COUNT).fill(true).map(() => {
    return {
      type: "UNLOCKED",
      state: [null, null, null, null],
    };
  }) as Board;
}

export function getResultPegs(secretCode: Code, guess: Code): Peg[] {
  const blackPegs: Peg[] = [];
  const whitePegs: Peg[] = [];

  const secretCodeCopy: Array<Color | -1> = [...secretCode];
  const guessCopy: Array<Color | -1> = [...guess];

  // First pass: Check for black pegs (correct color and position)
  for (let i = 0; i < secretCode.length; i++) {
    if (guess[i] === secretCode[i]) {
      blackPegs.push("black");
      // Mark the pegs as checked
      secretCodeCopy[i] = -1;
      guessCopy[i] = -1;
    }
  }

  // Second pass: Check for white pegs (correct color, wrong position)
  for (let i = 0; i < guessCopy.length; i++) {
    if (guessCopy[i] !== -1) {
      const index = secretCodeCopy.indexOf(guessCopy[i]);
      if (index !== -1) {
        whitePegs.push("white");
        secretCodeCopy[index] = -1;
      }
    }
  }

  return [...blackPegs, ...whitePegs];
}

export const initialGame = (): GameState => ({
  users: [],
  board: generateBoard(),
  log: addLog("Game Created!", []),
});

export type GameAction =
  | {
      type: "PIN_PLACED";
      payload: {
        position: {
          row: number;
          column: number;
        };
        color: Color;
      };
    }
  | { type: "GUESS"; payload: { position: { row: number } } };

export const gameUpdater = (
  action: ServerAction,
  state: GameState
): GameState => {
  switch (action.type) {
    case "USER_ENTERED": {
      return {
        ...state,
        users: [...state.users, action.user],
        log: addLog(`user ${action.user.id} joined 🎉`, state.log),
      };
    }

    case "USER_EXIT": {
      return {
        ...state,
        users: state.users.filter((user) => user.id !== action.user.id),
        log: addLog(`user ${action.user.id} left 😢`, state.log),
      };
    }

    case "PIN_PLACED": {
      const { position, color } = action.payload;
      const board = produce(state.board, (board) => {
        board[position.row].state[position.column] = color;
      });
      return {
        ...state,
        board,
        log: addLog(
          `user ${action.user.id} placed ${color} on row ${position.row} column ${position.column}`,
          state.log
        ),
      };
    }

    case "GUESS": {
      const { position } = action.payload;
      return {
        ...state,
      };
    }
  }
};
