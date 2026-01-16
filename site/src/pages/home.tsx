import { createSignal, Match, onMount, Switch } from "solid-js";
import { Select, createOptions } from "@thisbeyond/solid-select";
import cc from "classcat";

import { WaveFooter } from "../wave-footer";
import { Header } from "../header";
import { FeatureCard } from "../feature-card";
import { SectionHeading } from "../section-heading";
import { InstallButton } from "../install-button";
import { Example, ExampleCode, ExampleDemo } from "../example";
import { StylingExample } from "../examples/styling-example";
import stylingExampleString from "../examples/styling-example?raw";
import { StaticExample } from "../examples/static-example";
import staticExampleString from "../examples/static-example?raw";
import { ReactiveExample } from "../examples/reactive-example";
import reactiveExampleString from "../examples/reactive-example?raw";
import { FormatExample } from "../examples/format-example";
import formatExampleString from "../examples/format-example?raw";
import { FormatOptionsExample } from "../examples/format-options-example";
import formatOptionsExampleString from "../examples/format-options-example?raw";
import { ResetExample } from "../examples/reset-example";
import resetExampleString from "../examples/reset-example?raw";
import { RefFocusExample } from "../examples/ref-focus-example";
import refFocusExampleString from "../examples/ref-focus-example?raw";
import { AsyncFetchExample } from "../examples/async-fetch-example";
import asyncFetchExampleString from "../examples/async-fetch-example?raw";
import { EnableDisableExample } from "../examples/enable-disable-example";
import enableDisableExampleString from "../examples/enable-disable-example?raw";
import { FilterableExample } from "../examples/filterable-example";
import filterableExampleString from "../examples/filterable-example?raw";
import { FilterableObjectsExample } from "../examples/filterable-objects-example";
import filterableObjectsExampleString from "../examples/filterable-objects-example?raw";
import { FilterableCustomExample } from "../examples/filterable-custom-example";
import filterableCustomExampleString from "../examples/filterable-custom-example?raw";
import { CreateableExample } from "../examples/createable-example";
import createableExampleString from "../examples/createable-example?raw";
import { CreateableObjectsExample } from "../examples/createable-objects-example";
import createableObjectsExampleString from "../examples/createable-objects-example?raw";
import { CreateableCustomExample } from "../examples/createable-custom-example";
import createableCustomExampleString from "../examples/createable-custom-example?raw";
import { MultipleExample } from "../examples/multiple-example";
import multipleExampleString from "../examples/multiple-example?raw";
import { MultipleFilterableExample } from "../examples/multiple-filterable-example";
import multipleFilterableExampleString from "../examples/multiple-filterable-example?raw";
import { MultipleCreateableExample } from "../examples/multiple-createable-example";
import multipleCreateableExampleString from "../examples/multiple-createable-example?raw";
import { DisabledOptionsExample } from "../examples/disabled-options-example";
import disabledOptionsExampleString from "../examples/disabled-options-example?raw";
import { AutoScrollExample } from "../examples/auto-scroll-example";
import autoScrollExampleString from "../examples/auto-scroll-example?raw";
import { KitchenSinkExample } from "../examples/kitchen-sink-example";
import kitchenSinkExampleString from "../examples/kitchen-sink-example?raw";
import { GroupingExample } from "../examples/grouping-example";
import groupingExampleString from "../examples/grouping-example?raw";
import { SuidExample } from "../examples/suid-example";
import suidExampleString from "../examples/suid-example?raw";

import "./home.css";
import { useSearchParams } from "@solidjs/router";

const stylingExampleStylesheet = `.custom {
  &.solid-select-container {
    color: #fa7f25;
  }
  .solid-select-control {
    border-color: #fca560;
    &:focus-within {
      outline-color: #fca560;
    }
  }
  .solid-select-placeholder {
    color: #fca560;
  }
  .solid-select-option {
    &:hover {
      background-color: #fa7f25;
      color: #fff;
    }
    &[data-focused="true"] {
      background-color: #fca560;
      color: #fff;
    }
  }
}
`;

const Home = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [example, setExample] = createSignal<string>();
  let examplesRef: HTMLDivElement | undefined;

  onMount(() => {
    if (searchParams.example) {
      setExample(decodeURIComponent(searchParams.example));
      setTimeout(() => examplesRef.scrollIntoView({ behavior: "smooth" }), 250);
    }
  });

  const examples = [
    "Styling",
    "Static",
    "Reactive",
    "Format",
    "Format (Options)",
    "Reset",
    "Focus with ref",
    "Async Fetch",
    "Enable / Disable",
    "Filterable",
    "Filterable (Objects)",
    "Filterable (Custom)",
    "Createable",
    "Createable (Objects)",
    "Createable (Custom)",
    "Multiple",
    "Multiple Filterable",
    "Multiple Createable",
    "Disabled Options",
    "Grouping",
    "Auto scroll",
    "Kitchen Sink",
    "SUID Integration",
  ];
  const selectProps = createOptions(examples);

  return (
    <div class="leading-normal tracking-normal text-white ">
      <Header />

      <section id="features" class="bg-white border-b py-8">
        <div class="container mx-auto pt-4 pb-12 px-8 sm:px-20">
          <SectionHeading>Features</SectionHeading>

          <div class="grid md:grid-cols-2 auto-rows-fr gap-8">
            <FeatureCard title="Built for Solid">
              Leverages fine-grained reactivity primitives for coordination.
            </FeatureCard>
            <FeatureCard title="Flexible">
              Built to support a wide range of cases, from single selects to
              multi-select autocomplete lists.
            </FeatureCard>
            <FeatureCard title="Extendable">
              Use the pre-fabricated components or build your own from the core
              primitives.
            </FeatureCard>
            <FeatureCard title="Zero dependencies">
              Just pair with Solid and good to go.
            </FeatureCard>
          </div>
        </div>
      </section>
      <section id="examples" class="bg-gray-100 py-8" ref={examplesRef}>
        <div class="container mx-auto pt-4 pb-12 px-8 sm:px-20">
          <SectionHeading>Examples</SectionHeading>
          <Select
            class={"home"}
            placeholder="Select example..."
            initialValue={example()}
            onChange={(value) => {
              setExample(value);
              setSearchParams({ example: encodeURIComponent(value) });
            }}
            {...selectProps}
          />
          <Switch
            fallback={
              <Example>
                <ExampleDemo />
                <ExampleCode code="\nSelect an example to see the related code.\n " />
              </Example>
            }
          >
            <Match when={example() === "Styling"}>
              <Example>
                <ExampleDemo>
                  <StylingExample />
                </ExampleDemo>
                <div class="w-full lg:flex-1 lg:max-w-1/2">
                  <ExampleCode
                    code={stylingExampleString}
                    class="mb-1 flex-1 !lg:max-w-full"
                  />
                  <ExampleCode
                    stylesheet={stylingExampleStylesheet}
                    class="flex-1 !lg:max-w-full"
                  />
                </div>
              </Example>
            </Match>
            <Match when={example() === "Static"}>
              <Example>
                <ExampleDemo>
                  <StaticExample />
                </ExampleDemo>
                <ExampleCode code={staticExampleString} />
              </Example>
            </Match>
            <Match when={example() === "Reactive"}>
              <Example>
                <ExampleDemo>
                  <ReactiveExample />
                </ExampleDemo>
                <ExampleCode code={reactiveExampleString} />
              </Example>
            </Match>
            <Match when={example() === "Format"}>
              <Example>
                <ExampleDemo>
                  <FormatExample />
                </ExampleDemo>
                <ExampleCode code={formatExampleString} />
              </Example>
            </Match>
            <Match when={example() === "Format (Options)"}>
              <Example>
                <ExampleDemo>
                  <FormatOptionsExample />
                </ExampleDemo>
                <ExampleCode code={formatOptionsExampleString} />
              </Example>
            </Match>
            <Match when={example() === "Reset"}>
              <Example>
                <ExampleDemo>
                  <ResetExample />
                </ExampleDemo>
                <ExampleCode code={resetExampleString} />
              </Example>
            </Match>
            <Match when={example() === "Focus with ref"}>
              <Example>
                <ExampleDemo>
                  <RefFocusExample />
                </ExampleDemo>
                <ExampleCode code={refFocusExampleString} />
              </Example>
            </Match>
            <Match when={example() === "Async Fetch"}>
              <Example>
                <ExampleDemo>
                  <AsyncFetchExample />
                </ExampleDemo>
                <ExampleCode code={asyncFetchExampleString} />
              </Example>
            </Match>
            <Match when={example() === "Enable / Disable"}>
              <Example>
                <ExampleDemo>
                  <EnableDisableExample />
                </ExampleDemo>
                <ExampleCode code={enableDisableExampleString} />
              </Example>
            </Match>
            <Match when={example() === "Filterable"}>
              <Example>
                <ExampleDemo>
                  <FilterableExample />
                </ExampleDemo>
                <ExampleCode code={filterableExampleString} />
              </Example>
            </Match>
            <Match when={example() === "Filterable (Objects)"}>
              <Example>
                <ExampleDemo>
                  <FilterableObjectsExample />
                </ExampleDemo>
                <ExampleCode code={filterableObjectsExampleString} />
              </Example>
            </Match>
            <Match when={example() === "Filterable (Custom)"}>
              <Example>
                <ExampleDemo>
                  <FilterableCustomExample />
                </ExampleDemo>
                <ExampleCode code={filterableCustomExampleString} />
              </Example>
            </Match>
            <Match when={example() === "Createable"}>
              <Example>
                <ExampleDemo>
                  <CreateableExample />
                </ExampleDemo>
                <ExampleCode code={createableExampleString} />
              </Example>
            </Match>
            <Match when={example() === "Createable (Objects)"}>
              <Example>
                <ExampleDemo>
                  <CreateableObjectsExample />
                </ExampleDemo>
                <ExampleCode code={createableObjectsExampleString} />
              </Example>
            </Match>
            <Match when={example() === "Createable (Custom)"}>
              <Example>
                <ExampleDemo>
                  <CreateableCustomExample />
                </ExampleDemo>
                <ExampleCode code={createableCustomExampleString} />
              </Example>
            </Match>
            <Match when={example() === "Multiple"}>
              <Example>
                <ExampleDemo>
                  <MultipleExample />
                </ExampleDemo>
                <ExampleCode code={multipleExampleString} />
              </Example>
            </Match>
            <Match when={example() === "Multiple Filterable"}>
              <Example>
                <ExampleDemo>
                  <MultipleFilterableExample />
                </ExampleDemo>
                <ExampleCode code={multipleFilterableExampleString} />
              </Example>
            </Match>
            <Match when={example() === "Multiple Createable"}>
              <Example>
                <ExampleDemo>
                  <MultipleCreateableExample />
                </ExampleDemo>
                <ExampleCode code={multipleCreateableExampleString} />
              </Example>
            </Match>
            <Match when={example() === "Disabled Options"}>
              <Example>
                <ExampleDemo>
                  <DisabledOptionsExample />
                </ExampleDemo>
                <ExampleCode code={disabledOptionsExampleString} />
              </Example>
            </Match>
            <Match when={example() === "Grouping"}>
              <Example>
                <ExampleDemo>
                  <GroupingExample />
                </ExampleDemo>
                <ExampleCode code={groupingExampleString} />
              </Example>
            </Match>
            <Match when={example() === "Auto scroll"}>
              <Example>
                <ExampleDemo>
                  <AutoScrollExample />
                </ExampleDemo>
                <ExampleCode code={autoScrollExampleString} />
              </Example>
            </Match>
            <Match when={example() === "Kitchen Sink"}>
              <Example>
                <ExampleDemo>
                  <KitchenSinkExample />
                </ExampleDemo>
                <ExampleCode code={kitchenSinkExampleString} />
              </Example>
            </Match>
            <Match when={example() === "SUID Integration"}>
              <Example>
                <ExampleDemo>
                  <SuidExample />
                </ExampleDemo>
                <ExampleCode code={suidExampleString} />
              </Example>
            </Match>
          </Switch>
        </div>
      </section>
      <footer class="bg-gradient">
        <WaveFooter />
        <section id="get-it" class="container mx-auto text-center p-6 pb-12">
          <SectionHeading variant="light">Get it</SectionHeading>
          <h3 class="mb-4 text-2xl leading-tight">
            Install with NPM (or check out the code on{" "}
            <a
              class="hover:underline text-orange-200"
              href="https://github.com/thisbeyond/solid-select"
            >
              Github
            </a>
            )
          </h3>
          <InstallButton />
        </section>
      </footer>
    </div>
  );
};

export default Home;
