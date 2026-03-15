import { describe, expect, test } from "bun:test";
import { getSnippetPreviewText } from "../../src/renderer/src/lib/snippet-preview";

describe("snippet preview text", () => {
  test("collapses multiline whitespace into a single preview line", () => {
    expect(
      getSnippetPreviewText("git commit\n  --amend\t\t--no-edit"),
    ).toBe("git commit --amend --no-edit");
  });

  test("trims leading and trailing whitespace", () => {
    expect(getSnippetPreviewText("   Hello world   ")).toBe("Hello world");
  });

  test("preserves non-whitespace command characters", () => {
    expect(getSnippetPreviewText("echo ${HOME} && printf '%s' {name}")).toBe(
      "echo ${HOME} && printf '%s' {name}",
    );
  });
});
