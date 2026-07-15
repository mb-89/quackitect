package main

import (
	"os"
	"path/filepath"
	"strings"
)

// Node is a spec node: a trace work-product or a gate. Mirrors engine.parse's dict.
type Node struct {
	ID         string
	Statement  string
	Class      string
	Verify     string
	Killer     bool
	Type       string
	DependsOn  []string
	Parent     string
	Refines    []string
	Implements []string
	Verifies   []string
	Addresses  []string
	Path       string
	RegionBody string
	ModelHash  string // model nodes only: the extracted graph's canonical hash, computed at load (go-graph-load) so the kernel folds a field, never a file
	Line       int
	Milestone  int
	Validates  string // "needs": this gate validates the whole need-set; its hash folds the digest of
	// all needs, so adding/changing/removing any need reopens it (global validation, structurally).
	Suite      string   // "" | "standalone": not a member of the verification suites; own board entry (adr-standalone-suite)
	Deferred   string   // "" | <reason>: pushed to a later iteration (i0020 minimal port) - never ready, satisfies dependents, not DONE
	Retired    string   // "" | <reason>: dropped with its recorded reason (i0020 minimal port) - same board semantics as deferred
	Ears       string   // "" | "exempt - <reason>": EARS-lint exemption with its required reason (req-ears-authoring.1)
	TestsRed   string   // "" | "exempt - <reason>": pre-mechanism tests-red exemption, recorded ON the node (req-legacy-decided.2)
	Guidance   string   // "" | <slug>: points at the guidance doc holding this node's internals (req-reader-structure.2)
	Mode       string   // manifest nodes only: chapter | preset | deck | exclude (req-manifest-render.1)
	Order      int      // manifest chapter order (req-system-overview): explicit render slot; 0 = fall back to id sort
	ReadyWhen  string   // defer condition (go-decisions): write-once; scrap edge + ready_when = defer
	Supersedes []string // decision exit (go-decisions): an incoming supersedes edge = superseded
	State      string   // question nodes only (go-question-nodes): open | proposed | decided
	DecidedVia string   // question nodes only (go-question-nodes): how a decided question was decided
	DecidedIn  string   // decision nodes: the iteration the decision was DECIDED in (optional; mint stamps it from the active iteration)
	// design: go-ratings-map  implements: req-base-view-queries.2
	// One-level frontmatter maps (a key with an empty value followed by indented sub: value
	// lines), exposed generically to views. One level only - a deeper nest refuses at strict load.
	Maps map[string]map[string]string // e.g. ratings: {criterion: score}
	// enddesign
	// design: go-items  implements: req-candidate-decisions.3, req-candidate-decisions.1
	// The item machinery: ONE decision type with a kind
	// (architecture | project | waiver; empty = architecture for blessed history) rendered
	// in its owning chapter's view; candidate nodes carry an axis and 0..1 ratings, and
	// DECISIONS choose or reject them through links - candidate status derives from the
	// links, never stored; rejected candidates stay referenced so history survives.
	Kind      string   // decision kind | requirement kind (functional|quality|constraint|interface)
	Axis      string   // candidate: the decision axis it answers
	Direction string   // neighbour: in (feeds the system, left flank) | out (consumes from it, right flank)
	Chosen    []string // decision: the candidate(s) it picks
	Rejected  []string // decision: the candidate(s) it turns down, reasons in the body
	Refers    []string // rationale: the clause keys it explains (node ids or id#heading anchors)
	// enddesign
}

// Config is the iteration breadcrumb from .quack/config.toml. Overlay is the workspace's
// COMMITTED method-overlay root, relative to the workspace (e.g. "product/<name>").
type Config struct{ Type, Rigor, Version, LogsDir, Overlay, AgentLane string }

// design: go-parse  implements: req-go-port.3
// Hand-rolled frontmatter and config.toml parsing over the trivial subset in use
// (key: value lines plus simple [a, b] lists). No third-party TOML or YAML library.
func splitIDs(v string) []string {
	v = strings.Trim(v, "[]")
	out := []string{}
	for _, p := range strings.Split(v, ",") {
		if p = strings.TrimSpace(p); p != "" {
			out = append(out, p)
		}
	}
	return out
}

// ParseNode reads a markdown file's frontmatter into a Node. It reads the file and
// delegates to ParseNodeBytes — archive entries (go-compact) parse the same core
// without a file of their own.
func ParseNode(path string) Node {
	txt, _ := os.ReadFile(path)
	return ParseNodeBytes(path, txt)
}

// ParseNodeBytes parses raw node bytes into a Node. Splits on '---' and reads
// key: value lines, exactly like engine.parse (split(":", 1), trimmed). The path
// names the node's home — a real file, or an archive entry's synthetic ORIGINAL
// path — and feeds the id fallback and iterOf.
func ParseNodeBytes(path string, txt []byte) Node {
	n := Node{ID: strings.TrimSuffix(filepath.Base(path), ".md"), Class: "judgment", Path: path}
	parts := strings.Split(string(txt), "---")
	fm := ""
	if len(parts) >= 3 {
		fm = parts[1]
	}
	curMap := "" // design: go-ratings-map (continued): the open map key while its indented entries run
	for _, line := range strings.Split(fm, "\n") {
		if !strings.Contains(line, ":") {
			continue
		}
		indented := len(line) > 0 && (line[0] == ' ' || line[0] == '\t')
		kv := strings.SplitN(line, ":", 2)
		k, v := strings.TrimSpace(kv[0]), strings.TrimSpace(kv[1])
		if indented && curMap != "" {
			if v != "" {
				if n.Maps == nil {
					n.Maps = map[string]map[string]string{}
				}
				if n.Maps[curMap] == nil {
					n.Maps[curMap] = map[string]string{}
				}
				n.Maps[curMap][k] = v
			}
			continue
		}
		if v == "" {
			curMap = k
			continue
		}
		curMap = ""
		switch k {
		case "statement":
			n.Statement = v
		case "depends_on":
			n.DependsOn = splitIDs(v)
		case "parent":
			n.Parent = v
		case "class":
			n.Class = v
		case "verify":
			n.Verify = v
		case "killer":
			n.Killer = strings.ToLower(v) == "true"
		case "type":
			n.Type = v
		case "refines":
			n.Refines = splitIDs(v)
		case "implements":
			n.Implements = splitIDs(v)
		case "verifies":
			n.Verifies = splitIDs(v)
		case "supersedes":
			n.Supersedes = splitIDs(v)
		case "ready_when":
			n.ReadyWhen = v
		case "state":
			n.State = v
		case "decided_via":
			n.DecidedVia = v
		case "decided_in":
			n.DecidedIn = v
		case "addresses":
			n.Addresses = splitIDs(v)
		case "id":
			if v != "" {
				n.ID = v
			}
		case "validates":
			n.Validates = v
		case "ears":
			n.Ears = v
		case "tests_red":
			n.TestsRed = v
		case "guidance":
			n.Guidance = v
		case "mode":
			n.Mode = v
		case "order":
			o := 0
			neg := strings.HasPrefix(v, "-")
			for _, c := range strings.TrimPrefix(v, "-") {
				if c >= '0' && c <= '9' {
					o = o*10 + int(c-'0')
				} else {
					break
				}
			}
			if neg {
				o = -o
			}
			n.Order = o
		case "kind":
			n.Kind = v
		case "axis":
			n.Axis = v
		case "chosen":
			n.Chosen = splitIDs(v)
		case "rejected":
			n.Rejected = splitIDs(v)
		case "refers":
			n.Refers = splitIDs(v)
		case "deferred":
			n.Deferred = v
		case "retired":
			n.Retired = v
		case "suite":
			n.Suite = v
		case "direction":
			n.Direction = v
		case "milestone":
			m := 0
			for _, c := range strings.TrimPrefix(v, "M") {
				if c >= '0' && c <= '9' {
					m = m*10 + int(c-'0')
				} else {
					break
				}
			}
			n.Milestone = m
		}
	}
	// design: go-conn-prose-hash  implements: req-connections-lanes.7
	// A connection's prose IS edge rationale - it folds into the node hash via the
	// RegionBody seam (the design-marker precedent), so a body edit moves the root
	// and flips the cone; edge reasoning can never mutate trust-invisibly.
	if n.Type == "connection" && len(parts) >= 3 {
		n.RegionBody = strings.TrimSpace(strings.Join(parts[2:], "---"))
	}
	// enddesign
	if n.Type == "model" {
		// the graph hash computes ONCE at load (band work) - the kernel's fullHash
		// folds this field and never touches the file (adr-onion-physics)
		g, _ := extractModelGraph(string(txt))
		n.ModelHash = g.CanonicalHash()
	}
	return n
}

// ReadConfig parses .quack/config.toml's type/rigor/version. Defaults match engine.config.
func ReadConfig(path string) Config {
	c := Config{Type: "default", Rigor: "systematic", Version: "v0"}
	txt, err := os.ReadFile(path)
	if err != nil {
		return c
	}
	for _, line := range strings.Split(string(txt), "\n") {
		for _, k := range []string{"type", "rigor", "version", "logs_dir", "overlay", "agent_lane"} {
			if v, ok := tomlString(line, k); ok {
				switch k {
				case "type":
					c.Type = v
				case "rigor":
					c.Rigor = v
				case "version":
					c.Version = v
				case "logs_dir":
					c.LogsDir = v // optional override of the engine's user-dir log resolution (go-logs-dir)
				case "overlay":
					c.Overlay = v // the committed method-overlay root (go-overlay-resolver)
				case "agent_lane":
					c.AgentLane = v // "mcp" activates the piped-CLI refusal (go-guard-cli)
				}
			}
		}
	}
	return c
}

// tomlString matches a trivial `key = "value"` line (leading space and spaces around = allowed).
func tomlString(line, key string) (string, bool) {
	line = strings.TrimSpace(line)
	if !strings.HasPrefix(line, key) {
		return "", false
	}
	rest := strings.TrimSpace(line[len(key):])
	if !strings.HasPrefix(rest, "=") {
		return "", false
	}
	rest = strings.TrimSpace(rest[1:])
	if len(rest) >= 2 && rest[0] == '"' {
		if end := strings.IndexByte(rest[1:], '"'); end >= 0 {
			return rest[1 : 1+end], true
		}
	}
	return "", false
}

// enddesign
