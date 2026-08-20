---
form: find_prior_art
by: agent
signed_off: 2026-08-16T17:48:42.903Z
authors: agent
files: null
---

# Evidence form / find_prior_art

## current_situation

partition-functions closed: cluster-the-query and cluster-the-disposition minted for the three new i15 functions. This is finder 1 of 4 at M4 enumerate-space, scoped to i15's cone — the two new clusters, since the five pre-existing clusters are untouched by this iteration.

## applies

yes

## options

- project/spec/trace/option/opt-declarative-view-spec-evaluated-in-process.md
- project/spec/trace/option/opt-pipeline-query-language-over-index.md
- project/spec/trace/option/opt-embedded-relational-store-with-sql.md
- project/spec/trace/option/opt-scripting-api-over-loaded-index.md
- project/spec/trace/option/opt-probabilistic-threshold-classification.md
- project/spec/trace/option/opt-explicit-disposition-on-every-candidate.md

## literature

cluster-the-query: the relational query model (SQL SELECT/WHERE/named columns) as the general paradigm — embeddable engines such as SQLite are the common implementation. Our own architecture already committed to a neighbouring shape: adr-query-in-engine (spec/decisions/adr-query-in-engine.md at ref main) names the pinned in-engine Bases subset, reads nodes/edges/states/notes, returns filtered rows with chosen fields, refuses an unknown field.

cluster-the-disposition: Fellegi & Sunter, "A Theory for Record Linkage," Journal of the American Statistical Association 64(328), 1969 — verified via en.wikipedia.org/wiki/Record_linkage. Its match/non-match/possible-match three-way classification is the literature's answer to "rank a candidate pair, then decide what it is."

## shipped

COMPETITOR: Obsidian Bases, core plugin since it shipped inside Obsidian. Verified live against the Aug 2026 Obsidian changelog (obsidian.md/changelog) and help.obsidian.md/bases: ships a formula editor, sort/filter controls, and resizable table-view columns. `.base` files are YAML view-config (filter + view list), never data — matches v1's own harvested shape exactly.

COMPETITOR: Obsidian Dataview, community plugin. Verified against its own README (github.com/blacksmithgu/obsidian-dataview): four query modes — DQL (a pipeline-based, SQL-looking language), inline expressions, DataviewJS, inline JS. Data comes from frontmatter plus an inline `Key:: Value` syntax Bases does not have.

OUR OWN PREDECESSOR (the-query): v1 harvested 25 .base files plus adr-query-in-engine.md, read directly at ref main. spec/queries/requirements.base: `filters.and` over `type == "requirement"`, a table view sorted DESC on weight, grouped by kind. spec/queries/decisions-architecture.base: the same and-nested-filter shape over a different type/kind pair. Both confirm the declarative view-spec mechanism v1 already committed to.

OUR OWN PREDECESSOR (the-disposition): this engine's own judge-a-claim function (cluster-the-walk) already builds a form, checks what comes back, and carries a person's verdict on it — the same explicit-disposition-on-every-item shape, one cluster over, already running in production here.

## dry_wells

- none — both cluster-the-query and cluster-the-disposition returned real literature and real shipped precedent this pass

## follow_up

A build-time (not requirements-time) concern is parked as note-10b26a554948: Bases' formula editor and newer view types postdate the harvested v1 subset; adr-query-in-engine's reverse-sensitivity clause already covers extending the subset when a needed query demands it.

Next: the other three M4 finders (contradiction/TRIZ, analogy transfer, heuristics catalog, without/trimming, probe) run over the same two clusters, then enumerate-space dedupes and joins into the morphological chart.

## anything_else


