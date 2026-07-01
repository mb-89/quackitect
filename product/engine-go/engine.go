package main

import (
	"crypto/sha256"
	"encoding/hex"
	"encoding/json"
	"os"
	"path/filepath"
	"regexp"
	"sort"
	"strings"
)

// Roots, discovered by walking up to a .quack or pyproject.toml (mirrors engine.find_root).
var ROOT, SPEC, QUACK, ATTEST, NOTES, ENGINE string

// design: go-workspace-base  implements: req-workspace-split
// The engine operates on a selectable WORKSPACE, separate from the ENGINE install. ROOT (and all state
// — SPEC/QUACK/ATTEST/NOTES) is the cwd walk-up by default, or an explicit --base/-C target, so one
// engine drives its own or ANOTHER project's workspace (sebot base-style; like git -C). ENGINE (the
// binary + vendored resources) resolves from the executable's own location, independent of the
// workspace. In self mode the two roots coincide and behaviour is unchanged.
func baseFromArgs() string {
	for i := 1; i < len(os.Args)-1; i++ {
		if os.Args[i] == "--base" || os.Args[i] == "-C" {
			return os.Args[i+1]
		}
	}
	return ""
}

func findRoot() string {
	if b := baseFromArgs(); b != "" { // drive a different project's workspace
		if abs, err := filepath.Abs(b); err == nil {
			return abs
		}
		return b
	}
	d, _ := os.Getwd()
	for {
		if st, err := os.Stat(filepath.Join(d, ".quack")); err == nil && st.IsDir() {
			return d
		}
		if _, err := os.Stat(filepath.Join(d, "pyproject.toml")); err == nil {
			return d
		}
		p := filepath.Dir(d)
		if p == d {
			cwd, _ := os.Getwd()
			return cwd
		}
		d = p
	}
}

// engineRoot resolves the engine install (the dir holding .quack/engine/<binary> + vendored resources)
// from the executable path, independent of the workspace. Falls back to ROOT (self / dogfood).
func engineRoot() string {
	if exe, err := os.Executable(); err == nil {
		d := filepath.Dir(exe)
		for i := 0; i < 4 && d != filepath.Dir(d); i++ {
			if filepath.Base(d) == ".quack" {
				return filepath.Dir(d)
			}
			d = filepath.Dir(d)
		}
	}
	return ROOT
}

// enddesign

func init() {
	ROOT = findRoot()
	SPEC = filepath.Join(ROOT, "spec")
	QUACK = filepath.Join(ROOT, ".quack")
	ATTEST = filepath.Join(QUACK, "attest.json")
	NOTES = filepath.Join(QUACK, "notes")
	ENGINE = engineRoot()
}

// design: go-engine-core  implements: req-behavior-parity, req-split, req-review
// The engine core in Go: the node load, the hashing primitive and merkle fold, the
// suspect/bless attestation, and the gate-state machine — observably identical to
// engine.py. norm + full_hash were proven byte-identical to Python in the M5 spike.
var wsRe = regexp.MustCompile(`\s+`)

func norm(s string) string { return strings.ToLower(strings.TrimSpace(wsRe.ReplaceAllString(s, " "))) }
func h12(s string) string  { x := sha256.Sum256([]byte(s)); return hex.EncodeToString(x[:])[:12] }

func parents(n Node) []string {
	out := append([]string{}, n.DependsOn...)
	out = append(out, n.Refines...)
	out = append(out, n.Implements...)
	out = append(out, n.Verifies...)
	out = append(out, n.Addresses...)
	return out
}

func stmtHash(n Node) string { return h12(norm(n.Statement)) }

func fullHash(id string, nodes map[string]Node, memo map[string]string) string {
	if v, ok := memo[id]; ok {
		return v
	}
	n := nodes[id]
	deps := []string{}
	for _, d := range parents(n) {
		if _, ok := nodes[d]; ok {
			deps = append(deps, d)
		}
	}
	sort.Strings(deps)
	parts := make([]string, 0, len(deps))
	for _, d := range deps {
		parts = append(parts, fullHash(d, nodes, memo))
	}
	seed := norm(n.Statement) + "|" + n.Verify + "|" + strings.Join(parts, ",") + "|" + h12(n.RegionBody)
	if n.Validates == "needs" {
		// global validation, made structural: fold the digest of EVERY need into this gate's identity,
		// so adding/changing/removing any need (in any iteration) reopens it (SUSPECT). Fixes the gap
		// where "validated against all needs" was prose, not a wired input. The verification analogue
		// (coverage:tests-pass) is already live-computed; this gives validation the same reach.
		seed += "|needs:" + needsDigest(nodes)
	}
	hh := h12(seed)
	memo[id] = hh
	return hh
}

// needsDigest is a stable fingerprint of the whole need-set: sorted "id:stmtHash" of every need node.
// Independent of the node it is folded into (needs are roots), so no recursion.
func needsDigest(nodes map[string]Node) string {
	parts := []string{}
	for id, n := range nodes {
		if n.Type == "need" {
			parts = append(parts, id+":"+stmtHash(n))
		}
	}
	sort.Strings(parts)
	return h12(strings.Join(parts, ";"))
}

// LoadAll walks spec/**/*.md plus the in-code design markers under product/.
func LoadAll() map[string]Node {
	nodes := map[string]Node{}
	filepath.Walk(SPEC, func(path string, fi os.FileInfo, err error) error {
		if err != nil || fi.IsDir() || !strings.HasSuffix(path, ".md") {
			return nil
		}
		n := ParseNode(path)
		if n.Statement != "" && !strings.HasPrefix(n.ID, "TASK-") && !strings.HasPrefix(n.ID, "MARK-") {
			nodes[n.ID] = n
		}
		return nil
	})
	for id, d := range scanCodeDesigns() {
		nodes[id] = d
	}
	return nodes
}

var designRe = regexp.MustCompile(`design:\s*(\S+)\s+implements:\s*([^>]+)`)

// scanCodeDesigns finds '# design: id implements: reqs' (or // for Go) ... enddesign regions in the
// vehicle's own product/ (its tool). Engine-internal markers live under the engine layer; scan those
// with scanDesignsUnder(EngineDir()/...) when needed (e.g. the method self-test).
func scanCodeDesigns() map[string]Node {
	return scanDesignsUnder(filepath.Join(ROOT, "product"))
}

// scanDesignsUnder walks one base dir for design/enddesign regions and returns them keyed by id.
func scanDesignsUnder(base string) map[string]Node {
	out := map[string]Node{}
	filepath.Walk(base, func(path string, fi os.FileInfo, err error) error {
		if err != nil || fi.IsDir() {
			return nil
		}
		if !(strings.HasSuffix(path, ".py") || strings.HasSuffix(path, ".md") || strings.HasSuffix(path, ".go")) {
			return nil
		}
		raw, _ := os.ReadFile(path)
		content := strings.ReplaceAll(strings.ReplaceAll(string(raw), "\r\n", "\n"), "\r", "\n")
		lines := strings.Split(content, "\n")
		if k := len(lines); k > 0 && lines[k-1] == "" { // match Python splitlines (no trailing empty)
			lines = lines[:k-1]
		}
		for i := 0; i < len(lines); i++ {
			m := designRe.FindStringSubmatch(lines[i])
			if m == nil || strings.Contains(lines[i], "enddesign") || strings.Contains(m[1], "<") {
				continue
			}
			did := m[1]
			impl := strings.TrimRight(strings.ReplaceAll(m[2], "-->", ""), "- ")
			inline := ""
			if k := strings.Index(impl, "::"); k >= 0 {
				inline, impl = strings.TrimSpace(impl[k+2:]), impl[:k]
			}
			reqs := []string{}
			for _, x := range strings.Split(impl, ",") {
				if x = strings.TrimSpace(x); x != "" {
					reqs = append(reqs, x)
				}
			}
			desc := []string{}
			if inline != "" {
				desc = append(desc, inline)
			}
			j := i + 1
			for j < len(lines) {
				lt := strings.TrimLeft(lines[j], " \t")
				if !(strings.HasPrefix(lt, "#") || strings.HasPrefix(lt, "//")) || strings.Contains(lines[j], "enddesign") {
					break
				}
				desc = append(desc, strings.TrimRight(strings.TrimLeft(lt, "#/ "), " \t\r"))
				j++
			}
			end := j
			for end < len(lines) && !strings.Contains(lines[end], "enddesign") {
				end++
			}
			stmt := strings.Join(desc, " ")
			if stmt == "" {
				stmt = did
			}
			out[did] = Node{ID: did, Statement: stmt, Type: "design", Implements: reqs,
				Class: "review", Path: path, Line: i + 1, RegionBody: strings.Join(lines[i+1:end], "\n")}
		}
		return nil
	})
	return out
}

var traceContent = map[string]bool{"need": true, "usecase": true, "requirement": true, "design": true, "adr": true, "test": true}

// design: go-no-trace-gate  implements: req-no-trace-gate
// Trace-typed nodes (need/usecase/requirement/design/test/adr) are content, never task gates —
// isGate excludes them; selftest:no-trace-gate guards the invariant so it cannot regress.
// enddesign
func isGate(n Node) bool {
	// Trace work-products are content, never task-tree gates — even tests, which are executed but
	// belong to the trace (they verify requirements). The verification gate rolls the tests up.
	if traceContent[n.Type] {
		return false
	}
	if n.Class == "executed" {
		return true
	}
	return true
}

func iterOf(path string) string {
	rel, _ := filepath.Rel(SPEC, path)
	parts := strings.Split(filepath.ToSlash(rel), "/")
	if len(parts) > 1 && parts[0] == "iterations" {
		return parts[1]
	}
	return "i0000_baseline"
}

// --- attestation (append-only bless event log) ---

type Event struct {
	Check         string            `json:"check"`
	Action        string            `json:"action"`
	Actor         string            `json:"actor,omitempty"`
	FilledBy      string            `json:"filled_by,omitempty"`
	TS            interface{}       `json:"ts"`
	Hash          string            `json:"hash"`
	StatementHash string            `json:"statement_hash"`
	Deps          map[string]string `json:"deps"`
	PrevHash      *string           `json:"prev_hash"`
}

func attestEvents() []Event {
	raw, err := os.ReadFile(ATTEST)
	if err != nil {
		return nil
	}
	var ev []Event
	json.Unmarshal(raw, &ev)
	return ev
}

type attestState struct {
	Hash, StatementHash string
	Deps                map[string]string
}

func attestLoad() map[string]attestState {
	st := map[string]attestState{}
	for _, e := range attestEvents() {
		if e.Action == "bless" {
			st[e.Check] = attestState{e.Hash, e.StatementHash, e.Deps}
		}
	}
	return st
}

// GateState: CONTENT for trace work-products, else DONE/SUSPECT/OPEN. Executed checks
// compute live (coverage rule or cached run); review checks compare the blessed hash.
func gateState(id string, nodes map[string]Node, a map[string]attestState, memo map[string]string) string {
	n := nodes[id]
	if !isGate(n) {
		return "CONTENT"
	}
	h := fullHash(id, nodes, memo)
	if n.Class == "executed" {
		if strings.HasPrefix(n.Verify, "coverage:") {
			if coverageRule(nodes, strings.TrimSpace(n.Verify[len("coverage:"):]), iterOf(n.Path)) {
				return "DONE"
			}
			return "OPEN"
		}
		if strings.HasPrefix(n.Verify, "selftest:") {
			if runSelftest(strings.TrimSpace(n.Verify[len("selftest:"):])) {
				return "DONE"
			}
			return "OPEN"
		}
		if runExecuted(n, h) == "pass" {
			return "DONE"
		}
		return "OPEN"
	}
	s, ok := a[id]
	if !ok {
		return "OPEN"
	}
	if s.Hash == h {
		return "DONE"
	}
	return "SUSPECT"
}

// StatusMap resolves effective states: a DONE gate whose dependency gates are not DONE is SUSPECT.
func StatusMap(nodes map[string]Node) map[string]string {
	a := attestLoad()
	memo := map[string]string{}
	raw := map[string]string{}
	for id := range nodes {
		raw[id] = gateState(id, nodes, a, memo)
	}
	eff := map[string]string{}
	var resolve func(id string, stack map[string]bool) string
	resolve = func(id string, stack map[string]bool) string {
		if v, ok := eff[id]; ok {
			return v
		}
		s := raw[id]
		if s == "DONE" && !stack[id] {
			for _, d := range parents(nodes[id]) {
				if _, ok := nodes[d]; ok && raw[d] != "CONTENT" {
					st2 := map[string]bool{id: true}
					for k := range stack {
						st2[k] = true
					}
					if resolve(d, st2) != "DONE" {
						s = "SUSPECT"
						break
					}
				}
			}
		}
		eff[id] = s
		return s
	}
	for id := range nodes {
		resolve(id, map[string]bool{})
	}
	return eff
}

// enddesign

// The report always recomputes StatusMap live (no cached snapshot) — a stale snapshot could show a
// cached pass. See RenderReport and go-report-watch.
