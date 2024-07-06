type FuzzySearchMatch = boolean;

interface FuzzySearchResult {
  target: string;
  score: number;
  matches: FuzzySearchMatch[];
}

type FuzzySortResult = (FuzzySearchResult & {
  item: any;
  index: number;
})[];

const SCORING = {
  NO_MATCH: 0,
  MATCH: 1,
  WORD_START: 2,
  START: 3,
};

const fuzzySearch = (value: string, target: string): FuzzySearchResult => {
  let score = SCORING.NO_MATCH;
  let matches: FuzzySearchMatch[] = [];

  if (value.length <= target.length) {
    const valueChars = Array.from(value.toLocaleLowerCase());
    const targetChars = Array.from(target.toLocaleLowerCase());
    let delta = SCORING.START;

    outer: for (
      let valueIndex = 0, targetIndex = 0;
      valueIndex < valueChars.length;
      valueIndex++
    ) {
      while (targetIndex < targetChars.length) {
        if (targetChars[targetIndex] === valueChars[valueIndex]) {
          matches[targetIndex] = true;

          if (
            delta === SCORING.MATCH &&
            targetChars[targetIndex - 1] === " " &&
            targetChars[targetIndex] !== " "
          ) {
            delta = SCORING.WORD_START;
          }

          score += delta;
          delta++;
          targetIndex++;
          continue outer;
        } else {
          delta = SCORING.MATCH;
          targetIndex++;
        }
      }
      // Didn't exhaust search value.
      score = SCORING.NO_MATCH;
      matches.length = 0;
    }
  }

  return {
    target,
    score,
    matches,
  };
};

const fuzzyHighlight = (
  searchResult: FuzzySearchResult,
  highlighter = (match: string) => <mark>{match}</mark>
) => {
  const target = searchResult.target;
  const matches = searchResult.matches;
  const separator = "\x00";

  const highlighted = [];
  let open = false;

  for (let index = 0; index < target.length; index++) {
    const char = target[index];
    const matched = matches[index];
    if (!open && matched) {
      highlighted.push(separator);
      open = true;
    } else if (open && !matched) {
      highlighted.push(separator);
      open = false;
    }
    highlighted.push(char);
  }

  if (open) {
    highlighted.push(separator);
    open = false;
  }

  return (
    <>
      {highlighted
        .join("")
        .split(separator)
        .map((part, index) => (index % 2 ? highlighter(part) : part))}
    </>
  );
};

const fuzzySort = (
  value: string,
  items: any[],
  key?: string
): FuzzySortResult => {
  const sorted = [];

  for (let index = 0; index < items.length; index++) {
    const item = items[index];
    const target = key ? item[key] : item;
    const result = fuzzySearch(value, target);
    if (result.score) {
      sorted.push({ ...result, item, index });
    }
  }

  sorted.sort((a, b) => {
    let delta = b.score - a.score;
    if (delta === 0) {
      delta = a.index - b.index;
    }
    return delta;
  });

  return sorted;
};

export { fuzzySort, fuzzySearch, fuzzyHighlight };
export type { FuzzySearchResult, FuzzySortResult };