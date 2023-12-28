import {
  StreamResponseDef,
  createProtocol,
} from "@party-game-framework/common";
import { ChatMessage } from "./common";
import { Type } from "@sinclair/typebox";

export const FibbageProtocol = createProtocol({
  header: {
    id: "example",
    version: "1.0.0",
  },
  actions: {
    sendChatMessage: {
      request: Type.Omit(ChatMessage, ["name"]),
      response: Type.Union([
        StreamResponseDef.Ok(),
        StreamResponseDef.Custom("contains-bad-words"),
      ]),
    },
  },
  events: {
    onChatMessage: {
      body: ChatMessage,
    },
  },
});
export type FibbageProtocol = typeof FibbageProtocol;
