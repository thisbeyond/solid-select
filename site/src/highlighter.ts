import Prism from "prismjs";
import "prismjs/components/prism-jsx";
import "prismjs/components/prism-css";
import "prismjs/themes/prism-okaidia.css";

export const highlight = (code) =>
  Prism.highlight(code, Prism.languages.jsx, "jsx");

export const highlightStyle = (stylesheet) =>
  Prism.highlight(stylesheet, Prism.languages.css, "css");
