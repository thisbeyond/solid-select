import { For, JSX, createSignal, createUniqueId } from "solid-js";

import {
  CreateOptionsFormatFunction,
  Select,
  createOptions,
  fuzzyHighlight,
  fuzzySort,
} from "@thisbeyond/solid-select";

export const KitchenSinkExample = () => {
  const createValue = (name, icon) => {
    return { id: createUniqueId(), name, icon };
  };

  const candidates = [
    createValue("apple", "🍏"),
    createValue("banana", "🍌"),
    createValue("pear", "🍐"),
    createValue("pineapple", "🍍"),
    createValue("kiwi", "🥝"),
  ];

  const initialValue = [candidates[2]];

  const [options, setOptions] = createSignal(candidates);
  const [selectedValues, setSelectedValues] = createSignal(initialValue);

  const onChange = (selected) => {
    setSelectedValues(selected);

    const lastValue = selected[selected.length - 1];
    if (lastValue && !options().includes(lastValue)) {
      setOptions([...options(), lastValue]);
    }
  };

  const format = (value, type, meta) => (
    <div class="flex items-center gap-1">
      <span>{meta.highlight ?? value.name}</span>
      {value.icon}
    </div>
  );

  const filterable = (inputValue, options) => {
    return fuzzySort(inputValue, options, "text").map((result) => ({
      ...result.item,
      label: format(result.item.value, "label", {
        highlight: fuzzyHighlight(result, (match: string) => <b>{match}</b>),
      }),
    }));
  };

  const createable = (inputValue, exists) => {
    if (exists) return;
    const name = inputValue.toLowerCase();
    if (name != "grapes") return;
    return createValue(name, "🍇");
  };

  const extractText = (value) => value.name;

  const disable = (value) => selectedValues().includes(value);

  const props = createOptions(options, {
    format,
    filterable,
    createable,
    extractText,
    disable,
  });

  const emptyPlaceholder = () =>
    options().some((option) => option.name === "grapes")
      ? "No more options"
      : "Try 'grapes'!";

  return (
    <div class="flex flex-1 flex-col max-w-100 gap-3">
      <Select
        multiple
        initialValue={selectedValues()}
        onChange={onChange}
        emptyPlaceholder={emptyPlaceholder()}
        {...props}
      />
      <div class="flex gap-3 text-sm items-center">
        Quick pick:
        <For
          each={options()
            .filter((option) => !selectedValues().includes(option))
            .slice(0, 3)}
        >
          {(option) => (
            <button
              class="bg-blue-500 text-white px-2 py-1 rounded"
              onClick={() => setSelectedValues([...selectedValues(), option])}
            >
              {option.name}
            </button>
          )}
        </For>
      </div>
      <div class="text-sm mt-2 bg-yellow-500/20 p-3">
        Selected values:
        <br />
        {JSON.stringify(selectedValues())}
      </div>
    </div>
  );
};
