import { defineConfig } from "rollup-plugin-windicss";
import plugin from "windicss/plugin";

export default defineConfig({
  preflight: false,
  plugins: [
    plugin(({ addUtilities }) => {
      addUtilities({
        ".text-inherit": {
          font: "inherit",
        },
        ".outline-zero": {
          outline: "none",
        },
      });
    }),
    plugin(({ addVariant }) => {
      addVariant("data-focused", ({ modifySelectors }) => {
        return modifySelectors(({ className }) => {
          return `.${className}[data-focused="true"]`;
        });
      });
      addVariant("data-disabled", ({ modifySelectors }) => {
        return modifySelectors(({ className }) => {
          return `.${className}[data-disabled="true"]`;
        });
      });
      addVariant("data-has-value", ({ modifySelectors }) => {
        return modifySelectors(({ className }) => {
          return `.${className}[data-has-value="true"]`;
        });
      });
      addVariant("data-multiple", ({ modifySelectors }) => {
        return modifySelectors(({ className }) => {
          return `.${className}[data-multiple="true"]`;
        });
      });
    }),
  ],
  shortcuts: {
    "solid-select-container": "relative",
    "solid-select-control":
      "py-1 px-2 border border-gray-200 rounded leading-normal " +
      "focus-within:(outline-dotted-gray-300) grid grid-cols-1 " +
      "data-multiple:data-has-value:(flex flex-wrap items-stretch gap-1)",
    "solid-select-placeholder": "col-start-1 row-start-1 text-gray-400",
    "solid-select-single-value": "col-start-1 row-start-1",
    "solid-select-multi-value":
      "flex items-center rounded px-[4px] bg-gray-100 " +
      "text-[85%] leading-[inherit]",
    "solid-select-multi-value-remove": "px-1 hover:text-shadow-xl",
    "solid-select-input":
      "col-start-1 row-start-1 flex-1 bg-transparent outline-none m-0 p-0 " +
      "border-0 text-inherit read-only:cursor-default",
    "solid-select-list":
      "absolute min-w-full bg-[inherit] color-[inherit] shadow-lg " +
      "whitespace-nowrap rounded-sm mt-1 p-2 z-1",
    "solid-select-option":
      "px-4 py-2 cursor-default select-none " +
      "hover:bg-gray-200 data-focused:bg-gray-100 " +
      "data-disabled:(pointer-events-none text-gray-400)",
  },
});
