import usePartySocket from "partysocket/react";
import { useState } from "react";
import {
  CONNECTION_PARTY_NAME,
  CONNECTIONS_ROOM_ID,
  PARTY_HOST,
} from "../../party";

export const useLobbyCount = () => {
  const [rooms, setRooms] = useState<Record<string, number>>({});

  usePartySocket({
    host: PARTY_HOST,
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
