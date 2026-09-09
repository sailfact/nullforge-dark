# Nullforge — VS Code Themes

Two color themes for Visual Studio Code: **Nullforge Dark** (default, the brand's hero look) and **Nullforge Light**. Forge orange as the accent, Null navy as the dark surface, Parchment as the light surface, JetBrains Mono everywhere. Designed to feel like a built-in OS dev tool: high contrast, calm chrome, deliberate punctuation of color where it counts.

The Design System project carries a `preview.html` — an interactive editor mock with a dark/light toggle.

## Files

Both JSON files in this directory are **generated**. The source of truth is [`../src/nullforge.yaml`](../src/nullforge.yaml); run `npm run build` after editing it.

| File | Purpose |
|---|---|
| `nullforge-dark.json`  | Dark theme (`"type": "dark"`). Null navy background, Parchment text, Forge accent. |
| `nullforge-light.json` | Light theme (`"type": "light"`). Parchment background, Pitch text, Forge accent. Activity bar + title bar stay dark for brand presence. |

## Install

This repository *is* the extension. To use it locally:

```bash
npm install
npm run package          # builds the themes, verifies them, emits nullforge-<version>.vsix
code --install-extension nullforge-*.vsix
```

Reload VS Code, then **`⌘K ⌘T`** (Mac) / **`Ctrl+K Ctrl+T`** (Win/Linux) → pick **Nullforge Dark** or **Nullforge Light**.

## Install — quick

If you'd rather not install an extension, paste either JSON file into VS Code's `settings.json` under `"workbench.colorCustomizations"` and `"editor.tokenColorCustomizations"`. You'll lose the named-theme switcher but the colors will apply.

## Pair with — file icons + Nerd Font

A theme only paints colors; **file icons** are a separate VS Code "icon theme," and **chrome glyphs** (git branch, language indicators, debug arrows) live inside the editor font. To get the full Nullforge look, pair the JSON themes with these:

### 1. JetBrains Icons Enhanced — explorer file icons

A JetBrains-IDE-style icon theme: outlined file shapes with small colored marks per type. Pairs cleanly with our color palette — the marks read as accents, not noise.

```
ext install chadalen.vscode-jetbrains-icon-theme
```

(Or search **"JetBrains Icon Theme"** in the Extensions panel — variants from `chadalen` are common.) Then **`⌘K ⌘T → File Icon Theme → JetBrains Icon Theme`**.

If you'd rather use a different icon set, the Nullforge theme works fine with **Material Icon Theme**, **Symbols** (Miguel Solorio), or VS Code's built-in **Seti**.

### 2. JetBrainsMono Nerd Font — chrome glyphs

Use the [Nerd Fonts](https://www.nerdfonts.com/) build of JetBrains Mono — same typeface, patched with ~10k extra glyphs (git branch, file types, OS logos, devicons). The status bar, file tabs, and inline `nf-*` characters in your prompts and terminal will render real icons instead of `tofu` boxes.

**Install:**

```bash
# macOS
brew tap homebrew/cask-fonts
brew install --cask font-jetbrains-mono-nerd-font

# Linux / Windows
# Download from: https://www.nerdfonts.com/font-downloads → "JetBrainsMono Nerd Font"
# Unzip into ~/.local/share/fonts/ (Linux) or right-click → Install (Windows).
```

Then in `settings.json`:

```json
{
  "editor.fontFamily": "'JetBrainsMono Nerd Font', 'JetBrains Mono', ui-monospace, monospace",
  "terminal.integrated.fontFamily": "'JetBrainsMono Nerd Font'"
}
```

The **non-patched** JetBrains Mono ships in the Design System project at `fonts/`. The Nerd Font patch is not redistributed there — install it from the link above. The font fallback chain in the settings above ensures everything still renders if a user doesn't have it.

## Companion settings (recommended)

Combine everything above into one `settings.json` block:

```json
{
  "workbench.colorTheme": "Nullforge Dark",
  "workbench.iconTheme": "jetbrains-icon-theme",
  "editor.fontFamily": "'JetBrainsMono Nerd Font', 'JetBrains Mono', ui-monospace, monospace",
  "editor.fontLigatures": "'ss01', 'ss02', 'cv01', 'cv02'",
  "editor.fontSize": 14,
  "editor.lineHeight": 1.6,
  "editor.cursorStyle": "block",
  "editor.cursorBlinking": "phase",
  "editor.renderWhitespace": "selection",
  "editor.guides.bracketPairs": "active",
  "editor.bracketPairColorization.enabled": true,
  "terminal.integrated.fontFamily": "'JetBrainsMono Nerd Font'"
}
```

## Color reference

Every color traces back to the brand ramps in the Design System's `colors_and_type.css`. In the source YAML these are named roles — see the `palettes:` block for the full list.

| Role                  | Dark              | Light             | Token                |
|-----------------------|-------------------|-------------------|----------------------|
| editor background     | `#1a2a3a`         | `#f2ece6`         | `--null-700` / `--neutral-50` |
| editor foreground     | `#f2ece6`         | `#110e0b`         | `--neutral-50` / `--neutral-950` |
| cursor / line accent  | `#c4622d`         | `#c4622d`         | `--forge-500`        |
| selection             | `#c4622d40`       | `#c4622d33`       | `--forge-500` + alpha|
| activity bar          | `#06101a`         | `#0a1420` (still dark) | `--null-900`    |
| status bar            | `#c4622d`         | `#c4622d`         | `--forge-500`        |
| sidebar               | `#1a2a3a`         | `#e8e0d6`         | `--null-700` / sand-warm |
| comments              | `#7a9bb8` italic  | `#6b6058` italic  | `--null-200` / `--neutral-500` |
| strings               | `#e8a882`         | `#8f4420`         | `--forge-200` / `--forge-700` |
| keywords              | `#c4622d`         | `#c4622d`         | `--forge-500`        |
| functions             | `#f7e8df`         | `#1a2a3a`         | `--forge-50` / `--null-700` |
| types                 | `#e8a882`         | `#8f4420`         | `--forge-200` / `--forge-700` |

## Caveats

- The light theme keeps the **activity bar and title bar dark** — this is intentional. The contrast band frames the workspace and keeps Nullforge's identity visible even when you're working in light mode. If you'd prefer a fully light chrome, point `SURFACE_CHROME` and `SURFACE_RAIL` at the sand ramp in `src/nullforge.yaml` and rebuild.
- Token colors were tuned against TypeScript / TSX / TOML / Markdown. Other languages should look reasonable but may benefit from per-language scope additions — pull-request style.
- Not yet published to the marketplace. The local install above is the path until that happens.
