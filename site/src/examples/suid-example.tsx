// Example of building a custom Select with SUID and solid-select core.

import { createSelect, createOptions } from "@thisbeyond/solid-select";
import {
  createUniqueId,
  createSignal,
  createEffect,
  mergeProps,
  splitProps,
  on,
  Show,
  For,
  ParentComponent,
  VoidComponent,
} from "solid-js";
import {
  Box,
  Chip,
  List,
  TextField,
  ListItemButton,
  ListItemText,
  ListItem,
  Paper,
} from "@suid/material";
import createElementRef from "@suid/system/createElementRef";

import { Popper } from "./suid-popper";

type SelectProps = Parameters<typeof createSelect>[0] & {
  id?: string;
  name?: any;
  label?: string;
  error?: string | string[];
  touched?: boolean;
  format?: (data: any, type: "option" | "value") => any;
  placeholder?: string;
  readonly?: boolean;
  loading?: boolean;
  loadingPlaceholder?: string;
  emptyPlaceholder?: string;
  onBlur?: (event: Event) => void;
};

const Select: VoidComponent<SelectProps> = (props) => {
  const [selectProps, local] = splitProps(
    mergeProps(
      {
        format: (data: any, type: "option" | "value") => data,
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
  const select = createSelect(selectProps);

  createEffect(
    on(
      () => local.initialValue,
      (value) => {
        if (value != null) select.setValue(value);
      }
    )
  );

  const removeValue = (index: number) => {
    const value = select.value();
    select.setValue([...value.slice(0, index), ...value.slice(index + 1)]);
  };

  const fieldRef = createElementRef();

  return (
    <Box width={400}>
      <TextField
        ref={fieldRef}
        id={local.id}
        name={local.name}
        label={local.label}
        error={local.touched && local.error != null}
        disabled={select.disabled}
        size="small"
        fullWidth
        InputLabelProps={{
          shrink:
            select.isActive() || select.hasValue() || select.hasInputValue(),
          sx: { textTransform: "capitalize" },
        }}
        InputProps={{
          startAdornment: (
            <Show when={select.hasValue()}>
              <Show when={!select.multiple && !select.hasInputValue()}>
                <Box position="absolute" sx={{ pointerEvents: "none" }}>
                  {local.format(select.value(), "value")}
                </Box>
              </Show>
              <Show when={select.multiple}>
                <For each={select.value()}>
                  {(value, index) => (
                    <Chip
                      sx={{ m: "2px 4px 2px 0px" }}
                      size="small"
                      onMouseDown={select.onMouseDown}
                      onDelete={() => removeValue(index())}
                      label={local.format(value, "value")}
                    />
                  )}
                </For>
              </Show>
            </Show>
          ),
        }}
        sx={{
          "& .MuiInputBase-root": {
            flexWrap: "wrap",
            padding: "6px 6px 6px 14px",
            background: "white",
          },
          "& .MuiInputBase-input": {
            padding: "2.5px 0px",
            minWidth: 30,
            width: 0,
            flexGrow: 1,
            ...(select.isActive() ? {} : { caretColor: "transparent" }),
          },
        }}
        onFocusIn={select.onFocusIn}
        onFocusOut={select.onFocusOut}
        onBlur={local.onBlur}
        onClick={() => !select.disabled && select.toggleOpen()}
        onChange={(_, value) => {
          select.setInputValue(value);
        }}
        onKeyDown={select.onKeyDown}
        value={select.inputValue()}
        placeholder={
          !select.multiple && select.hasValue() ? "" : props.placeholder
        }
      />

      <Popper
        open={select.isOpen()}
        anchorEl={fieldRef.ref}
        placement="bottom"
        onMouseDown={select.onMouseDown}
      >
        <Paper
          sx={{
            overflow: "auto",
            minWidth: fieldRef.ref.clientWidth,
          }}
        >
          <List sx={{ maxHeight: "40vh", overflow: "auto" }}>
            <Show
              when={!local.loading}
              fallback={
                <OptionListPlaceholder>
                  {local.loadingPlaceholder}
                </OptionListPlaceholder>
              }
            >
              <For
                each={select.options()}
                fallback={
                  <OptionListPlaceholder>
                    {local.emptyPlaceholder}
                  </OptionListPlaceholder>
                }
              >
                {(option) => (
                  <ListItemButton
                    onClick={() => select.pickOption(option)}
                    selected={select.isOptionFocused(option)}
                    disabled={select.isOptionDisabled(option)}
                  >
                    <ListItemText
                      disableTypography
                      sx={{
                        "& mark": {
                          textDecoration: "underline",
                          background: "transparent",
                        },
                        overflow: "hidden",
                        whiteSpace: "nowrap",
                        textOverflow: "ellipsis",
                      }}
                    >
                      {local.format(option, "option")}
                    </ListItemText>
                  </ListItemButton>
                )}
              </For>
            </Show>
          </List>
        </Paper>
      </Popper>
    </Box>
  );
};

const OptionListPlaceholder: ParentComponent = (props) => {
  return (
    <ListItem>
      <ListItemText>{props.children}</ListItemText>
    </ListItem>
  );
};

export const SuidExample = () => {
  const createValue = (name) => {
    return { id: createUniqueId(), name };
  };

  const candidates = [
    createValue("apple"),
    createValue("banana"),
    createValue("pear"),
    createValue("pineapple"),
    createValue("kiwi"),
  ];

  const [values, setValues] = createSignal(candidates);
  const [selectedValues, setSelectedValues] = createSignal([]);

  const onChange = (selected) => {
    setSelectedValues(selected);

    const lastValue = selected[selected.length - 1];
    if (lastValue && !values().includes(lastValue)) {
      setValues([...values(), lastValue]);
    }
  };

  const props = createOptions(values, {
    key: "name",
    disable: (value) => selectedValues().includes(value),
    filterable: true, // Default
    createable: createValue,
  });

  return (
    <Select
      multiple
      label="Fruit"
      placeholder="Pick some fruit"
      onChange={onChange}
      {...props}
    />
  );
};
