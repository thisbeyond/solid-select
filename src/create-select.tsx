import {
  createEffect,
  createMemo,
  createSignal,
  mergeProps,
  on,
} from "solid-js";

type CreateSelectOption = any;

type CreateSelectSingleValue = any;

type CreateSelectValue = CreateSelectSingleValue | CreateSelectSingleValue[];

interface CreateSelectProps {
  options:
    | CreateSelectOption[]
    | ((inputValue: string) => CreateSelectOption[]);
  initialValue?: CreateSelectValue;
  multiple?: boolean;
  disabled?: boolean;
  optionToValue?: (option: CreateSelectOption) => CreateSelectSingleValue;
  isOptionDisabled?: (option: CreateSelectOption) => boolean;
  onChange?: (value: CreateSelectValue) => void;
  onInput?: (inputValue: string) => void;
}

const createSelect = (props: CreateSelectProps) => {
  const config = mergeProps(
    {
      multiple: false,
      disabled: false,
      optionToValue: (option: CreateSelectOption): CreateSelectSingleValue =>
        option,
      isOptionDisabled: (option: CreateSelectOption) => false,
    },
    props,
  );

  const parseValue = (value: CreateSelectValue) => {
    if (config.multiple && Array.isArray(value)) {
      return value;
    } else if (!config.multiple && !Array.isArray(value)) {
      return value !== null ? [value] : [];
    } else {
      throw new Error(
        `Incompatible value type for ${
          config.multiple ? "multple" : "single"
        } select.`,
      );
    }
  };

  const [_value, _setValue] = createSignal(
    config.initialValue !== undefined ? parseValue(config.initialValue) : [],
  );

  const value = () => (config.multiple ? _value() : _value()[0] || null);
  const setValue = (value: CreateSelectValue) => _setValue(parseValue(value));
  const clearValue = () => _setValue([]);
  const hasValue = () => !!(config.multiple ? value().length : value());

  createEffect(on(_value, () => config.onChange?.(value()), { defer: true }));

  const [inputValue, setInputValue] = createSignal("");
  const clearInputValue = () => setInputValue("");
  const hasInputValue = () => !!inputValue().length;

  createEffect(
    on(inputValue, (inputValue) => config.onInput?.(inputValue), {
      defer: true,
    }),
  );

  createEffect(
    on(
      inputValue,
      (inputValue) => {
        if (inputValue && !isOpen()) {
          setIsOpen(true);
        }
      },
      { defer: true },
    ),
  );

  const options =
    typeof config.options === "function"
      ? createMemo(
          () => (config.options as Function)(inputValue()),
          config.options(inputValue()),
        )
      : () => config.options;
  const optionsCount = () => options().length;

  const pickOption = (option: CreateSelectOption) => {
    if (config.isOptionDisabled(option)) return;

    const value = config.optionToValue(option);
    if (config.multiple) {
      setValue([..._value(), value]);
    } else {
      setValue(value);
      setIsActive(false);
    }
    setIsOpen(false);
  };

  const [isActive, setIsActive] = createSignal(false);
  const [isOpen, setIsOpen] = createSignal(false);
  const toggleOpen = () => setIsOpen(!isOpen());

  const [focusedOptionIndex, setFocusedOptionIndex] = createSignal(-1);

  const focusedOption = () => options()[focusedOptionIndex()];
  const isOptionFocused = (option: CreateSelectOption) =>
    option === focusedOption();

  const focusOption = (direction: "next" | "previous") => {
    if (!optionsCount()) setFocusedOptionIndex(-1);

    const max = optionsCount() - 1;
    const delta = direction === "next" ? 1 : -1;
    let index = focusedOptionIndex() + delta;
    if (index > max) {
      index = 0;
    }
    if (index < 0) {
      index = max;
    }
    setFocusedOptionIndex(index);
  };

  const focusPreviousOption = () => focusOption("previous");
  const focusNextOption = () => focusOption("next");

  createEffect(
    on(
      options,
      (options) => {
        if (isOpen()) setFocusedOptionIndex(Math.min(0, options.length - 1));
      },
      { defer: true },
    ),
  );

  createEffect(
    on(
      () => config.disabled,
      (isDisabled) => {
        if (isDisabled && isOpen()) {
          setIsOpen(false);
        }
      },
    ),
  );

  createEffect(
    on(
      isOpen,
      (isOpen) => {
        if (isOpen) {
          if (focusedOptionIndex() === -1) focusNextOption();
          setIsActive(true);
        } else {
          if (focusedOptionIndex() > -1) setFocusedOptionIndex(-1);
          setInputValue("");
        }
      },
      { defer: true },
    ),
  );

  createEffect(
    on(
      focusedOptionIndex,
      (focusedOptionIndex) => {
        if (focusedOptionIndex > -1 && !isOpen()) {
          setIsOpen(true);
        }
      },
      { defer: true },
    ),
  );

  const onFocusIn = () => setIsActive(true);
  const onFocusOut = () => {
    setIsActive(false);
    setIsOpen(false);
  };
  const onMouseDown = (event: Event) => event.preventDefault();

  const onClick = (event: Event) => {
    if (!config.disabled && !hasInputValue()) toggleOpen();
  };

  const onInput = (event: Event) => {
    setInputValue((event.target as HTMLInputElement).value);
  };

  const onKeyDown = (event: KeyboardEvent) => {
    switch (event.key) {
      case "ArrowDown":
        focusNextOption();
        break;
      case "ArrowUp":
        focusPreviousOption();
        break;
      case "Enter":
        if (isOpen() && focusedOption()) {
          pickOption(focusedOption());
          break;
        }
        return;
      case "Escape":
        if (isOpen()) {
          setIsOpen(false);
          break;
        }
        return;
      case "Delete":
      case "Backspace":
        if (inputValue()) {
          return;
        }
        if (config.multiple) {
          const currentValue = value() as CreateSelectSingleValue[];
          setValue([...currentValue.slice(0, -1)]);
        } else {
          clearValue();
        }
        break;
      case " ":
        if (inputValue()) {
          return;
        }
        if (!isOpen()) {
          setIsOpen(true);
        } else {
          if (focusedOption()) {
            pickOption(focusedOption());
          }
        }
        break;
      case "Tab":
        if (focusedOption() && isOpen()) {
          pickOption(focusedOption());
          break;
        }
        return;
      default:
        return;
    }
    event.preventDefault();
    event.stopPropagation();
  };

  return {
    options,
    value,
    setValue,
    hasValue,
    clearValue,
    inputValue,
    setInputValue,
    hasInputValue,
    clearInputValue,
    isOpen,
    setIsOpen,
    toggleOpen,
    isActive,
    setIsActive,
    get multiple() {
      return config.multiple;
    },
    get disabled() {
      return config.disabled;
    },
    pickOption,
    isOptionFocused,
    isOptionDisabled: config.isOptionDisabled,
    onFocusIn,
    onFocusOut,
    onMouseDown,
    onClick,
    onInput,
    onKeyDown,
  };
};

export { createSelect };
export type {
  CreateSelectProps,
  CreateSelectSingleValue,
  CreateSelectValue,
  CreateSelectOption,
};
