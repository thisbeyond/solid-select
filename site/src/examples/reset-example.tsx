import { createSignal } from "solid-js";
import { Select } from "@thisbeyond/solid-select";

export const ResetExample = () => {
  const [initialValue, setInitialValue] = createSignal(null, { equals: false });
  return (
    <>
      <Select
        initialValue={initialValue()}
        options={["apple", "banana", "pear", "pineapple", "kiwi"]}
      />
      <button class="primary-button" onClick={() => setInitialValue(null)}>
        Reset
      </button>
    </>
  );
};
