import { VoidComponent } from "solid-js";
import { Gateway } from "../../../lib/gateway";

const FallbackScene: VoidComponent<{ gateway: Gateway }> = (props) => {
  return (
    <div>
      <p>This protocol is not supported by your client</p>
      <p>
        {props.gateway.room()?.protocol.id}@
        {props.gateway.room()?.protocol.version}
      </p>
    </div>
  );
};
export default FallbackScene;
