---
minted_in: i16-the-vehicle-overlay-a-vehicle-vendors-th
id: opt-override-by-declared-identity
type: "[[option]]"
statement: an override names the artifact it replaces by that artifact's own stable identity, and where either file sits is irrelevant to the match
cluster: the-walk
question: how an override is matched to what it overrides
found_by: prior-art
source: "Kustomize patches (kubectl.docs.kubernetes.io/references/kustomize/kustomization/patches/), Nix overlays (NixOS/nixpkgs doc/using/overlays.chapter.md), XSLT 1.0 import precedence (www.w3.org/TR/xslt-10 s5.5-5.6), Android RRO (source.android.com/docs/core/runtime/rros), Cargo [patch] (doc.rust-lang.org/cargo/reference/overriding-dependencies.html), Go replace (go.dev/doc/modules/gomod-ref)"
---

## Mechanism

THE OVERRIDE CARRIES A SELECTOR, and the selector is the target's own name in
a namespace that exists independently of the filesystem. Resolution matches on
that name. Neither file's location takes part.

SIX SYSTEMS DO THIS, and they agree on the shape while differing on the
namespace.

- Kustomize matches on a Kubernetes group, version, kind and name tuple. A
  patch may even refer to a resource by a previous name, so identity survives
  a rename.
- Nix overlays match on the attribute name in the package set.
- XSLT matches named templates on a qualified name, and makes a duplicate at
  equal precedence a loud ERROR rather than a silent last-wins.
- Android's runtime overlays match on resource type and name, then compile
  that to a numeric map at install time.
- Cargo matches on source plus crate name; Go on the module path.

WHAT IT BUYS HERE, AND IT IS THE THING THE PATH SEARCH CANNOT DO. An artifact
that moves inside the vendored layer keeps being overridden, because the
override never referred to where it was. That failure is the standing defect
of the alternative on this cell.

AND THE PRICE IS ALREADY PAID. Every identity-keyed system in the sweep has a
name registry that exists for other reasons — Kubernetes kinds, crate
coordinates, XSLT qualified names. This corpus already gives every artifact a
stable id and already resolves references by it, so the namespace this
mechanism needs is not new work.

WHAT IT COSTS. The selector duplicates the target's identity, so an upstream
RENAME turns the override into a no-op. Kustomize is the only system in the
sweep that addresses this, and only for renames that went through its own
transformations. A rename upstream is therefore a silent break unless
something reports unmatched overrides.

AND THE FAILURE IS SILENT UNLESS MADE LOUD. XSLT is the counter-example worth
copying: an override matching nothing, or two overrides matching one target at
equal precedence, is an error rather than a shrug.
