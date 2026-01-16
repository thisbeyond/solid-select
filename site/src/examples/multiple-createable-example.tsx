import { Select, createOptions } from "@thisbeyond/solid-select";

export const MultipleCreateableExample = () => {
  const props = createOptions(
    ["apple", "banana", "pear", "pineapple", "kiwi"],
    {
      createable: true,
    }
  );
  return <Select multiple {...props} />;
};
