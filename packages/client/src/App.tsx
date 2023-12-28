import "./App.css";
import { Match, Show, Switch } from "solid-js";
import { createGateway } from "./lib/gateway";
import { FibbageProtocol } from "./protocols/fibbage/protocol";
import FibbageScene from "./protocols/fibbage/scenes/FibbageScene";
import FallbackScene from "./protocols/fallback/scenes/FallbackScene";

const App = () => {
  const gateway = createGateway();

  let inputRoomCode: HTMLInputElement | undefined = undefined;
  let inputName: HTMLInputElement | undefined = undefined;
  let inputGateway: HTMLInputElement | undefined = undefined;

  const createRoom = async () => {
    gateway.openRoom(FibbageProtocol.header); // TODO: let the user choose the protocol
  };

  const join = async () => {
    const roomCode = inputRoomCode?.value;
    const name = inputName?.value;
    if (!roomCode || !name) {
      alert("Please enter a code and name");
      return;
    }
    gateway.join(roomCode, name);
  };

  return (
    <>
      <Show when={!gateway.url()}>
        <input type="text" ref={inputGateway} value={"ws://localhost:8080"} />
        <button
          onClick={() => {
            const gatewayUrl = inputGateway?.value ?? undefined;
            if (!gatewayUrl) {
              alert("Please enter a gateway URL");
              return;
            }
            gateway.setUrl(gatewayUrl);
            console.info("Using gateway", gatewayUrl);
            localStorage.setItem("gatewayUrl", gatewayUrl);
          }}
        >
          Connect
        </button>
      </Show>
      <div style={{ display: "flex", "flex-flow": "column", gap: "10px" }}>
        <Show when={!gateway.room()}>
          <label>Room Code:</label>
          <input type="text" ref={inputRoomCode} />
          <label>Name:</label>
          <input type="text" ref={inputName} />
          <br />
          <div style={{ display: "flex", gap: "10px" }}>
            <button onClick={createRoom}>Create Room</button>
            <button onClick={join}>Join Room</button>
          </div>
        </Show>
      </div>
      <Show when={gateway.room()}>
        {(room) => (
          <Switch fallback={<FallbackScene gateway={gateway} />}>
            <Match when={room().protocol.id === FibbageProtocol.header.id}>
              <FibbageScene gateway={gateway} />
            </Match>
          </Switch>
        )}
      </Show>
    </>
  );
};

export default App;
