import type * as Party from "partykit/server";

import { gameUpdater, initialGame, Action, ServerAction } from "../game/logic";
import { GameState } from "../game/logic";

export const CONNECTION_PARTY_NAME = "rooms";
export const CONNECTIONS_ROOM_ID = "active-connections";

export default class Server implements Party.Server {
  private gameState: GameState;

  constructor(readonly room: Party.Room) {
    this.gameState = initialGame();
    console.log("Room created:", room.id);
  }
  async onConnect(connection: Party.Connection, _ctx: Party.ConnectionContext) {
    await this.updateConnections("connect", connection);
    this.gameState = gameUpdater(
      { type: "USER_ENTERED", user: { id: connection.id } },
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
      },
      this.gameState
    );
    this.room.broadcast(JSON.stringify(this.gameState));
  }
  onMessage(message: string, sender: Party.Connection) {
    const action: ServerAction = {
      ...(JSON.parse(message) as Action),
      user: { id: sender.id },
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
