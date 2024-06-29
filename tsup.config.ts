import { defineConfig } from "tsup";
import * as preset from "tsup-preset-solid";

const preset_options: preset.PresetOptions = {
  entries: [
    {
      entry: "./src/index.tsx",
      dev_entry: true,
    },
    {
      name: "style.css",
      entry: "./src/style.css",
    },
  ],
  drop_console: true,
};

export default defineConfig((config) => {
  const watching = !!config.watch;

  const parsed_data = preset.parsePresetOptions(preset_options, watching);

  if (!watching) {
    const package_fields = preset.generatePackageExports(parsed_data);

    // Force format for style.css import.
    package_fields.exports["./style.css"].import = "./dist/style.css/index.css";
    package_fields.typesVersions = {};

    console.log(
      `\npackage.json: \n${JSON.stringify(package_fields, null, 2)}\n\n`,
    );
    preset.writePackageJson(package_fields);
  }
  const result = preset.generateTsupOptions(parsed_data);
  return result;
});
