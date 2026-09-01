---
name: design
description: SplitEase UI rules. Use before writing, editing, or reviewing ANY UI code in this repo — components, pages, dialogs, forms, tables, buttons, colors, spacing, icons. shadcn/ui exclusively, installed via the official shadcn CLI, Midday-inspired editorial look, light theme, monochrome tokens with a near-black primary. Trigger this even for small UI tweaks, styling questions, or "add a button/badge/dialog" requests — not just full new pages.
---

# SplitEase Design System

This skill is the single source of truth for how SplitEase looks and how UI code must be written. It applies to every page, dialog, form, table, and screen in this repo — groups, expenses, balances, settle-up, activity, and settings.

It is a **constraint**, not a suggestion. Code that violates it is not acceptable.

Visual direction is adapted from **Midday** (midday-ai/midday) — a calm, editorial, monochrome business UI — restyled for SplitEase's domain (shared expenses, group balances, settle-up flows).

## The two hard rules

1. **shadcn/ui exclusively.** Every visible UI element must come from a shadcn component (registry component, or a component composed from them). Nothing else. Do not hand-build a button, card, modal, dropdown, table, or form control from scratch — if shadcn has it, use it; if a domain component is needed (e.g. `ExpenseCard`, `BalanceRow`, `GroupTile`), compose it from shadcn primitives rather than writing raw markup and Tailwind from zero.
2. **Official CLI only.** Components are added with the official shadcn CLI — `npx shadcn@latest add <component>` — which vendors them into `src/components/ui/`. Never hand-copy a component from a website, blog, screenshot, or third-party kit (including Midday's own repo — Midday is a *visual reference only*, never a source to copy code from).

### Allowed

- shadcn registry components (via `npx shadcn@latest add …`)
- Components composed from shadcn primitives (e.g. a `GroupCard` built from `Card` + `Avatar` + `Badge`)
- `lucide-react` icons (the icon set shadcn uses)
- Tailwind CSS (shadcn's base) and shadcn CSS variables (`--background`, `--primary`, …)
- Radix primitives already bundled inside shadcn components
- `recharts` for charts (via the shadcn `chart` component) — e.g. spend-over-time, category breakdown
- `react-hook-form` + `zod` for forms (via the shadcn `form` component) — replace any Formik/Yup usage in new UI work with this pairing so validation stays inside the shadcn `Form` pattern
- TanStack Query/Table for data fetching and table state, rendered through shadcn `Table`/`DataTable`

### Prohibited

- Any other component library: MUI, Ant Design, Chakra, Bootstrap, Tailwind UI, etc.
- **Copying markup from Midday, shadcnspace, Dribbble, or any third-party kit.** These may inspire layout and spacing rhythm — never a source to lift code from. Rebuild from official shadcn primitives.
- **Hand-written CSS files** — no bespoke `styles.css`, no CSS-in-JS, no `className` soup with one-off utility values that bypass the token system.
- Bespoke styled components built with raw utility classes outside the shadcn token system.
- `window.alert` / `window.confirm` for any feedback or confirmation — always shadcn `Toast` (sonner) or `AlertDialog`.

## Design tokens

Adapted from Midday's "Midday Modern" system — calm, editorial, high-contrast monochrome, restrained accents. Map these into shadcn's CSS-variable theme (`app/globals.css`), never hardcoded hex values in JSX.

**Theme:** light-only for v1. Dark mode can follow later by adding the shadcn dark tokens on top of the same scale — don't block on it.

**Neutrals:** zinc-leaning warm off-white, matching Midday's restrained monochrome discipline.

| Token | Value | shadcn variable |
|---|---|---|
| Primary / CTA | `#121212` (near-black) | `--primary`, text `--primary-foreground: #fafafa` |
| Secondary text | `#616161` | `--muted-foreground` |
| Border | `#e5e7eb` | `--border` |
| Surface | `#ffffff` | `--card`, `--popover` |
| Background | `#f7f7f5` | `--background` |
| Overlay / strong CTA | `#18181b` | used for `button-primary` background |
| Destructive (you owe / negative balance) | `#b42318` | `--destructive` |
| Positive (you are owed / settled) | shadcn `--primary` at reduced opacity, or a single desaturated green kept out of the base palette and used only for balance sign, never decoratively | custom `--positive` variable, used sparingly |

**Radius:** pill-shaped buttons and inputs (`rounded-full`), 8px (`rounded-md`) for cards and panels — matches Midday's soft-pill / gentle-card language, not shadcn's sharper default. Set `--radius: 0.5rem` and apply `rounded-full` explicitly on `Button`/`Input` via the CLI-generated variants.

**Typography:** two-family pairing, same spirit as Midday — a low-weight serif for editorial/brand moments (page headers like "Your groups", empty states, the landing/auth screens) and a clean sans for all functional UI (tables, forms, labels, amounts). Install both as local font packages (no CDN dependency), wire through `tailwind.config` font families:
- Display/serif: headline sizes only (36–64px), tight negative tracking, weight 400.
- Sans: everything else — body 14–18px, labels 11–14px at medium weight, no uppercase shouting.

**Spacing scale:** `6px / 16px / 24px / 48px / 128px` (xs/sm/md/lg/xl) layered on top of Tailwind's default scale. Cards default to `p-4` (16px); page sections use `gap-6` to `gap-12`; hero/empty-state moments can use the 128px tier for breathing room.

**Elevation:** flat by default. Hierarchy comes from borders and contrast, not shadow. Cards use a 1px `--border` and no `shadow-*` utility unless a floating element (popover, dropdown, dialog overlay) genuinely needs separation — those already get shadcn's built-in shadow, don't add more.

## Layout system

SplitEase is a single authenticated app (no separate till/dashboard split like a POS). Use one shell:

- **App shell:** shadcn `Sidebar` (collapsible) + top bar, in the Midday-style calm dashboard mould — sidebar for Groups / Activity / Balances / Settings, top bar for the current group switcher, add-expense action, and user menu.
- **Content area:** centered, max-width container (don't stretch tables/forms full-bleed on large screens) — Midday's layouts stay spacious and center-weighted rather than dense-fluid.
- **Mobile:** sidebar collapses to a `Sheet`; bottom-anchored primary action ("Add expense") stays reachable with one thumb.

## Core screens & component conventions

- **Groups list:** `Card` grid, each card = group name, member `Avatar` stack (`AvatarGroup` pattern via shadcn `Avatar`), net balance in `Badge`/colored text using the positive/destructive tokens above — never a raw colored `<span>`.
- **Group detail / expense feed:** shadcn `Tabs` for Expenses / Balances / Activity; expenses render as a list of `Card` rows (avatar, description, amount, paid-by), not a hand-rolled `<li>` list with ad hoc classes.
- **Add/edit expense:** shadcn `Dialog` or `Sheet` (mobile) containing a shadcn `Form` (react-hook-form + zod) — amount `Input`, payer `Select`, split-method `Tabs` or `RadioGroup` (equal / exact / percentage), participant `Checkbox` list.
- **Balances / settle up:** shadcn `Table` for "who owes whom", with a `Button` per row to record a settlement, confirmed via `AlertDialog`.
- **Empty states:** `Card` + short copy + one clear `Button` action ("Create your first group") — never a bare blank page.
- **Feedback:** shadcn `Toast` (sonner) for expense-added/settled confirmations and errors.
- **Loading:** shadcn `Skeleton` for group cards, expense rows, and balance tables — never a bare "Loading…" string.
- **Amounts:** always right-aligned in tables, tabular-nums, sign communicated by color token (destructive = you owe, positive = you're owed) plus a leading `+`/`-`, never color alone.
- **Icons:** lucide-react only, `size-4` inline / `size-5` on buttons, consistent stroke weight.

## Working with the CLI

```bash
npx shadcn@latest init          # run once per app (frontend/)
npx shadcn@latest add button card input form dialog sheet table tabs \
  avatar badge select checkbox radio-group alert-dialog toast skeleton \
  sidebar dropdown-menu chart
```

- Keep shadcn at its **official, latest** version. Never fork or hand-edit `components.json`.
- New primitives land in `src/components/ui/` (or `frontend/src/components/ui/` given this repo's `frontend/`/`backend/` split) — untouched, as generated.
- Domain components (`GroupCard`, `ExpenseRow`, `BalanceTable`, `SettleUpDialog`) live alongside feature code, built on top of `ui/` — never duplicating what a primitive already does.

## Review checklist

- [ ] Every visible element is a shadcn component or composed from one
- [ ] No CSS files written by hand; no raw utility-class styling outside the token scale
- [ ] No third-party UI kit, and no markup copied from Midday or any other reference
- [ ] Colors come from CSS variables/tokens, never hardcoded hex in JSX
- [ ] Buttons/inputs are pill-shaped (`rounded-full`), cards use `rounded-md` with a 1px border, no stray shadows
- [ ] Balance/amount signs use token color + explicit `+`/`-`, not color alone
- [ ] Toasts/AlertDialogs used for feedback and destructive confirmations — no `alert()`/`confirm()`
