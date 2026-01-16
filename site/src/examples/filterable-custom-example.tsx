import {
  Select,
  createOptions,
  fuzzySearch,
  fuzzyHighlight,
} from "@thisbeyond/solid-select";

const customFuzzySort = (searchString, options, valueFields) => {
  const sorted = [];

  for (let index = 0; index < options.length; index++) {
    const option = options[index];
    const fieldResults = valueFields.reduce(
      (map, target) =>
        map.set(target, fuzzySearch(searchString, option.value[target])),
      new Map(),
    );

    let score = 0;
    for (const [, result] of fieldResults) score += result.score;
    if (score) sorted.push({ score, option, index, fieldResults });
  }

  sorted.sort((a, b) => b.score - a.score || a.index - b.index);

  return sorted;
};

export const FilterableCustomExample = () => {
  const options = [
    { name: "apple", description: "A delicious fruit" },
    { name: "orange", description: "A refreshing citrus." },
    { name: "banana", description: "A slippery gag." },
  ];

  const format = (value, type, meta) => {
    switch (type) {
      case "label":
        return (
          <div class="flex flex-col justify-items-center gap-2">
            <span>{meta.highlight?.name ?? value.name}</span>
            <span class="text-sm">
              {meta.highlight?.description ?? value.description}
            </span>
          </div>
        );
      case "value":
        return value.name;
    }
  };

  const highlighter = (match) => <mark class="distinctive">{match}</mark>;

  const filterable = (inputValue, options) =>
    customFuzzySort(inputValue, options, ["name", "description"]).map(
      (result) => ({
        ...result.option,
        label: format(result.option.value, "label", {
          highlight: {
            name: fuzzyHighlight(result.fieldResults.get("name"), highlighter),
            description: fuzzyHighlight(
              result.fieldResults.get("description"),
              highlighter,
            ),
          },
        }),
      }),
    );

  const props = createOptions(options, { filterable, format });
  return <Select {...props} />;
};
