import { Static, Type } from "@sinclair/typebox";
import { ProtocolHeader, createProtocol } from "../protocol";
import { StreamResponseDef } from "../stream-responses";
import { Client } from "../client";

export const Room = Type.Object({
  code: Type.String(),
  players: Type.Array(Type.String()),
  protocol: ProtocolHeader,
});
export type Room = Static<typeof Room>;

export const GatewayProtocol = createProtocol({
  header: {
    id: "gateway",
    version: "1.0.0",
  },
  actions: {
    $openRoom: {
      request: Type.Object({
        protocol: ProtocolHeader,
      }),
      response: Type.Union([
        StreamResponseDef.Ok(Type.Object({ room: Room })),
        StreamResponseDef.Custom("already-in-room"),
      ]),
    },
    $join: {
      request: Type.Object({
        code: Type.String(),
        name: Type.String(),
      }),
      response: Type.Union([
        StreamResponseDef.Ok(Type.Object({ room: Room })),
        StreamResponseDef.Custom("room-not-found"),
        StreamResponseDef.Custom("name-is-taken"),
        StreamResponseDef.Custom("name-is-invalid"),
        StreamResponseDef.Custom("already-in-room"),
      ]),
    },
    $leave: {
      request: Type.Object({}),
      response: Type.Union([
        StreamResponseDef.Ok(),
        StreamResponseDef.Custom("room-not-found"),
      ]),
    },
    $setProtocol: {
      request: ProtocolHeader,
      response: Type.Union([
        StreamResponseDef.Ok(),
        StreamResponseDef.Custom("room-not-found"),
        StreamResponseDef.Custom("not-authority"),
      ]),
    },
  },
  events: {
    $onPlayerJoined: {
      body: Type.Object({
        name: Type.String(),
      }),
    },
    $onPlayerLeft: {
      body: Type.Object({
        name: Type.String(),
      }),
    },
    $onRoomClose: {
      body: Type.Object({}),
    },
    $onProtocolChange: {
      body: ProtocolHeader,
    },
  },
});
export type GatewayProtocol = typeof GatewayProtocol;
export type GatewayClient = Client<GatewayProtocol>;
