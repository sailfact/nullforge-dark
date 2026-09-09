# nullforge
*build from nothing.*

A Visual Studio Code theme in two variants — **Nullforge Dark** and **Nullforge Light** — generated from a single source file.

[nullforge-theme](https://github.com/sailfact/nullforge-theme)

## Layout

| Path | What it is |
|---|---|
| `src/nullforge.yaml` | **Source of truth.** Palettes, variants, and one shared colour structure. |
| `themes/*.json` | Generated. Do not edit by hand — `npm run build` overwrites them. |
| `themes/README.md` | Theme documentation: install, companion font/icon settings, colour reference. |
| `scripts/` | `generate` → `build` → `verify` / `lint`. |

## How it works

`src/nullforge.yaml` holds every VS Code colour key **once**. Values are `$ROLE`
references; the hex lives only in the `palettes:` block, one palette per variant:

```yaml
palettes:
  dark:
    SURFACE_EDITOR:  '#1a2a3a'
    ACCENT:          '#c4622d'
  light:
    SURFACE_EDITOR:  '#f2ece6'
    ACCENT:          '#c4622d'

variants:
  - id: dark
    label: "Nullforge Dark"
    uiTheme: vs-dark
    file: nullforge-dark.json

colors:
  editor.background:  $SURFACE_EDITOR
  editorCursor.foreground:  $ACCENT
  editor.selectionBackground:  !alpha [$ACCENT, '40']
```

- `!alpha [$ROLE, '40']` appends a constant alpha suffix to a role.
- `~` as a palette value omits that key for that variant.
- Adding a variant is a one-file change: add a palette and a `variants:` entry.
  `npm run build` writes the new JSON *and* registers it in
  `package.json` → `contributes.themes`.

## Commands

```bash
npm install
npm run build      # regenerate themes/ and sync package.json contributes.themes
npm run verify     # round-trip check: generated output vs the committed JSON
npm run lint       # diff our colour keys against VS Code's published reference
npm run package    # build + verify + vsce package → nullforge-<version>.vsix
```

`npm run verify` is the guard that makes the YAML safe to treat as the only
source of truth: it regenerates in memory and deep-compares against what is
committed in `themes/`, reporting every differing path.

## Credits

Colours, ramps, and token assignments come from the Nullforge Design System.
