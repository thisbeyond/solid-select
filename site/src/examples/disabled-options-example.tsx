import { Select } from "@thisbeyond/solid-select";

export const DisabledOptionsExample = () => (
  <Select
    options={["apple", "banana", "pear", "pineapple", "kiwi"]}
    isOptionDisabled={(option) => option === "pear"}
  />
);
