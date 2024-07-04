import { useGameRoom } from "@/hooks/useGameRoom";
import { Dispatch, useMemo, useState } from "react";
import type { Board, GameAction } from "../../game/logic";
import { Color, COLORS, RowState } from "../../game/logic";

/*
  Render a board - 4x10 - 2x2 grid next to each row for result comparison
  Render a piece picker - colors (red, yellow, green, blue, orange, purple)
  Generate a random sequence of colors at beginning of round

  Place a piece - with a chosen color place piece on a row
  Check guess once 4 selections made - compare with random guess
  Render the result comparison 

  Go to next row until no more guesses (10 total)
*/

interface GameProps {
  username: string;
  roomId: string;
}

export default function Game({ username, roomId }: GameProps) {
  const [currentColor, setCurrentColor] = useState<Color>("red");
  const { gameState, dispatch } = useGameRoom(username, roomId);

  if (!gameState) {
    return null;
  }

  return (
    <div className="flex flex-col gap-4 items-center justify-center h-full">
      <Board
        currentColor={currentColor}
        board={gameState.board}
        dispatch={dispatch}
      />
      <Picker setCurrentColor={setCurrentColor} />
      currentColor: {currentColor}
    </div>
  );
}

function Board({
  currentColor,
  board,
  dispatch,
}: {
  currentColor: Color;
  board: Board;
  dispatch: Dispatch<GameAction>;
}) {
  return (
    <div className="border-black border">
      {board.map((row, i) => (
        <Row
          key={i}
          index={i}
          row={row}
          selectedColor={currentColor}
          dispatch={dispatch}
        />
      ))}
    </div>
  );
}

function Row({
  selectedColor,
  row,
  index,
  dispatch,
}: {
  selectedColor: Color;
  dispatch: Dispatch<GameAction>;
  row: RowState;
  index: number;
}) {
  return (
    <div className="flex">
      {row.state.map((cell, i) => (
        <Cell
          key={i}
          color={cell ?? "white"}
          setColor={() =>
            dispatch({
              type: "UPDATE_CELL",
              payload: {
                color: selectedColor,
                column: i,
                row: index,
              },
            })
          }
        />
      ))}
    </div>
  );
}

function Cell({
  color,
  setColor,
}: {
  color: Color | "white";
  setColor: () => void;
}) {
  return (
    <div
      className="child h-6 w-24 border-black border"
      style={{ backgroundColor: color }}
      onClick={setColor}
    />
  );
}

interface PickerProps {
  setCurrentColor: (color: Color) => void;
}

function Picker({ setCurrentColor }: PickerProps) {
  return (
    <div style={{ height: 32, display: "flex", gap: "4px" }}>
      {COLORS.map((color) => (
        <div
          key={color}
          onClick={() => setCurrentColor(color)}
          style={{ minWidth: 32, backgroundColor: color }}
        ></div>
      ))}
    </div>
  );
}
