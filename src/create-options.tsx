import { JSXElement } from "solid-js";

import { Value } from "./create-select";
import { fuzzyHighlight, fuzzySort } from "./fuzzy";

type Values<V> = V[];

interface Option<V> {
  label: JSXElement;
  value: Value<V>;
  disabled: boolean;
}

interface CreateOptionsConfig<V> {
  key?: string;
  filterable?: boolean;
  createable?: boolean | ((inputValue: string) => Value<V>);
  disable?: (value: Value<V>) => boolean;
}

function createOptions<V extends JSXElement>(
  values: Values<V> | ((inputValue: string) => Values<V>),
  userConfig?: CreateOptionsConfig<V>
) {
  const config = Object.assign(
    {
      filterable: true,
      disable: () => false,
    },
    userConfig || {}
  );

  const getLabel = (value: Value<V>) => {
    let v = value as unknown
    return (config?.key !== undefined && v != null) ? v[config.key as keyof typeof v] : value
  }

  const options = (inputValue: string) => {
    const initialValues =
      typeof values === "function" ? values(inputValue) : values;

    let createdOptions: Option<V>[] = initialValues.map((value) => {
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
      const exists = createdOptions.some((option) => {
        const label = getLabel(option.value)
        return (typeof label === "string") ? areEqualIgnoringCase(inputValue, label) : false
      });

      if (trimmedValue && !exists) {
        let value: Value<V>;
        if (typeof config.createable === "function") {
          value = config.createable(trimmedValue);
        } else {
          value = (config.key ? { [config.key]: trimmedValue } : trimmedValue) as Value<V>;
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

  const optionToValue = (option: Option<V>) => option.value;

  const format = (item: Option<V> | Value<V>, type: "option" | "value") =>
    type === "option" ? (item as Option<V>).label : getLabel(item as Value<V>);

  const isOptionDisabled = (option: Option<V>) => option.disabled;

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
