import {
  Show,
  For,
  splitProps,
  mergeProps,
  ParentComponent,
  createEffect,
  on,
  createContext,
  useContext,
  JSX,
} from "solid-js";
import {
  createSelect,
  Value as ValueType,
  CreateSelectProps,
} from "./create-select";

interface CommonProps<O, V> {
  format: (
    data: O | ValueType<V>,
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
  children?: JSX.Element;
}

type SelectReturn<O,V> = ReturnType<typeof createSelect<O,V>>;

type SelectProps<O, V> = CreateSelectProps<O, V> & Partial<CommonProps<O,V>>;

function SelectContext<O,V>() {
  return createContext<SelectReturn<O,V>>()
};

function SelectContextProvider<O,V>(props:{value: SelectReturn<O,V>, children: JSX.Element}) {
  return SelectContext<O,V>().Provider(props)
};

const useSelect = <O,V>() => {
  const context = useContext(SelectContext<O,V>());
  if (!context) throw new Error("No SelectContext found in ancestry.");
  return context;
};

function Select<O,V>(props: SelectProps<O,V>) {
  const [selectProps, local] = splitProps(
    mergeProps(
      {
        format: ((data, type) => data) as CommonProps<O,V>["format"],
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
    ]
  );
  const select = createSelect<O,V>(selectProps);

  createEffect(
    on(
      () => local.initialValue,
      (value) => value !== undefined && select.setValue(value)
    )
  );

  return (
    <SelectContextProvider value={select}>
      <Container class={local.class}>
        <Control
          id={local.id}
          name={local.name}
          format={local.format}
          placeholder={local.placeholder}
          autofocus={local.autofocus}
          readonly={local.readonly}
        />
        <List
          loading={local.loading}
          loadingPlaceholder={local.loadingPlaceholder}
          emptyPlaceholder={local.emptyPlaceholder}
          format={local.format}
        />
      </Container>
    </SelectContextProvider>
  );
};

type ContainerProps<O,V> = Pick<CommonProps<O,V>, "class" | "children">;

function Container<O,V>(props:ContainerProps<O,V>) {
  const select = useSelect<O,V>();
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

type ControlProps<O,V> = Omit<CommonProps<O,V>, "class">;

function Control<O,V>(props:ControlProps<O,V>) {
  const select = useSelect<O, V>();

  const removeValue = (index: number) => {
    const value = select.value() as V[];
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
        <SingleValue>{props.format(select.value()!, "value")}</SingleValue>
      </Show>
      <Show when={select.hasValue() && select.multiple}>
        <For each={select.value() as V[]}>
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
      />
    </div>
  );
};

type PlaceholderProps<O,V> = Pick<CommonProps<O,V>, "placeholder" | "children">

function Placeholder<O,V>(props:PlaceholderProps<O,V>) {
  return <div class="solid-select-placeholder">{props.children}</div>;
};

const SingleValue: ParentComponent<{}> = (props) => {
  return <div class="solid-select-single-value">{props.children}</div>;
};

const MultiValue: ParentComponent<{ onRemove: () => void }> = (props) => {
  const select = useSelect();

  return (
    <div class="solid-select-multi-value">
      {props.children}
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

type InputProps<O,V> = Pick<CommonProps<O,V>, "id" | "name" | "autofocus" | "readonly">;

function Input<O,V>(props:InputProps<O,V>)  {
  const select = useSelect();
  return (
    <input
      id={props.id}
      name={props.name}
      class="solid-select-input"
      data-multiple={select.multiple}
      data-is-active={select.isActive()}
      type="text"
      tabIndex={0}
      autocomplete="off"
      autocapitalize="none"
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

type ListProps<O,V> = Pick<
  CommonProps<O,V>,
  "loading" | "loadingPlaceholder" | "emptyPlaceholder" | "format"
>;

function List<O,V>(props:ListProps<O,V>) {
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
            {(option: O) => (
              <Option option={option}>{props.format(option, "option")}</Option>
            )}
          </For>
        </Show>
      </div>
    </Show>
  );
};

type OptionProps<O> = {
  option: O;
  children?: JSX.Element;
};

function Option<O>(props:OptionProps<O>) {
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
