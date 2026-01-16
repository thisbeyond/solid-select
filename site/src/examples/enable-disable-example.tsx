import { Select } from "@thisbeyond/solid-select";
import { createSignal } from "solid-js";

export const EnableDisableExample = () => {
  const [disabled, setDisabled] = createSignal(false);
  return (
    <>
      <Select
        disabled={disabled()}
        options={["apple", "banana", "pear", "pineapple", "kiwi"]}
      />
      <label class="bg-transparent flex items-center gap-1">
        <input
          type="checkbox"
          onChange={(event) => setDisabled(event.currentTarget.checked)}
        />
        Disabled
      </label>
    </>
  );
};
