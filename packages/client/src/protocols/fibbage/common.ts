import { Static, Type } from "@sinclair/typebox";

export const ChatMessage = Type.Object({
  name: Type.String(),
  message: Type.String(),
});
export type ChatMessage = Static<typeof ChatMessage>;
