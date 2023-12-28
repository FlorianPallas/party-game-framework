import { Stream } from "@party-game-framework/common";
import { Observable } from "rxjs";
import { WebSocket } from "ws";

export class WebSocketStream extends Stream<string> {
  constructor(webSocket: WebSocket) {
    super({
      input: new Observable((subscriber) => {
        webSocket.on("message", (data) => subscriber.next(data.toString()));
        webSocket.on("close", () => subscriber.complete());
        webSocket.on("error", (err) => subscriber.error(err));
      }),
      output: {
        next: (data) => webSocket.send(data),
        complete: () => webSocket.close(),
        error: (err) => webSocket.close(1, err),
      },
    });
  }
}
