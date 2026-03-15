import { describe, expect, test } from "bun:test";
import {
  getLibraryPageItems,
  getLibraryPageForItemId,
  getLibraryPaginationState,
  getTrayPageItems,
  getTrayPaginationState,
  LIBRARY_PAGE_SIZE,
  TRAY_PAGE_SIZE,
} from "../../src/renderer/src/features/tray-pagination";

const snippets = Array.from({ length: 12 }, (_, index) => ({
  id: String(index + 1),
}));

describe("tray pagination", () => {
  test("returns an empty first page for an empty tray list", () => {
    expect(getTrayPaginationState(0, 0)).toEqual({
      page: 0,
      pageSize: TRAY_PAGE_SIZE,
      totalPages: 1,
    });
    expect(getTrayPageItems([], 0)).toEqual([]);
  });

  test("keeps a single page when results fit inside the tray", () => {
    expect(getTrayPaginationState(0, 4)).toEqual({
      page: 0,
      pageSize: TRAY_PAGE_SIZE,
      totalPages: 1,
    });
    expect(getTrayPageItems(snippets.slice(0, 4), 0)).toEqual(
      snippets.slice(0, 4),
    );
  });

  test("returns the requested page when multiple tray pages exist", () => {
    expect(getTrayPaginationState(1, snippets.length)).toEqual({
      page: 1,
      pageSize: TRAY_PAGE_SIZE,
      totalPages: 2,
    });
    expect(getTrayPageItems(snippets, 1)).toEqual(snippets.slice(6, 12));
  });

  test("resets back to the first page when search changes", () => {
    expect(getTrayPaginationState(1, snippets.length, { reset: true })).toEqual(
      {
        page: 0,
        pageSize: TRAY_PAGE_SIZE,
        totalPages: 2,
      },
    );
  });

  test("clamps the page after deleting the last item on the final page", () => {
    expect(getTrayPaginationState(1, 6)).toEqual({
      page: 0,
      pageSize: TRAY_PAGE_SIZE,
      totalPages: 1,
    });
  });

  test("uses the main window page size for library pagination", () => {
    expect(getLibraryPaginationState(1, snippets.length)).toEqual({
      page: 1,
      pageSize: LIBRARY_PAGE_SIZE,
      totalPages: 2,
    });
    expect(getLibraryPageItems(snippets, 1)).toEqual(snippets.slice(9, 12));
  });

  test("resets the library pagination back to the first page", () => {
    expect(
      getLibraryPaginationState(1, snippets.length, { reset: true }),
    ).toEqual({
      page: 0,
      pageSize: LIBRARY_PAGE_SIZE,
      totalPages: 2,
    });
  });

  test("finds the page that contains a selected library snippet", () => {
    expect(getLibraryPageForItemId(snippets, "10")).toBe(1);
    expect(getLibraryPageForItemId(snippets, "2")).toBe(0);
  });

  test("returns null when the selected library snippet is missing", () => {
    expect(getLibraryPageForItemId(snippets, "missing")).toBeNull();
  });
});
