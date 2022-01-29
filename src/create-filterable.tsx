import { Option, Value } from "./create-select";

const splitOn = (sliceable: string, ...indices: number[]) =>
  [0, ...indices].map((index, indexPosition, indices) =>
    sliceable.slice(index, indices[indexPosition + 1])
  );

const createFilterable = (options: Option[]) => {
  const filterableOptions = (inputValue: string): Option[] => {
    if (!inputValue) {
      return options.map((option) => ({ label: option, value: option }));
    }

    const length = inputValue.length;
    const filteredOptions = [];
    for (const option of options) {
      const index = option.indexOf(inputValue);
      if (index > -1) {
        const parts = splitOn(option, index, index + length);
        const label = (
          <>
            {parts[0]}
            <b>{parts[1]}</b>
            {parts[2]}
          </>
        );
        filteredOptions.push({
          label,
          value: option,
        });
      }
    }
    return filteredOptions;
  };

  const optionToValue = (option: Option) => option.value;
  const format = (data: Option | Value, type: "option" | "value") =>
    type === "option" ? data.label : data;

  return {
    options: filterableOptions,
    optionToValue,
    format,
  };
};

export { createFilterable };
