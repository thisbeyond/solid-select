import { JSXElement } from "solid-js";

import { CreateSelectValue } from "./create-select";
import { fuzzyHighlight, fuzzySort } from "./fuzzy";

interface CreateOptionsOption {
  value: CreateSelectValue;
  label: JSXElement;
  text: string;
  disabled: boolean;
}

type CreateOptionsFilterableFunction = (
  inputValue: string,
  options: CreateOptionsOption[],
) => CreateOptionsOption[];

type CreateOptionsCreateableFunction = (
  inputValue: string,
  exists: boolean,
  options: CreateOptionsOption[],
) => CreateSelectValue | CreateSelectValue[];

type CreateOptionsFormatFunction = (
  value: CreateSelectValue,
  type: "value" | "label",
  meta: { highlight?: JSXElement; prefix?: string },
) => JSXElement;

const defaultFormat: CreateOptionsFormatFunction = (value, type, meta) =>
  type === "label" ? (
    <>
      {meta.prefix}
      {meta.highlight ?? value}
    </>
  ) : (
    value
  );

interface CreateOptionsConfig {
  key?: string;
  format?: CreateOptionsFormatFunction;
  filterable?: boolean | CreateOptionsFilterableFunction;
  createable?: boolean | CreateOptionsCreateableFunction;
  extractText?: (value: CreateSelectValue) => string;
  disable?: (value: CreateSelectValue) => boolean;
}

const createOptions = (
  values: CreateSelectValue[] | ((inputValue: string) => CreateSelectValue[]),
  userConfig?: CreateOptionsConfig,
) => {
  const config: CreateOptionsConfig &
    Required<
      Pick<CreateOptionsConfig, "extractText" | "filterable" | "disable">
    > = Object.assign(
    {
      extractText: (value: CreateSelectValue) =>
        value.toString ? value.toString() : value,
      filterable: true,
      disable: () => false,
    },
    userConfig || {},
  );

  if (
    config.key &&
    userConfig &&
    (userConfig.format || userConfig.disable || userConfig.extractText)
  ) {
    console.warn(
      "When 'key' option is specified, custom 'format', 'disable' and",
      "'extractText' functions will receive the keyed value rather than the",
      "full object.",
    );
  }

  if (
    typeof config.createable === "function" &&
    config.createable.length === 1
  ) {
    console.warn(
      'Outdated "createable" function signature detected.',
      'Will only call if no option alredy "exists" as a result.',
      'Please update function to accept "exists" as second parameter',
      'and return "undefined" to prevent adding a create option.',
    );
  }

  const resolveValue = (value: CreateSelectValue) =>
    config.key ? value[config.key] : value;

  const extractText = (value: CreateSelectValue) =>
    config.extractText(resolveValue(value));

  const format: CreateOptionsFormatFunction = (value, type, meta) => {
    const resolvedValue = resolveValue(value);
    return config.format
      ? config.format(resolvedValue, type, meta)
      : defaultFormat(resolvedValue, type, meta);
  };

  const disable = (value: CreateSelectValue) =>
    config.disable(resolveValue(value));

  const options = (inputValue: string) => {
    const trimmedValue = inputValue.trim();
    const initialValues =
      typeof values === "function" ? values(inputValue) : values;

    let createdOptions: CreateOptionsOption[] = initialValues.map((value) => {
      return {
        value,
        label: format(value, "label", {}),
        text: extractText(value),
        disabled: disable(value),
      };
    });

    if (config.filterable && trimmedValue) {
      if (typeof config.filterable === "function") {
        createdOptions = config.filterable(trimmedValue, createdOptions);
      } else {
        createdOptions = fuzzySort(trimmedValue, createdOptions, "text").map(
          (result) => ({
            ...result.item,
            label: format(result.item.value, "label", {
              highlight: fuzzyHighlight(result),
            }),
          }),
        );
      }
    }

    if (config.createable !== undefined) {
      const exists = createdOptions.some((option) =>
        areEqualIgnoringCase(trimmedValue, option.text),
      );

      if (trimmedValue) {
        let valueOrValues: CreateSelectValue | CreateSelectValue[] | undefined;

        if (typeof config.createable === "function") {
          if (config.createable.length === 1) {
            if (!exists) {
              valueOrValues = config.createable(
                trimmedValue,
                exists,
                createdOptions,
              );
            }
          } else {
            valueOrValues = config.createable(
              trimmedValue,
              exists,
              createdOptions,
            );
          }
        } else if (!exists) {
          valueOrValues = config.key
            ? { [config.key]: trimmedValue }
            : trimmedValue;
        }

        if (valueOrValues !== undefined) {
          const values = Array.isArray(valueOrValues)
            ? valueOrValues
            : [valueOrValues];

          const optionsToAdd: CreateOptionsOption[] = [];
          for (const value of values) {
            optionsToAdd.push({
              value: value,
              label: format(value, "label", { prefix: "Create " }),
              text: extractText(value),
              disabled: false,
            });
          }

          createdOptions = [...createdOptions, ...optionsToAdd];
        }
      }
    }

    return createdOptions;
  };

  return {
    options,
    optionToValue: (option: CreateOptionsOption) => option.value,
    isOptionDisabled: (option: CreateOptionsOption) => option.disabled,
    format: (
      item: CreateOptionsOption | CreateSelectValue,
      type: "option" | "value",
    ) =>
      type === "option"
        ? (item as CreateOptionsOption).label
        : format(item as CreateSelectValue, "value", {}),
  };
};

const areEqualIgnoringCase = (firstString: string, secondString: string) =>
  firstString.localeCompare(secondString, undefined, {
    sensitivity: "base",
  }) === 0;

export { createOptions, defaultFormat, areEqualIgnoringCase };
export type {
  CreateOptionsOption,
  CreateOptionsFormatFunction,
  CreateOptionsFilterableFunction,
  CreateOptionsCreateableFunction,
};
