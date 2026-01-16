import { createSignal } from "solid-js";
import { Select, createOptions } from "@thisbeyond/solid-select";

export const RefFocusExample = () => {
  const [ref, setRef] = createSignal<HTMLInputElement | null>(null);
  return (
    <>
      <Select
        ref={setRef}
        {...createOptions(["apple", "banana", "pear", "pineapple", "kiwi"])}
      />
      <button
        class="primary-button"
        onMouseDown={(event) => event.preventDefault()}
        onClick={() => {
          const element = ref();
          if (element) {
            if (document.activeElement === element) {
              element.blur();
            } else {
              element.focus();
            }
          }
        }}
      >
        Toggle focus
      </button>
    </>
  );
};
