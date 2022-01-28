import {
  Show,
  For,
  splitProps,
  mergeProps,
  Component,
  JSXElement,
} from "solid-js";

import {
  createSelect,
  Option as OptionType,
  Value as ValueType,
  CreateSelectProps,
} from "./create-select";

interface CommonProps {
  format: (
    data: OptionType | ValueType,
    type: "option" | "value"
  ) => string | undefined;
  placeholder?: string;
  name?: string;
  class?: string;
  autofocus?: boolean;
  readonly?: boolean;
}

type SelectReturn = ReturnType<typeof createSelect>;

type SelectProps = CreateSelectProps & Partial<CommonProps>;

const Select = (props: SelectProps) => {
  const [selectProps, local] = splitProps(
    mergeProps(
      {
        format: ((data, type) => data) as CommonProps["format"],
        placeholder: "Select...",
        readonly: true,
      },
      props
    ),
    [
      "options",
      "optionToValue",
      "initialValue",
      "onInput",
      "onChange",
      "onBlur",
    ]
  );
  const select = createSelect(selectProps);

  return (
    <Container class={local.class} ref={select.containerRef}>
      <Control
        format={local.format}
        placeholder={local.placeholder}
        name={local.name}
        autofocus={local.autofocus}
        readonly={local.readonly}
        value={select.value}
        inputValue={select.inputValue}
        inputRef={select.inputRef}
      />
      <List
        ref={select.listRef}
        isOpen={select.isOpen}
        options={select.options}
      >
        {(option: OptionType) => (
          <Option
            isFocused={select.isOptionFocused(option)}
            pickOption={[select.pickOption, option]}
          >
            {local.format(option, "option")}
          </Option>
        )}
      </List>
    </Container>
  );
};

type ContainerProps = { ref: SelectReturn["containerRef"] } & Pick<
  CommonProps,
  "class"
>;

const Container: Component<ContainerProps> = (props) => {
  return (
    <div
      class={`solid-select-container ${
        props.class !== undefined ? props.class : ""
      }`}
      ref={props.ref}
    >
      {props.children}
    </div>
  );
};

type ControlProps = Omit<CommonProps, "class"> &
  Pick<SelectReturn, "value" | "inputValue" | "inputRef">;

const Control = (props: ControlProps) => {
  return (
    <div class="solid-select-control">
      <Show when={!props.inputValue}>
        <Value
          value={props.format(props.value, "value")}
          placeholder={props.placeholder}
        />
      </Show>
      <Input
        ref={props.inputRef}
        name={props.name}
        autofocus={props.autofocus}
        readonly={props.readonly}
      />
    </div>
  );
};

type ValueProps = { value?: string } & Pick<CommonProps, "placeholder">;

const Value: Component<ValueProps> = (props) => {
  return (
    <div class="solid-select-value" data-has-value={!!props.value}>
      {props.value ?? props.placeholder}
    </div>
  );
};

type InputProps = { ref: SelectReturn["inputRef"] } & Pick<
  CommonProps,
  "name" | "autofocus" | "readonly"
>;

const Input: Component<InputProps> = (props) => {
  return (
    <input
      ref={props.ref}
      name={props.name}
      class="solid-select-input"
      type="text"
      tabIndex={0}
      autocomplete="off"
      autocapitalize="none"
      autofocus={props.autofocus}
      readonly={props.readonly}
      onKeyDown={(event: KeyboardEvent) => {
        if (event.key === "Escape") {
          event.preventDefault();
          event.stopPropagation();
          (event.target as HTMLElement).blur();
        }
      }}
    />
  );
};

type ListProps = {
  ref: SelectReturn["listRef"];
  children: (option: OptionType) => JSXElement;
} & Pick<SelectReturn, "isOpen" | "options">;

const List = (props: ListProps) => {
  return (
    <Show when={props.isOpen}>
      <div ref={props.ref} class="solid-select-list">
        <For each={props.options} fallback={"No options"}>
          {props.children}
        </For>
      </div>
    </Show>
  );
};

type OptionProps = {
  isFocused: boolean;
  pickOption: [SelectReturn["pickOption"], OptionType];
};

const Option: Component<OptionProps> = (props) => {
  return (
    <div
      data-is-focused={props.isFocused}
      class="solid-select-option"
      onClick={props.pickOption}
    >
      {props.children}
    </div>
  );
};

export { Select, Input, Value, List, Option };
