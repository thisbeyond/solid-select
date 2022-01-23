import { defineConfig } from "rollup-plugin-windicss";
import plugin from "windicss/plugin";

export default defineConfig({
  preflight: false,
  plugins: [
    plugin(({ addVariant }) => {
      addVariant("data-is-focused", ({ modifySelectors }) => {
        return modifySelectors(({ className }) => {
          return `.${className}[data-is-focused="true"]`;
        });
      });
      addVariant("data-has-no-value", ({ modifySelectors }) => {
        return modifySelectors(({ className }) => {
          return `.${className}[data-has-value="false"]`;
        });
      });
    }),
  ],
  shortcuts: {
    "solid-select-container": "relative",
    "solid-select-control":
      "grid grid-cols-1 py-1 px-2 border border-gray-200 rounded " +
      "focus-within:(outline-dotted-gray-300)",
    "solid-select-value":
      "col-start-1 row-start-1 data-has-no-value:text-gray-400",
    "solid-select-input":
      "col-start-1 row-start-1 bg-transparent w-full outline-none",
    "solid-select-list":
      "absolute min-w-full bg-[inherit] color-[inherit] shadow-lg " +
      "whitespace-nowrap rounded-sm mt-1 p-2 z-1",
    "solid-select-option":
      "px-4 py-2 cursor-point hover:bg-gray-200 data-is-focused:bg-gray-100",
  },
});
