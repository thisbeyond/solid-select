import { Select } from "@thisbeyond/solid-select";

export const AutoScrollExample = () => (
  <Select options={[...Array(50).keys()]} />
);
