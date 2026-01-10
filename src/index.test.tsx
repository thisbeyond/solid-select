import { render } from "@solidjs/testing-library";
import { Select } from "./index";

describe("Select Component", () => {
  it("renders without crashing", () => {
    const { getByRole } = render(() => <Select options={["Apple", "Banana", "Cherry"]} />);
    // The input doesn't have combobox role by default, but it is a textbox
    expect(getByRole("textbox")).toBeInTheDocument();
  });

  it("shows placeholder text", () => {
    const { getByText } = render(() => <Select options={["Apple", "Banana", "Cherry"]} placeholder="Pick a fruit" />);
    expect(getByText("Pick a fruit")).toBeInTheDocument();
  });
});
