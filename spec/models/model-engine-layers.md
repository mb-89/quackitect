---
id: model-engine-layers
type: model
kind: layers-flow
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
  end
  subgraph graph
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
    go-parse["text to typed nodes"]
    go-strict-load["the strict referee"]
    go-truth-in-spec["truth lives in spec"]
    go-evidence-hash["evidence folds into gates"]
    go-evidence-honesty["verdict honesty rules"]
    go-evidence-cache-cap["verdict file cap"]
    go-verdict-cache["verdict cache"]
    go-attest-ritual["challenge and renewal"]
    go-spec-lints["spec lint rules"]
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
    go-apply-manifest["judged bulk-edit applier"]
    go-mint-skeleton["mint skeletons"]
    go-mint-templates["mint bodies from template files"]
    go-rules-config["rule-sets from config files"]
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
    go-guide-ch8["guidance chapter"]
    go-guidance-split["guidance split rules"]
    go-context-neighbours["context star from nbr notes"]
    go-onion-figure["the onion drill-down render"]
    go-onion-busbar["bus-bar level layout"]
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
    go-ucfn-board["use-case function board"]
    go-comment-island["comment island"]
    go-island-serialize["island serialization"]
    go-file2list["commented copy readback"]
    go-report["report render"]
    go-render-folds["fan, theme, and age folds"]
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
    go-models-complete-book["kind-example figures"]
    go-onion-model-source["onion layer map from the model"]
    go-book-once["shared real-book render memo"]
    go-lint-ast-cache["design-flow derivation memo"]
    go-compact["iteration archive codec"]
    go-ask-hardening["ask-store merge and stale-answer serialization rules"]
    go-ask-core["ask model and store serialization"]
  end
  subgraph services
    go-build["engine build orchestration"]
    go-build-fast-skip["compile skip"]
    go-rebaseline-inprocess["in-process re-baseline"]
    go-note["note capture"]
    go-note-dedup["note collision"]
    go-metrics["dispatch metrics"]
    go-stamp-user["user stamp"]
    go-verdict-surgical["surgical verdicts"]
    go-verify-feedback["verify feedback"]
    go-why-derived["why for derived checks"]
    go-first-wins-lanes["first answer wins"]
    go-mint["deterministic minting"]
    go-mint-content["mint bodies"]
    go-mint-kinds["mint kind set"]
    go-mint-edge-aware["mint edge mode"]
    go-perf["perf checks"]
  end
  subgraph rim
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
    go-compact-cmd["compact verb and referee archive ids"]
    go-cone-triage["triage verb and the suspects-only wave filter"]
    go-attest-gate["ledger commands need a key"]
    go-grandfathers-decided["historical exemptions decided"]
    go-legacy-lanes-retired["legacy lanes refused"]
    go-global-ratchet["binary self-update"]
    go-ratchet-stamp["build stamps"]
    go-ask-loop["ask send, drain, await"]
    go-ask-seam["adapter seam"]
    go-report-watch["watch server"]
    go-logs-dir["session logs"]
    go-notes-out["notes files"]
    go-inside-launcher["launcher emission"]
    go-inside-agents["agents file emission"]
    go-inside-claude["claude pointer emission"]
    go-agents-emit["agents emit"]
    go-init-stubs["stub workspaces"]
    go-stub-spec["spec template skeleton"]
    go-ntfy-adapter["ntfy transport"]
    go-ask-pairing["pairing config and print"]
    go-pair-qr["qr to terminal"]
    go-home-sweep["fixture home sweep"]
    go-home-marker["home marker files"]
  end
  subgraph ambient
    go-data-home["data home paths"]
    go-call-log["telemetry - cross-cutting by decision (adr-logging-ambient)"]
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
```
## Rationale (not load-bearing)
The physics (owner physics): rank = abstraction gradient; elements = design regions; files = themes (derived Schlauch); bands own transforms; identity transit legal; a-to-b notation. Uncertain allocations for the owner's red pen: go-strict-load (band vs kernel - it referees DURING the load transform), go-book-drift and go-register-vale (kernel rules that read files), go-global-ratchet (services with heavy rim I/O), go-tests-pass-eval (kernel logic that shells out to run suites - an expected rim-only-I/O finding). The graph--kernel seam carries no dedicated band yet - transit is identity today. Rendering: rim--graph carries BOTH directions (parse a-to-b: rim-to-graph; render: graph-to-rim) - the codec pattern, one band. The onion render points here; design-layers.md retires when it does.

Allocation by essence:
- To the band: every region whose essence is a coordinate transform on files. Spec-or-data readers and writers: go-strict-load, go-truth-in-spec (the ledger's CONTENT stays kernel memory; its file serialization is the band part - the region carries the serialization), go-evidence-hash, go-evidence-honesty, go-evidence-cache-cap, go-verdict-cache, go-base-eval, go-spec-content, go-conn-lanes, go-type-stakeholders. Raw-text lints (they work on the text coordinate, not the graph): go-spec-lints, go-model-lints, go-register-vale, go-user-wording, go-book-drift, go-entry-chain. One-shot spec rewrites and body emission: go-migrate-layout, go-migrate-edges, go-mint-skeleton. go-attest-ritual: the challenge IS a transform of the live contract text.
- To the rim: the console command shells (they parse argv, call inward, print) - go-start, go-start-init, go-walk, go-bless, go-gather, go-ship, go-notes-list, go-calls-summary, go-tests-red, go-observe-red-refresh. The world-manipulating machinery: go-global-ratchet, go-ratchet-stamp, go-build-fast-path, go-authoring-cheap (binary, stamps, golden). The fixture-world batteries: go-selftest, go-grandfathers-decided, go-legacy-lanes-retired. The transport side of asks: go-ask-loop, go-ask-seam (adapters and their pump). go-attest-gate: its own design text names the CLI layer.
- Orchestration RULES stay inward: go-first-wins-lanes, go-note, go-metrics, go-stamp-user (services); go-decisions, go-actor-channels, go-attest-state (kernel). Their console shells (cmdDecisions, cmdMigrateActors, cmdBuild-style) sit outside regions - the marked region is the rule, the shell is plumbing.
- go-readout-width (ambient) gained the console channel probe (channelInteractive) - console shape is a meaning-free utility, same family as isTTY.

Further allocations by essence: go-cluster, go-mint-templates, go-rules-config, go-render-folds, go-apply-manifest -> all rim--graph, file-coordinate transforms every one; go-question-nodes -> graph (type vocabulary, beside go-items); go-book-once, go-lint-ast-cache (render/derivation memos), go-compact (the archive codec - file transform both directions) -> rim--graph; go-ask-hardening, go-cone-triage (orchestration RULES - store merge, stale refusal, wave filter) -> services, their console shells stay plumbing; go-selftest-registry (runner wiring), go-compact-cmd (console verb + the referee's archive-id recognition) -> rim.

Render allocations by essence: go-decisions-table, go-asr-list, go-guides-table -> rim--graph, graph-to-html renders every one, the same family as go-q-table and go-project-record. go-views-home (the views-home figure: preset filter entries plus the derived-documents table) -> rim--graph, same family. go-onion-busbar (the drill-down's deterministic bus-bar SVG layout, split from go-onion-figure) -> rim--graph, a graph-to-svg transform.
