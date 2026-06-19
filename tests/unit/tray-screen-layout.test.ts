import { describe, expect, test } from "bun:test";
import { readFile } from "node:fs/promises";

const trayScreenUrl = new URL(
  "../../src/renderer/src/features/TrayScreen.tsx",
  import.meta.url,
);

describe("TrayScreen layout — content-sizing feedback-loop guard", () => {
  test("TrayShell is natural-height (no window-tied max-h-full / h-full)", async () => {
    const source = await readFile(trayScreenUrl, "utf8");

    // Isolate the TrayShell's className. A window-tied height there
    // (`max-h-full` / `h-full`) makes the float shrink as the window shrinks,
    // which feeds a smaller measurement back through useReportContentHeight and
    // collapses the popover to its header — the desktop "tray is broken" bug.
    const shellClass = source.match(
      /function TrayShell[\s\S]*?className="([^"]*surface-float[^"]*)"/,
    );
    expect(shellClass).not.toBeNull();
    const cls = shellClass?.[1] ?? "";

    expect(cls).toContain("surface-float");
    expect(cls).not.toContain("max-h-full");
    expect(cls).not.toContain("h-full");
  });

  test("the snippet list keeps its own height cap so long lists still scroll", async () => {
    const source = await readFile(trayScreenUrl, "utf8");
    // The list — not the shell — owns the height ceiling, so the float grows
    // with content up to this cap and the window content-sizes to match.
    expect(source).toMatch(/ScrollArea className="max-h-\[22rem\] min-h-0"/);
  });
});
