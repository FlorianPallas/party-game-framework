import { Protocol } from "./protocol";
import { Static } from "@sinclair/typebox";
import { v4 as uuid } from "uuid";
import { Observer } from "rxjs";
import { Consumer } from "./consumer";
import { ActionEvent, Message, ActionRequest } from ".";
import { ActionResponse } from "./message";

export class Client<P extends Protocol> implements Consumer<Message> {
  private readonly callbacks = new Map<string, (data: any) => void>();

  constructor(
    private options: {
      protocol: P;
      channel: Observer<Message>;
      actionHandlers: {
        [K in keyof P["actions"]]?: (
          request: ActionRequest<Static<P["actions"][K]["request"]>>
        ) => Promise<Static<P["actions"][K]["response"]>>;
      };
      eventHandlers: {
        [K in keyof P["events"]]?: (
          event: ActionEvent<Static<P["events"][K]["body"]>>
        ) => void;
      };
    }
  ) {}

  consume(message: Message) {
    return Message.fold({
      request: this.onRequest.bind(this),
      response: this.onResponse.bind(this),
      event: this.onEvent.bind(this),
    })(message);
  }

  private onRequest(request: ActionRequest): boolean {
    const action = this.options.protocol.actions[request.type];
    if (!action) {
      return false;
    }

    const handler = this.options.actionHandlers[request.type];
    if (!handler) {
      return false;
    }

    handler(request).then((response) => {
      if (!action.response || !request.requestId) {
        // If the action has no response, don't send one
        return true;
      }
      this.options.channel.next({
        kind: "response",
        recipientId: request.sender.id,
        requestId: request.requestId,
        body: response,
      });
    });
    return true;
  }

  private onEvent(event: ActionEvent): boolean {
    const schema = this.options.protocol.events[event.type];
    if (!schema) {
      return false;
    }

    // TODO: Validate event body
    const handler = this.options.eventHandlers[event.type];
    if (!handler) {
      return false;
    }

    handler(event);
    return true;
  }

  private onResponse(response: ActionResponse): boolean {
    const callback = this.callbacks.get(response.requestId);
    if (!callback) {
      return false;
    }
    callback(response.body);
    return true;
  }

  sendAction<T extends keyof P["actions"]>(
    type: T,
    body: Static<P["actions"][T]["request"]>
  ) {
    return new Promise<Static<P["actions"][T]["response"]>>((resolve) => {
      const requestId = uuid();
      this.callbacks.set(requestId, resolve);
      this.options.channel.next({
        kind: "request",
        type: type.toString(),
        body,
        requestId,
        sender: { id: "", name: "" }, // the sender is populated by the gateway server
      });
    });
  }

  sendEvent<T extends keyof P["events"]>(
    type: T,
    body: Static<P["events"][T]["body"]>
  ) {
    this.options.channel.next({
      kind: "event",
      type: type.toString(),
      body,
    });
  }
}
