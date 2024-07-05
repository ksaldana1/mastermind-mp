import usePartySocket from "partysocket/react";
import { useState } from "react";
import { CONNECTION_PARTY_NAME, CONNECTIONS_ROOM_ID } from "../../party";

export const useLobbyCount = () => {
  const [rooms, setRooms] = useState<Record<string, number>>({});

  usePartySocket({
    host: process.env.NEXT_PUBLIC_SERVER_URL || "127.0.0.1:1999",
    party: CONNECTION_PARTY_NAME,
    room: CONNECTIONS_ROOM_ID,
    onMessage(event: MessageEvent<string>) {
      setRooms(JSON.parse(event.data));
    },
  });

  return {
    rooms,
  };
};
