export type ActionRequest<T = unknown> = {
  kind: "request";
  type: string;
  requestId: string;
  sender: { id: string; name?: string };
  body: T;
};

export type ActionResponse<T = unknown> = {
  kind: "response";
  recipientId: string;
  requestId: string;
  body: T;
};

export type ActionEvent<T = unknown> = {
  kind: "event";
  type: string;
  body: T;
};

export type Message = ActionRequest | ActionResponse | ActionEvent;

export const Message = {
  parse: (data: string) => JSON.parse(data) as Message,
  stringify: (data: Message) => JSON.stringify(data),

  isRequest: (message: Message): message is ActionRequest =>
    message.kind === "request",
  isResponse: (message: Message): message is ActionResponse =>
    message.kind === "response",
  isEvent: (message: Message): message is ActionEvent =>
    message.kind === "event",

  fold:
    <T>(handlers: {
      request: (request: ActionRequest) => T;
      response: (response: ActionResponse) => T;
      event: (event: ActionEvent) => T;
    }) =>
    (message: Message) => {
      switch (message.kind) {
        case "request":
          return handlers.request(message);
        case "response":
          return handlers.response(message);
        case "event":
          return handlers.event(message);
      }
    },
};
