import { Select, createOptions } from "@thisbeyond/solid-select";

export const FilterableObjectsExample = () => {
  const props = createOptions(
    [
      { name: "apple" },
      { name: "banana" },
      { name: "pear" },
      { name: "pineapple" },
      { name: "kiwi" },
    ],
    { key: "name" }
  );
  return <Select {...props} />;
};
