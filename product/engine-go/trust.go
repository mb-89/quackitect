package main

// i0008 trust-hardening surface. Authored as stubs first (test-first walk):
// the selftest_trust.go runners were observed RED against the stubs
// (coverage:tests-red), then each function is implemented to green in its M6
// build step, where its design: marker lands.

import (
	"encoding/json"
	"fmt"
	"os"
	"path/filepath"
	"runtime"
	"sort"
	"strings"
)

// ParseIssue is one strict-load finding: which file, which key/ref, what's wrong.
type ParseIssue struct{ Path, Key, Msg string }

// design: go-region-hash-norm  implements: req-design-hash-norm
// ONE design-region hash over whitespace-collapse-only normalization (adr-region-hash-ws): pure
// reformatting (gofmt, indent churn) never reopens a design, while ANY content edit — including
// comments (design content) and case-only renames (normWS preserves case, unlike the statement
// norm) — does. Folded at the single region-hash site in fullHash (engine.go).
func normWS(s string) string { return strings.TrimSpace(wsRe.ReplaceAllString(s, " ")) }

// enddesign

// design: go-strict-load  implements: req-strict-frontmatter, req-ref-integrity
// Strictness at EVERY graph load (adr-strict-load). A first-line '---' fence marks a node candidate
// (evidence docs' mid-document hrules are excluded naturally); iteration.md is its own breadcrumb
// key class. Malformed lines, keys outside the complete allowlist (incl. the i7 additions), duplicate
// ids, unterminated fences, and dangling references — every declared edge field, checked against the
// full recognized id set, both directions of the trace — are collected as BATCHED issues naming file
// and key. LoadAll refuses the graph with nonzero exit rather than compute a silently-shrunk suspect
// cone; `note` loads no graph and stays available mid-repair. The gather lane stays format-promiscuous.
var nodeKeysAllow = map[string]bool{
	"id": true, "type": true, "statement": true, "class": true, "verify": true, "killer": true,
	"milestone": true, "parent": true, "depends_on": true, "refines": true, "implements": true,
	"verifies": true, "addresses": true, "validates": true, "ears": true, "adjudicated_by": true,
}
var iterKeysAllow = map[string]bool{
	"iteration": true, "status": true, "type": true, "rigor": true,
	"roles": true, "testdesigner": true, "implementer": true, "tester": true,
}
var refFields = map[string]bool{
	"depends_on": true, "refines": true, "implements": true, "verifies": true, "addresses": true,
}

// nodeFence is THE single recognition rule, shared by the strict guard and the loader (LoadAll,
// scanIDs): a file is a node candidate iff its first line (UTF-8 BOM stripped) is the '---' fence.
// One rule means nothing can be loaded unchecked — a BOM'd file once slipped past the guard while
// the lenient loader still parsed it (caught live at i8 M7 validation).
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
	ids := map[string]string{}          // id -> first file
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
		raw, rerr := os.ReadFile(path)
		if rerr != nil {
			issues = append(issues, ParseIssue{path, "", "unreadable: " + rerr.Error()})
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
		for i := 1; i < end; i++ {
			l := lines[i]
			if strings.TrimSpace(l) == "" {
				continue
			}
			kv := strings.SplitN(l, ":", 2)
			if len(kv) < 2 {
				issues = append(issues, ParseIssue{path, strings.TrimSpace(l), "frontmatter line is not key: value"})
				continue
			}
			k, v := strings.TrimSpace(kv[0]), strings.TrimSpace(kv[1])
			if !keys[k] {
				issues = append(issues, ParseIssue{path, k, "unknown frontmatter key"})
				continue
			}
			if isIter {
				continue // breadcrumb, not a graph node
			}
			switch {
			case k == "id" && v != "":
				id = v
			case refFields[k]:
				for _, t := range splitIDs(v) {
					refs = append(refs, ref{id, path, k, t})
				}
			case k == "parent" && v != "":
				refs = append(refs, ref{id, path, k, v})
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
		if _, ok := ids[r.to]; !ok {
			issues = append(issues, ParseIssue{r.path, r.field,
				"dangling reference: '" + r.from + "' --" + r.field + "--> '" + r.to + "' (no such node)"})
		}
	}
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
	os.Exit(1)
}

// enddesign

// design: go-actor-channels  implements: req-actor-channels
// The bless actor defaults per CHANNEL (adr-actor-channel-stat): an interactive console (BOTH stdin
// and stdout are char-devices — this harness proves stdin alone lies) defaults to human; any piped /
// harness-invoked channel defaults to agent, so omission under-claims human oversight (the harmless
// direction). An explicit `--by <actor>` overrides either. QUACK_ACTOR is retired — env state stamped
// agent blesses as human when forgotten, blinding the self-cert metric.
func resolveActor(args []string, interactive bool) string {
	for i := 0; i < len(args)-1; i++ {
		if args[i] == "--by" {
			return args[i+1]
		}
	}
	if interactive {
		return "human"
	}
	return "agent"
}

func channelInteractive() bool {
	for _, f := range []*os.File{os.Stdin, os.Stdout} {
		fi, err := f.Stat()
		if err != nil || fi.Mode()&os.ModeCharDevice == 0 {
			return false
		}
	}
	return true
}

// enddesign

// design: go-kernel-selftest  implements: req-kernel-selftest
// The trust kernel proves itself from BAKED deterministic corpora inside the shipped selftest
// (adr-kernel-corpus) — never `go test` (Windows flags fresh test binaries), never unseeded
// randomness. Golden vectors pin the hash primitives; reopenedSet gives the suspect-cone batteries
// their exact-set oracle (fullHash folds transitively, so a changed upstream reopens precisely its
// blessed descendants); verifyAttestChain makes the attest prev_hash chain load-bearing (per-check:
// first bless anchors at null — the migrated anchor — and every later bless must back-point to its
// predecessor's hash, so a rewritten or forged middle event is detected); xorshift64* is a hand-rolled
// PRNG whose stream WE own across Go versions, for the fixed-seed property DAGs.
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
// The engine owns canonical log-dir resolution (adr-logs-user-dir): session/research logs live in a
// STABLE user-scoped data dir — %LOCALAPPDATA%\quackitect\logs\<slug> on Windows, $XDG_DATA_HOME
// (default ~/.local/share)/quackitect/logs/<slug> elsewhere — never in the repo (bloat + foreign
// personal data) and never in a temp dir (OS-purged; these are durable, cross-project-searchable).
// slug = workspace dir name + h12(abs path) prefix (readable AND collision-proof). A config.toml
// `logs_dir = "..."` override wins verbatim. Surfaced via `quack version`; the one-time migration of
// the legacy .quack/logs content (foreign folders included) was performed and verified at i8 M6.
func logsDir(cfg Config) string {
	if cfg.LogsDir != "" {
		return cfg.LogsDir
	}
	base := os.Getenv("LOCALAPPDATA")
	if runtime.GOOS != "windows" || base == "" {
		if x := os.Getenv("XDG_DATA_HOME"); x != "" {
			base = x
		} else {
			home, _ := os.UserHomeDir()
			base = filepath.Join(home, ".local", "share")
		}
	}
	slug := filepath.Base(ROOT) + "-" + h12(ROOT)[:6]
	return filepath.Join(base, "quackitect", "logs", slug)
}

// enddesign

// design: go-ears-lint  implements: req-ears-lint
// Forward-only EARS enforcement (adr-ears-baseline). The committed baseline (.quack/ears-baseline.json,
// generated once via `lint --ears-baseline`) holds the stmtHash of every requirement existing at
// feature-land: lint checks ONLY requirements whose current stmtHash is absent — new statements and
// genuinely re-stated ones — so blessed history is structurally unflaggable, and a MISSING baseline
// disarms enforcement entirely (fail-safe: never a surprise retrofit). A checked statement must match
// one of the five EARS shapes and contain "shall"; blocklisted weasel words are flagged;
// `ears: exempt - <reason>` skips the check and is COUNTED, while a bare exempt without a reason is
// itself a finding. Applies to type:requirement at systematic rigor (gated at the lint call site).
var earsPrefixes = []string{"the ", "when ", "while ", "if ", "where "}
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
	for _, weasel := range weaselWords {
		if seen[weasel] {
			hits = append(hits, weasel)
		}
	}
	return hits
}

// earsFindings returns the findings and the count of honored exemptions.
func earsFindings(nodes map[string]Node, baseline map[string]bool) ([]string, int) {
	var findings []string
	exempt := 0
	ids := make([]string, 0, len(nodes))
	for id := range nodes {
		ids = append(ids, id)
	}
	sort.Strings(ids)
	for _, id := range ids {
		n := nodes[id]
		if n.Type != "requirement" || baseline[stmtHash(n)] {
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

// earsBaseline loads the committed baseline; empty result = enforcement disarmed.
func earsBaseline() map[string]bool {
	raw, err := os.ReadFile(filepath.Join(QUACK, "ears-baseline.json"))
	if err != nil {
		return nil
	}
	var hashes []string
	if json.Unmarshal(raw, &hashes) != nil {
		return nil
	}
	out := map[string]bool{}
	for _, h := range hashes {
		out[h] = true
	}
	return out
}

// earsWriteBaseline records the stmtHash of every CURRENT requirement (the feature-land set).
func earsWriteBaseline(nodes map[string]Node) int {
	var hashes []string
	for _, n := range nodes {
		if n.Type == "requirement" {
			hashes = append(hashes, stmtHash(n))
		}
	}
	sort.Strings(hashes)
	out, _ := json.MarshalIndent(hashes, "", " ")
	os.WriteFile(filepath.Join(QUACK, "ears-baseline.json"), out, 0o644)
	return len(hashes)
}

// enddesign

// design: go-monotonic-lint  implements: req-monotonic-lint
// Milestone-monotonic wiring, enforced mechanically (the i0002 escape: M6 build steps were ready
// before the M5 spike). Every task in milestone n≥2 must reach the SAME iteration's milestone-(n-1)
// gate through its transitive depends_on chain — else `next` could schedule a later milestone ahead
// of an unblessed gate. Composer discipline stays in engage.md; this makes the engine catch the miss.
// FORWARD-ONLY like the EARS lint: iterations BEFORE the convention landed (i0000 baseline, i0001,
// i0002 — where the escape was discovered and whose flat wiring is exactly the recorded bug) are
// grandfathered — rewiring blessed history would mass-suspect gates for zero new safety.
const monotonicSince = "i0003"

// testsRedSince: the first iteration walked WITH the tests-red gate (i0007 built observe-red;
// i0008 first consumed it). Earlier tests are grandfathered — see coverage.go tests-red.
const testsRedSince = "i0008"

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
