import { Stream } from "@party-game-framework/common";
import { Observable } from "rxjs";

export class WebSocketStream extends Stream<string> {
  constructor(webSocket?: WebSocket) {
    super({
      input: new Observable((subscriber) => {
        if (!webSocket) {
          console.warn("WebSocketStream: No WebSocket provided");
          return;
        }
        console.log("WebSocketStream: Listening to WebSocket");

        webSocket.addEventListener("message", (event) =>
          subscriber.next(event.data)
        );
        webSocket.addEventListener("close", () => subscriber.complete());
        webSocket.addEventListener("error", (err) => subscriber.error(err));
      }),
      output: {
        next: (data) => webSocket?.send(data),
        complete: () => webSocket?.close(),
        error: (err) => webSocket?.close(1, err),
      },
    });
  }
}
