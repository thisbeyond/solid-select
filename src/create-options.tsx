import { JSXElement } from "solid-js";

import { RawValue } from "./create-select";
import { fuzzyHighlight, fuzzySort } from "./fuzzy";

export type Values = RawValue[];

export interface Option {
  label: JSXElement;
  value: RawValue;
  disabled: boolean;
}

export interface CreateOptionsConfig {
  key?: string;
  filterable?: boolean;
  createable?: boolean | ((inputValue: string) => RawValue);
  disable?: (value: RawValue) => boolean;
}

export const createOptions = (
  values: Values | ((inputValue: string) => Values),
  userConfig?: CreateOptionsConfig
) => {
  const config = Object.assign(
    {
      filterable: true,
      disable: () => false,
    },
    userConfig || {}
  );

  const getLabel = (value: RawValue) =>
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
      createdOptions = fuzzySort(inputValue, createdOptions, "label").map(
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
        let value: RawValue;
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

  const format = (item: Option | RawValue, type: "option" | "value") =>
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
