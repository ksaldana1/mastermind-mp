import type * as Party from "partykit/server";

export default class Rooms implements Party.Server {
  connections: Record<string, number> = {};
  constructor(readonly room: Party.Room) {}

  async onRequest(request: Party.Request) {
    // read from storage
    this.connections =
      this.connections ?? (await this.room.storage.get("connections")) ?? {};
    // update connection count
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

      // notify any connected listeners
      this.room.broadcast(JSON.stringify(this.connections));

      // save to storage
      await this.room.storage.put("connections", this.connections);
    }

    // send connection counts to requester
    return new Response(JSON.stringify(this.connections));
  }
}
