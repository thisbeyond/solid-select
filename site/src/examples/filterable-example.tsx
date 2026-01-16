import { Select, createOptions } from "@thisbeyond/solid-select";

export const FilterableExample = () => {
  const props = createOptions(["apple", "banana", "pear", "pineapple", "kiwi"]);
  return <Select {...props} />;
};
