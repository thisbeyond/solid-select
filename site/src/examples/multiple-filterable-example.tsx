import { Select, createOptions } from "@thisbeyond/solid-select";

export const MultipleFilterableExample = () => {
  const props = createOptions(["apple", "banana", "pear", "pineapple", "kiwi"]);
  return <Select multiple {...props} />;
};
