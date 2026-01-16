import { Select } from "@thisbeyond/solid-select";
import { createSignal } from "solid-js";

export const FormatExample = () => {
  const options = [
    { name: "apple", label: "🍏 Apple" },
    { name: "banana", label: "🍌 Banana" },
    { name: "pear", label: "🍐 Pear" },
    { name: "pineapple", label: "🍍 Pineapple" },
    { name: "kiwi", label: "🥝 Kiwi" },
  ];

  const format = (item, type) => (type === "option" ? item.label : item.name);

  const [value, setValue] = createSignal(null);

  return (
    <div class="flex flex-1 flex-col max-w-100 gap-3">
      <Select options={options} format={format} onChange={setValue} />
      <div class="text-sm mt-2 bg-yellow-500/20 p-3">
        Value: {JSON.stringify(value())}
      </div>
    </div>
  );
};
