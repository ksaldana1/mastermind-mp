import usePartySocket from "partysocket/react";
import { useState } from "react";

export const useLobbyCount = () => {
  const [rooms, setRooms] = useState<Record<string, number>>({});

  usePartySocket({
    host: process.env.NEXT_PUBLIC_SERVER_URL || "127.0.0.1:1999",
    party: "rooms",
    room: "active-connections",
    onMessage(event: MessageEvent<string>) {
      setRooms(JSON.parse(event.data));
    },
  });

  return {
    rooms,
  };
};
