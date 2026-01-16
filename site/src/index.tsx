import "windi.css";
import { render } from "solid-js/web";
import { Router } from "@solidjs/router";

import Site from "./site";

render(
  () => (
    <Router>
      <Site />
    </Router>
  ),
  document.getElementById("root"),
);
