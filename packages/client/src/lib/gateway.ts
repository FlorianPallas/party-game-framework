import {
  Client,
  GatewayProtocol,
  Message,
  ProtocolHeader,
  Room,
} from "@party-game-framework/common";
import { createSignal, createMemo, onMount, onCleanup } from "solid-js";
import { WebSocketStream } from "./stream";

export const createGateway = (defaultUrl?: string) => {
  const [isAuthority, setIsAuthority] = createSignal(false);
  const [url, setUrl] = createSignal(defaultUrl);
  const [room, setRoom] = createSignal<Room>();

  const webSocket = createMemo(() => {
    return url() ? new WebSocket(url()!) : undefined;
  });

  const stream = createMemo(() =>
    new WebSocketStream(webSocket()).map({
      input: Message.parse,
      output: Message.stringify,
    })
  );

  const client = createMemo(() => {
    const client = new Client({
      channel: stream().output,
      protocol: GatewayProtocol,
      actionHandlers: {},
      eventHandlers: {
        $onPlayerJoined: async ({ body }) => {
          setRoom((room) => {
            if (!room) {
              return;
            }
            return {
              ...room,
              players: [...room.players, body.name],
            };
          });
        },
        $onPlayerLeft: async ({ body }) => {
          setRoom((room) => {
            if (!room) {
              return;
            }
            return {
              ...room,
              players: room.players.filter((player) => player !== body.name),
            };
          });
        },
        $onRoomClose: async () => {
          setRoom(undefined);
          alert("Room closed");
        },
      },
    });

    stream().input.subscribe((message) => client.consume(message));

    return client;
  });

  onMount(() => {
    // try to load from local storage
    const storedUrl = localStorage.getItem("gatewayUrl");
    if (storedUrl) {
      setUrl(storedUrl);
    }
  });

  onCleanup(() => {
    webSocket()?.close();
  });

  const setUrlPersist = (url: string, store: boolean = true) => {
    setUrl(url);
    if (store) {
      localStorage.setItem("gatewayUrl", url);
    }
  };

  const openRoom = async (protocol: ProtocolHeader) => {
    const response = await client().sendAction("$openRoom", { protocol });
    if (response.code !== "ok") {
      alert(`Error opening room: ${response.code}`);
      return;
    }
    setRoom(response.room);
    setIsAuthority(true);
  };

  const join = async (roomCode: string, name: string) => {
    const response = await client().sendAction("$join", {
      code: roomCode,
      name,
    });
    if (response.code !== "ok") {
      alert(`Error joining room: ${response.code}`);
      return;
    }
    setRoom(response.room);
  };

  return {
    stream,
    url,
    setUrl: setUrlPersist,
    openRoom,
    join,
    room,
    isAuthority,
  };
};
export type Gateway = ReturnType<typeof createGateway>;
