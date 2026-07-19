---
id: model-engine-layers
type: model
kind: onion
statement: what may depend on what in the engine, and how do signals travel through it?
class: review
killer: false
---
```mermaid
flowchart TD
  %% The engine's onion (owner physics): rank = abstraction gradient,
  %% innermost first. Elements are design regions; files are themes (derived).
  %% Bands own the transforms; ambient holds meaning-free utilities.
  %% Allocations marked "%% ?" are agent judgment awaiting owner confirmation.
  subgraph kernel
    go-voice-gate["voice gate rule"]
    go-io-busbar["disk-selector classing for the physics rules"]
    go-drawing-not-node["drawing recognition rule"]
    go-fail-at-end["battery fail-at-end rule"]
    go-engine-core["graph resolution and full hashes"]
    go-suspect-root["suspect propagation"]
    go-coverage-ids["coverage rules"]
    go-tests-pass-eval["tests-pass evaluation"]
    go-testsred-marker["tests-red exemption rule"]
    go-vv-time-scope["backward-cumulative vv scope"]
    go-vv-exceptions["vv exception rules"]
    go-verdict-order["double-claim rule"]
    go-decisions["decision classes"]
    go-region-hash-norm["region hash normalization"]
    go-no-trace-gate["trace content is never a gate"]
    go-actor-channels["actor stamped by channel"]
    go-attest-state["key state and budgets"]
    go-ears-lint["ears shapes and weasel words"]
    go-monotonic-lint["milestone-monotonic wiring"]
    go-id-charset["id charset rule"]
    go-model-conformance["declared vs as-built diffing"]
    go-model-asbuilt["the engine's reflexion diff"]
    go-conn-prose-hash["prose hashing for edges"]
    go-standalone-suite["standalone suite rule"]
    go-kernel-selftest["trust kernel vectors"]
    go-refusal-lint["refusal messages carry cause plus recovery"]
    go-bless-preflight["bless preflight at the write path"]
    go-ifu-coverage["ifu use-case coverage rule"]
    go-no-test-policy["vv no-test policy findings"]
    go-red-edit-guard["red-observed edit guard"]
    go-field-tier["tier semantics: core blocks, deferrable defaults count"]
    go-register-colors["provenance to traffic-light derivation"]
  end
  subgraph graph
    go-sub-addressing["requirement sub-statement addressing"]
    go-function-nodes["function node type"]
    go-conn-tools["lane tooling"]
    go-conn-lane-root["lane root resolution"]
    go-conn-code-endpoints["code-design edge endpoints"]
    go-edge-mode["edge-mode switch"]
    go-auto-link["auto-linking"]
    go-virtual-edges["virtual edges"]
    go-model-nodes["model nodes in the ledger"]
    go-items["item type vocabulary"]
    go-question-nodes["question state and provenance"]
  end
  subgraph rim--graph
    go-chapter-title-split["chapter title and subtitle split"]
    go-toc-order["the toc owns the chapter order"]
    go-onion-interact["the one onion interaction script"]
    go-card-evidence["hand-off card evidence render"]
    go-handoff-lifecycle["hand-off page lifecycle"]
    go-timeline-drilldown["task drill into evidence and cited elements"]
    go-root-content["identity-root content set"]
    go-module-config["module config read"]
    go-node-module-default["node module default"]
    go-rigor-fit["rigor fit lint"]
    go-verdict-guard["verdict-write guards: busy discard, first-green withhold"]
    go-voice-lint["voice lint over authored statements"]
    go-recital-chain["recital wording-chain selftest"]
    go-parse["text to typed nodes"]
    go-strict-load["the strict referee"]
    go-truth-in-spec["truth lives in spec"]
    go-evidence-hash["evidence folds into gates"]
    go-evidence-honesty["verdict honesty rules"]
    go-evidence-cache-cap["verdict file cap"]
    go-verdict-cache["verdict cache"]
    go-attest-ritual["challenge and renewal"]
    go-spec-lints["spec lint rules"]
    go-terms-order-lint["terms-before-use advisory lint"]
    go-model-lints["model ambiguity and coverage lints"]
    go-register-vale["prose register rules"]
    go-user-wording["user wording rules"]
    go-book-drift["book drift rule"]
    go-entry-chain["entry pointer-chain rule"]
    go-conn-lanes["edge lanes"]
    go-base-eval["base query evaluation"]
    go-spec-content["spec content roots"]
    go-type-stakeholders["type and stakeholder vocabulary"]
    go-migrate-layout["layout migration"]
    go-migrate-edges["edge migration"]
    go-cluster["cluster migration"]
    go-dsm-cluster["design coupling clustering"]
    go-apply-manifest["judged bulk-edit applier"]
    go-apply-undo["apply undo journal"]
    go-quack-mv["the rename determinizer"]
    go-apply-field-ops["scalar frontmatter surgery"]
    go-mint-skeleton["mint skeletons"]
    go-mint-templates["mint bodies from template files"]
    go-rules-config["rule-sets from config files"]
    go-field-schemas["per-field schemas: load, merge, validate"]
    go-provenance-block["per-field provenance parse and hash"]
    go-register-render["register rows: two greens, progressive disclosure"]
    go-seed-skeleton["start seeds the rigor checklist skeleton"]
    go-vehicle-misuse-guard["vehicle-spec misuse signature warning"]
    go-schema-tester["validate the schema set itself"]
    go-graph-load["spec loading and node assembly"]
    go-ratings-map["ratings map parsing"]
    go-conn-loader["lane files to edges"]
    go-model-extract["mermaid to semantic graph"]
    go-model-behavior["behavior subsets to graphs"]
    go-model-registry["kind registry scan"]
    go-book-emitter["graph to book html"]
    go-book-shell["book shell"]
    go-book-manifests["manifest units"]
    go-book-figures["derived figures"]
    go-book-glossary["glossary render"]
    go-book-honesty["honesty slate render"]
    go-book-a11y["a11y attributes"]
    go-ch2-derived["derived fundamentals lists"]
    go-deck-mode["deck views"]
    go-deck-anchors["deck url anchors + reflection"]
    go-guide-ch8["guidance chapter"]
    go-guidance-split["guidance split rules"]
    go-context-neighbours["context model from nbr notes"]
    go-onion-figure["the onion drill-down render"]
    go-onion-busbar["bus-bar level layout"]
    go-onion-dsm-groups["dsm coupling clusters in the onion"]
    go-model-standalone["standalone single-model render"]
    go-onion-change-marks["review change-marks that propagate up"]
    go-block-tree-design["block tree render"]
    go-trace-graph["trace view render"]
    go-fig-elem-ids["stable figure element ids"]
    go-fig-fullscreen["figure fullscreen"]
    go-fig-tables["figure tables"]
    go-q-table["query tables"]
    go-render-refs["reference rendering"]
    go-ref-tooltips["reference tooltips"]
    go-results-exception["results exception render"]
    go-project-record["project record render"]
    go-decisions-table["one decisions table render"]
    go-informed-by-edges["decision-to-model-element links + render"]
    go-asr-list["generated asr link list"]
    go-guides-table["guides table render"]
    go-views-home["views home render"]
    go-quarantine-scope["meta quarantine"]
    go-annotator-core["comment layer"]
    go-annotator-static-checks["comment dom checks"]
    go-ai-marks["provenance icons"]
    go-icon-density["icon density"]
    go-reader-name["reader naming"]
    go-shell-title-card["title card"]
    go-white-label-identity["identity surfaces from the brand layer"]
    go-ucfn-board["use-case function board"]
    go-comment-island["comment island"]
    go-island-serialize["island serialization"]
    go-file2list["commented copy readback"]
    go-report["report render"]
    go-render-folds["fan, theme, and age folds"]
    go-trace-collapsible["typed trace clusters with busbar interiors"]
    go-models-useful["the model pull law - render follows the views ruling"]
    go-structure-layers["authored model routes - context to structure to onion"]
    go-report-why["why panel"]
    go-report-filter-ux["report filters"]
    go-report-logo["report logo"]
    go-trace-nesting["report trace nesting"]
    go-verdict-link["verdict links"]
    go-facet-board["facet board"]
    go-handover-pager["pager card"]
    go-pager-merge["combined pager"]
    go-pager-scope["pager scoping"]
    go-progress-bar["progress bar"]
    go-progress-cmd["progress command render"]
    go-model-render["model figures"]
    go-onion-space["onion figures break out of the prose column"]
    go-models-complete-book["kind-example figures"]
    go-onion-model-source["onion layer map from the model"]
    go-book-once["shared real-book render memo"]
    go-lint-ast-cache["design-flow derivation memo"]
    go-compact["iteration archive codec"]
    go-ask-hardening["ask-store merge and stale-answer serialization rules"]
    go-ask-core["ask model and store serialization"]
    go-first-wins-lanes["first answer wins"]
    go-timeline-shared["the one timeline renderer, three frames"]
    go-timeline-shared-css["the one timeline stylesheet"]
    go-timeline-frames["timeline frame surfaces and the evidence drilldown"]
    go-pugh-matrix-render["pugh matrix from criterion and candidate nodes"]
    go-raid-matrix-render["raid bubble matrix"]
    go-register-fold["design-input register + generic filter columns"]
    go-sample-register["the pong sample of the register component"]
    go-ifu-arc-lint["ifu deck arc shape check"]
    go-rationale-fill["rationale fill lint - real content or an explicit n/a mark"]
    go-card-guard["card select-line guard"]
    go-marker-scan-stop["marker scan stop rule"]
    go-module-import-plan["module import planning"]
    go-voice-prose["prose voice lint"]
  end
  subgraph services
    go-region-delta["why-delta region attribution"]
    go-build["engine build orchestration"]
    go-build-fast-skip["compile skip"]
    go-rebaseline-inprocess["in-process re-baseline"]
    go-note["note capture"]
    go-note-dedup["note collision"]
    go-stamp-user["user stamp"]
    go-verdict-surgical["surgical verdicts"]
    go-why-derived["why for derived checks"]
    go-mint["deterministic minting"]
    go-mint-content["mint bodies"]
    go-mint-kinds["mint kind set"]
    go-mint-edge-aware["mint edge mode"]
    go-mint-prefill["mint pre-fills schema fields with proposals and provenance"]
  end
  subgraph rim
    go-mcp-supervisor["mcp supervisor face"]
    go-mcp-self-arm["mcp self-arm on birth"]
    go-mcp-errors["mcp error surfaces"]
    go-supervisor-hardening["force-swap, deterministic kill, park sweep"]
    go-ask-context["ask context capture"]
    go-lint-exit["honest lint exit"]
    go-verify-pin["battery build pinning"]
    go-battery-isolation["battery isolation"]
    go-arg-guards["argv guards"]
    go-adopt-honest["honest adoption"]
    go-guard-selftest["battery gating in dispatch"]
    go-guard-cli["declared agent lane refusal"]
    go-grant-store["standing grant events"]
    go-grant-review["grant collection surface"]
    go-battery-progress["battery progress line"]
    go-verify-feedback["verify feedback - the battery announce lane on stderr"]
    go-battery-batch["battery batch cache"]
    go-battery-parallel["battery worker pool"]
    go-binary["process entry"]
    go-cli-help["help surface"]
    go-start["version start"]
    go-start-init["workspace init"]
    go-walk["the next check walk"]
    go-bless["adjudication recording"]
    go-gather["source bundling"]
    go-ship["packaging"]
    go-build-fast-path["build fast path"]
    go-build-analysis["static-analysis gate in the build"]
    go-authoring-cheap["authoring fast paths"]
    go-notes-list["notes listing"]
    go-calls-summary["call-log aggregate"]
    go-tests-red["observe-red command"]
    go-observe-red-refresh["red re-attest"]
    go-selftest["selftest runner"]
    go-selftest-registry["per-file test registries"]
    go-perf["perf checks"]
    go-compact-cmd["compact verb and referee archive ids"]
    go-cone-triage["triage verb and the suspects-only wave filter"]
    go-attest-gate["ledger commands need a key"]
    go-grandfathers-decided["historical exemptions decided"]
    go-legacy-lanes-retired["legacy lanes refused"]
    go-global-ratchet["binary self-update"]
    go-ratchet-stamp["build stamps"]
    go-ask-loop["ask send, drain, await"]
    go-mcp-server["hand-rolled stdio MCP transport + tool dispatch"]
    go-mcp-session["per-session attest state + the ledger choke point"]
    go-register-answer["watch-mode answer endpoint onto the ask path"]
    go-defer-retire["defer and retire reaches"]
    go-ask-seam["adapter seam"]
    go-report-watch["watch server"]
    go-logs-dir["session logs"]
    go-notes-out["notes files"]
    go-inside-launcher["launcher emission"]
    go-inside-agents["agents file emission"]
    go-inside-claude["claude pointer emission"]
    go-init-stubs["stub workspaces"]
    go-stub-spec["spec template skeleton"]
    go-ntfy-adapter["ntfy transport"]
    go-ask-pairing["pairing config and print"]
    go-pair-qr["qr to terminal"]
    go-home-sweep["fixture home sweep"]
    go-home-marker["home marker files"]
    go-boot-cmd["the fixed boot sequence command"]
    go-pager-result["pager round-end line + pollable result file"]
    go-query["query verb - the read lane"]
    go-binary-budget["cold-start budget measurement"]
    go-mcp-birth["scaffold mcp arming"]
    go-mcp-reload["supervisor child reload"]
    go-module-command-selector["module command dispatch"]
  end
  subgraph ambient
    go-type-colors["one palette source for every render"]
    go-palette-source["type colors resolved from the one palette source"]
    go-data-home["data home paths"]
    go-call-log["telemetry - cross-cutting by decision (adr-logging-ambient)"]
    go-call-log-cap["log retention cap - cross-cutting by decision (adr-logging-ambient)"]
    go-overlay-resolver["overlay resolution"]
    go-workspace-base["workspace base paths"]
    go-brand["brand name"]
    go-readout-width["text width and console probes"]
  end
  %% flows - a-to-b, payload-labeled, between declared elements
  go-binary -->|argv as command| go-walk
  go-walk -->|load request| go-parse
  go-parse -->|typed nodes| go-engine-core
  go-conn-loader -->|edges| go-conn-lanes
  go-conn-lanes -->|adjacency| go-engine-core
  go-model-extract -->|semantic graphs| go-model-nodes
  go-model-nodes -->|graph hashes| go-engine-core
  go-engine-core -->|resolved graph| go-coverage-ids
  go-bless -->|adjudication events| go-truth-in-spec
  go-ask-loop -->|answer intents| go-bless
  go-ntfy-adapter -->|tap payloads| go-ask-loop
  go-coverage-ids -->|verdicts| go-report
  go-coverage-ids -->|verdicts| go-book-emitter
  go-coverage-ids -->|readiness| go-handover-pager
  go-report -->|html| go-report-watch
  go-book-emitter -->|book html| go-notes-out
  go-handover-pager -->|pager text| go-cli-help
  %% i18 new-block flows (the developer's input/output contract per block)
  go-mcp-server -->|tool call| go-mcp-session
  go-mcp-session -->|attested call| go-walk
  go-mcp-session -->|attested ledger op| go-bless
  go-parse -->|parsed field values| go-field-schemas
  go-field-schemas -->|field violations| go-spec-lints
  go-schema-tester -->|contract test| go-field-schemas
  go-decisions -->|architecture links| go-informed-by-edges
  go-informed-by-edges -->|informed-by lists| go-model-render
  go-informed-by-edges -->|type column| go-decisions-table
  %% i22 new-block flows (engine laws)
  go-binary -->|command and channel| go-guard-selftest
  go-guard-selftest -->|lawful battery request| go-selftest
  go-grant-store -->|grant cover and stamp| go-bless
  go-verdict-guard -->|guarded verdicts| go-verdict-cache
```
## Rationale (not load-bearing)
The physics (owner physics): rank = abstraction gradient; elements = design regions; files = themes (derived Schlauch); bands own transforms; identity transit legal; a-to-b notation. Uncertain allocations for the owner's red pen: go-strict-load (band vs kernel - it referees DURING the load transform), go-book-drift and go-register-vale (kernel rules that read files), go-global-ratchet (services with heavy rim I/O), go-tests-pass-eval (kernel logic that shells out to run suites - an expected rim-only-I/O finding). The graph--kernel seam carries no dedicated band yet - transit is identity today. Rendering: rim--graph carries BOTH directions (parse a-to-b: rim-to-graph; render: graph-to-rim) - the codec pattern, one band. The onion render points here; design-layers.md retires when it does.

Allocation by essence:
- To the band: every region whose essence is a coordinate transform on files. Spec-or-data readers and writers: go-strict-load, go-truth-in-spec (the ledger's CONTENT stays kernel memory; its file serialization is the band part - the region carries the serialization), go-evidence-hash, go-evidence-honesty, go-evidence-cache-cap, go-verdict-cache, go-base-eval, go-spec-content, go-conn-lanes, go-type-stakeholders. Raw-text lints (they work on the text coordinate, not the graph): go-spec-lints, go-model-lints, go-register-vale, go-user-wording, go-book-drift, go-entry-chain. One-shot spec rewrites and body emission: go-migrate-layout, go-migrate-edges, go-mint-skeleton. go-attest-ritual: the challenge IS a transform of the live contract text.
- To the rim: the console command shells (they parse argv, call inward, print) - go-start, go-start-init, go-walk, go-bless, go-gather, go-ship, go-notes-list, go-calls-summary, go-tests-red, go-observe-red-refresh. The world-manipulating machinery: go-global-ratchet, go-ratchet-stamp, go-build-fast-path, go-authoring-cheap (binary, stamps, golden). The fixture-world batteries: go-selftest, go-grandfathers-decided, go-legacy-lanes-retired. The transport side of asks: go-ask-loop, go-ask-seam (adapters and their pump). go-attest-gate: its own design text names the CLI layer.
- Orchestration RULES stay inward: go-note, go-stamp-user (services); go-decisions, go-actor-channels, go-attest-state (kernel). Their console shells (cmdDecisions, cmdMigrateActors, cmdBuild-style) sit outside regions - the marked region is the rule, the shell is plumbing.
- go-readout-width (ambient) gained the console channel probe (channelInteractive) - console shape is a meaning-free utility, same family as isTTY.
- go-call-log-cap (ambient) sits beside go-call-log - the retention cap is the same cross-cutting utility family, not a design transform.

Further allocations by essence: go-cluster, go-mint-templates, go-rules-config, go-render-folds, go-apply-manifest -> all rim--graph, file-coordinate transforms every one; go-question-nodes -> graph (type vocabulary, beside go-items); go-book-once, go-lint-ast-cache (render/derivation memos), go-compact (the archive codec - file transform both directions) -> rim--graph; go-ask-hardening, go-cone-triage (orchestration RULES - store merge, stale refusal, wave filter) -> services, their console shells stay plumbing; go-selftest-registry (runner wiring), go-compact-cmd (console verb + the referee's archive-id recognition) -> rim.

Allocated at i18 M4 AHEAD of the build (the diagram-first hard rule) - five new elements, UNREALIZED until M6 fills them: go-mcp-server + go-mcp-session -> rim (the new transport face and its per-session attest choke point, beside the ask lane); go-field-schemas + go-schema-tester -> rim--graph (per-field schema load/validate and the schema-set contract test, beside the config and text lints); go-informed-by-edges -> rim--graph (decision-to-element links and their render, beside the decisions table). The three MECHANICAL requirements are behavior changes to existing elements, not new blocks: await-console-exit modifies go-ask-loop; lint-exit-honest modifies the lint command; report-debounce removes render-on-bless from go-bless. The architecture ADRs (adr-mcp-transport, adr-schema-format, adr-mcp-attest, all kind:architecture) link to these elements via informed-by once go-informed-by-edges is built at M6 - the iteration documents its own architecture through the feature it ships.

Render allocations by essence: go-decisions-table, go-asr-list, go-guides-table -> rim--graph, graph-to-html renders every one, the same family as go-q-table and go-project-record. go-views-home (the views-home figure: preset filter entries plus the derived-documents table) -> rim--graph, same family. go-onion-busbar (the drill-down's deterministic bus-bar SVG layout, split from go-onion-figure) -> rim--graph, a graph-to-svg transform. go-model-standalone (one model's onion as a small self-contained HTML review page) and go-onion-change-marks (the review's change-mark and its element->cluster->ring propagation) -> rim--graph, both graph-to-html transforms in the same render family.

Allocated at i21 M4 AHEAD of the build (the diagram-first hard rule) - eight new elements, UNREALIZED until M6 fills them. By essence: go-field-tier and go-register-colors -> kernel (completeness counting and the provenance-to-color derivation are trust RULES, the coverage family); go-mint-prefill -> services (a mint content rule beside go-mint-content); go-provenance-block, go-register-render, go-seed-skeleton -> rim--graph (frontmatter parse, graph-to-html render, and file emission from the rigor source - each a file/render transform in its named family); the apply generalization (create/write ops) extends go-apply-manifest IN PLACE - the build found no seam that earned a second element; go-register-answer -> rim (a transport face beside go-ask-loop and go-mcp-server). The ride-alongs are behavior changes to EXISTING elements, not new blocks: rigor-fit extends go-spec-lints, the drivers-table union extends go-asr-list, the README scope and jargon advisory extend go-terms-order-lint, battery tiers modify go-selftest and go-build-fast-path, the deck-goto fix modifies go-deck-anchors, and the EARS sweep is data. Two i20 regions allocated late (they were the sky-fall findings): go-defer-retire -> rim (a console verb doing external I/O and calling the triage machinery - the conformance checker corrected the first services placement), go-vehicle-misuse-guard -> rim--graph (a spec lint). The i21 architecture ADRs (adr-register-in-report, adr-register-watch-answers, adr-seed-from-rigor-source, adr-provenance-in-node, all kind:architecture) link to these elements via addresses edges (go-informed-by-edges).

Allocated at i27 M4 AHEAD of the build (the diagram-first hard rule) - ten new elements, UNREALIZED until M6 fills them. By essence: go-function-nodes -> graph (a node type beside go-model-nodes and go-items); go-refusal-lint -> kernel (a message-format trust rule beside go-ears-lint); go-timeline-shared, go-pugh-matrix-render, go-raid-matrix-render, go-register-fold, go-ifu-arc-lint -> rim--graph (graph-to-html renders and a spec lint, the established render family); go-boot-cmd, go-pager-result -> rim (a console verb and round-end I/O beside go-handover-pager's family); go-palette-source -> ambient (a meaning-free resolution utility the renders share). The REST of i27's scope lands as behavior changes to EXISTING elements, not new blocks: onion clusters, enter navigation, and the boilerplate fold extend go-onion-figure and go-onion-busbar in place (adr-onion-extend); the slide live half extends go-deck-mode via fig resolution (adr-slide-figref); deck nav clamping extends go-deck-mode; why-delta honesty modifies the why lister; verify build-pinning modifies the battery runner; supervisor-any-swap modifies go-mcp-server; details-full-entry, search-visible-hits, graph centering, ch2/ch3 restructure, vv result links, and timeline anchoring modify their owning render elements.

Late allocations at i27 M4 (the conformance debt): twelve regions realized in i22-i26 while this model was typed guide, conformance-blind. Allocated by essence: trust rules to the kernel (go-bless-preflight, go-ifu-coverage, go-red-edit-guard), text and file transforms to the band (go-card-guard, go-marker-scan-stop, go-module-import-plan, go-voice-prose), verbs and world contact to the rim (go-query, go-binary-budget, go-mcp-birth, go-mcp-reload, go-module-command-selector). The two physics findings were RULED at the i27 M4 gate (q-coverage-ids-physics, B): external I/O goes through the layers - file and disk I/O crosses on an I/O busbar like any other input, and a kernel element never touches the world directly. The coverage rules' run seam refactors through the I/O lane at the build, and the onion gains a disk-I/O busbar representation then.

Closed out at i27 M6 (the build's conformance debt, b29). Four regions the build realized under names the M4 allocation did not carry, allocated by essence: go-apply-undo -> rim--graph (the undo journal is a file transform beside go-apply-manifest); go-onion-dsm-groups -> rim--graph (the cluster grouping earned its own seam beside go-onion-busbar - the build found the seam the M4 text expected to stay in place); go-timeline-frames -> rim--graph (the frame surfaces and evidence drilldown beside go-timeline-shared); go-no-test-policy -> kernel (a vv trust rule beside go-vv-exceptions). Four more built regions were renamed to their allocated M4 names instead (go-ifu-arc-lint, go-pager-result, go-pugh-matrix-render, go-raid-matrix-render, go-register-fold). And the PHYSICS REFACTOR ruled at M4 landed: the coverage rules' progress announcements inject through a seam the verify-feedback lane owns, so the kernel prints nothing itself; the refusal lint's file walker and the function-node migration's file I/O moved out of their rule regions (the marked region is the rule, the shell is plumbing); the onion's declared I/O gains the disk busbar, tapped by the blocks whose code actually touches the disk. go-verify-feedback moved services -> rim in the same pass: the battery announce lane prints to stderr by essence, so its home is the world-facing shell. go-rationale-fill (b30) allocated rim--graph on arrival: a raw-text lint over node files, the go-spec-lints family. The unbuilt-trio repair (owner ruling B, 2026-07-19) allocated its three regions the same way: go-models-useful (the render pull gate), go-structure-layers (route parse and render), go-trace-collapsible (the tab collapse and interior render) - graph-to-render transforms every one, the established family.

Allocated at the i27 M6 reopen (the c-wave), by essence: go-onion-space -> rim--graph (a render layout rule on the figure wrapper, the go-model-render family); go-timeline-shared-css -> rim--graph (the one stylesheet beside go-timeline-shared, a render constant allocated for honesty though it carries no calls); go-sample-register -> rim--graph (a graph-to-html render of the canonical teaching fixture, beside go-register-fold).

Allocated at the i27 c9 walk (the same conformance-blind class the M4 late-allocation paragraph closed for i22-i26): twenty-six flow-light regions realized across i24-i27 that the sky-fall lint never saw - they carry no product-internal calls - yet banded into the overview's unmapped ring. By essence: trust rules to the kernel (go-voice-gate, go-io-busbar, go-drawing-not-node, and go-fail-at-end - the conformance checker corrected its first rim placement, the kernel coverage rules call it); the sub-statement vocabulary to the graph; renders, file transforms, and text lints to rim--graph (go-chapter-title-split, go-onion-interact, go-card-evidence, go-handoff-lifecycle, go-timeline-drilldown, go-root-content, go-module-config, go-node-module-default, go-rigor-fit); the why-delta attribution to services; transport faces, battery-runner shape, and verbs to the rim (the mcp family, go-supervisor-hardening, go-ask-context, go-lint-exit, go-verify-pin, go-battery-isolation, go-arg-guards, go-adopt-honest); the palette resolution to ambient (go-type-colors, beside go-palette-source). go-toc-order joined rim--graph on arrival: a file-to-order transform in the render family, per the owner's hand-editable-toc ruling. go-quack-mv and go-apply-field-ops joined rim--graph beside go-apply-manifest: file-coordinate transforms both, per the owner's learn-it-into-apply ruling on the vault-tool research.


Allocated at i22 (engine laws), by essence. To the rim: go-guard-selftest and go-guard-cli (the dispatch guard layer - the same command-shell family as go-attest-gate), go-grant-store and go-grant-review (adjudication event verbs beside go-bless), go-battery-progress, go-battery-batch, and go-battery-parallel (battery runner shape beside go-selftest). To the band (rim--graph): go-verdict-guard (the verdict-file write rule beside go-verdict-cache and go-evidence-honesty), go-voice-lint (a raw-text lint beside go-register-vale), go-recital-chain (a text-chain rule beside go-entry-chain).
