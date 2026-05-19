---
name: QuickCommand
description: Local-first macOS snippet launcher; dark cool surface, warm sand accent, keyboard-first density.
colors:
  background: "oklch(0.15 0.01 260)"
  foreground: "oklch(0.97 0.01 85)"
  late-light-sand: "oklch(0.82 0.03 78)"
  late-light-sand-foreground: "oklch(0.16 0.01 260)"
  late-light-sand-ring: "oklch(0.82 0.03 78 / 0.56)"
  surface-tier-1: "oklch(0.18 0.014 260)"
  surface-tier-2: "oklch(0.24 0.012 260 / 0.48)"
  surface-tier-3: "oklch(0.28 0.014 260 / 0.34)"
  surface-tier-inset: "oklch(0.16 0.01 252 / 0.52)"
  muted-foreground: "oklch(0.78 0.012 85)"
  border-hairline: "oklch(1 0 0 / 0.14)"
  border-input: "oklch(1 0 0 / 0.10)"
  destructive: "oklch(0.66 0.16 28)"
  destructive-foreground: "oklch(1 0 0)"
  status-success-foreground: "oklch(0.95 0.04 162)"
  status-success-background: "oklch(0.57 0.09 162 / 0.22)"
  status-success-border: "oklch(0.83 0.12 162 / 0.28)"
  status-warning-foreground: "oklch(0.97 0.04 95)"
  status-warning-background: "oklch(0.62 0.11 92 / 0.18)"
  status-warning-border: "oklch(0.86 0.13 92 / 0.28)"
  status-error-foreground: "oklch(0.95 0.03 30)"
  status-error-background: "oklch(0.62 0.12 28 / 0.18)"
  status-error-border: "oklch(0.8 0.13 28 / 0.28)"
typography:
  display:
    fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Avenir Next', system-ui, sans-serif"
    fontSize: "22px"
    fontWeight: 600
    lineHeight: 1.25
    letterSpacing: "-0.01em"
  headline:
    fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Avenir Next', system-ui, sans-serif"
    fontSize: "17px"
    fontWeight: 600
    lineHeight: 1.35
    letterSpacing: "normal"
  title:
    fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Avenir Next', system-ui, sans-serif"
    fontSize: "15px"
    fontWeight: 500
    lineHeight: 1.4
    letterSpacing: "normal"
  body:
    fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Avenir Next', system-ui, sans-serif"
    fontSize: "15px"
    fontWeight: 400
    lineHeight: 1.55
    letterSpacing: "normal"
  label:
    fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Avenir Next', system-ui, sans-serif"
    fontSize: "12px"
    fontWeight: 600
    lineHeight: 1.4
    letterSpacing: "normal"
  kbd:
    fontFamily: "'SF Mono', ui-monospace, 'Cascadia Code', 'Fira Code', monospace"
    fontSize: "10px"
    fontWeight: 500
    lineHeight: 1.4
    letterSpacing: "0.02em"
rounded:
  xs: "6px"
  sm: "10px"
  md: "12px"
  lg: "14px"
  xl: "18px"
spacing:
  xs: "4px"
  sm: "8px"
  md: "12px"
  lg: "16px"
  xl: "24px"
  xxl: "32px"
components:
  button-primary:
    backgroundColor: "{colors.late-light-sand}"
    textColor: "{colors.late-light-sand-foreground}"
    rounded: "{rounded.sm}"
    padding: "8px 16px"
    height: "44px"
  button-primary-hover:
    backgroundColor: "{colors.late-light-sand}"
    textColor: "{colors.late-light-sand-foreground}"
    rounded: "{rounded.sm}"
  button-outline:
    backgroundColor: "transparent"
    textColor: "{colors.foreground}"
    rounded: "{rounded.sm}"
    padding: "8px 16px"
    height: "44px"
  button-ghost:
    backgroundColor: "transparent"
    textColor: "{colors.muted-foreground}"
    rounded: "{rounded.sm}"
    padding: "8px 16px"
    height: "44px"
  button-destructive:
    backgroundColor: "{colors.destructive}"
    textColor: "{colors.destructive-foreground}"
    rounded: "{rounded.sm}"
    padding: "8px 16px"
    height: "44px"
  input-text:
    backgroundColor: "{colors.border-input}"
    textColor: "{colors.foreground}"
    rounded: "{rounded.sm}"
    padding: "8px 12px"
    height: "44px"
  list-item:
    backgroundColor: "transparent"
    textColor: "{colors.foreground}"
    rounded: "{rounded.xs}"
    padding: "8px 12px"
  list-item-active:
    backgroundColor: "oklch(0.44 0.025 252 / 0.22)"
    textColor: "{colors.foreground}"
    rounded: "{rounded.xs}"
  status-pill-success:
    backgroundColor: "{colors.status-success-background}"
    textColor: "{colors.status-success-foreground}"
    rounded: "{rounded.lg}"
    padding: "4px 10px"
  status-pill-warning:
    backgroundColor: "{colors.status-warning-background}"
    textColor: "{colors.status-warning-foreground}"
    rounded: "{rounded.lg}"
    padding: "4px 10px"
  status-pill-neutral:
    backgroundColor: "oklch(1 0 0 / 0.06)"
    textColor: "{colors.foreground}"
    rounded: "{rounded.lg}"
    padding: "4px 10px"
  kbd:
    backgroundColor: "oklch(0.27 0.014 255 / 0.38)"
    textColor: "oklch(0.83 0.012 85)"
    rounded: "{rounded.xs}"
    padding: "1px 6px"
---

# Design System: QuickCommand

## 1. Overview

**Creative North Star: "The Hand-Built Loupe"**

QuickCommand is a small, precise instrument made for someone who values craft. The visual system reads like a tool, not a product. Surfaces are quiet, dark, and cool, sized to the keyboard and the act of typing. The single warm accent, Late-Light Sand, lands on the one element the eye should travel to: the active row, the focused input, the primary button. Everything else gets out of the way.

The system is dark by default because QuickCommand lives on top of other apps, summoned and dismissed across the day. A pale UI would shout against terminals, editors, and runbook panes; a deep cool surface lets it sit beneath those workflows without drawing attention until the user wants it. Type is restrained, dense, and informational. Motion is brief, easing in and out without choreography. Color carries meaning, never decoration.

This system explicitly rejects the visual languages PRODUCT.md names as anti-references: SaaS-dashboard card grids and gradient accents, Sequoia-era over-frosted glass and decorative `backdrop-filter`, cloud-app maximalism (sidebars of teamspaces, presence avatars, sync indicators), and toy/playful illustration. The current `styles.css` carries some legacy `backdrop-filter` rules; this document treats those as drift to remove, not pattern to extend.

**Key Characteristics:**
- Dark cool blue-grey base with a single warm accent that earns every appearance.
- Tonal layering for depth, not shadows or blur.
- Apple system type at functional sizes, no display-scale headlines.
- Generous keyboard targets (`44px` minimum) without visual bulk.
- Status conveyed by labelled pills, never by hue alone.

## 2. Colors: The Cool-Surface, Warm-Accent Palette

A four-step cool surface ladder, one warm accent, three labeled status hues, no decorative color. Every value is OKLCH. The palette is intentionally narrow.

### Primary
- **Late-Light Sand** (`oklch(0.82 0.03 78)`): the only warm note in the system. Carries the focus ring, the primary button background, the active list-item border, and any "this is where you are" affordance. Used sparingly. When it appears, it is the most important element on screen.

### Neutral
- **Deep Blue-Black Surface** (`oklch(0.15 0.01 260)`): the canonical app background. The base of every window. Cool, slightly tinted toward blue, never `#000`.
- **Surface Tier 1** (`oklch(0.18 0.014 260)`): the top of the app-shell tonal gradient. The one visible degree above background.
- **Surface Tier 2** (`oklch(0.24 0.012 260 / 0.48)`): muted panels and informational chrome. Always over Tier 1.
- **Surface Tier 3** (`oklch(0.28 0.014 260 / 0.34)`): cards and primary panels. The most-elevated tier in the system.
- **Surface Inset** (`oklch(0.16 0.01 252 / 0.52)`): pressed-in containers; below background tone, never above it.
- **Foreground** (`oklch(0.97 0.01 85)`): primary text. Warm-tinted near-white, never pure white.
- **Muted Foreground** (`oklch(0.78 0.012 85)`): secondary text, meta, field notes, section labels.
- **Hairline Border** (`oklch(1 0 0 / 0.14)`): default 1px borders. Always 1px, always low-alpha white over the cool surface.

### Status (label-paired only)
- **Success** (`bg oklch(0.57 0.09 162 / 0.22)`, `text oklch(0.95 0.04 162)`): "Accessibility ready"-class confirmations.
- **Warning** (`bg oklch(0.62 0.11 92 / 0.18)`, `text oklch(0.97 0.04 95)`): missing-permission, missing-hotkey, gentle-blocking states.
- **Error** (`bg oklch(0.62 0.12 28 / 0.18)`, `text oklch(0.95 0.03 30)`): destructive-action context, paste-failure messaging.

### Named Rules

**The One Warm Note Rule.** Late-Light Sand appears on at most one element per visible region, and never as a fill on more than ~10% of any screen at rest. If two elements both want it, only the higher-intent one (focus > selection > brand) gets it.

**The No-Pure-Black, No-Pure-White Rule.** Backgrounds tilt cool (`oklch(... 0.01–0.014 252–260)`), text tilts warm (`oklch(... 0.01 85)`). Pure `#000` and `#fff` are forbidden in all new styles.

**The Color-Plus-Label Rule.** Status colors never carry meaning alone. A success pill has both green and the word "Accessibility ready". A warning pill has both amber and the missing-state copy. Color blindness, dark adaptation, and ambient contrast all degrade hue; the label is what survives.

## 3. Typography

**Display Font:** Apple system stack (`-apple-system, BlinkMacSystemFont, "SF Pro Display", "Avenir Next", system-ui, sans-serif`)
**Body Font:** Same Apple system stack
**Label/Mono Font:** Apple monospace stack (`"SF Mono", ui-monospace, "Cascadia Code", "Fira Code", monospace`)

**Character:** Apple system, used at functional sizes only. The system never reaches for a display face or a marketing-scale headline. Hierarchy is created by weight contrast and small scale steps, not by shouting.

### Hierarchy
- **Display** (600 weight, 22px, line-height 1.25, letter-spacing -0.01em): the largest type the system uses, reserved for window-level titles like the library hero. Never larger.
- **Headline** (600 weight, 17px, line-height 1.35): panel titles inside the library (Settings, About).
- **Title** (500 weight, 15px, line-height 1.4): snippet titles in lists, primary labels.
- **Body** (400 weight, 15px, line-height 1.55): paragraph copy, snippet preview text, descriptions. Cap line length at 65–75ch.
- **Label** (600 weight, 12px, line-height 1.4): section labels, field notes, button text inside small variants.
- **KBD** (500 weight, 10px monospace, letter-spacing 0.02em): keyboard-shortcut hints inside `.kbd` chips. Monospace is the only place mono shows up.

### Named Rules

**The Functional-Scale Rule.** Body type stays at 15px. Display caps at 22px. The full ladder spans 10px (kbd) to 22px (display): one order of magnitude, no marketing leap. If the design wants more visual weight, it earns it with weight contrast (400 → 600), not with a 36px headline.

**The Two-Step Weight Rule.** Hierarchy uses two weights: 400 for body, 600 for emphasis. 500 exists for titles where 600 would shout. Never reach for 700 or italics; the type stack already discourages it.

**The Mono-Is-A-Cue Rule.** Monospace appears only in `.kbd` shortcut chips. Code blocks, snippet values, and file paths stay in the system sans, because snippets contain prose and code interleaved; the user supplies the text.

## 4. Elevation

QuickCommand uses **tonal layering** for depth, not shadows and not backdrop-filter. Surfaces sit at four distinct lightness steps over the cool background; the eye reads stacking from those alone. Shadows are reserved exclusively for the operating-system-provided window chrome (the macOS title bar shadow under the library window). Inside the renderer, no `box-shadow`, no `backdrop-filter`, no decorative blur.

The current `styles.css` has legacy `backdrop-filter: blur(...)` rules on `.surface`, `.surface-muted`, `.notice`, `.kbd`, and `.kbd-blur`. Those are drift; remove them as the affected components get touched. New components must not introduce `backdrop-filter`.

### Tonal Vocabulary
- **Background** (`oklch(0.15 0.01 260)`): the floor; everything sits over this.
- **Surface Tier 1** (`oklch(0.18 0.014 260)`): app shell and quiet panels.
- **Surface Tier 2** (`oklch(0.24 0.012 260 / 0.48)`): muted panels.
- **Surface Tier 3** (`oklch(0.28 0.014 260 / 0.34)`): primary cards and panels; the highest tier the eye should land on.
- **Surface Inset** (`oklch(0.16 0.01 252 / 0.52)`): below-background recessed containers (snippet preview, scroll wells).

### Named Rules

**The Flat-By-Default Rule.** Surfaces have no `box-shadow`. Depth is read from the four-tier tonal ladder above. If a designer feels the urge to add shadow for "lift", they reach for the next tonal tier instead.

**The No-Glass Rule.** `backdrop-filter` and `-webkit-backdrop-filter` are forbidden on all new components. The macOS-native vibrancy of the menu-bar popover chrome is provided by the OS, not by the renderer; never reproduce it in CSS.

**The Inset-Below-Background Rule.** Recessed containers sit *darker* than background, not lighter. A snippet preview well, a scroll inset, a pressed input ground all use Surface Inset, which is below background lightness. This makes "stacked above" and "carved into" visually distinct.

## 5. Components

Every component below is built from the four tonal tiers, the hairline border, the system type stack, and Late-Light Sand for focus or active state. No component introduces a new color, a new shadow, or a new blur.

### Buttons
- **Shape:** Gently rounded rectangle (`10px` radius, `--radius-sm`).
- **Size:** Default height `44px` (`h-11` token). Tap targets are non-negotiable; do not regress for visual density.
- **Primary:** Background Late-Light Sand (`oklch(0.82 0.03 78)`), text Deep Blue-Black (`oklch(0.16 0.01 260)`). Padding `8px 16px`.
- **Outline:** Transparent background, hairline border, foreground text. Hover lightens to the muted accent surface.
- **Ghost:** Transparent background, muted-foreground text. Hover background lifts to `surface-tier-3`.
- **Destructive:** Background Destructive Coral (`oklch(0.66 0.16 28)`), text near-white. Reserved for irreversible removals.
- **Hover / Focus:** 140ms ease transitions on `background-color`, `border-color`, `color` only. Focus shows a 3px Late-Light Sand ring at 56% alpha; the ring sits outside the border and never displaces layout.

### Inputs
- **Shape:** Same `10px` radius and `44px` height as buttons. Inputs and buttons share size so adjacent fields and actions align.
- **Background:** Translucent white at 10% over surface (`--input`).
- **Border:** Hairline (`oklch(1 0 0 / 0.14)`) at rest. On focus, border tints to Late-Light Sand and the 3px ring appears.
- **Placeholder:** Muted Foreground; never the same lightness as user text.
- **Invalid state:** Border switches to Destructive Coral, ring switches to Destructive Coral at 20–40% alpha.

### List Items
- **Shape:** `8px` radius, `1px` transparent border at rest. Padding `8px 12px`.
- **Hover:** Background lifts to `oklch(0.36 0.018 252 / 0.22)`, border becomes hairline.
- **Active (selected):** Background `oklch(0.44 0.025 252 / 0.22)`, border tints Late-Light Sand at 32% alpha. The active row is the *only* element on the list that wears the warm accent.
- **Density:** Lists prefer tight rows. Two text lines (title + truncated value) is the canonical row; meta moves to a trailing chip, not a third line.

### Status Pills
- **Shape:** Pill at `14px` radius, padding `4px 10px`, label-typography 12px/600.
- **Variants:** `success`, `warning`, `error`, `neutral`. Each pairs a tinted background, a tinted border, and a high-contrast foreground on the same hue family. No icon-only pills; every pill carries a label.
- **Tone:** Backgrounds sit between 18% and 28% alpha so the surface beneath remains readable.

### KBD Hints
- **Shape:** `6px` radius, monospace label, padding `1px 6px`.
- **Background:** Translucent cool surface, `oklch(0.27 0.014 255 / 0.38)`. Hairline border.
- **Use:** Inline next to the action they trigger. Never used decoratively; if a row shows a `⌘K` chip, that chip must work.

### Notices (inline alerts)
- **Shape:** `16px` radius, hairline border, status-tinted background. Padding `12px 16px`.
- **Variants:** Warning (missing accessibility, missing hotkey) and Error (paste failure, import failure). Successful confirmations are a one-line muted-foreground line, not a notice.
- **Composition:** Lead with a one-line title. The detail line and the recovery action sit below, in the same notice. Never stack a notice inside another notice.

### Window Chrome
- **Library Window:** macOS hidden-inset title bar, dark background `oklch(0.15 0.01 260)` matching the canvas. Width `1080px`, height `760px`, non-resizable so the layout can be tuned for one canvas.
- **Palette:** Frameless, sized to its content, summoned dead-center.
- **Tray Popover:** OS-provided menu-bar popover chrome; the renderer fills the interior only and does not paint over the OS-supplied vibrancy.

## 6. Do's and Don'ts

### Do:
- **Do** use Late-Light Sand on focus rings, primary buttons, and active list items, and only those surfaces by default.
- **Do** reach for the next tonal tier when you want lift; tonal layering is the only depth mechanism.
- **Do** keep `44px` (`h-11`) as the minimum height of any interactive surface that takes pointer or keyboard focus.
- **Do** pair every status hue with a label. "Accessibility ready", not a green dot. "No hotkey configured", not a yellow dot.
- **Do** use OKLCH for every color value, including alpha overlays.
- **Do** keep type at functional sizes (10px to 22px ladder) and lean on weight contrast (400 vs 600) for hierarchy.
- **Do** respect `prefers-reduced-motion`. The 140ms easing transitions are already governed by the global query in `styles.css`; new transitions must not opt out.
- **Do** keep monospace inside `.kbd` chips and nowhere else.
- **Do** keep snippet previews to two lines (title and value) and let the card body breathe.

### Don't:
- **Don't** use `box-shadow` on app surfaces. Tonal layering replaces it. The OS provides window-level shadows; nothing in the renderer should add more.
- **Don't** use `backdrop-filter` or `-webkit-backdrop-filter` on new components. The "Heavy glass and blur effects" anti-reference in PRODUCT.md is enforced here. Existing legacy rules in `styles.css` are drift to remove, not pattern to extend.
- **Don't** introduce a marketing-scale headline. 22px is the ceiling; no display fonts, no hero numbers.
- **Don't** build the SaaS-dashboard card grid: identical-shape tiles with icon + heading + body, repeated across the canvas. PRODUCT.md flags this directly; lists are the right answer in QuickCommand, not card grids.
- **Don't** use side-stripe borders (`border-left` greater than 1px as colored accent). If a row needs emphasis, lift the background tier or apply the warm-accent border on all four sides.
- **Don't** use gradient text or `background-clip: text`. Emphasis comes from weight and size.
- **Don't** use pure `#000` or `#fff`. Always tint cool (background) or warm (text).
- **Don't** add cloud-app chrome: presence avatars, share buttons, sync indicators, comment threads. This is a local-first app and must not pretend otherwise.
- **Don't** ship toy or doodled empty states. Empty states are one terse sentence and the next single action.
- **Don't** reach for a modal as the first answer to "where does this UI go?". Inline editing in the library, the palette as a focused-flow surface, and the tray as a quick-glance surface already cover the work.
- **Don't** introduce a new accent hue. The system has one warm note. If you need a second emphasis, raise type weight or size.
- **Don't** animate CSS layout properties (width, height, top, left, padding, margin). Use opacity and `transform` only. The framer-motion presets in `@/lib/motion` already follow this rule.
