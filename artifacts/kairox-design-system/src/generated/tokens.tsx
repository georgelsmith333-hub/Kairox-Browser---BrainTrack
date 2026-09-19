/* GENERATED FROM tokens.json -- DO NOT EDIT. Run scripts/build-tokens.mjs. */
// Portable design tokens (colors as hex). Web consumes the theme via
// src/index.css; mobile (Expo) and any other platform import this object so the
// whole product shares one source of truth.
export const tokens = {
  "color": {
    "light": {
      "background": "#F5F1EA",
      "foreground": "#11161D",
      "border": "#D9D7D1",
      "card": "#FFFDF8",
      "cardForeground": "#11161D",
      "popover": "#FFFDF8",
      "popoverForeground": "#11161D",
      "primary": "#0C6A83",
      "primaryForeground": "#F7FCFD",
      "secondary": "#E8E7E1",
      "secondaryForeground": "#1B252D",
      "muted": "#EDEBE5",
      "mutedForeground": "#5F666B",
      "accent": "#D8EEF0",
      "accentForeground": "#12343E",
      "destructive": "#B83D4C",
      "destructiveForeground": "#FFF8F6",
      "input": "#D4D4CE",
      "ring": "#0C6A83",
      "chart1": "#0C6A83",
      "chart2": "#B77B2B",
      "chart3": "#6A5AA8",
      "chart4": "#2C8C72",
      "chart5": "#B83D4C",
      "sidebar": "#EAE7DF",
      "sidebarForeground": "#263139",
      "sidebarBorder": "#D3D2CC",
      "sidebarPrimary": "#0C6A83",
      "sidebarPrimaryForeground": "#F7FCFD",
      "sidebarAccent": "#D8EEF0",
      "sidebarAccentForeground": "#12343E",
      "sidebarRing": "#0C6A83"
    },
    "dark": {
      "background": "#0B0E13",
      "foreground": "#F4F1EA",
      "border": "#27303A",
      "card": "#121821",
      "cardForeground": "#F4F1EA",
      "popover": "#151C25",
      "popoverForeground": "#F4F1EA",
      "primary": "#6EE1F0",
      "primaryForeground": "#081116",
      "secondary": "#1B2530",
      "secondaryForeground": "#EAF0F2",
      "muted": "#151D27",
      "mutedForeground": "#9BA9B0",
      "accent": "#17333D",
      "accentForeground": "#B6F1F5",
      "destructive": "#E65B68",
      "destructiveForeground": "#220A0E",
      "input": "#27303A",
      "ring": "#6EE1F0",
      "chart1": "#6EE1F0",
      "chart2": "#F3BD62",
      "chart3": "#B7A5F0",
      "chart4": "#63D0AE",
      "chart5": "#F47C87",
      "sidebar": "#0F141B",
      "sidebarForeground": "#DDE7EA",
      "sidebarBorder": "#27303A",
      "sidebarPrimary": "#6EE1F0",
      "sidebarPrimaryForeground": "#081116",
      "sidebarAccent": "#17333D",
      "sidebarAccentForeground": "#B6F1F5",
      "sidebarRing": "#6EE1F0"
    }
  },
  "fontFamily": {
    "sans": [
      "Inter",
      "sans-serif"
    ],
    "serif": [
      "Georgia",
      "serif"
    ],
    "mono": [
      "JetBrains Mono",
      "Menlo",
      "monospace"
    ]
  },
  "radius": "0.75rem",
  "spacing": "0.25rem"
} as const;

export type Tokens = typeof tokens;
export default tokens;
