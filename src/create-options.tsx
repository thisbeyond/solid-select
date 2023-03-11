import { JSXElement } from "solid-js";

import { Value } from "./create-select";
import { fuzzyHighlight, fuzzySort } from "./fuzzy";

type Values = Value[];

interface Option {
  label: JSXElement;
  value: Value;
  disabled: boolean;
}

interface CreateOptionsConfig {
  key?: string;
  filterKey?:string;
  filterable?: boolean;
  createable?: boolean | ((inputValue: string) => Value);
  disable?: (value: Value) => boolean;
}

const createOptions = (
  values: Values | ((inputValue: string) => Values),
  userConfig?: CreateOptionsConfig
) => {
  const config = Object.assign(
    {
      filterable: true,
      filterKey: 'label',
      disable: () => false,
    },
    userConfig || {}
  );

  const getLabel = (value: Value) =>
    config?.key !== undefined ? value[config.key] : value;

  const options = (inputValue: string) => {
    const initialValues =
      typeof values === "function" ? values(inputValue) : values;

    let createdOptions: Option[] = initialValues.map((value) => {
      return {
        label: getLabel(value),
        value: value,
        disabled: config.disable(value),
      };
    });

    if (config.filterable && inputValue) {
      createdOptions = fuzzySort(inputValue, createdOptions, config.filterKey).map(
        (result) => ({
          ...result.item,
          label: fuzzyHighlight(result),
        })
      );
    }

    if (config.createable !== undefined) {
      const trimmedValue = inputValue.trim();
      const exists = createdOptions.some((option) =>
        areEqualIgnoringCase(inputValue, getLabel(option.value))
      );

      if (trimmedValue && !exists) {
        let value: Value;
        if (typeof config.createable === "function") {
          value = config.createable(trimmedValue);
        } else {
          value = config.key ? { [config.key]: trimmedValue } : trimmedValue;
        }

        const option = {
          label: (
            <>
              Create <mark>{getLabel(value)}</mark>
            </>
          ),
          value,
          disabled: false,
        };
        createdOptions = [...createdOptions, option];
      }
    }

    return createdOptions;
  };

  const optionToValue = (option: Option) => option.value;

  const format = (item: Option | Value, type: "option" | "value") =>
    type === "option" ? item.label : getLabel(item);

  const isOptionDisabled = (option: Option) => option.disabled;

  return {
    options,
    optionToValue,
    isOptionDisabled,
    format,
  };
};

const areEqualIgnoringCase = (firstString: string, secondString: string) =>
  firstString.localeCompare(secondString, undefined, {
    sensitivity: "base",
  }) === 0;

export { createOptions };
