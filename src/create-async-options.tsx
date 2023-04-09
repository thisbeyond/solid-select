import { createSignal, createResource, getOwner, onCleanup } from "solid-js";

import { Option } from "./create-select";

const createAsyncOptions = (
  fetcher: (inputValue: string) => Promise<Option[]>,
  timeout = 250
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
    onInput: throttle(setInputValue, timeout),
    readonly: false,
  };
};

// From https://github.com/solidjs-community/solid-primitives/blob/main/packages/scheduled/LICENSE
const throttle = (callback: (...args: any) => any, threshold = 250) => {
  let isThrottled = false,
    timeoutId: ReturnType<typeof setTimeout>,
    lastArgs: Parameters<typeof callback>;

  const throttled: typeof callback = (...args) => {
    lastArgs = args;
    if (isThrottled) return;
    isThrottled = true;
    timeoutId = setTimeout(() => {
      callback(...lastArgs);
      isThrottled = false;
    }, threshold);
  };

  const clear = () => {
    clearTimeout(timeoutId);
    isThrottled = false;
  };

  if (getOwner()) onCleanup(clear);

  return Object.assign(throttled, { clear });
};

export { createAsyncOptions };
