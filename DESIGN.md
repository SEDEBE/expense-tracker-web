---
version: 1
name: Gastos — achromatic ledger
description: A personal expense tracker that reads like a ledger. The interface is ink on a blue-grey ground with no colour of its own; money is set in ink with tabular figures, and one blue marks the data the screen is about (this month).
colors:
  ground: "#f2f4f7"        # page and sidebar, one level off white (a ledger's blue-grey)
  surface: "#ffffff"       # cards
  raised: "#f8f9fb"        # row hover, auth side panel
  active: "#e6e9ee"        # selected nav item, grey fills
  border: "#e3e6eb"        # card edges
  rule: "#eef0f3"          # row rules inside cards
  control: "#d1d5db"       # input and select borders
  text: "#111111"
  muted: "#5f6368"         # secondary text, 4.5:1 on white
  primary: "#1d1f20"       # the one primary action per screen (near-black)
  chart: "#1d5fbf"         # the one data hue: this month's column and category bars
  chart-muted: "#c3c8d0"   # every compared value (other months)
  positive: "#247b50"      # spending fell
  negative: "#c4242a"      # spending rose, destructive actions
dark:
  ground: "#0b0b0c"
  surface: "#141415"
  text: "#f4f4f5"
  muted: "#b4b4b4"
  primary: "#f4f4f5"       # inverted
  chart: "#5b9bf0"
typography:
  family: Geist (variable), one face for everything
  title: 24px / 500, tracking -0.02em
  section: 16px / 500
  headline-figure: 30px / 700 (money only)
  body: 14px / 400
  small: 12px / 400
  figures: tabular-nums on every amount, count and date
radius:
  card: 8px
  control: 6px
---

# Gastos design system

Based on the `achromatic-ledger` app style from taste-skill (studied finance screens) and written in
the DESIGN.md format from VoltAgent/awesome-design-md. Read this before changing the UI.

## Principles

1. **Colour goes on data, not chrome.** The sidebar, buttons, tabs and links are ink and greys. The
   blue appears only on the data the screen is about: the selected month's column and this month's
   category bars. Under about 1% of the screen is coloured.
2. **Money reads like a ledger.** Every amount uses tabular figures, is right-aligned in columns,
   has two decimals and a thousands separator (`1.486,69 €`, `useGrouping: 'always'`).
3. **Each screen answers one question first.** The dashboard: "how much have I spent this month and
   on what?". The largest figure (30px) is the answer; the line under the title states the one
   finding against a named baseline ("Restaurantes ya supera todo septiembre: …").
4. **Comparison is grey, the subject is blue.** Last month is a thin ink tick on each category bar;
   other months are grey columns. A rise in spending is red, a fall green, and a month in progress is
   never compared as if it were finished.
5. **Honest states.** Zeros print as `0,00 €`; empty blocks keep their frame with one dashed sentence;
   loading keeps the final layout with grey bars, no shimmer.

## Layout

- Open plane shell: a 240px sidebar on the page ground (mark, scope, nav, user, sign out), no top
  bar on desktop. On screens under 1024px it folds into a 48px bar with a full-screen menu.
- Canvas: fluid up to 1180px, 24-36px gutters, 16px gap between cards.
- Dashboard grid: categories (7/12) beside the six-month chart (5/12), then the latest expenses at
  full width. Every block shows its header and first rows on a 1440×900 screen.

## Components

- **Buttons:** primary near-black (inverted in dark mode), secondary grey fill, ghost for icon
  actions. One primary per screen.
- **Cards:** white, 1px border, no shadow. Title 16/500 in the header; the period or legend in grey
  on the right.
- **Tables:** 12px grey sentence-case header, 48px rows, 1px row rules, no zebra, numbers
  right-aligned. Under 640px each row becomes two lines (what and how much; category and date).
- **Charts:** hand-written SVG. Columns with a 2px top radius, 4-5 faint gridlines, round ticks that
  top out above the maximum, the baseline as the one heavier line, a dashed reference line for the
  average explained in the legend below. Hit areas wider than the marks, and a hidden table for
  screen readers.
- **Dialogs:** the only element with a shadow (it floats).

## Don't

Gradients, glows, glass, emoji, icons in tinted circles, sparklines on figures, coloured tab pills,
tracked uppercase labels, a greeting as the title, more than one hue in a chart.
