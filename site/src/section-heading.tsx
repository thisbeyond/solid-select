import cc from "classcat";

export function SectionHeading(props) {
  return (
    <>
      <h1
        class={cc([
          "w-full my-2 text-5xl font-bold leading-tight text-center",
          props.variant === "light" ? "text-white" : "text-gray-800 ",
        ])}
      >
        {props.children}
      </h1>
      <div class="w-full mb-12">
        <div
          class={cc([
            "h-1 mx-auto w-64 opacity-25 my-0 py-0 rounded-t",
            props.variant === "light" ? "bg-white" : "bg-gradient",
          ])}
        />
      </div>
    </>
  );
}
