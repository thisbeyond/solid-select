import withSolid from "rollup-preset-solid";
import WindiCSS from "rollup-plugin-windicss";
import css from "rollup-plugin-css-only";

export default withSolid({
  input: "src/index.tsx",
  plugins: [...WindiCSS(), css({ output: "style.css" })],
});
