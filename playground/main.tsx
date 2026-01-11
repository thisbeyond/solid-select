import { render } from "solid-js/web";
import { Select } from "@thisbeyond/solid-select";
import "../public/style.css";

const App = () => {
  return (
    <div>
      <h1>Solid Select Playground</h1>
      <Select
        options={["Apple", "Banana", "Cherry"]}
        placeholder="Choose a fruit..."
      />
    </div>
  );
};

render(() => <App />, document.getElementById("root")!);
