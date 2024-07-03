import { JSXElement } from "solid-js";

import { Value } from "./create-select";
import { fuzzyHighlight, fuzzySort } from "./fuzzy";

type Values = Value[];

interface Option {
  value: Value;
  label: JSXElement;
  text: string;
  disabled: boolean;
}

type CreateOptionsFormatType = "value" | "label" | "text";

type CreateOptionsFormat = <T extends CreateOptionsFormatType>(
  value: Value,
  type: T,
  meta: { highlight?: JSXElement; prefix?: string },
) => T extends "text" ? string : JSXElement;

export const defaultFormat: CreateOptionsFormat = (value, type, meta) => {
  switch (type) {
    case "value":
      return value;
    case "text":
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
      format?: CreateOptionsFormat;
      key?: never;
    }
) & {
  filterable?: boolean | ((inputValue: string, options: Option[]) => Option[]);
  createable?:
    | boolean
    | ((
        inputValue: string,
        exists: boolean,
        options: Option[],
      ) => Value | Value[]);
  disable?: (value: Value) => boolean;
};

const createOptions = (
  values: Values | ((inputValue: string) => Values),
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

  const formatter: <T extends CreateOptionsFormatType>(
    value: Value,
    type: T,
    meta?: { highlight?: JSXElement; prefix?: string },
  ) => T extends "text" ? string : JSXElement = (value, type, meta = {}) => {
    return config.format
      ? config.format(value, type, meta)
      : defaultFormat(config.key ? value[config.key] : value, type, meta);
  };

  const options = (inputValue: string) => {
    const initialValues =
      typeof values === "function" ? values(inputValue) : values;

    let createdOptions: Option[] = initialValues.map((value) => {
      return {
        value: value,
        label: formatter(value, "label"),
        text: formatter(value, "text"),
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
        let valueOrValues: Value | Value[] | undefined;

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

          const optionsToAdd: Option[] = [];
          for (const value of values) {
            optionsToAdd.push({
              value: value,
              label: formatter(value, "label", { prefix: "Create " }),
              text: formatter(value, "text"),
              disabled: false,
            });
          }

          createdOptions = [...createdOptions, ...optionsToAdd];
        }
      }
    }

    return createdOptions;
  };

  const optionToValue = (option: Option) => option.value;

  const format = (item: Option | Value, type: "option" | "value") =>
    type === "option" ? item.label : formatter(item, "value");

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
