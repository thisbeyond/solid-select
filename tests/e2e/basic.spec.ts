import { test, expect } from "@playwright/test";

test("Select component renders and can open", async ({ page }) => {
  await page.goto("/");

  // Check if title is present
  await expect(
    page.getByRole("heading", { name: "Solid Select Playground" })
  ).toBeVisible();

  // Find the select placeholder
  const placeholder = page.getByText("Choose a fruit...");
  await expect(placeholder).toBeVisible();

  // Click to open
  // The input might overlay the placeholder, so force click or click the container
  await placeholder.click({ force: true });

  // Check if options are visible
  await expect(page.getByText("Apple")).toBeVisible();
  await expect(page.getByText("Banana")).toBeVisible();
  await expect(page.getByText("Cherry")).toBeVisible();
});
