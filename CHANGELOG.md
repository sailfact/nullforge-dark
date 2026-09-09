# Change Log

All notable changes to the "nullforge" extension are documented in this file.
This project follows [Keep a Changelog](http://keepachangelog.com/).

## [Unreleased]

### Added
- **Nullforge Light** — a second variant sharing the Forge accent, on a Parchment
  surface with the activity bar and title bar kept dark for brand presence.
- `src/nullforge.yaml` is now the single source of truth for every variant:
  one colour structure, one palette per theme, resolved through named `$ROLE`s.
- `npm run build` regenerates `themes/` **and** syncs `package.json` →
  `contributes.themes`, so adding a variant is a one-file change.
- `npm run verify` round-trip check and `npm run package` release script.

### Changed
- The single `nullforge-theme` is now **Nullforge Dark**
  (`themes/nullforge-dark.json`). Users with `"workbench.colorTheme":
  "nullforge-theme"` need to re-pick the theme once.
- Adopted the Design System's newer dark surface ramp: the editor background
  moves from `#0a1420` to `#1a2a3a`, with chrome and borders following.

## [1.0.1]

- Added editor widget colours (suggest, hover, marker navigation).

## [1.0.0]

- Initial release.
