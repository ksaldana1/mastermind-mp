const addLog = (message: string, logs: GameState["log"]): GameState["log"] => {
  return [{ dt: new Date().getTime(), message: message }, ...logs].slice(
    0,
    MAX_LOG_SIZE
  );
};

export interface User {
  id: string;
}

interface BaseGameState {
  users: User[];
  log: {
    dt: number;
    message: string;
  }[];
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
export type GameAction = {
  type: "PIN_PLACED";
  payload: {
    position: {
      row: number;
      column: number;
    };
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
  switch (action.type) {
    case "USER_ENTERED":
      return {
        ...state,
        users: [...state.users, action.user],
        log: addLog(`user ${action.user.id} joined 🎉`, state.log),
      };

    case "USER_EXIT":
      return {
        ...state,
        users: state.users.filter((user) => user.id !== action.user.id),
        log: addLog(`user ${action.user.id} left 😢`, state.log),
      };

    case "PIN_PLACED":
      const { position, color } = action.payload;
      return {
        ...state,
        board: state.board.with(position.row, {
          type: "UNLOCKED",
          state: state.board[position.row].state.with(
            position.column,
            color
          ) as Row,
        }) as Board,
      };
  }
};
