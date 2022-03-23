import fs from "fs";
import withSolid from "rollup-preset-solid";
import WindiCSS from "rollup-plugin-windicss";
import css from "rollup-plugin-css-only";

const stripWindiCSSImport = () => {
  return {
    name: "strip-windi-css-import",
    generateBundle() {
      const path = fs.realpathSync("./dist/source/index.jsx");
      const data = fs.readFileSync(path, { encoding: "utf8" });
      const transformed = data.replace(/^import "virtual:windi.css";/, "");
      fs.writeFileSync(path, transformed);
    },
  };
};

export default withSolid({
  input: "src/index.tsx",
  plugins: [...WindiCSS(), css({ output: "style.css" }), stripWindiCSSImport()],
});
