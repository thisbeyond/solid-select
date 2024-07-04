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

type CreateOptionsFormatFunction = <Type extends "value" | "label" | "text">(
  value: CreateSelectValue,
  type: Type,
  meta: { highlight?: JSXElement; prefix?: string },
) => Type extends "text" ? string : JSXElement;

const hasToString = (value: any): value is { toString: () => string } =>
  typeof value.toString === "function";

const defaultFormat: CreateOptionsFormatFunction = (value, type, meta) => {
  switch (type) {
    case "value":
      return value;
    case "text":
      if (!hasToString(value)) {
        throw new Error(
          "Value must have a 'toString' method for text extraction.",
        );
      }
      return value.toString();
    case "label":
      return (
        <>
          {meta?.prefix}
          {meta?.highlight ?? value}
        </>
      );
  }
};

type CreateOptionsConfig = (
  | {
      key?: string;
      format?: never;
    }
  | {
      format?: CreateOptionsFormatFunction;
      key?: never;
    }
) & {
  filterable?: boolean | CreateOptionsFilterableFunction;
  createable?: boolean | CreateOptionsCreateableFunction;
  disable?: (value: CreateSelectValue) => boolean;
};

const createOptions = (
  values: CreateSelectValue[] | ((inputValue: string) => CreateSelectValue[]),
  userConfig?: CreateOptionsConfig,
) => {
  const config: CreateOptionsConfig &
    Required<Pick<CreateOptionsConfig, "filterable" | "disable">> =
    Object.assign(
      {
        filterable: true,
        disable: () => false,
      },
      userConfig || {},
    );

  if (config.key && config.format) {
    console.warn(
      "The 'key' option is ignored when 'format' option is specified.",
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

  const formatter: CreateOptionsFormatFunction = (
    value,
    type,
    meta: { highlight?: JSXElement; prefix?: string },
  ) => {
    return config.format
      ? config.format(value, type, meta)
      : defaultFormat(config.key ? value[config.key] : value, type, meta);
  };

  const options = (inputValue: string) => {
    const initialValues =
      typeof values === "function" ? values(inputValue) : values;

    let createdOptions: CreateOptionsOption[] = initialValues.map((value) => {
      return {
        value: value,
        label: formatter(value, "label", {}),
        text: formatter(value, "text", {}),
        disabled: config.disable(value),
      };
    });

    if (config.filterable && inputValue) {
      if (typeof config.filterable === "function") {
        createdOptions = config.filterable(inputValue, createdOptions);
      } else {
        createdOptions = fuzzySort(inputValue, createdOptions, "text").map(
          (result) => ({
            ...result.item,
            label: formatter(result.item.value, "label", {
              highlight: fuzzyHighlight(result),
            }),
          }),
        );
      }
    }

    if (config.createable !== undefined) {
      const trimmedValue = inputValue.trim();
      const exists = createdOptions.some((option) =>
        areEqualIgnoringCase(inputValue, option.text),
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
          valueOrValues =
            config.key && !config.format
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
              label: formatter(value, "label", { prefix: "Create " }),
              text: formatter(value, "text", {}),
              disabled: false,
            });
          }

          createdOptions = [...createdOptions, ...optionsToAdd];
        }
      }
    }

    return createdOptions;
  };

  const optionToValue = (option: CreateOptionsOption) => option.value;

  const format = (
    item: CreateOptionsOption | CreateSelectValue,
    type: "option" | "value",
  ) =>
    type === "option"
      ? (item as CreateOptionsOption).label
      : formatter(item, "value", {});

  const isOptionDisabled = (option: CreateOptionsOption) => option.disabled;

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

export { createOptions, defaultFormat, areEqualIgnoringCase };
export type {
  CreateOptionsOption,
  CreateOptionsFormatFunction,
  CreateOptionsFilterableFunction,
  CreateOptionsCreateableFunction,
};