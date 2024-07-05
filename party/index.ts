import type * as Party from "partykit/server";

import {
  gameUpdater,
  initialGame,
  Action,
  ServerAction,
  generateCode,
  Code,
} from "../game/logic";
import { GameState } from "../game/logic";

export const CONNECTION_PARTY_NAME = "rooms";
export const CONNECTIONS_ROOM_ID = "active-connections";

export default class Server implements Party.Server {
  private gameState: GameState;
  private secret: Code;

  constructor(readonly room: Party.Room) {
    this.gameState = initialGame();
    this.secret = generateCode();
    console.log("Room created:", room.id);
  }

  async onConnect(connection: Party.Connection, _ctx: Party.ConnectionContext) {
    await this.updateConnections("connect", connection);
    this.gameState = gameUpdater(
      {
        type: "USER_ENTERED",
        user: { id: connection.id },
        secret: this.secret,
      },
      this.gameState
    );
    this.room.broadcast(JSON.stringify(this.gameState));
  }

  async onClose(connection: Party.Connection) {
    await this.updateConnections("disconnect", connection);
    this.gameState = gameUpdater(
      {
        type: "USER_EXIT",
        user: { id: connection.id },
        secret: this.secret,
      },
      this.gameState
    );
    this.room.broadcast(JSON.stringify(this.gameState));
  }

  onMessage(message: string, sender: Party.Connection) {
    const action: ServerAction = {
      ...(JSON.parse(message) as Action),
      user: { id: sender.id },
      secret: this.secret,
    };
    console.log(`Received action ${action.type} from user ${sender.id}`);
    this.gameState = gameUpdater(action, this.gameState);
    this.room.broadcast(JSON.stringify(this.gameState));
  }

  async updateConnections(
    type: "connect" | "disconnect",
    connection: Party.Connection
  ) {
    const connectionsParty = this.room.context.parties[CONNECTION_PARTY_NAME];
    const connectionsRoom = connectionsParty.get(CONNECTIONS_ROOM_ID);

    await connectionsRoom.fetch({
      method: "POST",
      body: JSON.stringify({
        type,
        connectionId: connection.id,
        roomId: this.room.id,
      }),
    });
  }
}

Server satisfies Party.Worker;
