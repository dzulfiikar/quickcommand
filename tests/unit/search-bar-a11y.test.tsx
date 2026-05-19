import { describe, expect, test } from "bun:test";
import { renderToStaticMarkup } from "react-dom/server";
import { SearchBar } from "../../src/renderer/src/components/SearchBar";

describe("SearchBar accessibility", () => {
  test("renders an explicit accessible name instead of relying on placeholder text alone", () => {
    const html = renderToStaticMarkup(
      <SearchBar onQueryChange={() => {}} placeholder="Search snippets..." />,
    );

    expect(html).toContain("aria-label=");
  });
});
