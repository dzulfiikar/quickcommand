import { describe, expect, test } from "bun:test";
import {
  getSnippetPreviewParts,
  getSnippetPreviewText,
} from "../../src/renderer/src/lib/snippet-preview";

describe("snippet preview text", () => {
  test("collapses multiline whitespace into a single preview line", () => {
    expect(getSnippetPreviewText("git commit\n  --amend\t\t--no-edit")).toBe(
      "git commit --amend --no-edit",
    );
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

describe("snippet preview parts", () => {
  test("returns one text part when no placeholders present", () => {
    expect(getSnippetPreviewParts("git status")).toEqual([
      { kind: "text", value: "git status" },
    ]);
  });

  test("splits placeholders out of preview text", () => {
    expect(getSnippetPreviewParts("Send {name} the {report} doc")).toEqual([
      { kind: "text", value: "Send " },
      { kind: "param", name: "name" },
      { kind: "text", value: " the " },
      { kind: "param", name: "report" },
      { kind: "text", value: " doc" },
    ]);
  });

  test("supports placeholder at start and end", () => {
    expect(getSnippetPreviewParts("{first} and {last}")).toEqual([
      { kind: "param", name: "first" },
      { kind: "text", value: " and " },
      { kind: "param", name: "last" },
    ]);
  });

  test("does not split shell-style ${VAR} references", () => {
    expect(getSnippetPreviewParts("echo ${HOME}")).toEqual([
      { kind: "text", value: "echo ${HOME}" },
    ]);
  });

  test("returns empty array for empty input", () => {
    expect(getSnippetPreviewParts("   ")).toEqual([]);
  });
});
