import { createSignal, createResource } from "solid-js";

import { RawOption } from "./create-select";

export const createAsyncOptions = (
  fetcher: (inputValue: string) => Promise<RawOption[]>
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

type variableArgumentLambda = (...args: any[]) => any;

/**
 * applies only the last call to lambda that occured within a interval of time [threshhold] in ms, or the first one if no one occured before, default threshold is 250ms, yields a function.
 */
function throttle(
  fn: variableArgumentLambda,
  threshhold: number = 250
): variableArgumentLambda {
  let last: any, deferTimer: any;
  return function (this: any) {
    const now = +new Date(),
      args = arguments as unknown as any[],
      ctx = this;
    if (last && now < last + threshhold) {
      // hold on to it
      clearTimeout(deferTimer);
      deferTimer = setTimeout(() => {
        last = now;
        fn.apply(ctx, args);
      }, threshhold);
    } else {
      last = now;
      fn.apply(ctx, args);
    }
  };
}

/**
 * creates a derivation from AsyncOptions that does not forward all consecutive input event to the fetcher lambda, but only those that occur outside of a specific time interval.
 * This helps to mitigate performance problems due to heavy I/O
 *
 * consider the following example of events [A..E]
 * A..100ms..B..150ms..C..300ms..D..50ms..E
 * with a default threshhold of 250ms only Event A..C..E are considered
 * @param fetcher
 * @param timeout
 * @returns
 */
export const createThrottledAsyncOptions = (
  fetcher: (inputValue: string) => Promise<RawOption[]>,
  timeout?: number
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
