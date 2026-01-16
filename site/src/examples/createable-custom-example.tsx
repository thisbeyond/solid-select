import { createSignal, createUniqueId } from "solid-js";
import { Select, createOptions } from "@thisbeyond/solid-select";

export const CreateableCustomExample = () => {
  const createValue = (name) => {
    return { id: createUniqueId(), name };
  };

  const [options, setOptions] = createSignal([
    createValue("apple"),
    createValue("banana"),
  ]);

  const available = ["pear", "pineapple", "kiwi"];

  const createable = (inputValue, exists, currentOptions) => {
    if (exists) return;

    const addable = available.filter((entry) => entry.startsWith(inputValue));

    if (!currentOptions.length && !addable.length) {
      // Return all remaining available options if no options matched.
      return available.map((entry) => createValue(entry));
    } else {
      return addable.map((entry) => createValue(entry));
    }
  };

  const props = createOptions(options, {
    key: "name",
    createable: createable,
  });
  return (
    <Select
      {...props}
      onChange={(value) => {
        if (!options().includes(value)) {
          setOptions([...options(), value]);
          const index = available.indexOf(value.name);
          if (index !== -1) {
            available.splice(index, 1);
          }
        }
      }}
    />
  );
};
