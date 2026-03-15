const badgeBaseClassName =
  "px-2.5 py-1 text-[11px] font-medium gap-1.5 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]";

export function getLibraryShortcutBadge(shortcut: string | null) {
  if (shortcut) {
    return {
      className: `${badgeBaseClassName} border-sky-400/30 bg-sky-500/12 text-sky-100`,
      label: shortcut,
    };
  }

  return {
    className: `${badgeBaseClassName} border-amber-400/35 bg-amber-500/12 text-amber-100`,
    label: "No hotkey configured",
  };
}

export function getLibraryAccessibilityBadge(permissionGranted: boolean) {
  if (permissionGranted) {
    return {
      className: `${badgeBaseClassName} border-emerald-400/30 bg-emerald-500/12 text-emerald-100`,
      label: "Accessibility ready",
    };
  }

  return {
    className: `${badgeBaseClassName} border-yellow-400/35 bg-yellow-500/12 text-yellow-100`,
    label: "Accessibility required",
  };
}
