import { Select, createOptions } from "@thisbeyond/solid-select";

export const CreateableExample = () => {
  const props = createOptions(
    ["apple", "banana", "pear", "pineapple", "kiwi"],
    { createable: true }
  );
  return <Select {...props} />;
};
