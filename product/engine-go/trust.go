package main

// trust.go — the trust-hardening surface: strict graph load, region hashing,
// actor resolution, and the lint gates. The selftest_trust.go runners verify it.

import (
	"fmt"
	"os"
	"path/filepath"
	"sort"
	"strconv"
	"strings"
)

// ParseIssue is one strict-load finding: which file, which key/ref, what's wrong.
type ParseIssue struct{ Path, Key, Msg string }

// design: go-region-hash-norm  implements: req-design-hash-norm
// There is ONE design-region hash, over whitespace-collapse-only normalization (adr-region-hash-ws). Pure reformatting, such as gofmt or indent churn, never reopens a design. ANY content edit does, including comments, which are design content, and case-only renames, since normWS preserves case unlike the statement norm. It folds at the single region-hash site in fullHash (engine.go).
func normWS(s string) string { return strings.TrimSpace(wsRe.ReplaceAllString(s, " ")) }

// enddesign

// design: go-strict-load  implements: req-structural-strictness.1, req-structural-strictness.2
// Strictness applies at EVERY graph load (adr-strict-load). A first-line '---' fence marks a node candidate; evidence docs' mid-document hrules are excluded naturally. iteration.md is its own breadcrumb key class. Malformed lines, keys outside the complete allowlist, duplicate ids, unterminated fences, and dangling references are all collected as BATCHED issues naming file and key. Dangling references cover every declared edge field, checked against the full recognized id set, both directions of the trace. LoadAll refuses the graph with nonzero exit, rather than compute a silently-shrunk suspect cone. `note` loads no graph and stays available mid-repair. The gather lane stays format-promiscuous.
var nodeKeysAllow = map[string]bool{
	"id": true, "type": true, "statement": true, "class": true, "verify": true, "killer": true,
	"milestone": true, "parent": true, "depends_on": true, "refines": true, "implements": true,
	"verifies": true, "addresses": true, "validates": true, "ears": true, "adjudicated_by": true,
	"ready_when": true, "supersedes": true, "suite": true, "tests_red": true, "guidance": true, "mode": true,
	"deferred": true, "retired": true, // the i0020 minimal defer/retire stamps (go-defer-retire)
	"order":      true, // manifest chapter order (req-system-overview)
	"ratings":    true, // one-level map key (go-ratings-map, req-base-view-queries.2)
	"provenance": true, // one-level map key: per-field value sources (go-provenance-block, adr-provenance-in-node)
	// the item fields (go-items + the item templates); every field's
	// semantics and value range live in its item template (method/templates)
	"kind": true, "axis": true, "chosen": true, "rejected": true, "refers": true, "role": true, "direction": true,
	"phase": true, "discipline": true, "quality": true, "must_wish": true, "weight": true,
	"source": true, "responsible": true, "interest": true, "influence": true,
	"probability": true, "impact": true, "mitigation": true, "owner": true, "status": true,
	"actors": true, "trigger": true, "method": true, "level": true, "acceptance": true,
	"record_of": true, "equipment": true, "conditions": true, "result": true,
	"applies_chapters": true, "applies_type": true, "applies_rigor": true,
	// further item fields; semantics and ranges live in the
	// item templates: tags (rationale/decision filtering), the six quality-scenario
	// fields, criterion metric/target, budget metric/unit/rule/margin + allocations map,
	// rule scope, guide audience, design-element responsibility/realization, stakeholder
	// preset/guide links, connection src/dst/q
	"tags": true, "stimulus_source": true, "stimulus": true, "artifact": true,
	"environment": true, "response": true, "response_measure": true,
	"metric": true, "target": true, "unit": true, "rule": true, "margin": true,
	"allocations": true, "scope": true, "audience": true, "responsibility": true,
	"realization": true, "preset": true, "guide": true, "src": true, "dst": true, "q": true,
	"verify_method": true, // the requirement item's method field - the bare verify key stays the executed-check referent
	"functions":     true, // the need item's functional structure (semantics in the need item template)
	"question":      true, // the model node's question field (the statement may carry it instead)
	// the question-node fields (go-question-nodes, adr-question-nodes-provenance):
	// decision state (open | proposed | decided) and, once decided, its provenance
	"state": true, "decided_via": true,
	// the decision-node provenance field: the iteration the decision was DECIDED in
	// (optional; quack mint stamps it from the active iteration)
	"decided_in": true,
}
var iterKeysAllow = map[string]bool{
	"iteration": true, "status": true, "type": true, "rigor": true,
	"roles": true, "testdesigner": true, "implementer": true, "tester": true,
}
var refFields = map[string]bool{
	"depends_on": true, "refines": true, "implements": true, "verifies": true, "addresses": true,
	"supersedes": true,
	// decision-over-candidate links (go-items): dangling chosen/rejected refuse like any edge.
	// refers is NOT here - it may carry id#heading anchors, checked by the anchor lint instead.
	"chosen": true, "rejected": true,
}

// design: go-sub-addressing  implements: req-trace-clustered
// A clustered requirement carries NUMBERED shall-statements (req-x.2, adr-cluster-numbered-statements). An edge may target the number, and the graph resolves it against the base node (req-x). ONE helper strips the trailing .N. It applies at exactly three resolution points: the strict referee's dangling checks, here and in connectionIssues, the lane merge (applyConnEdges), and the trace graph's edge builder (traceEdges). Code-scanned design markers keep raw suffixed targets, so the graph resolves them itself. It applies ONLY when the raw id resolves nowhere, so a literal dotted node id still wins. Downstream lookups, such as parents, fullHash, and the coverage walks, then see plain ids.
func subAddrBase(ref string) string {
	i := strings.LastIndex(ref, ".")
	if i <= 0 || i == len(ref)-1 {
		return ref
	}
	for _, r := range ref[i+1:] {
		if r < '0' || r > '9' {
			return ref
		}
	}
	return ref[:i]
}

// enddesign

// nodeFence is THE single recognition rule, shared by the strict guard and the loader (LoadAll,
// scanIDs): a file is a node candidate iff its first line (UTF-8 BOM stripped) is the '---' fence.
// One rule means nothing can be loaded unchecked — a BOM'd file can slip past the guard while
// the lenient loader still parses it.
func nodeFence(raw []byte) bool {
	s := strings.TrimPrefix(string(raw), "\ufeff")
	if i := strings.IndexByte(s, '\n'); i >= 0 {
		s = s[:i]
	}
	return strings.TrimSpace(s) == "---"
}

// StrictIssues walks one directory tree and returns every strict-load finding, batched.
func StrictIssues(specDir string) []ParseIssue {
	var issues []ParseIssue
	edgeMode := edgesModeOf(specDir)      // frontmatter | connections (go-edge-mode)
	ids := map[string]string{}            // id -> first file
	modelElemFiles := map[string]string{} // declared model element id -> the model file (go-informed-by-edges)
	type ref struct{ from, path, field, to string }
	var refs []ref
	filepath.Walk(specDir, func(path string, fi os.FileInfo, err error) error {
		if err != nil {
			if fi == nil {
				issues = append(issues, ParseIssue{path, "", "unreadable: " + err.Error()})
			}
			return nil
		}
		if fi.IsDir() || !strings.HasSuffix(path, ".md") {
			return nil
		}
		if isSpecContent(specDir, path) {
			return nil // project-content notes (go-spec-content) have their own loaders, not node grammar
		}
		raw, rerr := os.ReadFile(path)
		if rerr != nil {
			issues = append(issues, ParseIssue{path, "", "unreadable: " + rerr.Error()})
			return nil
		}
		if filepath.Base(path) == archiveName && isArchiveFile(raw) {
			// design: go-compact-cmd (referee side) implements: req-iterations-compacted ::
			// archived ids join the id universe, so live lanes referencing shipped-then-
			// compacted nodes never read dangling (the loader parses archives natively;
			// the referee must recognize the same ids). Entry payloads were strict-checked
			// before their compaction and are verbatim-immutable — only ids register here.
			for _, e := range splitArchive(raw) {
				if !nodeFence(e.raw) {
					continue
				}
				if filepath.Base(filepath.FromSlash(e.rel)) == "iteration.md" {
					continue // mirrors the plain-file walk: iteration.md never joins the id universe
				}
				aid := strings.TrimSuffix(filepath.Base(filepath.FromSlash(e.rel)), ".md")
				if prev, dup := ids[aid]; dup {
					issues = append(issues, ParseIssue{path, aid, "duplicate id (silently shadows " + prev + ")"})
				} else {
					ids[aid] = path
				}
			}
			return nil
		}
		if !nodeFence(raw) {
			return nil // not a node candidate (evidence docs, README prose)
		}
		lines := strings.Split(strings.ReplaceAll(strings.TrimPrefix(string(raw), "\ufeff"), "\r\n", "\n"), "\n")
		keys := nodeKeysAllow
		isIter := filepath.Base(path) == "iteration.md"
		if isIter {
			keys = iterKeysAllow
		}
		inConnHome := strings.Contains(filepath.ToSlash(path), "/connections/")
		end := -1
		for i := 1; i < len(lines); i++ {
			if strings.TrimSpace(lines[i]) == "---" {
				end = i
				break
			}
		}
		if end < 0 {
			issues = append(issues, ParseIssue{path, "", "unterminated frontmatter fence"})
			return nil
		}
		id := strings.TrimSuffix(filepath.Base(path), ".md")
		curMap := "" // design: go-ratings-map (strict side): the open one-level map key
		typeVal, kindVal := "", ""
		for i := 1; i < end; i++ {
			l := lines[i]
			if strings.TrimSpace(l) == "" {
				continue
			}
			indented := l[0] == ' ' || l[0] == '\t'
			kv := strings.SplitN(l, ":", 2)
			if len(kv) < 2 {
				issues = append(issues, ParseIssue{path, strings.TrimSpace(l), "frontmatter line is not key: value"})
				continue
			}
			k, v := strings.TrimSpace(kv[0]), strings.TrimSpace(kv[1])
			if indented {
				if curMap == "" {
					issues = append(issues, ParseIssue{path, k, "indented entry outside a map key"})
				} else if v == "" {
					issues = append(issues, ParseIssue{path, curMap + "." + k, "nested map refused (one level only)"})
				} else if curMap == "ratings" { // go-items: scales are 0..1 everywhere
					if f, err := strconv.ParseFloat(v, 64); err != nil || f < 0 || f > 1 {
						issues = append(issues, ParseIssue{path, curMap + "." + k, "rating outside 0..1: " + v})
					}
				}
				continue
			}
			if !keys[k] {
				curMap = ""
				issues = append(issues, ParseIssue{path, k, "unknown frontmatter key"})
				continue
			}
			if v == "" {
				curMap = k
				continue
			}
			curMap = ""
			if isIter {
				continue // breadcrumb, not a graph node
			}
			switch {
			case k == "id" && v != "":
				id = v
			case k == "type":
				typeVal = v
			case k == "kind":
				kindVal = v
			case edgeMode == "connections" && legacyEdgeKeys[k] && !isIter && !inConnHome:
				issues = append(issues, ParseIssue{path, k,
					"legacy edge key in connections mode - the edge belongs in spec/connections (go-edge-mode)"})
			case refFields[k]:
				for _, t := range splitIDs(v) {
					refs = append(refs, ref{id, path, k, t})
				}
			case k == "parent" && v != "":
				refs = append(refs, ref{id, path, k, v})
			}
		}
		// go-items: ONE decision type, three kinds; empty = architecture (blessed history).
		if typeVal == "adr" && kindVal != "" && kindVal != "architecture" && kindVal != "project" && kindVal != "waiver" {
			issues = append(issues, ParseIssue{path, kindVal, "unknown decision kind (architecture | project | waiver)"})
		}
		// an unknown TYPE fails loud at the door: isGate defaults typeless strays to a
		// blessable gate, so a stray type:note or a typo must never reach the board
		// (the i19 spike's silent-misclassification finding).
		if typeVal != "" && !traceContent[typeVal] {
			issues = append(issues, ParseIssue{path, typeVal, "unknown type \"" + typeVal + "\" - not a known node type; a stray note belongs in the data home, a task carries no type"})
		}
		// go-informed-by-edges: a model's declared elements are first-class trace endpoints, so a
		// decision addressing one never reads dangling — collect them for the id universe below.
		if typeVal == "model" {
			g, _ := extractModelGraph(string(raw))
			for e := range g.Elems {
				if _, dup := modelElemFiles[e]; !dup {
					modelElemFiles[e] = path
				}
			}
		}
		if !isIter {
			if prev, dup := ids[id]; dup {
				issues = append(issues, ParseIssue{path, id, "duplicate id (silently shadows " + prev + ")"})
			} else {
				ids[id] = path
			}
		}
		return nil
	})
	for _, r := range refs {
		if r.to == scrapSink {
			continue // the built-in sink (go-decisions) is always recognized; it has no file
		}
		if _, ok := ids[r.to]; !ok {
			if _, sub := ids[subAddrBase(r.to)]; sub {
				continue // a numbered sub-statement resolves against its base node (go-sub-addressing)
			}
			issues = append(issues, ParseIssue{r.path, r.field,
				"dangling reference: '" + r.from + "' --" + r.field + "--> '" + r.to + "' (no such node)"})
		}
	}
	// design: go-conn-code-endpoints  implements: req-connections-code.1
	// Connection endpoints resolve against code-derived designs too: ch4's interface story
	// (an interface between two design elements) is impossible on a software project while
	// the guard knows only spec-file ids.
	for id, n := range scanCodeDesigns() {
		if _, dup := ids[id]; !dup {
			ids[id] = n.Path
		}
	}
	// enddesign
	// a decision may address a DECLARED model element first-class (go-informed-by-edges); an element
	// no model declares stays unrecognized and reads dangling like any other unknown endpoint.
	for id, p := range modelElemFiles {
		if _, dup := ids[id]; !dup {
			ids[id] = p
		}
	}
	// the connections home (go-conn-lanes): kinds, lanes, endpoints, and the one-lane rule
	issues = append(issues, connectionIssues(specDir, ids)...)
	return issues
}

// strictGuard refuses a malformed workspace graph — called by LoadAll before the graph is used.
func strictGuard() {
	issues := StrictIssues(SPEC)
	if len(issues) == 0 {
		return
	}
	fmt.Fprintf(os.Stderr, "STRICT: %d issue(s) — graph refused; a malformed node could silently shrink the suspect cone:\n", len(issues))
	for _, is := range issues {
		rel, _ := filepath.Rel(ROOT, is.Path)
		fmt.Fprintf(os.Stderr, "  - %s [%s] %s\n", filepath.ToSlash(rel), is.Key, is.Msg)
	}
	quackExit(1)
}

// enddesign

// design: go-actor-channels  implements: req-actor-channels
// The bless actor defaults per CHANNEL (adr-actor-channel-stat). An interactive console, where BOTH stdin and stdout are char-devices, since this harness proves stdin alone lies, defaults to the user. Any piped or harness-invoked channel defaults to agent, so omission under-claims adjudicator oversight, the harmless direction. An explicit `--by <actor>` overrides either, normalized through normActor so new records always write `user` (go-stamp-user). QUACK_ACTOR is retired, since env state stamped agent blesses as the user when forgotten, blinding the self-cert metric.
func resolveActor(args []string, interactive bool) string {
	for i := 0; i < len(args)-1; i++ {
		if args[i] == "--by" {
			return normActor(args[i+1])
		}
	}
	if interactive {
		return "user"
	}
	return "agent"
}

// normActor folds the legacy recorded vocabulary into the current one: human IS user
// (go-stamp-user records the migration; this is the reader's view of the vocabulary).
func normActor(a string) string {
	if a == "human" || a == "" {
		return "user"
	}
	return a
}

// enddesign

// design: go-kernel-selftest  implements: req-kernel-selftest
// The trust kernel proves itself from BAKED deterministic corpora inside the shipped selftest (adr-kernel-corpus). It never runs `go test` (Windows flags fresh test binaries), and never uses unseeded randomness. Golden vectors pin the hash primitives. reopenedSet gives the suspect-cone batteries their exact-set oracle: fullHash folds transitively, so a changed upstream reopens precisely its blessed descendants. verifyAttestChain makes the attest prev_hash chain load-bearing. Per check, the first bless anchors at null (the migrated anchor). Every later bless must back-point to its predecessor's hash, so a rewritten or forged middle event is detected. xorshift64* is a hand-rolled PRNG whose stream WE own across Go versions, for the fixed-seed property DAGs.
var kernelVectors = []struct{ In, H12 string }{
	{"quack", "82d928273d06"},
	{"hello world", "b94d27b9934d"},
	{"the ledger cannot lie", "953a2eb546dc"},
	{"a|b|c,d|e", "ff52545a91e0"}, // fold-seed shaped
}

// verifyAttestChain checks every per-check bless chain in the event log.
func verifyAttestChain(events []Event) bool {
	last := map[string]string{}
	for _, e := range events {
		if e.Action != "bless" {
			continue
		}
		if prev, seen := last[e.Check]; seen {
			if e.PrevHash == nil || *e.PrevHash != prev {
				return false // broken or forged back-pointer
			}
		} else if e.PrevHash != nil {
			return false // a first bless must anchor at null (the migrated anchor)
		}
		last[e.Check] = e.Hash
	}
	return true
}

// reopenedSet: which blessed checks no longer match their attested hash after a change.
func reopenedSet(nodes map[string]Node, blessed map[string]attestState) []string {
	memo := map[string]string{}
	var out []string
	for id, s := range blessed {
		if _, ok := nodes[id]; !ok {
			continue
		}
		if fullHash(id, nodes, memo) != s.Hash {
			out = append(out, id)
		}
	}
	sort.Strings(out)
	return out
}

// xorshift64* — deterministic PRNG for the property batteries; the stream is ours, not a stdlib's.
func xorshift(seed uint64) func() uint64 {
	x := seed
	if x == 0 {
		x = 1
	}
	return func() uint64 {
		x ^= x >> 12
		x ^= x << 25
		x ^= x >> 27
		return x * 0x2545F4914F6CDD1D
	}
}

// enddesign

// design: go-logs-dir  implements: req-logs-out-of-repo
// The engine owns canonical log-dir resolution (adr-logs-user-dir). Session and research logs live in a STABLE user-scoped data dir: %LOCALAPPDATA%\quackitect\logs\<slug> on Windows, or $XDG_DATA_HOME (default ~/.local/share)/quackitect/logs/<slug> elsewhere. They never live in the repo (bloat plus foreign personal data), and never in a temp dir (OS-purged; these are durable and cross-project-searchable). slug = workspace dir name + h12(abs path) prefix, readable AND collision-proof. A config.toml `logs_dir = "..."` override wins verbatim. It is surfaced via `quack version`.
func logsDir(cfg Config) string {
	if cfg.LogsDir != "" {
		return cfg.LogsDir
	}
	// workspace-first (adr-no-quack-data-home): logs are one kind-folder inside the ONE
	// data home per workspace, and the slug hashes the CANONICAL path — otherwise the same
	// workspace splits across two homes by invoking-shell casing.
	return dataDirFor("logs")
}

// enddesign

// design: go-ears-lint  implements: req-ears-authoring.1
// EARS enforcement applies over EVERY requirement. There is no anonymous forward-only baseline (adr-grandfathers-historical). Each historical non-EARS statement carries an explicit `ears: exempt - <reason citing its ADR>` marker, so blessed history stays unflaggable by RECORD, not by a silent set-membership file. A checked statement must match one of the five EARS shapes and contain "shall". Blocklisted weasel words are flagged. `ears: exempt - <reason>` skips the check and is COUNTED, while a bare exempt without a reason is itself a finding. This applies to type:requirement at systematic rigor, gated at the lint call site.
var earsPrefixes = []string{"the ", "when ", "while ", "if ", "where "}

// weaselWords is the compiled FALLBACK only. The living list is config
// (method/config/weasel-words.json, go-rules-config); the lint reads it through
// weaselWordsFromConfig. This copy exists because a stub workspace carries no
// config home, and the lint must stay alive there.
var weaselWords = []string{"should", "would", "could", "may", "might", "appropriate", "adequate",
	"sufficient", "quickly", "easy", "user-friendly", "robust", "flexible", "seamless", "efficient",
	"optimal", "reasonable", "gracefully"}

func earsShapeOK(stmt string) bool {
	s := strings.ToLower(strings.TrimSpace(stmt))
	if !strings.Contains(s, " shall ") {
		return false
	}
	for _, p := range earsPrefixes {
		if strings.HasPrefix(s, p) {
			if p == "if " && !strings.Contains(s, " then ") {
				return false // unwanted-behaviour shape is "If <condition>, then the <system> shall ..."
			}
			return true
		}
	}
	return false
}

func earsWeasels(stmt string) []string {
	var hits []string
	words := strings.FieldsFunc(strings.ToLower(stmt), func(r rune) bool {
		return !(r >= 'a' && r <= 'z' || r == '-')
	})
	seen := map[string]bool{}
	for _, w := range words {
		seen[w] = true
	}
	list := weaselWordsFromConfig()
	if len(list) == 0 {
		list = weaselWords // config file missing (a stub workspace) — the compiled fallback
	}
	for _, weasel := range list {
		if seen[weasel] {
			hits = append(hits, weasel)
		}
	}
	return hits
}

// earsFindings returns the findings and the count of honored exemptions.
func earsFindings(nodes map[string]Node) ([]string, int) {
	var findings []string
	exempt := 0
	ids := make([]string, 0, len(nodes))
	for id := range nodes {
		ids = append(ids, id)
	}
	sort.Strings(ids)
	for _, id := range ids {
		n := nodes[id]
		if n.Type != "requirement" {
			continue
		}
		if e := strings.TrimSpace(n.Ears); strings.HasPrefix(e, "exempt") {
			if len(strings.TrimLeft(strings.TrimPrefix(e, "exempt"), " -–—:")) > 0 {
				exempt++
				continue
			}
			findings = append(findings, id+": ears exemption carries no reason (a reason is required)")
			continue
		}
		if !earsShapeOK(n.Statement) {
			findings = append(findings, id+": statement matches no EARS shape (ubiquitous/event/state/unwanted/optional with 'shall')")
		}
		if ws := earsWeasels(n.Statement); len(ws) > 0 {
			findings = append(findings, id+": weasel word(s): "+strings.Join(ws, ", "))
		}
	}
	return findings, exempt
}

// enddesign

// design: go-monotonic-lint  implements: req-structural-strictness.3
// Milestone-monotonic wiring is enforced mechanically (the escape class: build steps ready before their prior gate). Every task in milestone n≥2 must reach the SAME iteration's milestone-(n-1) gate through its transitive depends_on chain. Otherwise `next` could schedule a later milestone ahead of an unblessed gate. Composer discipline stays in engage.md; this makes the engine catch the miss. It is FORWARD-ONLY, like the EARS lint. Iterations before monotonicSince are grandfathered, since rewiring blessed history would mass-suspect gates for zero new safety.
const monotonicSince = "i0003"

func monotonicFindings(nodes map[string]Node) []string {
	var findings []string
	for id, n := range nodes {
		if n.Milestone < 2 || traceContent[n.Type] {
			continue
		}
		iter := iterOf(n.Path)
		if iter < monotonicSince {
			continue // pre-convention blessed history, never retrofitted
		}
		seen := map[string]bool{}
		stack := append([]string{}, n.DependsOn...)
		ok := false
		for len(stack) > 0 {
			d := stack[len(stack)-1]
			stack = stack[:len(stack)-1]
			if seen[d] {
				continue
			}
			seen[d] = true
			dn, exists := nodes[d]
			if !exists {
				continue
			}
			if dn.Milestone == n.Milestone-1 && strings.HasSuffix(dn.ID, "-gate") && iterOf(dn.Path) == iter {
				ok = true
				break
			}
			stack = append(stack, dn.DependsOn...)
		}
		if !ok {
			findings = append(findings,
				id+": milestone M"+itoa(n.Milestone)+" task never chains through the M"+itoa(n.Milestone-1)+" gate (depends_on)")
		}
	}
	sort.Strings(findings)
	return findings
}

// enddesign
