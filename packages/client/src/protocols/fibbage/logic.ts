import { StreamResponse, Client } from "@party-game-framework/common";
import { createSignal, createMemo } from "solid-js";
import { FibbageProtocol } from "./protocol";
import { ChatMessage } from "./common";
import { Gateway } from "../../lib/gateway";

export const createFibbage = (gateway: Gateway) => {
  const [messages, setMessages] = createSignal<ChatMessage[]>([]);

  const exampleClient = createMemo(() => {
    const client = new Client({
      channel: gateway.stream().output,
      protocol: FibbageProtocol,
      actionHandlers: {
        sendChatMessage: async ({ body, sender }) => {
          if (body.message.includes("shit")) {
            return StreamResponse.Custom("contains-bad-words");
          }

          client.sendEvent("onChatMessage", {
            message: body.message,
            name: sender.name ?? "???",
          });

          return StreamResponse.Ok();
        },
      },
      eventHandlers: {
        onChatMessage: async ({ body }) => {
          setMessages((messages) => [...messages, body]);
        },
      },
    });

    gateway.stream().input.subscribe((message) => client.consume(message));

    return client;
  });

  const sendMessage = async (message: string) => {
    const response = await exampleClient().sendAction("sendChatMessage", {
      message,
    });
    if (response.code !== "ok") {
      alert(`Error sending message: ${response.code}`);
      return;
    }
  };

  return {
    messages,
    sendMessage,
  };
};
