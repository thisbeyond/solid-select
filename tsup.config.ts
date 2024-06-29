import { defineConfig } from "tsup";
import * as preset from "tsup-preset-solid";

const preset_options: preset.PresetOptions = {
  entries: {
    entry: "./src/index.tsx",
    dev_entry: true,
  },
  drop_console: true,
};

export default defineConfig((config) => {
  config.publicDir = "public";
  const watching = !!config.watch;
  return preset.generateTsupOptions(
    preset.parsePresetOptions(preset_options, watching),
  );
});
