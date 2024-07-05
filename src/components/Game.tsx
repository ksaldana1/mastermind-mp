import { useGameRoom } from "@/hooks/useGameRoom";
import { Dispatch, useState } from "react";
import type { Board, GameAction, User, Results } from "../../game/logic";
import { Color, COLORS, RowState } from "../../game/logic";
import clsx from "clsx";

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
    <div className="flex justify-center gap-8">
      <PlayerList players={gameState.users} />
      <div className="flex flex-col gap-4 items-center justify-center h-full">
        <Board
          currentColor={currentColor}
          board={gameState.board}
          dispatch={dispatch}
        />
        <Picker setCurrentColor={setCurrentColor} currentColor={currentColor} />
      </div>
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
    <div className="flex flex-col gap-2">
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
  const disableGuess = !row.state.every((cell) => cell !== null);
  return (
    <div className="flex">
      {row.state.map((cell, i) => (
        <Cell
          key={i}
          color={cell ?? "white"}
          setColor={() =>
            dispatch({
              type: "PIN_PLACED",
              payload: {
                position: {
                  column: i,
                  row: index,
                },
                color: selectedColor,
              },
            })
          }
        />
      ))}
      {row.type === "UNLOCKED" ? (
        <button
          disabled={disableGuess}
          onClick={() =>
            dispatch({
              type: "GUESS",
              payload: { position: { row: index } },
            })
          }
          className={clsx(
            "bg-green-700 text-white font-bold py-2 px-4 rounded h-6 flex items-center ml-2",
            disableGuess && "opacity-50 cursor-not-allowed"
          )}
        >
          Guess
        </button>
      ) : (
        <Result results={row.results} />
      )}
    </div>
  );
}

function Result({ results }: { results: Results }) {
  return (
    <div className="flex items-center justify-center ms-2">
      {results.map((color, i) => (
        <div
          key={i}
          style={{ backgroundColor: color }}
          className="w-3 h-3 border-black border rounded-full"
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
  currentColor: Color;
}

function Picker({ setCurrentColor, currentColor }: PickerProps) {
  return (
    <div className="flex gap-1 h-8 cursor-pointer">
      {COLORS.map((color) => (
        <div
          key={color}
          className="w-8"
          onClick={() => setCurrentColor(color)}
          style={{ backgroundColor: color }}
        >
          <div className="text-white flex justify-center items-center mt-1">
            {currentColor === color && "X"}
          </div>
        </div>
      ))}
    </div>
  );
}

function PlayerList({ players }: { players: User[] }) {
  return (
    <div className="flex flex-col">
      <p className="font-semibold italic underline">Players</p>
      <ul>
        {players.map((player, i) => (
          <li key={`${player}-${i}`}>{player.id}</li>
        ))}
      </ul>
    </div>
  );
}
