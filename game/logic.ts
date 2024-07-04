// util for easy adding logs
const addLog = (message: string, logs: GameState["log"]): GameState["log"] => {
  return [{ dt: new Date().getTime(), message: message }, ...logs].slice(
    0,
    MAX_LOG_SIZE
  );
};

// If there is anything you want to track for a specific user, change this interface
export interface User {
  id: string;
}

// Do not change this! Every game has a list of users and log of actions
interface BaseGameState {
  users: User[];
  log: {
    dt: number;
    message: string;
  }[];
}

// Do not change!
export type Action = DefaultAction | GameAction;

// Do not change!
export type ServerAction = WithUser<DefaultAction> | WithUser<GameAction>;

// The maximum log size, change as needed
const MAX_LOG_SIZE = 4;

type WithUser<T> = T & { user: User };

export type DefaultAction = { type: "UserEntered" } | { type: "UserExit" };

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

export type RowState =
  | { type: "UNLOCKED"; state: Row }
  | { type: "LOCKED"; state: Code };

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
export interface GameState extends BaseGameState {
  target: number;
  board: Board;
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

// This is how a fresh new game starts out, it's a function so you can make it dynamic!
// In the case of the guesser game we start out with a random target
export const initialGame = (): GameState => ({
  users: [],
  target: Math.floor(Math.random() * 100),
  board: generateBoard(),
  log: addLog("Game Created!", []),
});

// Here are all the actions we can dispatch for a user
export type GameAction =
  | { type: "guess"; guess: number }
  | {
      type: "UPDATE_CELL";
      payload: {
        row: number;
        column: number;
        color: Color;
      };
    };

export const gameUpdater = (
  action: ServerAction,
  state: GameState
): GameState => {
  // This switch should have a case for every action type you add.

  // "UserEntered" & "UserExit" are defined by default

  // Every action has a user field that represent the user who dispatched the action,
  // you don't need to add this yourself
  console.log(state);
  switch (action.type) {
    case "UserEntered":
      return {
        ...state,
        users: [...state.users, action.user],
        log: addLog(`user ${action.user.id} joined 🎉`, state.log),
      };

    case "UserExit":
      return {
        ...state,
        users: state.users.filter((user) => user.id !== action.user.id),
        log: addLog(`user ${action.user.id} left 😢`, state.log),
      };

    case "guess":
      if (action.guess === state.target) {
        return {
          ...state,
          target: Math.floor(Math.random() * 100),
          log: addLog(
            `user ${action.user.id} guessed ${action.guess} and won! 👑`,
            state.log
          ),
        };
      } else {
        return {
          ...state,
          log: addLog(
            `user ${action.user.id} guessed ${action.guess}`,
            state.log
          ),
        };
      }
    case "UPDATE_CELL":
      return {
        ...state,
        board: state.board.with(action.payload.row, {
          type: "UNLOCKED",
          state: state.board[action.payload.row].state.with(
            action.payload.column,
            action.payload.color
          ) as Row,
        }) as Board,
      };
  }
};
