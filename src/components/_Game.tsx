import "./App.css";
import { useMemo, useState } from "react";

/*
  Render a board - 4x10 - 2x2 grid next to each row for result comparison
  Render a piece picker - colors (red, yellow, green, blue, orange, purple)
  Generate a random sequence of colors at beginning of round

  Place a piece - with a chosen color place piece on a row
  Check guess once 4 selections made - compare with random guess
  Render the result comparison 

  Go to next row until no more guesses (10 total)
*/

const COLORS = ["red", "yellow", "green", "blue", "orange", "purple"] as const;
type Color = (typeof COLORS)[number];

const COLUMNS_COUNT = 4;
const ROWS_COUNT = 10;

function generateRandomSequence(): [Color, Color, Color, Color] {
  return new Array(COLUMNS_COUNT).fill(true).map(() => {
    const randomIndex = Math.floor(Math.random() * COLORS.length);
    return COLORS[randomIndex];
  }) as [Color, Color, Color, Color];
}

export default function App() {
  const [currentColor, setCurrentColor] = useState<Color>("red");
  const answer = useMemo(() => {
    return generateRandomSequence();
  }, []);

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "16px",
        alignItems: "center",
        justifyContent: "center",
        height: "100%",
      }}
    >
      <div>answer: {answer.join(" ")}</div>
      <Board currentColor={currentColor} />
      <Picker setCurrentColor={setCurrentColor} />
      currentColor: {currentColor}
    </div>
  );
}

function Board({ currentColor }: { currentColor: Color }) {
  return (
    <div className="parent">
      {new Array(ROWS_COUNT).fill(true).map((_, i) => (
        <Row key={i} selectedColor={currentColor} />
      ))}
    </div>
  );
}

type Row = [CellColor, CellColor, CellColor, CellColor];
type CellColor = Color | "white";

function Row({ selectedColor }: { selectedColor: Color }) {
  const [cells, setSelectedCells] = useState<Row>([
    "white",
    "white",
    "white",
    "white",
  ]);

  const setColor = (index: number) => {
    const copy = [...cells] as Row;
    // ['white', 'whte', 'white', 'white']
    copy[index] = selectedColor;
    setSelectedCells(copy);
  };

  return (
    <div className="row">
      {cells.map((_, i) => (
        <Cell key={i} color={cells[i]} setCurrentColor={() => setColor(i)} />
      ))}
    </div>
  );
}

function Cell({
  color,
  setCurrentColor,
}: {
  color: CellColor;
  setCurrentColor: () => void;
}) {
  return (
    <div
      className="child"
      style={{ backgroundColor: color }}
      onClick={setCurrentColor}
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
