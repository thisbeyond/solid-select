import { createSignal, createResource } from "solid-js";

import { Option } from "./create-select";

const createAsyncOptions = (
  fetcher: (inputValue: string) => Promise<Option[]>
) => {
  const [inputValue, setInputValue] = createSignal("");
  const [asyncOptions] = createResource(inputValue, fetcher, {
    initialValue: [],
  });

  return {
    get options() {
      return asyncOptions();
    },
    get loading() {
      return asyncOptions.loading;
    },
    onInput: setInputValue,
    readonly: false,
  };
};

export { createAsyncOptions };
