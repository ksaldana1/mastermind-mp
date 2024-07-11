import { useGameRoom } from "@/hooks/useGameRoom";
import { useControls } from "leva";
import { Suspense, useState } from "react";
import { Color } from "../../game/logic";
import { Canvas, useLoader } from "@react-three/fiber";
import { TextureLoader } from "three";
import { Stage, OrbitControls } from "@react-three/drei";

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
    <div style={{ height: "100%", width: "100%" }}>
      <Canvas>
        <Stage>
          <OrbitControls />
          <Suspense fallback={null}>
            {new Array(10).fill(true).map((_, i) => (
              <Row y={i} key={i} />
            ))}
          </Suspense>
        </Stage>
      </Canvas>
    </div>
  );
}

function Row({ y }: { y: number }) {
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
        return <Peg x={i} key={i} />;
      })}
    </group>
  );
}

function Peg({ x }: { x: number }) {
  const { rotation, radius, height } = useControls("peg", {
    rotation: 1.5,
    radius: {
      value: 0.05,
      step: 0.01,
    },
    height: {
      value: 0.12,
      step: 0.01,
    },
  });

  return (
    <mesh rotation-x={rotation} position-x={x * 0.25 - 0.38}>
      <cylinderGeometry args={[radius, radius, height, 32]} />
      <meshBasicMaterial color="black" />
    </mesh>
  );
}
