import { createSignal, createResource, getOwner, onCleanup } from "solid-js";

function createAsyncOptions<O>(
  fetcher: (inputValue: string) => Promise<O[]>,
  timeout = 250
){
  const [inputValue, setInputValue] = createSignal("");
  const throttledFetcher = throttle(fetcher, timeout);
  const [asyncOptions] = createResource(inputValue, throttledFetcher, {
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

const throttle = (
  callback: (...args: any[]) => Promise<unknown>,
  threshold: number
) => {
  let activePromise: Promise<unknown> | null = null,
    timeoutId: ReturnType<typeof setTimeout>,
    lastArgs: Parameters<typeof callback>;

  const wait = () =>
    new Promise((resolve) => (timeoutId = setTimeout(resolve, threshold)));

  const throttled: typeof callback = (...args) => {
    lastArgs = args;
    if (activePromise) return activePromise;
    activePromise = wait().then(() => {
      activePromise = null;
      return callback(...lastArgs);
    });

    return activePromise;
  };

  const clear = () => {
    clearTimeout(timeoutId);
    activePromise = null;
  };

  if (getOwner()) onCleanup(clear);

  return Object.assign(throttled, { clear });
};

export { createAsyncOptions };
