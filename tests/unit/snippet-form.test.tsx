import { describe, expect, test } from "bun:test";
import { renderToStaticMarkup } from "react-dom/server";
import { SnippetForm } from "../../src/renderer/src/components/SnippetForm";
import type { SnippetInput } from "../../src/shared/snippet-model";

const draft: SnippetInput = {
  title: "Git Status",
  value: "git status --short",
};

describe("SnippetForm", () => {
  test("renders a delete action only when editing an existing snippet", () => {
    const createHtml = renderToStaticMarkup(
      <SnippetForm
        draft={draft}
        onChange={() => {}}
        onSubmit={async () => {}}
        saving={false}
      />,
    );

    const editHtml = renderToStaticMarkup(
      <SnippetForm
        deleteDisabled={false}
        draft={draft}
        onChange={() => {}}
        onDelete={async () => {}}
        onSubmit={async () => {}}
        saving={false}
      />,
    );

    expect(createHtml).not.toContain("Delete snippet");
    expect(editHtml).toContain("Delete snippet");
  });
});
