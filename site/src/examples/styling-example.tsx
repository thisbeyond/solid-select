import { Select } from "@thisbeyond/solid-select";

// Import default styles. (All examples use this via a global import)
import "@thisbeyond/solid-select/style.css";

// Apply custom styling. See stylesheet below.
import "./styling-example.css";

export const StylingExample = () => (
  <Select
    class="custom"
    options={["apple", "banana", "pear", "pineapple", "kiwi"]}
  />
);
