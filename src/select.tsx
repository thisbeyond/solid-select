import {
  Show,
  For,
  splitProps,
  mergeProps,
  Component,
  ParentComponent,
  createEffect,
  on,
  createContext,
  useContext,
  JSXElement,
  Ref,
} from "solid-js";
import {
  createSelect,
  CreateSelectOption,
  CreateSelectValue,
  CreateSelectProps,
} from "./create-select";

interface CommonProps {
  format: (
    data: CreateSelectOption | CreateSelectValue,
    type: "option" | "value",
  ) => JSXElement | undefined;
  placeholder?: string;
  id?: string;
  name?: string;
  class?: string;
  autofocus?: boolean;
  readonly?: boolean;
  loading?: boolean;
  loadingPlaceholder?: string;
  emptyPlaceholder?: string;
  ref?: Ref<HTMLInputElement>;
}

type SelectReturn = ReturnType<typeof createSelect>;

type SelectProps = CreateSelectProps & Partial<CommonProps>;

const SelectContext = createContext<SelectReturn>();

const useSelect = () => {
  const context = useContext(SelectContext);
  if (!context) throw new Error("No SelectContext found in ancestry.");
  return context;
};

const Select: Component<SelectProps> = (props) => {
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
      props,
    ),
    [
      "options",
      "optionToValue",
      "isOptionDisabled",
      "multiple",
      "disabled",
      "onInput",
      "onChange",
    ],
  );
  const select = createSelect(selectProps);

  createEffect(
    on(
      () => local.initialValue,
      (value) => value !== undefined && select.setValue(value),
    ),
  );

  return (
    <SelectContext.Provider value={select}>
      <Container class={local.class}>
        <Control
          id={local.id}
          name={local.name}
          format={local.format}
          placeholder={local.placeholder}
          autofocus={local.autofocus}
          readonly={local.readonly}
          ref={props.ref}
        />
        <List
          loading={local.loading}
          loadingPlaceholder={local.loadingPlaceholder}
          emptyPlaceholder={local.emptyPlaceholder}
          format={local.format}
        />
      </Container>
    </SelectContext.Provider>
  );
};

type ContainerProps = Pick<CommonProps, "class">;

const Container: ParentComponent<ContainerProps> = (props) => {
  const select = useSelect();
  return (
    <div
      class={`solid-select-container ${
        props.class !== undefined ? props.class : ""
      }`}
      data-disabled={select.disabled}
      onFocusIn={select.onFocusIn}
      onFocusOut={select.onFocusOut}
      onMouseDown={(event) => {
        select.onMouseDown(event);
        event.currentTarget.getElementsByTagName("input")[0].focus();
      }}
    >
      {props.children}
    </div>
  );
};

type ControlProps = Omit<CommonProps, "class">;

const Control: Component<ControlProps> = (props) => {
  const select = useSelect();

  const removeValue = (index: number) => {
    const value = select.value();
    select.setValue([...value.slice(0, index), ...value.slice(index + 1)]);
  };

  return (
    <div
      class="solid-select-control"
      data-multiple={select.multiple}
      data-has-value={select.hasValue()}
      data-disabled={select.disabled}
      onClick={select.onClick}
    >
      <Show when={!select.hasValue() && !select.hasInputValue()}>
        <Placeholder>{props.placeholder}</Placeholder>
      </Show>
      <Show
        when={select.hasValue() && !select.multiple && !select.hasInputValue()}
      >
        <SingleValue>{props.format(select.value(), "value")}</SingleValue>
      </Show>
      <Show when={select.hasValue() && select.multiple}>
        <For each={select.value()}>
          {(value, index) => (
            <MultiValue onRemove={() => removeValue(index())}>
              {props.format(value, "value")}
            </MultiValue>
          )}
        </For>
      </Show>
      <Input
        id={props.id}
        name={props.name}
        autofocus={props.autofocus}
        readonly={props.readonly}
        ref={props.ref}
      />
    </div>
  );
};

type PlaceholderProps = Pick<CommonProps, "placeholder">;

const Placeholder: ParentComponent<PlaceholderProps> = (props) => {
  return <div class="solid-select-placeholder">{props.children}</div>;
};

const SingleValue: ParentComponent<{}> = (props) => {
  return <div class="solid-select-single-value">{props.children}</div>;
};

const MultiValue: ParentComponent<{ onRemove: () => void }> = (props) => {
  const select = useSelect();

  return (
    <div class="solid-select-multi-value">
      <span>{props.children}</span>
      <button
        type="button"
        class="solid-select-multi-value-remove"
        onClick={(event: MouseEvent) => {
          event.stopPropagation();
          props.onRemove();
        }}
      >
        ⨯
      </button>
    </div>
  );
};

type InputProps = Pick<
  CommonProps,
  "id" | "name" | "autofocus" | "readonly" | "ref"
>;

const Input: Component<InputProps> = (props) => {
  const select = useSelect();
  return (
    <input
      ref={props.ref}
      id={props.id}
      name={props.name}
      class="solid-select-input"
      data-multiple={select.multiple}
      data-is-active={select.isActive()}
      type="text"
      tabIndex={0}
      autocomplete="off"
      autocapitalize="none"
      autocorrect="off"
      autofocus={props.autofocus}
      readonly={props.readonly}
      disabled={select.disabled}
      size={1}
      value={select.inputValue()}
      onInput={select.onInput}
      onKeyDown={(event: KeyboardEvent) => {
        select.onKeyDown(event);
        if (!event.defaultPrevented) {
          if (event.key === "Escape") {
            event.preventDefault();
            event.stopPropagation();
            (event.target as HTMLElement).blur();
          }
        }
      }}
      onMouseDown={(event) => {
        event.stopPropagation();
      }}
    />
  );
};

type ListProps = Pick<
  CommonProps,
  "loading" | "loadingPlaceholder" | "emptyPlaceholder" | "format"
>;

const List: Component<ListProps> = (props) => {
  const select = useSelect();

  return (
    <Show when={select.isOpen()}>
      <div class="solid-select-list">
        <Show
          when={!props.loading}
          fallback={
            <div class="solid-select-list-placeholder">
              {props.loadingPlaceholder}
            </div>
          }
        >
          <For
            each={select.options()}
            fallback={
              <div class="solid-select-list-placeholder">
                {props.emptyPlaceholder}
              </div>
            }
          >
            {(option: CreateSelectOption) => (
              <Option option={option}>{props.format(option, "option")}</Option>
            )}
          </For>
        </Show>
      </div>
    </Show>
  );
};

type OptionProps = {
  option: CreateSelectOption;
};

const Option: ParentComponent<OptionProps> = (props) => {
  const select = useSelect();

  const scrollIntoViewOnFocus = (element: HTMLDivElement) => {
    createEffect(() => {
      if (select.isOptionFocused(props.option)) {
        element.scrollIntoView({ block: "nearest" });
      }
    });
  };
  return (
    <div
      ref={scrollIntoViewOnFocus}
      data-disabled={select.isOptionDisabled(props.option)}
      data-focused={select.isOptionFocused(props.option)}
      class="solid-select-option"
      onClick={() => select.pickOption(props.option)}
    >
      {props.children}
    </div>
  );
};

export {
  Select,
  Container,
  Control,
  Placeholder,
  SingleValue,
  MultiValue,
  Input,
  List,
  Option,
  SelectContext,
  useSelect,
};
