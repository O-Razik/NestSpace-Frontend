# NestSpace Design System Style Update

**Date:** May 15, 2026  
**Theme:** Dark theme with cyan accent  
**Typography:** JetBrains Mono

## Summary of Changes

This document outlines all style changes made to align the NestSpace Frontend with the NestSpace Design System specifications. The update transitions the project from oklch-based light theme to a cohesive dark theme with cyan-primary accent colors.

---

## 1. Core Design Tokens

### New CSS Variables (Dark Theme)

All CSS variables are defined in `src/styles.css` under `:root` selector:

#### Background Scale
```css
--bg: #0c0f0e;              /* Primary background (near-black, mint-tinted) */
--surface: #131715;         /* Sidebars, panels */
--surface2: #1c211f;        /* Cards, inputs (default) */
--surface3: #262d2a;        /* Hover states, borders */
--color-border: #262d2a;    /* Border color */
```

#### Text/Foreground
```css
--fg: #f0faf8;              /* Primary text (light mint-white) */
--fg-muted: #8faaa3;        /* Secondary text (70% contrast) */
--fg-dim: #566660;          /* Tertiary text (lowest contrast) */
```

#### Brand & Accent (Cyan Focus)
```css
--color-accent: #22d3ee;    /* Bright cyan - primary action, links, focus states */
--accent-2: #06b6d4;        /* Darker cyan - secondary, nested actions */
--accent-bg: #06253a;       /* Dark cyan - subtle background tint */
```

#### Semantic Colors
```css
--color-danger: #f87171;    /* Red - errors, destructive actions */
--warn: #fb923c;            /* Orange - warnings, cautions */
--ok: #2dd4bf;              /* Teal - success, online status */
--pink: #ec4899;            /* Pink - highlights, attention */
```

#### Shape & Typography
```css
--radius: 6px;              /* Border radius (changed from 0.625rem) */
--font-mono: 'JetBrains Mono Variable', 'JetBrains Mono', monospace;
```

### Spartan/Helm Compatibility Mapping

The following legacy theme variables are mapped to new NestSpace tokens for seamless integration with Spartan-ng/Helm components:

| Legacy Variable | Maps To | Purpose |
|---|---|---|
| `--background` | `var(--bg)` | Page/main background |
| `--foreground` | `var(--fg)` | Primary text color |
| `--primary` | `var(--color-accent)` | Primary action (cyan) |
| `--primary-foreground` | `#000` | Text on primary button |
| `--destructive` | `var(--color-danger)` | Error/delete actions |
| `--card` | `var(--surface2)` | Card backgrounds |
| `--muted` | `var(--surface2)` | Muted backgrounds |
| `--muted-foreground` | `var(--fg-muted)` | Muted text |
| `--border` | `var(--color-border)` | Border color |
| `--input` | `var(--surface2)` | Input field backgrounds |
| `--sidebar` | `var(--surface)` | Sidebar backgrounds |

---

## 2. Files Modified

### `src/styles.css` ✅
- **Change:** Complete redesign of CSS variables and theme tokens
- **Details:**
  - Removed light theme variables
  - Added dark-only `:root` selector with NestSpace palette
  - Replaced oklch colors with hex values
  - Added Spartan/Helm mapping layer
  - Created component utility classes in `@layer components`
  - Added generic font-family fallback for accessibility

### `tailwind.config.ts` ✨ NEW
- **Created new file** to extend Tailwind's default color palette
- **Exports:** Color aliases for NestSpace tokens
  - `bg`, `surface.DEFAULT`, `surface.2`, `surface.3`
  - `fg.DEFAULT`, `fg.muted`, `fg.dim`
  - `accent.DEFAULT`, `accent.2`, `accent.bg`
  - `danger`, `warn`, `ok`, `pink`
- **Purpose:** Enables using CSS variables in Tailwind utilities via `@apply` or direct class names

### Component Changes

#### `src/app/shared/badge.ts` ✅
- **Changed:** `bg-danger` → `bg-pink` (pink/red unread badge pill)
- **Changed:** `text-primary-foreground` → `text-white`
- **Changed:** `border-danger/50` → `border-pink/50`
- **Reason:** Match the reference screenshot and keep the unread badge visually distinct

#### `src/app/features/sidebars/channel/channel-item.ts` ✅
- **Changed:** Removed solid active row background
- **Changed:** Active icon color `text-primary` → `text-accent`
- **Changed:** Hover state softened to `hover:bg-sidebar-accent/10`
- **Reason:** Keep emphasis on the category icon instead of filling the whole row with cyan

#### `src/app/shared/members-panel/members-panel.component.ts` ✅
- **Changed:** Hardcoded colors → CSS variables
  - `--mp-accent: #22d3ee` → `--mp-accent: var(--accent)`
  - `--mp-online: #2dd4bf` → `--mp-online: var(--ok)`
- **Changed:** Font reference
  - `font-family: 'JetBrains Mono Variable', 'JetBrains Mono', monospace` → `font-family: var(--font-mono)`
- **Reason:** Dynamic theming support and centralized token management

#### `src/app/shared/members-panel/members-panel-row.ts` ✅
- **Changed:** Avatar text color
  - `color: #fff` → `color: var(--primary-foreground)`
- **Changed:** Badge text color
  - `color: #fff` → `color: var(--primary-foreground)`
- **Purpose:** Semantic color consistency

#### `src/app/shared/members-panel/members-panel-collapsed.ts` ✅
- **Changed:** Avatar text color
  - `color: #fff` → `color: var(--primary-foreground)`
- **Purpose:** Consistency across all avatar components

#### `src/app/features/sidebars/dashboard/user-card.ts` ✅
- **Changed:** Avatar gradient
  - `from-teal-400 to-cyan-600` → `from-accent to-accent-2`
- **Changed:** Avatar text color
  - `text-white` → `text-primary-foreground`
- **Changed:** Status indicator
  - `bg-green-500` → `bg-ok`
- **Reason:** Use accent palette for consistent visual identity

---

## 3. New Component Utilities

### Created in `src/styles.css` (@layer components)

#### `.card`
Used for component card/panel backgrounds:
```css
background-color: var(--surface2);
border: 1px solid var(--border);
border-radius: var(--radius);
padding: 8px 10px;
```

#### `.chip` & `.chip.active` / `.chip.dim`
For small badge/label components:
```css
padding: 3px 10px;
border-radius: var(--radius);
```

#### `.lbl`
For subtle section labels:
```css
font-size: 0.75rem;
color: var(--fg-dim);
font-weight: 700;
text-transform: uppercase;
letter-spacing: 1.2px;
```

#### `.task-item` & Variants
For task/list item components with left-border priority indicators:
- `.task-item.urgent` — `border-left-color: var(--color-danger)`
- `.task-item.soon` — `border-left-color: var(--warn)`
- `.task-item.ok` — `border-left-color: var(--ok)`

#### Color Utilities
- `.text-fg` → `var(--foreground)`
- `.text-fg-muted` → `var(--fg-muted)`
- `.text-fg-dim` → `var(--fg-dim)`
- `.bg-surface`, `.bg-surface2`, `.bg-surface3`
- `.bg-accent-bg`, `.border-accent-2`

---

## 4. Browser Compatibility

- **CSS Custom Properties:** Full support in all modern browsers
- **Tailwind CSS:** V4.2+ with PostCSS support
- **Dark Mode:** Hardcoded to dark theme (no light mode toggle currently)
  - Light theme fallback exists in `:root.light` for emergency use
- **Font Loading:** JetBrains Mono Variable from @fontsource-variable/jetbrains-mono

---

## 5. Components Verified & Updated ✅

| Component | Status | Notes |
|---|---|---|
| Badge | ✅ Updated | Uses pink/red unread pill styling |
| Button (Helm) | ✅ Compatible | Inherits from `--primary` mapping |
| MembersPanel | ✅ Updated | All hardcoded colors replaced |
| ChannelItem | ✅ Updated | Active state accent moved to icon only |
| MembersPanelRow | ✅ Updated | Avatar & badge colors fixed |
| MembersPanelCollapsed | ✅ Updated | Avatar text color fixed |
| UserCard | ✅ Updated | Avatar gradient & status color updated |
| Logo | ✅ Compatible | Uses `--primary` which maps to cyan |
| LoginForm | ✅ Compatible | Uses Helm components, inherits colors |
| Sidebar (Helm) | ✅ Compatible | Uses mapped `--sidebar-*` variables |

---

## 6. Components Requiring Manual Review

The following components should be visually verified through the browser to ensure appearance matches design intent:

1. **Forms & Inputs** - Check input focus states and error colors
2. **Dialog modals** - Verify popover backgrounds and text contrast
3. **Tooltips** - Ensure tooltip backgrounds are readable
4. **Hover states** - Test all interactive elements for proper accent highlight
5. **Disabled states** - Verify disabled button opacity and colors
6. **Icons** - Check icon colors in different contexts (primary, secondary, muted)

---

## 7. Testing Checklist

Before deploying, verify:

- [ ] Dev server runs without errors: `npm run start`
- [ ] Production build succeeds: `npm run build`
- [ ] All pages load with correct dark background (#0c0f0e)
- [ ] Primary action buttons are cyan (#22d3ee)
- [ ] Hover states display darker cyan (#06b6d4)
- [ ] Text is readable with proper contrast
- [ ] Sidebar and panels use #131715 background
- [ ] Cards and inputs use #1c211f surface color
- [ ] Borders use #262d2a (surface3 tone)
- [ ] Status indicators: online = teal, error = red, warning = orange
- [ ] Focus outlines are cyan
- [ ] JetBrains Mono font displays correctly
- [ ] Responsive design is maintained

---

## 8. Future Enhancements

- [ ] Add light theme with toggle support (if needed)
- [ ] Create theme switcher component
- [ ] Add CSS custom properties to Tailwind preset for better IDE autocomplete
- [ ] Consider CSS tokens export for design documentation
- [ ] Test WCAG AAA contrast ratios for accessibility

---

## 9. Related Files

- Design System Spec: `/docs/design-system.md` (if available)
- Tailwind Config: `tailwind.config.ts` (new)
- Global Styles: `src/styles.css` (updated)
- Package Config: `package.json` (no changes)
- Angular Config: `angular.json` (no changes)

---

## 10. Rollback Instructions

If issues arise, revert to previous theme by restoring from git:

```bash
git checkout HEAD~1 src/styles.css
git checkout HEAD~1 tailwind.config.ts
git rm tailwind.config.ts
# Then rebuild
npm run build
```

---

**Created by:** GitHub Copilot  
**Last Updated:** May 15, 2026

