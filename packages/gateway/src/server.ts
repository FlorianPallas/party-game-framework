import { WebSocketServer } from "ws";
import {
  Client,
  GatewayClient,
  GatewayProtocol,
  Message,
  ProtocolHeader,
  Stream,
  ActionResponse,
} from "@party-game-framework/common";
import { WebSocketStream } from "./stream";
import { v4 as uuid } from "uuid";

const wss = new WebSocketServer({ port: 8080 });

type Peer = {
  id: string;
  stream: Stream<Message>;
  client: GatewayClient;
};

type Room = {
  code: string;
  authorityId: string;
  protocol: ProtocolHeader;
  players: Map<string, string>;
};

const rooms: Room[] = [];
const peers: Peer[] = [];

function findRoomByCode(code: string) {
  return rooms.find((room) => room.code === code.toUpperCase());
}

function findPeerById(id: string) {
  return peers.find((peer) => peer.id === id);
}

function findRoomByPeerId(id: string) {
  return rooms.find((room) => room.players.has(id) || room.authorityId === id);
}

function broadcast(
  room: Room,
  fn: (peer: Peer, sender: string | undefined) => void
) {
  [...room.players.keys()]
    .concat(room.authorityId)
    .map((peerId) => findPeerById(peerId))
    .forEach((peer) => peer && fn(peer, room.players.get(peer.id)));
}

wss.on("connection", (ws) => {
  const id = uuid();

  const stream = new WebSocketStream(ws).map({
    input: Message.parse,
    output: Message.stringify,
  });

  const client = new Client({
    channel: stream.output,
    protocol: GatewayProtocol,
    actionHandlers: {
      $openRoom: async ({ body }) => {
        const self = findPeerById(id)!;

        const room: Room = {
          code: generateUniqueRoomCode(),
          players: new Map(),
          authorityId: self.id,
          protocol: body.protocol,
        };
        rooms.push(room);

        return ActionResponse.Ok({
          room: {
            code: room.code,
            protocol: room.protocol,
            players: [...room.players.values()],
          },
        });
      },
      $join: async ({ body }) => {
        const self = findPeerById(id)!;

        const room = findRoomByCode(body.code);
        if (!room) {
          return ActionResponse.Custom("room-not-found");
        }

        const name = body.name.trim().toUpperCase();

        if (room.players.has(peer.id)) {
          return ActionResponse.Custom("already-in-room");
        }

        if (name.length < 1) {
          return ActionResponse.Custom("name-is-invalid");
        }

        if ([...room.players.values()].includes(name)) {
          return ActionResponse.Custom("name-is-taken");
        }

        room.players.set(self.id, name);
        broadcast(room, (peer) =>
          peer.client.sendEvent("$onPlayerJoined", { name })
        );

        return ActionResponse.Ok({
          room: {
            code: room.code,
            protocol: room.protocol,
            players: [...room.players.values()],
          },
        });
      },
      $setProtocol: async ({ body }) => {
        const self = findPeerById(id)!;

        const room = findRoomByPeerId(self.id);
        if (!room) {
          return ActionResponse.Custom("room-not-found");
        }

        if (room.authorityId !== self.id) {
          return ActionResponse.Custom("not-authority");
        }

        room.protocol = body;
        broadcast(room, (peer) =>
          peer.client.sendEvent("$onProtocolChange", body)
        );

        return ActionResponse.Ok();
      },
    },
    eventHandlers: {},
  });

  const peer: Peer = { id, stream, client };
  peers.push(peer);
  console.log("peer connected", peer.id);

  stream.input.subscribe((message) => {
    const wasConsumed = client.consume(message);
    if (wasConsumed) {
      return;
    }

    // proxy all other messages to the room or authority

    const self = findPeerById(id)!;
    const room = findRoomByPeerId(self.id);

    if (!room) {
      // ignore messages sent by peers not in a room
      console.warn("peer not in room", self.id);
      return;
    }

    Message.fold({
      request: (request) => {
        // requests are always directed to the authority
        findPeerById(room.authorityId)?.stream.output.next({
          ...request,
          // populate sender
          sender: {
            id: self.id,
            name: room.players.get(self.id),
          },
        });
      },
      response: (response) => {
        // responses are always directed to the sender of the request
        console.log("sending response to original sender", response);
        findPeerById(response.recipientId)?.stream.output.next(response);
      },
      event: (event) => {
        // events are always directed to all peers
        console.log("sending event to all peers", event);
        broadcast(room, (peer) => peer.stream.output.next(event));
      },
    })(message);
  });

  ws.on("error", (err) => {
    console.log("peer error", err);
  });

  ws.on("close", () => {
    console.log("peer disconnected", peer.id);
    const self = findPeerById(id)!;
    const room = findRoomByPeerId(self.id);
    if (room) {
      room.players.delete(self.id);
      broadcast(room, (peer) =>
        peer.client.sendEvent("$onPlayerLeft", { name: self.id })
      );
    }
    peers.splice(peers.indexOf(peer), 1);
  });
});

wss.on("listening", () => {
  console.info("Listening on port 8080");
});

const generateUniqueRoomCode = () => {
  const ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  const LENGTH = 4;

  let code: string;
  do {
    code = "";
    for (let i = 0; i < LENGTH; i++) {
      code += ALPHABET[Math.floor(Math.random() * ALPHABET.length)];
    }
  } while (rooms.find((room) => room.code === code));
  return code;
};
