import { Select, createAsyncOptions } from "@thisbeyond/solid-select";

const fetchData = async (inputValue) => {
  return await new Promise((resolve) => {
    setTimeout(
      () =>
        resolve(
          ["apple", "banana", "pear", "pineapple", "kiwi"].filter((option) =>
            option.startsWith(inputValue)
          )
        ),
      500
    );
  });
};

export const AsyncFetchExample = () => {
  const props = createAsyncOptions(fetchData);
  return <Select {...props} />;
};
