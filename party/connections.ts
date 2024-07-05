import type * as Party from "partykit/server";

export default class Rooms implements Party.Server {
  connections: Record<string, number> = {};
  constructor(readonly room: Party.Room) {}

  async onConnect(connection: Party.Connection, _ctx: Party.ConnectionContext) {
    connection.send(JSON.stringify(this.connections));
  }

  async onRequest(request: Party.Request) {
    this.connections =
      this.connections ?? (await this.room.storage.get("connections")) ?? {};
    if (request.method === "POST") {
      const update = await request.json<{
        roomId: string;
        type: "connect" | "disconnect";
      }>();
      const count = this.connections[update.roomId] ?? 0;
      if (update.type === "connect")
        this.connections[update.roomId] = count + 1;
      if (update.type === "disconnect")
        this.connections[update.roomId] = Math.max(0, count - 1);

      this.room.broadcast(JSON.stringify(this.connections));
      await this.room.storage.put("connections", this.connections);
    }

    return new Response(JSON.stringify(this.connections));
  }
}
