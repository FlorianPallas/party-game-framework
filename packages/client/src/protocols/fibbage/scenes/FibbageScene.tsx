import { For, Show, VoidComponent } from "solid-js";
import { Gateway } from "../../../lib/gateway";
import { createFibbage } from "../logic";

const FibbageScene: VoidComponent<{ gateway: Gateway }> = (props) => {
  const state = createFibbage(props.gateway);

  let inputChat: HTMLInputElement | undefined = undefined;

  const sendMessage = async () => {
    if (!inputChat) {
      return;
    }
    state.sendMessage(inputChat.value);
    inputChat.value = "";
  };

  return (
    <>
      <p
        style={{
          "font-size": "100px",
          "font-weight": "bold",
          "font-family": "monospace",
          "margin-bottom": "0px",
        }}
      >
        {props.gateway.room()!.code}
      </p>
      <ul>
        <Show when={props.gateway.room()!.players.length === 0}>
          <li>No players</li>
        </Show>
        <For each={props.gateway.room()!.players}>
          {(player) => <li>{player}</li>}
        </For>
      </ul>
      <div>
        <For each={state.messages()}>
          {(message) => (
            <div>
              <b>{message.name}</b>: {message.message}
            </div>
          )}
        </For>
      </div>
      <input type="text" ref={inputChat} />
      <button onClick={sendMessage}>Send</button>
    </>
  );
};
export default FibbageScene;
