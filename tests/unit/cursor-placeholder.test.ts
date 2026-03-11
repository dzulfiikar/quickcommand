import { describe, expect, it } from "bun:test";

import {
  CURSOR_PLACEHOLDER,
  extractParams,
  hasParams,
  parseCursorPlaceholder,
  substituteParams,
} from "../../src/shared/cursor-placeholder";

describe("extractParams", () => {
  it("returns empty array when no params exist", () => {
    expect(extractParams("echo hello")).toEqual([]);
  });

  it("extracts a single param", () => {
    expect(extractParams('git commit -M "{message}"')).toEqual(["message"]);
  });

  it("extracts multiple unique params in order", () => {
    expect(extractParams("curl -X {method} {url} -H 'Bearer {token}'")).toEqual(
      ["method", "url", "token"],
    );
  });

  it("deduplicates repeated params", () => {
    expect(extractParams("{host}:{host}/api")).toEqual(["host"]);
  });

  it("ignores shell variables like ${HOME}", () => {
    expect(extractParams("cd ${HOME} && echo {name}")).toEqual(["name"]);
  });

  it("ignores empty braces", () => {
    expect(extractParams("echo {} {name}")).toEqual(["name"]);
  });

  it("supports underscores in param names", () => {
    expect(extractParams("{my_param} {another_one}")).toEqual([
      "my_param",
      "another_one",
    ]);
  });
});

describe("hasParams", () => {
  it("returns false for plain text", () => {
    expect(hasParams("echo hello")).toBe(false);
  });

  it("returns true when params exist", () => {
    expect(hasParams("echo {name}")).toBe(true);
  });

  it("returns false for shell variables", () => {
    expect(hasParams("echo ${HOME}")).toBe(false);
  });
});

describe("substituteParams", () => {
  it("replaces all occurrences of a param", () => {
    expect(substituteParams("{host}:{host}/api", { host: "localhost" })).toBe(
      "localhost:localhost/api",
    );
  });

  it("replaces multiple different params", () => {
    expect(
      substituteParams("curl -X {method} {url}", {
        method: "POST",
        url: "https://api.example.com",
      }),
    ).toBe("curl -X POST https://api.example.com");
  });

  it("leaves unmatched params as-is", () => {
    expect(substituteParams("{a} {b}", { a: "yes" })).toBe("yes {b}");
  });

  it("preserves shell variables", () => {
    expect(substituteParams("${HOME}/{name}", { name: "dir" })).toBe(
      "${HOME}/dir",
    );
  });

  it("handles empty values", () => {
    expect(substituteParams('git commit -M "{msg}"', { msg: "" })).toBe(
      'git commit -M ""',
    );
  });
});

describe("parseCursorPlaceholder (backward compat)", () => {
  it("returns text unchanged when no placeholder exists", () => {
    const result = parseCursorPlaceholder("echo hello");
    expect(result.cleanText).toBe("echo hello");
    expect(result.cursorOffset).toBe(0);
  });

  it("strips the placeholder and computes offset from end", () => {
    const result = parseCursorPlaceholder('git commit -M "{cursor}"');
    expect(result.cleanText).toBe('git commit -M ""');
    expect(result.cursorOffset).toBe(1);
  });

  it("exports the cursor placeholder constant", () => {
    expect(CURSOR_PLACEHOLDER).toBe("{cursor}");
  });
});
