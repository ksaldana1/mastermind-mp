import Game from "@/components/Game";
import Layout from "@/components/Layout";
import { useLobbyCount } from "@/hooks/useLobbyCount";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { z } from "zod";

const queryParamsValidator = z.object({
  username: z.string().min(1).optional(),
  roomId: z.string().min(1).optional(),
});

interface GameSetup {
  username: string | null;
  roomId: string | null;
}

export default function Home() {
  const router = useRouter();

  const [setup, setSetup] = useState<GameSetup>({
    username: (router.query.username as string) ?? null,
    roomId: (router.query.roomId as string) ?? null,
  });

  const { rooms } = useLobbyCount();

  // need this if we directly navigate to a lobby
  useEffect(() => {
    if (router.isReady) {
      const parsed = queryParamsValidator.safeParse(router.query);
      if (parsed.success) {
        setSetup(() => ({
          username: parsed.data.username ?? null,
          roomId: parsed.data.roomId ?? null,
        }));
      }
    }
  }, [router, setSetup]);

  const handleFormSubmit = (event?: React.FormEvent<HTMLFormElement>) => {
    event?.preventDefault();
    // @ts-ignore SO WHAT
    const roomId = event?.target[0].value;
    setSetup({ ...setup, roomId });
    router.push(
      {
        query: {
          username: setup.username,
          roomId,
        },
      },
      undefined,
      { shallow: true }
    );
  };

  if (!router.query.username) {
    return (
      <Layout>
        <div>
          <form
            className="flex flex-col gap-4"
            onSubmit={(e) => {
              e.preventDefault();
              router.push({
                query: {
                  username: setup.username,
                },
              });
            }}
          >
            <label
              className="text-stone-600 text-xs font-bold"
              htmlFor="username"
            >
              Username
            </label>
            <input
              type="text"
              value={setup.username || ""}
              onChange={(e) =>
                setSetup({ ...setup, username: e.currentTarget.value })
              }
              className="border border-black p-2"
              name="username"
              id="username"
            />
            <button className="rounded border p-5 bg-yellow-400 group text-black shadow hover:shadow-lg transition-all duration-200 hover:scale-125">
              <p className="font-bold hover:animate-wiggle">Set username</p>
            </button>
          </form>
        </div>
      </Layout>
    );
  }

  // Show the game after the user has picked a room and a username
  if (setup !== null && setup.roomId && setup.username) {
    return (
      <>
        <Layout>
          <Game roomId={setup.roomId} username={setup.username} />
          <div className="flex justify-end">
            <button
              onClick={() => {
                router.push({
                  pathname: "/",
                  query: {
                    username: setup.username,
                  },
                });
                setSetup({
                  username: null,
                  roomId: null,
                });
              }}
              className="bg-black rounded p-2 inline-block shadow text-xs text-stone-50 hover:animate-wiggle"
            >
              Leave Room
            </button>
          </div>
        </Layout>
      </>
    );
  }

  return (
    <Layout>
      <div>
        <form className="flex flex-col gap-4" onSubmit={handleFormSubmit}>
          <label className="text-stone-600 text-xs font-bold" htmlFor="roomid">
            RoomId
          </label>
          <input
            type="text"
            defaultValue={setup.roomId || ""}
            className="border border-black p-2"
            name="roomid"
            id="roomid"
          />
          <button className="rounded border p-5 bg-yellow-400 group text-black shadow hover:shadow-lg transition-all duration-200 hover:scale-125">
            <p className="font-bold hover:animate-wiggle">Create Lobby 🎉</p>
          </button>
        </form>
        <div className="mt-4">
          <div>Lobbies:</div>
          <ul className="flex flex-col gap-4">
            {Object.entries(rooms).map(([room, playerCount]) => {
              return (
                <li className="h-8 flex items-center gap-2" key={room}>
                  <div>
                    {room}: {playerCount}
                  </div>
                  <button
                    className="bg-green-700 hover:bg-green-900 text-white font-bold py-2 px-4 rounded h-8 flex items-center"
                    onClick={() => {
                      setSetup({ ...setup, roomId: room });
                      router.push(
                        {
                          query: {
                            username: setup.username,
                            roomId: room,
                          },
                        },
                        undefined,
                        { shallow: true }
                      );
                    }}
                  >
                    Join
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      </div>
    </Layout>
  );
}
