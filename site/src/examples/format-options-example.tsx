import { createSignal } from "solid-js";
import { Select, createOptions } from "@thisbeyond/solid-select";

export const FormatOptionsExample = () => {
  const [value, setValue] = createSignal(null);

  const format = (value, type, meta) => (
    <div class="flex items-center gap-2">
      {meta.prefix}
      <div>{value.icon}</div>
      <div>{meta.highlight ?? value.name}</div>
    </div>
  );

  const props = createOptions(
    [
      { name: "apple", icon: "🍏" },
      { name: "banana", icon: "🍌" },
      { name: "pear", icon: "🍐" },
      { name: "pineapple", icon: "🍍" },
      { name: "kiwi", icon: "🥝" },
    ],
    {
      format,
      extractText: (value) => value.name,
      createable: (inputValue) => ({ name: inputValue, icon: "🍇" }),
    },
  );

  return (
    <div class="flex flex-1 flex-col max-w-100 gap-3">
      <Select {...props} onChange={setValue} />
      <div class="text-sm mt-2 bg-yellow-500/20 p-3">
        Value: {JSON.stringify(value())}
      </div>
    </div>
  );
};
