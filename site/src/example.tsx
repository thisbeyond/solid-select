import cc from "classcat";
import { highlight, highlightStyle } from "./highlighter";

export const Example = (props) => {
  return (
    <div>
      <h3 class="text-gray-800 text-3xl font-bold leading-none mb-3">
        {props.title}
      </h3>
      <div
        class={cc([
          "flex flex-wrap text-gray-800 gap-8",
          props.reverse && "flex-row-reverse",
        ])}
      >
        {props.children}
      </div>
    </div>
  );
};

export const ExampleCode = (props) => {
  const highlightedCode = props.code
    ? highlight(props.code)
    : highlightStyle(props.stylesheet);
  return (
    <div class={cc(["w-full lg:flex-1 lg:max-w-1/2", props.class])}>
      <pre
        class={
          "text-sm text-white bg-gray-800 rounded-lg p-6 " +
          "overflow-auto max-h-[80vh]"
        }
      >
        <code class="inline-block min-w-100" innerHTML={highlightedCode} />
      </pre>
    </div>
  );
};

export const ExampleDemo = (props) => {
  return (
    <div
      class={
        "w-full lg:flex-1 flex justify-center items-center gap-5 " +
        "border-3 border-dashed rounded-lg p-6 relative text-xl "
      }
    >
      {props.children}
    </div>
  );
};
