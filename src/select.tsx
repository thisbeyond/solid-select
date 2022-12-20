import {
  Show,
  For,
  splitProps,
  mergeProps,
  Component,
  ParentComponent,
  JSXElement,
  createEffect,
  on,
} from "solid-js";

import {
  createSelect,
  RawOption,
  RawValue,
  CreateSelectProps,
} from "./create-select";

export interface CommonProps {
  format: (
    data: RawOption | RawValue,
    type: "option" | "value"
  ) => string | undefined;
  placeholder?: string;
  id?: string;
  name?: string;
  class?: string;
  autofocus?: boolean;
  readonly?: boolean;
  loading?: boolean;
  loadingPlaceholder?: string;
  emptyPlaceholder?: string;
}

export type SelectReturn = ReturnType<typeof createSelect>;

export type SelectProps = CreateSelectProps & Partial<CommonProps>;

export const Select: Component<SelectProps> = (props) => {
  const [selectProps, local] = splitProps(
    mergeProps(
      {
        format: ((data, type) => data) as CommonProps["format"],
        placeholder: "Select...",
        readonly: typeof props.options !== "function",
        loading: false,
        loadingPlaceholder: "Loading...",
        emptyPlaceholder: "No options",
      },
      props
    ),
    [
      "options",
      "optionToValue",
      "isOptionDisabled",
      "multiple",
      "disabled",
      "onInput",
      "onChange",
      "onBlur",
      "onFocus",
    ]
  );
  const select = createSelect(selectProps);

  createEffect(
    on(
      () => local.initialValue,
      (value) => value !== undefined && select.setValue(value)
    )
  );

  return (
    <Container
      class={local.class}
      ref={select.containerRef}
      disabled={select.disabled}
    >
      <Control
        format={local.format}
        placeholder={local.placeholder}
        id={local.id}
        name={local.name}
        autofocus={local.autofocus}
        readonly={local.readonly}
        disabled={select.disabled}
        value={select.value}
        hasValue={select.hasValue}
        setValue={select.setValue}
        inputValue={select.inputValue}
        inputRef={select.inputRef}
        multiple={select.multiple}
      />
      <List
        ref={select.listRef}
        isOpen={select.isOpen}
        options={select.options}
        loading={local.loading}
        loadingPlaceholder={local.loadingPlaceholder}
        emptyPlaceholder={local.emptyPlaceholder}
      >
        {(option: RawOption) => (
          <Option
            isDisabled={select.isOptionDisabled(option)}
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

export type ContainerProps = {
  ref: SelectReturn["containerRef"];
  disabled: SelectReturn["disabled"];
} & Pick<CommonProps, "class">;

export const Container: ParentComponent<ContainerProps> = (props) => {
  return (
    <div
      class={`solid-select-container ${
        props.class !== undefined ? props.class : ""
      }`}
      ref={props.ref}
      data-disabled={props.disabled}
    >
      {props.children}
    </div>
  );
};

export type ControlProps = Omit<CommonProps, "class"> &
  Pick<
    SelectReturn,
    | "value"
    | "hasValue"
    | "setValue"
    | "multiple"
    | "disabled"
    | "inputValue"
    | "inputRef"
  >;

export const Control: Component<ControlProps> = (props) => {
  const removeValue = (index: number) => {
    const value = props.value;
    props.setValue([...value.slice(0, index), ...value.slice(index + 1)]);
  };

  return (
    <div
      class="solid-select-control"
      data-multiple={props.multiple}
      data-has-value={props.hasValue}
      data-disabled={props.disabled}
    >
      <Show when={!props.hasValue && !props.inputValue}>
        <Placeholder>{props.placeholder}</Placeholder>
      </Show>
      <Show when={props.hasValue && !props.multiple && !props.inputValue}>
        <SingleValue>{props.format(props.value, "value")}</SingleValue>
      </Show>
      <Show when={props.hasValue && props.multiple}>
        <For each={props.value}>
          {(value, index) => (
            <MultiValue onRemove={() => removeValue(index())}>
              {props.format(value, "value")}
            </MultiValue>
          )}
        </For>
      </Show>
      <Input
        ref={props.inputRef}
        id={props.id}
        name={props.name}
        autofocus={props.autofocus}
        disabled={props.disabled}
        readonly={props.readonly}
      />
    </div>
  );
};

export type PlaceholderProps = Pick<CommonProps, "placeholder">;

export const Placeholder: ParentComponent<PlaceholderProps> = (props) => {
  return <div class="solid-select-placeholder">{props.children}</div>;
};

export const SingleValue: ParentComponent<{}> = (props) => {
  return <div class="solid-select-single-value">{props.children}</div>;
};

export const MultiValue: ParentComponent<{ onRemove: () => void }> = (
  props
) => {
  return (
    <div class="solid-select-multi-value">
      {props.children}
      <button
        type="button"
        class="solid-select-multi-value-remove"
        on:click={(event: MouseEvent) => {
          event.stopPropagation();
          props.onRemove();
        }}
      >
        ⨯
      </button>
    </div>
  );
};

export type InputProps = {
  ref: SelectReturn["inputRef"];
  disabled: SelectReturn["disabled"];
} & Pick<CommonProps, "id" | "name" | "autofocus" | "readonly">;

export const Input: Component<InputProps> = (props) => {
  return (
    <input
      ref={props.ref}
      id={props.id}
      name={props.name}
      class="solid-select-input"
      type="text"
      tabIndex={0}
      autocomplete="off"
      autocapitalize="none"
      autofocus={props.autofocus}
      readonly={props.readonly}
      disabled={props.disabled}
      size={1}
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

export type ListProps = {
  ref: SelectReturn["listRef"];
  children: (option: RawOption) => JSXElement;
} & Pick<SelectReturn, "isOpen" | "options"> &
  Pick<CommonProps, "loading" | "loadingPlaceholder" | "emptyPlaceholder">;

export const List: Component<ListProps> = (props) => {
  return (
    <Show when={props.isOpen}>
      <div ref={props.ref} class="solid-select-list">
        <Show
          when={!props.loading}
          fallback={
            <div class="solid-select-list-placeholder">
              {props.loadingPlaceholder}
            </div>
          }
        >
          <For
            each={props.options}
            fallback={
              <div class="solid-select-list-placeholder">
                {props.emptyPlaceholder}
              </div>
            }
          >
            {props.children}
          </For>
        </Show>
      </div>
    </Show>
  );
};

export type OptionProps = {
  isDisabled: boolean;
  isFocused: boolean;
  pickOption: [SelectReturn["pickOption"], RawOption];
};

export const Option: ParentComponent<OptionProps> = (props) => {
  const scrollIntoViewOnFocus = (element: HTMLDivElement) => {
    createEffect(() => {
      if (props.isFocused) {
        element.scrollIntoView({ block: "nearest" });
      }
    });
  };
  return (
    <div
      ref={scrollIntoViewOnFocus}
      data-disabled={props.isDisabled}
      data-focused={props.isFocused}
      class="solid-select-option"
      onClick={props.pickOption}
    >
      {props.children}
    </div>
  );
};
