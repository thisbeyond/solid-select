import {
  createEffect,
  createRenderEffect,
  createSignal,
  mergeProps,
  on,
} from "solid-js";

type Option = any;

type SingleValue = any;

type Value = SingleValue | SingleValue[];

type CreateSelectProps = {
  options: Option[];
  initialValue?: Value;
  multiple?: boolean;
  optionToValue?: (option: Option) => SingleValue;
  onChange?: (value: Value) => void;
  onInput?: (inputValue: string) => void;
  onFocus?: (event: FocusEvent) => void;
  onBlur?: (event: FocusEvent) => void;
};

const createSelect = (props: CreateSelectProps) => {
  const config = mergeProps(
    {
      multiple: false,
      optionToValue: (option: Option): SingleValue => option,
    },
    props
  );

  const parseValue = (value: Value) => {
    if (config.multiple && Array.isArray(value)) {
      return value;
    } else if (!config.multiple && !Array.isArray(value)) {
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

  createEffect(on(_value, () => config.onChange?.(value()), { defer: true }));

  const options =
    typeof config.options === "function"
      ? config.options
      : () => config.options;
  const optionsCount = () => options().length;

  const pickOption = (option: Option) => {
    const value = config.optionToValue(option);
    if (config.multiple) {
      setValue([..._value(), value]);
    } else {
      setValue(value);
    }
    close();
    hideInput();
  };

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

  const [inputIsHidden, setInputIsHidden] = createSignal(false);
  const showInput = () => setInputIsHidden(false);
  const hideInput = () => setInputIsHidden(true);

  const [isOpen, setIsOpen] = createSignal(false);
  const open = () => setIsOpen(true);
  const close = () => setIsOpen(false);

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
    control: null,
    input: null,
    list: null,
  };

  const controlRef = (element: HTMLElement) => {
    refs.control = element;

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
      open();
      if (refs.input && event.target !== refs.input) {
        event.preventDefault();
      }
    });
  };

  const inputRef = (element: HTMLInputElement) => {
    refs.input = element;

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
    refs.list = element;

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
    get options() {
      return options();
    },
    get inputValue() {
      return inputValue();
    },
    get isOpen() {
      return isOpen();
    },
    pickOption,
    isOptionFocused,
    control: controlRef,
    input: inputRef,
    list: listRef,
  };
};

export { createSelect };
export type { CreateSelectProps, SingleValue, Value, Option };