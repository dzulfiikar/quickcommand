const badgeBaseClassName = "gap-1.5 px-2.5 py-1 text-[11px] font-medium";

export function getLibraryShortcutBadge(shortcut: string | null) {
  if (shortcut) {
    return {
      className: `${badgeBaseClassName} status-pill`,
      label: shortcut,
    };
  }

  return {
    className: `${badgeBaseClassName} status-pill status-pill--warning`,
    label: "No hotkey configured",
  };
}

export function getLibraryAccessibilityBadge(permissionGranted: boolean) {
  if (permissionGranted) {
    return {
      className: `${badgeBaseClassName} status-pill status-pill--success`,
      label: "Accessibility ready",
    };
  }

  return {
    className: `${badgeBaseClassName} status-pill status-pill--warning`,
    label: "Accessibility required",
  };
}
