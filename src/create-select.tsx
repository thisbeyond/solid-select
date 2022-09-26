import {
  createEffect,
  createMemo,
  createRenderEffect,
  createSignal,
  mergeProps,
  on,
} from "solid-js";

type Option = any;

type SingleValue = any;

type Value = SingleValue | SingleValue[];

interface CreateSelectProps {
  options: Option[] | ((inputValue: string) => Option[]);
  initialValue?: Value;
  multiple?: boolean;
  disabled?: boolean;
  optionToValue?: (option: Option) => SingleValue;
  isOptionDisabled?: (option: Option) => boolean;
  onChange?: (value: Value) => void;
  onInput?: (inputValue: string) => void;
  onFocus?: (event: FocusEvent) => void;
  onBlur?: (event: FocusEvent) => void;
}

const createSelect = (props: CreateSelectProps) => {
  const config = mergeProps(
    {
      multiple: false,
      disabled: false,
      optionToValue: (option: Option): SingleValue => option,
      isOptionDisabled: (option: Option) => false,
    },
    props
  );

  const parseValue = (value: Value) => {
    if (config.multiple && Array.isArray(value)) {
      return value;
    } else if (!config.multiple) {
      return value !== null ? [value] : [];
    } else {
      throw new Error(
        `Incompatible value type for ${
          config.multiple ? "multple" : "single"
        } select.`
      );
    }
  };

  const [_value, _setValue] = createSignal(
    config.initialValue ? parseValue(config.initialValue) : []
  );

  const value = () => (config.multiple ? _value() : _value()[0] || null);
  const setValue = (value: Value) => _setValue(parseValue(value));
  const clearValue = () => _setValue([]);
  const hasValue = () => !!(config.multiple ? value().length : value());

  createEffect(on(_value, () => config.onChange?.(value()), { defer: true }));

  const [inputValue, setInputValue] = createSignal("");
  const clearInputValue = () => setInputValue("");

  createEffect(
    on(inputValue, (inputValue) => config.onInput?.(inputValue), {
      defer: true,
    })
  );

  createEffect(
    on(
      inputValue,
      (inputValue) => {
        if (inputValue && !isOpen()) {
          open();
        }
      },
      { defer: true }
    )
  );

  const options =
    typeof config.options === "function"
      ? createMemo(
          () => (config.options as Function)(inputValue()),
          config.options(inputValue())
        )
      : () => config.options;
  const optionsCount = () => options().length;

  const pickOption = (option: Option) => {
    if (config.isOptionDisabled(option)) return;

    const value = config.optionToValue(option);
    if (config.multiple) {
      setValue([..._value(), value]);
    } else {
      setValue(value);
      hideInput();
    }
    close();
  };

  const [inputIsHidden, setInputIsHidden] = createSignal(false);
  const showInput = () => setInputIsHidden(false);
  const hideInput = () => setInputIsHidden(true);

  const [isOpen, setIsOpen] = createSignal(false);
  const open = () => setIsOpen(true);
  const close = () => setIsOpen(false);
  const toggle = () => setIsOpen(!isOpen());

  const isDisabled = () => config.disabled;

  const [focusedOptionIndex, setFocusedOptionIndex] = createSignal(-1);

  const focusedOption = () => options()[focusedOptionIndex()];
  const isOptionFocused = (option: Option) => option === focusedOption();

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
      { defer: true }
    )
  );

  createEffect(
    on(isDisabled, (isDisabled) => {
      if (isDisabled && isOpen()) {
        close();
      }
    })
  );

  createEffect(
    on(
      isOpen,
      (isOpen) => {
        if (isOpen) {
          if (focusedOptionIndex() === -1) focusNextOption();
          showInput();
        } else {
          if (focusedOptionIndex() > -1) setFocusedOptionIndex(-1);
          clearInputValue();
        }
      },
      { defer: true }
    )
  );

  createEffect(
    on(
      focusedOptionIndex,
      (focusedOptionIndex) => {
        if (focusedOptionIndex > -1 && !isOpen()) {
          open();
        }
      },
      { defer: true }
    )
  );

  const refs: Record<string, null | HTMLElement> = {
    containerRef: null,
    inputRef: null,
    listRef: null,
  };

  const containerRef = (element: HTMLElement) => {
    refs.containerRef = element;

    if (!element.getAttribute("tabIndex")) {
      element.tabIndex = -1;
    }

    element.addEventListener("focusin", () => {
      showInput();
    });

    element.addEventListener("focusout", (event: FocusEvent) => {
      const target = event.relatedTarget as HTMLElement;
      for (const relatedElement of Object.values(refs)) {
        if (relatedElement?.contains(target)) {
          event.preventDefault();
          event.stopPropagation();
          return;
        }
      }
      close();
    });

    element.addEventListener("pointerdown", (event) => {
      if (refs.inputRef && event.target !== refs.inputRef) {
        event.preventDefault();
      }
    });

    element.addEventListener("click", (event) => {
      if (
        !refs.listRef ||
        !refs.listRef.contains(event.target as HTMLElement)
      ) {
        if (refs.inputRef) {
          refs.inputRef.focus();
        }
        toggle();
      }
    });
  };

  const inputRef = (element: HTMLInputElement) => {
    refs.inputRef = element;

    if (!element.getAttribute("tabIndex")) {
      element.tabIndex = -1;
    }

    createRenderEffect(() => (element.value = inputValue()));
    element.addEventListener("input", (event: Event) => {
      setInputValue((event.target as HTMLInputElement).value);
    });

    createRenderEffect(() => {
      element.style.setProperty("opacity", inputIsHidden() ? "0" : "1");
    });

    element.addEventListener("focus", (event: FocusEvent) => {
      if (config.onFocus) {
        config.onFocus(event);
      }
    });
    element.addEventListener("blur", (event: FocusEvent) => {
      if (config.onBlur) {
        config.onBlur(event);
      }
    });

    element.addEventListener("keydown", (event) => {
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
            close();
            break;
          }
          return;
        case "Delete":
        case "Backspace":
          if (inputValue()) {
            return;
          }
          if (config.multiple) {
            const currentValue = value() as SingleValue[];
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
            open();
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
    });
  };

  const listRef = (element: HTMLElement) => {
    refs.listRef = element;

    if (!element.getAttribute("tabIndex")) {
      element.tabIndex = -1;
    }

    element.addEventListener("pointerdown", (event) => {
      event.preventDefault();
      event.stopPropagation();
    });
  };

  return {
    get value() {
      return value();
    },
    get hasValue() {
      return hasValue();
    },
    setValue,
    get options() {
      return options();
    },
    get inputValue() {
      return inputValue();
    },
    get isOpen() {
      return isOpen();
    },
    multiple: config.multiple,
    get disabled() {
      return isDisabled();
    },
    pickOption,
    isOptionFocused,
    isOptionDisabled: config.isOptionDisabled,
    containerRef,
    inputRef,
    listRef,
  };
};

export { createSelect };
export type { CreateSelectProps, SingleValue, Value, Option };
