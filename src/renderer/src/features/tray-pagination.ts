export const TRAY_PAGE_SIZE = 6;
export const LIBRARY_PAGE_SIZE = 9;

type PaginationOptions = {
  pageSize?: number;
  reset?: boolean;
};

function getPaginationState(
  requestedPage: number,
  totalItems: number,
  options: PaginationOptions = {},
) {
  const pageSize = options.pageSize ?? TRAY_PAGE_SIZE;
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const page = options.reset
    ? 0
    : Math.min(Math.max(requestedPage, 0), totalPages - 1);

  return {
    page,
    pageSize,
    totalPages,
  };
}

function getPageItems<T>(
  items: T[],
  requestedPage: number,
  options: PaginationOptions = {},
) {
  const pageSize = options.pageSize ?? TRAY_PAGE_SIZE;
  const { page } = getPaginationState(requestedPage, items.length, { pageSize });
  const start = page * pageSize;
  return items.slice(start, start + pageSize);
}

export function getTrayPaginationState(
  requestedPage: number,
  totalItems: number,
  options: PaginationOptions = {},
) {
  return getPaginationState(requestedPage, totalItems, {
    ...options,
    pageSize: options.pageSize ?? TRAY_PAGE_SIZE,
  });
}

export function getTrayPageItems<T>(
  items: T[],
  requestedPage: number,
  pageSize = TRAY_PAGE_SIZE,
) {
  return getPageItems(items, requestedPage, { pageSize });
}

export function getLibraryPaginationState(
  requestedPage: number,
  totalItems: number,
  options: PaginationOptions = {},
) {
  return getPaginationState(requestedPage, totalItems, {
    ...options,
    pageSize: options.pageSize ?? LIBRARY_PAGE_SIZE,
  });
}

export function getLibraryPageItems<T>(
  items: T[],
  requestedPage: number,
  pageSize = LIBRARY_PAGE_SIZE,
) {
  return getPageItems(items, requestedPage, { pageSize });
}

export function getLibraryPageForItemId<T extends { id: string }>(
  items: T[],
  itemId: string,
  pageSize = LIBRARY_PAGE_SIZE,
) {
  const itemIndex = items.findIndex((item) => item.id === itemId);

  if (itemIndex === -1) {
    return null;
  }

  return Math.floor(itemIndex / pageSize);
}
