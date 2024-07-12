import { useGameRoom } from "@/hooks/useGameRoom";
import { useControls } from "leva";
import { Dispatch, Suspense, useState } from "react";
import { Action, Color, COLORS, GameState, ROWS_COUNT } from "../../game/logic";
import { Canvas, useLoader } from "@react-three/fiber";
import { FrontSide, TextureLoader } from "three";
import { Stage, OrbitControls } from "@react-three/drei";

interface GameProps {
  username: string;
  roomId: string;
}

export default function Game({ username, roomId }: GameProps) {
  const [currentColor, setCurrentColor] = useState<Color>("red");

  const { gameState, dispatch } = useGameRoom(username, roomId);

  const { rotation, position } = useControls("board", {
    rotation: {
      x: -0.2,
      y: 0,
      z: 0,
    },
    position: {
      x: 0,
      y: 0,
      z: 0,
    },
  });

  if (!gameState) {
    return null;
  }

  return (
    <div style={{ height: "100%", width: "100%" }}>
      <Canvas>
        <Stage>
          <OrbitControls />
          <Suspense fallback={null}>
            <group
              position={[position.x, position.y, position.z]}
              rotation={[rotation.x, rotation.y, rotation.z]}
            >
              {new Array(ROWS_COUNT).fill(true).map((_, i) => (
                <Row
                  y={i}
                  key={i}
                  dispatch={dispatch}
                  color={currentColor}
                  gameState={gameState}
                />
              ))}
              <ColorPicker onClick={(color: Color) => setCurrentColor(color)} />
            </group>
          </Suspense>
        </Stage>
      </Canvas>
    </div>
  );
}

function Row({
  y,
  dispatch,
  color,
  gameState,
}: {
  y: number;
  dispatch: Dispatch<Action>;
  color: Color;
  gameState: GameState;
}) {
  const colorMap = useLoader(TextureLoader, "Wood/Wood092_1K-JPG_Color.jpg");
  const { width, height, depth } = useControls("row", {
    height: {
      value: 0.2,
      step: 0.01,
    },
    width: {
      value: 1.05,
      step: 0.01,
    },
    depth: {
      value: 0.1,
      step: 0.01,
    },
  });

  return (
    <group position-y={y * 0.2}>
      <mesh>
        <boxGeometry args={[width, height, depth]} />
        <meshBasicMaterial map={colorMap} />
      </mesh>
      {new Array(4).fill(true).map((_, i) => {
        return (
          <Peg
            x={i}
            key={i}
            color={gameState?.board?.at(y)?.state.at(i) || null}
            onClick={() => {
              dispatch({
                type: "PIN_PLACED",
                payload: {
                  color,
                  position: {
                    column: i,
                    row: y,
                  },
                },
              });
            }}
          />
        );
      })}
    </group>
  );
}

function Peg({
  x,
  onClick,
  color,
}: {
  x: number;
  onClick: () => void;
  color: Color | null;
}) {
  const { rotation, radius, height, position } = useControls("peg", {
    rotation: 1.5,
    radius: {
      value: 0.05,
      step: 0.01,
    },
    height: {
      value: 0.01,
      step: 0.01,
    },
    position: {
      x: 0,
      y: 0,
      z: 0.05,
    },
  });

  return (
    <mesh
      onClick={onClick}
      rotation-x={rotation}
      position-x={x * 0.25 - 0.38}
      position-z={position.z}
      position-y={position.y}
    >
      <cylinderGeometry args={[radius, radius, height, 32]} />
      <meshBasicMaterial side={FrontSide} color={color ?? "black"} />
    </mesh>
  );
}

function ColorPicker({ onClick }: { onClick: (color: Color) => void }) {
  const { rotation, radius, height, position } = useControls("picker", {
    rotation: {
      x: 1.5,
      y: 0,
      z: 0,
    },
    radius: {
      value: 0.05,
      step: 0.01,
    },
    height: {
      value: 0.02,
      step: 0.01,
    },
    position: {
      x: -0.7,
      y: 0,
    },
  });
  return (
    <group>
      {COLORS.map((color, i) => {
        return (
          <mesh
            position={[position.x, 0.25 * i, 0]}
            rotation={[rotation.x, rotation.y, rotation.z]}
            key={color}
            onClick={() => onClick(color)}
          >
            <cylinderGeometry args={[radius, radius, height]} />
            <meshStandardMaterial color={color} />
          </mesh>
        );
      })}
    </group>
  );
}
