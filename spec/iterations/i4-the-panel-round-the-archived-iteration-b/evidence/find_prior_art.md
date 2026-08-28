---
form: find_prior_art
judgment: passed at 2026-08-24T11:12:27.355Z
by: agent
signed_off: 2026-08-23T17:11:52.663Z
authors: agent
files: null
---

# Evidence form / find_prior_art

## current_situation

TWO RENDERINGS OF THE SAME WALK STAND, and one is being removed. The open design question is what the surviving one must be.

THE OTHER THREE OPENING PIECES ARE ALREADY-RULED BUILDS rather than open spaces, so prior art has nothing to add to them.

THIS FINDER RAN ALONE. Three sibling finders cover the other angles.

## applies

yes — the surviving surface lives inside an editor host, so what that host's publisher says about its own surfaces is primary evidence and takes minutes to check

## options

- opt-one-webview-view-in-a-container-is-the-only-surface

## literature

ONE PRIMARY READ, AND IT IS THE PUBLISHER'S OWN.

VS Code Extension API, UX Guidelines / Webviews, https://code.visualstudio.com/api/ux-guidelines/webviews, page dated 8/19/2026. Three lines carry weight.

- "webviews should only be used if you absolutely need them."
- Under Don't: "Repeat existing functionality (Welcome page, Settings, configuration, etc.)"
- "You can also place webviews into any view container (sidebar or panel) and these elements are called webview views. The same webview guidance applies to webview views."

THE SECOND LINE IS THE SINGLE-POINT-OF-TRUTH RULE written by the host vendor about its own surfaces, and it arrived independently of the owner's ruling of the same day.

NO ACADEMIC LITERATURE WAS READ. The question is a platform convention rather than a research question, and a paper about duplicated view state would be a lead rather than evidence for this host.

## shipped

TWO SHIPPED EXAMPLES ARE NAMED ON THE SAME PAGE, both by the publisher.

- SIMPLE BROWSER renders a browser-like window in a webview panel. It is the case where a webview genuinely earns itself, because nothing in the editor's own vocabulary draws a web page.
- PULL REQUEST uses a custom tree view for the list and a webview only for the detail. That split is the interesting one: the parts the editor can already draw are drawn by the editor, and the webview carries only what it cannot.

THE PATTERN ACROSS BOTH is that a webview carries what the host has no widget for, and never what it does.

THE PREDECESSOR WAS NOT REVERSE-ENGINEERED. This project's own v1 is a richer source than either example and it was not read here, because this finder ran alone and that read is a state's worth of work on its own. Named as a gap rather than left silent.

## dry_wells

- the web search itself: eight hits, six of them API tutorials or starter templates answering how to build a webview rather than whether to have two
- marketplace listings for architecture-visualiser extensions: a listing is evidence a feature is claimed, never that the design behind it is good
- community write-ups on webview architecture: they repeat the API guide and name no primary of their own, which makes them leads rather than evidence
- prior art on collapsing two surfaces into one: none found, and that is a real null result rather than a search that went wrong
- this project's own predecessor: not reverse-engineered here, because that read is a state's worth of work and this finder ran alone

## follow_up

THE PREDECESSOR READ IS OWED SOMEWHERE. v1 is a richer source than either shipped example on the publisher's page, and skipping it is the gap this method card warns about by name.

THE HOST LIMIT WAS NOT LOOKED FOR. Nothing was found that bounds what the surviving view may render, and nothing was searched for beyond one guidance page. That carries as an assumption rather than as a finding, and it is already recorded against the surface collapse.

## anything_else

