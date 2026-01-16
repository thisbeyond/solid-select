import "@fontsource/poppins/300.css";
import "@fontsource/poppins/400.css";
import "@fontsource/poppins/500.css";
import "@fontsource/poppins/700.css";
import "@fontsource/poppins/800.css";
import "@fontsource/poppins/900.css";
import "@fontsource/jetbrains-mono/400.css";

import { Component, lazy } from "solid-js";
import { Route } from "@solidjs/router";

import Home from "./pages/home";
const NotFoundPage = lazy(() => import("./errors/404"));

const Site: Component = () => {
  return (
    <>
      <Route path="/" component={Home}></Route>
      <Route path="/*all" component={NotFoundPage}></Route>
    </>
  );
};

export default Site;
