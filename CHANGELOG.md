# Changelog

## [0.4.0] - 2022-02-08

### Added

- Support passing `id` prop to the `Select` control. The id will be set on the
  contained `input` allowing the control to be associated with a corresponding
  `label` for example.

## [0.3.0] - 2022-02-07

### Added

- Expose a `hasValue` property as part of the `createSelect` returned interface.
  The reactive property handles the differences between 'multiple' and 'single'
  value modes correctly in order to return an accurate boolean value.

### Fixed

- Fix reliance on implicit boolean conversion for control show logic. Use the
  new `hasValue` check instead to properly account for multi vs single value
  differences.

## [0.2.1] - 2022-02-05

### Fixed

- Update `rollup-plugin-solid` to 1.2.2 to address
  [Bundlephobia](bundlephobia.com) build error (caused by it tripping over the
  optinal chaining syntax `?.`). The plugin now targets a slightly older env in
  order to compile this syntax away.

## [0.2.0] - 2022-02-04

### Added

- Support picking multiple options in Select component.

  Add a `multiple` prop that, when true, customises the component to display and
  manage multiple values. Support removing values with keyboard backspace or
  removing an arbitrary value through clicking a remove button on a value.

  ```jsx
  <Select multiple options={["one", "two", "three"]} />
  ```

  As part of this, expose in the select interface whether it was configured for
  multiple values or not. This makes it easier for consumers to check the mode
  and can be useful for determining whether to expect value as an array or not.

- Support options generation via function callback. When `options` is specified
  as a function, call it on input change passing the current input value. The
  function should return the list of options to use. For example:

  ```js
  (inputValue: string) =>
    ["one", "two", "three"].filter((option) => option.startsWith(inputValue));
  ```

  To address the common case of filtering options, also provide a
  `createFilterable` helper. The helper accepts the initial list of options and
  returns the props required to set up filtering them against the input value,
  complete with highlighting the match in the string. Can be used to filter
  plain strings (or objects by passing a 'key' to the configuration):

  ```jsx
  <Select {...createFilterable(["one", "two", "three"])} />
  ```

- Make Select component read only by default (when a static list of options is
  passed). When in read only mode, the input is not editable. This can be
  overridden explicitly by passing the `readonly` prop to the Select component
  with the preferred value.

- Support `autofocus` attribute on Select component (to request the browser to
  auto focus the field on page load).

### Changed

- Toggle options list on click rather always open. This is more natural as
  someone might just be checking the options and then want to close the control
  with another click on the control.

### Fixed

- Fix inconsistent text rendering in the Select input.

  Ensure the input element matches the specified font for the control so that
  there is no difference between displayed value and typed text rendering.

  Also, prevent the input computing a different size due to browser default
  styles (e.g. margin, padding). Force a standard line-height for the control
  as Firefox prevents setting a smaller line-height for inputs (which can cause
  a discrepancy in how the value text is rendered vs the input text).

## [0.1.0] - 2022-01-23

Initial release featuring core create select logic, accompanying component
blocks and a composed component for convenience.

<!-- prettier-ignore -->
[Unreleased]: https://github.com/thisbeyond/solid-select/compare/0.4.0...HEAD

[0.4.0]: https://github.com/thisbeyond/solid-select/compare/0.3.0...0.4.0
[0.3.0]: https://github.com/thisbeyond/solid-select/compare/0.2.1...0.3.0
[0.2.1]: https://github.com/thisbeyond/solid-select/compare/0.2.0...0.2.1
[0.2.0]: https://github.com/thisbeyond/solid-select/compare/0.1.0...0.2.0
[0.1.0]: https://github.com/thisbeyond/solid-select/compare/null...0.1.0
