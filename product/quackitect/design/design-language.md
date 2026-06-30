<!-- design: brand-design-language  implements: req-design-language :: The design language is one overlay-resolved brand bundle (voice, logo set, palette, typography). The engine default is generic (neutral voice + [ LOGO GOES HERE ] placeholders); a vehicle overrides in its overlay; deleting the vehicle's files falls back to this default. The report renders the resolved logo-mark left of the project name. -->
# Design language

A project's brand is ONE folder: **`product/brand/`** — voice, logo set, palette. This folder here
(`design/`) is the engine's **generic template** for it; `start init` seeds a new vehicle's
`product/brand/` from these files. The engine reads `product/brand/<asset>` and falls back to this
template when an asset is absent.

| asset | file (in `product/brand/`) | purpose |
|---|---|---|
| voice | `voice.md` | how every output reads (chat + artifact) |
| mark | `logo-mark.svg` | small / favicon / report titlebar |
| dark | `logo-dark.svg` | light-ink mark for dark backgrounds |
| palette | `palette.md` | colour tokens |

**Replace, don't fork.** Edit the files in `product/brand/` in place (keep the names). What ships as the
template is brand-neutral: a neutral voice and `[ LOGO GOES HERE ]` placeholders. **Delete** an asset to
fall back to this engine template.
<!-- enddesign -->
