package main

import (
	"fmt"
	"os"
	"path/filepath"
	"regexp"
	"strings"
)

// design: go-mint  implements: req-mint, req-mint-sugar.1, req-mint-sugar.2
// Deterministic minting (adr-deterministic-mint): the engine emits every node skeleton — typed
// frontmatter, engine-stamped id, placeholder statement — so a node is schema-valid at BIRTH; the
// agent fills content, never authors shape (the strict parser guards READ time; mint moves
// the guarantee to creation). Sugar forms stamp the decision edges the classifier derives from:
// `mint veto --of <id>`, `mint defer --of <id> --ready-when "<cond>"`, `mint supersede <old>` — so a
// veto/defer/supersession can never be misspelled into the wrong class. Decisions land in
// spec/decisions/; other types land in the active iteration.
// design: go-mint-kinds  implements: req-mint-from-templates.1
// Every item kind mints: the agent fills content, never authors
// shape - hand-copying a skeleton under the strict whitelist punishes every typo with a
// refused graph. adjudicated_by says user (human is retired vocabulary).
var mintPrefix = map[string]string{
	"need": "need-", "usecase": "uc-", "requirement": "req-", "test": "test-", "adr": "adr-",
	"stakeholder": "stk-", "candidate": "cand-", "raid": "raid-", "rationale": "why-",
	"record": "rec-", "criterion": "crit-", "rule": "rule-", "budget": "bud-",
	"guide": "guide-", "design": "des-", "connection": "con-", "neighbour": "nbr-",
	// structural models: the node body carries the fenced diagram, seeded from
	// the kind registry's example (go-model-registry)
	"model": "model-",
	// open unknowns (go-question-nodes): first-class trace content, born `state: open`
	"question": "q-",
}

// enddesign

// sugarAddresses stamps the decision edges for veto/defer: the target plus the sink — and never
// the sink twice when the target IS the sink (addresses: [scrap, scrap]).
func sugarAddresses(of string) string {
	if of == "" || of == scrapSink {
		return scrapSink
	}
	return of + ", " + scrapSink
}

func mintID(kind, slug string) string {
	p := mintPrefix[kind]
	if slug == "" {
		slug = strings.ToLower(attestRandom(4, "b32"))
	}
	if strings.HasPrefix(slug, p) {
		return slug
	}
	return p + slug
}

// design: go-mint-edge-aware  implements: req-connections-code.2
// In connections mode a minted node carries NO legacy edge key — the strict referee would
// refuse it on the very next load. mintBody omits the keys when lanes=true; mintNodeAtX writes the same edges
// into the connection lanes instead. depends_on and the non-legacy keys stay in frontmatter
// in both modes (adr-edges-scope).
type mintEdge struct{ kind, dst string }

func mintLaneEdges(kind string, extra map[string]string) []mintEdge {
	var out []mintEdge
	add := func(k, v string) {
		for _, d := range strings.Split(v, ",") {
			if d = strings.TrimSpace(d); d != "" {
				out = append(out, mintEdge{k, d})
			}
		}
	}
	switch kind {
	case "usecase", "requirement":
		add("refines", extra["of"])
	case "test":
		add("verifies", extra["of"])
	case "adr":
		addr := extra["addresses"]
		if addr == "" {
			addr = extra["of"]
		}
		add("addresses", addr)
		add("supersedes", extra["supersedes"])
	case "rationale", "rule":
		add("refers", extra["of"])
	case "budget":
		add("addresses", extra["of"])
	}
	return out
}

// enddesign

// design: go-mint-templates  implements: req-config-split
// Skeletons come FROM the item templates (adr-rules-as-config, tier b): a kind's
// static frontmatter extras load from the fenced `skeleton` block in
// method/templates/items/<kind>.md - the template file IS the registry (the
// modelStubFor pattern). The code keeps only what a file cannot carry: edge keys,
// per-call interpolation, and the hardcoded fallback for template-less stub
// workspaces. A `{{edges}}` marker line names where the frontmatter-mode edge
// lands when it sits mid-skeleton (budget).
func mintSkeletonFor(kind string) string {
	raw, err := os.ReadFile(filepath.Join(EngineDir(), "method", "templates", "items", kind+".md"))
	if err != nil {
		return ""
	}
	src := strings.ReplaceAll(string(raw), "\r\n", "\n")
	if i := strings.Index(src, "```skeleton\n"); i >= 0 {
		rest := src[i+len("```skeleton\n"):]
		if j := strings.Index(rest, "```"); j >= 0 {
			if s := strings.TrimRight(rest[:j], "\n"); s != "" {
				return s + "\n"
			}
		}
	}
	return ""
}

func mintSkel(kind, fallback string) string {
	if s := mintSkeletonFor(kind); s != "" {
		return s
	}
	return fallback
}

// enddesign

func mintBody(kind, id string, extra map[string]string, lanes bool) string {
	var b strings.Builder
	b.WriteString("---\n")
	b.WriteString("id: " + id + "\n")
	b.WriteString("type: " + kind + "\n")
	switch kind {
	case "need":
		b.WriteString(mintSkel("need", "source: stk-TODO\nacceptance: TODO — the checkable condition that accepts the need\n"))
	case "usecase":
		if !lanes {
			b.WriteString("refines: [" + extra["of"] + "]\n")
		}
	case "requirement":
		if !lanes {
			b.WriteString("refines: [" + extra["of"] + "]\n")
		}
		b.WriteString("depends_on: []\n")
	case "test":
		if !lanes {
			b.WriteString("verifies: [" + extra["of"] + "]\n")
		}
	case "adr":
		addr := extra["addresses"]
		if addr == "" {
			addr = extra["of"]
		}
		if !lanes {
			b.WriteString("addresses: [" + addr + "]\n")
		}
		if extra["decided_in"] != "" {
			// the decision's provenance: the active iteration it was decided in
			// (stamped by mintNodeAtX from the TARGET workspace's breadcrumb)
			b.WriteString("decided_in: " + extra["decided_in"] + "\n")
		}
		b.WriteString("adjudicated_by: user\n")
		if extra["ready_when"] != "" {
			b.WriteString("ready_when: " + extra["ready_when"] + "\n")
		}
		if extra["supersedes"] != "" && !lanes {
			b.WriteString("supersedes: [" + extra["supersedes"] + "]\n")
		}
	case "stakeholder":
		b.WriteString(mintSkel("stakeholder", "role: TODO\ninterest: 0.5\ninfluence: 0.5\nweight: 0.5\n"))
	case "candidate":
		b.WriteString(mintSkel("candidate", "axis: TODO\nratings:\n  crit-TODO: 0.5\n"))
	case "raid":
		b.WriteString(mintSkel("raid", "kind: risk\nprobability: 0.5\nimpact: 0.5\nmitigation: TODO\nowner: TODO\nstatus: open\n"))
	case "rationale":
		if !lanes {
			b.WriteString("refers: [" + extra["of"] + "]\n")
		}
	case "record":
		b.WriteString("record_of: [" + extra["of"] + "]\nresult: TODO — value plus-minus uncertainty against the pre-fixed rule\n")
	case "criterion":
		b.WriteString(mintSkel("criterion", "metric: TODO\ntarget: TODO\n"))
	case "rule":
		b.WriteString(mintSkel("rule", "scope: TODO\n"))
		if !lanes {
			b.WriteString("refers: [" + extra["of"] + "]\n")
		}
	case "budget":
		sk := mintSkel("budget", "metric: TODO\nunit: TODO\n{{edges}}\nrule: sum\nmargin: 0.2\nallocations:\n  des-TODO: 0\n")
		pre, post := sk, ""
		if i := strings.Index(sk, "{{edges}}\n"); i >= 0 {
			pre, post = sk[:i], sk[i+len("{{edges}}\n"):]
		}
		b.WriteString(pre)
		if !lanes {
			b.WriteString("addresses: [" + extra["of"] + "]\n")
		}
		b.WriteString(post)
	case "guide":
		b.WriteString(mintSkel("guide", "audience: TODO\n"))
	case "model":
		mk := extra["kind"]
		if mk == "" {
			mk = "layers-flow"
		}
		b.WriteString("kind: " + mk + "\n")
	case "design":
		b.WriteString("responsibility: TODO\nimplements: [" + extra["of"] + "]\nrealization: make\n")
	case "connection":
		b.WriteString(mintSkel("connection", "kind: TODO\nsrc: TODO\ndst: TODO\n"))
	case "question":
		// a question is born open (go-question-nodes); decided_via lands with the ruling
		b.WriteString(mintSkel("question", "state: open\n"))
	}
	stmt := extra["statement"]
	if stmt == "" {
		stmt = "TODO — one line, load-bearing; the agent fills content, the engine owns shape"
	}
	b.WriteString("statement: " + stmt + "\n")
	if kind == "test" {
		b.WriteString("class: executed\nverify: selftest:" + strings.TrimPrefix(id, "test-") + "\n")
	} else {
		b.WriteString("class: review\n")
	}
	rat := extra["rationale"]
	if rat == "" {
		rat = "TODO"
	}
	b.WriteString("killer: false\n---\n")
	if kind == "model" {
		mk := extra["kind"]
		if mk == "" {
			mk = "layers-flow"
		}
		if stub := modelStubFor(mk); stub != "" {
			// the registry's example IS the skeleton (go-model-registry) - authored
			// in place, draft==truth from the first line
			b.WriteString("```mermaid\n" + stub + "```\n")
		}
	}
	b.WriteString("## Rationale (not load-bearing)\n" + rat + "\n")
	return b.String()
}

func mintNodeAt(dir, kind, id string) (string, error) {
	return mintNodeAtX(dir, kind, id, map[string]string{})
}

// design: go-mint-content  implements: req-mint-from-templates.1
// The four content kinds mint their own shapes into the spec content homes - they are
// notes with dedicated loaders, never node grammar. A content mint requires --id (the
// filename IS the slug; there is no engine-stamped prefix).
var contentMintDir = map[string]string{
	"term": "glossary", "reference": "references", "fundamental": "fundamentals", "method": "methods",
}

func mintContentBody(kind string) string {
	switch kind {
	case "term":
		return "---\nterm: TODO\nlong: TODO — the long form, first use renders it\nclass: domain\naliases: []\n---\nTODO — one-line definition\n"
	case "reference":
		return "---\ntitle: TODO\nurl: https://TODO\nkind: informative\nversion: TODO\naccessed: TODO\naliases: []\n---\nTODO — what it is, why this project leans on it, which parts matter\n"
	case "fundamental":
		return "---\nstatement: TODO — the one-liner for the fundamentals list\naliases: []\n---\nTODO — the full body; renders in the guidance chapter, one link away\n"
	case "method":
		return "---\nstatement: TODO — the purpose\napplies_chapters: []\napplies_type: [default]\napplies_rigor: [lean, systematic]\nsource: ref-TODO\naliases: []\n---\n## Situation\nTODO\n## Effect\nTODO\n## Procedure\nTODO\n## Tools\nTODO\n"
	}
	return ""
}

func mintContentAt(kind, slug string) (string, error) {
	if slug == "" {
		return "", fmt.Errorf("mint %s needs --id <slug> (the filename is the slug)", kind)
	}
	dir := filepath.Join(SPEC, contentMintDir[kind])
	if err := os.MkdirAll(dir, 0o755); err != nil {
		return "", err
	}
	path := filepath.Join(dir, slug+".md")
	if _, err := os.Stat(path); err == nil {
		return "", fmt.Errorf("mint: %s exists", path)
	}
	if err := os.WriteFile(path, []byte(mintContentBody(kind)), 0o644); err != nil {
		return "", err
	}
	return path, nil
}

// enddesign

func mintNodeAtX(dir, kind, id string, extra map[string]string) (string, error) {
	if _, ok := mintPrefix[kind]; !ok {
		return "", fmt.Errorf("mint: unknown node type %q", kind)
	}
	full := mintID(kind, id)
	if err := os.MkdirAll(dir, 0o755); err != nil {
		return "", err
	}
	path := filepath.Join(dir, full+".md")
	if _, err := os.Stat(path); err == nil {
		if id != "" {
			return "", fmt.Errorf("mint: %s exists", path)
		}
		full = mintID(kind, "") // auto ids retry on the rare collision
		path = filepath.Join(dir, full+".md")
	}
	// the TARGET's workspace owns the edge mode: walk up from the mint dir to its
	// project.toml (a bare temp dir has none -> frontmatter, the default)
	specDir := ""
	for d := dir; ; {
		if _, err := os.Stat(filepath.Join(d, "project.toml")); err == nil {
			specDir = d
			break
		}
		parent := filepath.Dir(d)
		if parent == d {
			break
		}
		d = parent
	}
	lanes := specDir != "" && edgesModeOf(specDir) == "connections"
	if kind == "adr" && extra["decided_in"] == "" && specDir != "" {
		// decisions effectively never happen outside an iteration: stamp the TARGET
		// workspace's active iteration as decided_in (v0 = no iteration yet, no stamp)
		if v := ReadConfig(filepath.Join(specDir, "project.toml")).Version; v != "" && v != "v0" {
			extra["decided_in"] = v
		}
	}
	if err := os.WriteFile(path, []byte(mintBody(kind, full, extra, lanes)), 0o644); err != nil {
		return "", err
	}
	if lanes {
		// the same edges land in the connection lanes instead (go-mint-edge-aware);
		// a failed edge write UNDOES the mint - a node must never lose its edge silently
		for _, e := range mintLaneEdges(kind, extra) {
			if _, err := mintConnection(specDir, e.kind, full, e.dst, "", ""); err != nil {
				os.Remove(path)
				return "", fmt.Errorf("mint: edge %s->%s: %v (node not written)", full, e.dst, err)
			}
		}
	}
	return path, nil
}

func mintDefaultDir(kind string) string {
	switch kind {
	case "adr":
		return filepath.Join(SPEC, "decisions")
	// the global item homes: long-lived kinds live
	// beside the iterations, not inside them
	case "stakeholder":
		return filepath.Join(SPEC, "stakeholders")
	case "usecase":
		return filepath.Join(SPEC, "usecases")
	case "raid":
		return filepath.Join(SPEC, "raid")
	case "rule":
		return filepath.Join(SPEC, "rules")
	case "guide":
		return filepath.Join(SPEC, "guides")
	case "connection":
		return filepath.Join(SPEC, "connections")
	}
	cfg := readProjectConfig()
	if cfg.Version != "" {
		return filepath.Join(SPEC, "iterations", cfg.Version)
	}
	return filepath.Join(SPEC, "trace")
}

func cmdMint(args []string) {
	if len(args) == 0 {
		fmt.Println("usage: mint <kind> [--id slug] [--of id] [--statement \"...\"] [--rationale \"...\"] [--dir path]")
		fmt.Println("       kinds: need usecase requirement test adr stakeholder candidate raid rationale record criterion rule budget guide design connection question")
		fmt.Println("       mint evidence --milestone M<n> [--dir path]           (stamp the milestone's evidence-doc skeleton)")
		fmt.Println("       mint veto --of <id> [--statement \"...\"]      (decision: scrapped, final)")
		fmt.Println("       mint defer --of <id> --ready-when \"<cond>\"    (decision: parked until)")
		fmt.Println("       mint supersede <old-id> [--statement \"...\"]  (decision: replaced by this)")
		return
	}
	kind := args[0]
	extra := map[string]string{
		"of": flagVal(args, "--of"), "statement": flagVal(args, "--statement"),
		"ready_when": flagVal(args, "--ready-when"), "rationale": flagVal(args, "--rationale"),
		"kind": flagVal(args, "--kind"),
	}
	switch kind {
	case "veto":
		kind = "adr"
		extra["addresses"] = sugarAddresses(extra["of"])
		extra["of"] = ""
	case "defer":
		kind = "adr"
		if extra["ready_when"] == "" {
			fmt.Println("mint defer needs --ready-when \"<condition>\"")
			return
		}
		extra["addresses"] = sugarAddresses(extra["of"])
		extra["of"] = ""
	case "supersede":
		kind = "adr"
		if len(args) < 2 || strings.HasPrefix(args[1], "-") {
			fmt.Println("mint supersede needs the superseded decision's id")
			return
		}
		extra["supersedes"] = args[1]
	}
	if kind == "evidence" {
		p, err := mintEvidence(flagVal(args, "--milestone"), flagVal(args, "--dir"))
		if err != nil {
			fmt.Fprintln(os.Stderr, err)
			quackExit(1)
		}
		rel, _ := filepath.Rel(ROOT, p)
		fmt.Println("minted ->", filepath.ToSlash(rel))
		return
	}
	if kind == "connection" && len(args) >= 4 && !strings.HasPrefix(args[1], "-") {
		// the connection sugar (go-conn-tools): mint connection <kind> <src> <dst>
		out, err := mintConnection(SPEC, args[1], args[2], args[3], flagVal(args, "--q"), flagVal(args, "--statement"))
		if err != nil {
			fmt.Fprintln(os.Stderr, err)
			quackExit(1)
		}
		fmt.Println("minted ->", out)
		return
	}
	if _, ok := contentMintDir[kind]; ok {
		p, err := mintContentAt(kind, flagVal(args, "--id"))
		if err != nil {
			fmt.Fprintln(os.Stderr, err)
			quackExit(1)
		}
		rel, _ := filepath.Rel(ROOT, p)
		fmt.Println("minted ->", filepath.ToSlash(rel))
		return
	}
	dir := flagVal(args, "--dir")
	if dir == "" {
		dir = mintDefaultDir(kind)
	}
	p, err := mintNodeAtX(dir, kind, flagVal(args, "--id"), extra)
	if err != nil {
		fmt.Fprintln(os.Stderr, err)
		quackExit(1)
	}
	rel, _ := filepath.Rel(ROOT, p)
	fmt.Println("minted ->", filepath.ToSlash(rel))
}

// enddesign

// design: go-mint-skeleton  implements: req-mint-from-templates.2
// `quack mint evidence --milestone M<n>` stamps the milestone's evidence-doc skeleton from its
// template (method/templates/<slug>.md): the template frontmatter is stripped (evidence docs are
// prose, never nodes), the placeholders substitute (iteration, rigor, itag), and an EXISTING doc
// is refused - the skeleton never overwrites evidence.
var evidenceSlugs = map[string]string{
	"M1": "M1-frame", "M2": "M2-inputs", "M3": "M3-candidates", "M4": "M4-decision",
	"M5": "M5-spike-findings", "M6": "M6-build-plan", "M7": "M7-validation", "M8": "M8-handover",
}

func mintEvidence(ms, dir string) (string, error) {
	slug, ok := evidenceSlugs[strings.ToUpper(strings.TrimSpace(ms))]
	if !ok {
		return "", fmt.Errorf("mint evidence needs --milestone M1..M8")
	}
	tpl, err := os.ReadFile(filepath.Join(EngineDir(), "method", "templates", slug+".md"))
	if err != nil {
		return "", err
	}
	cfg := readProjectConfig()
	if dir == "" {
		dir = filepath.Join(SPEC, "iterations", cfg.Version)
	}
	target := filepath.Join(dir, slug+".md")
	if _, err := os.Stat(target); err == nil {
		return "", fmt.Errorf("refusing: %s.md exists - the skeleton never overwrites evidence", slug)
	}
	body := string(tpl)
	if strings.HasPrefix(body, "---") {
		if i := strings.Index(body[3:], "---"); i >= 0 {
			body = strings.TrimLeft(body[3+i+3:], "\r\n")
		}
	}
	body = strings.NewReplacer("<iteration>", cfg.Version, "<rigor>", cfg.Rigor, "<itag>", iterTag(cfg.Version)).Replace(body)
	os.MkdirAll(dir, 0o755)
	if err := os.WriteFile(target, []byte(body), 0o644); err != nil {
		return "", err
	}
	return target, nil
}

// iterTag shortens a version id to its task-id tag: i0012_spec_book -> i12.
func iterTag(v string) string {
	if m := regexp.MustCompile(`^i0*(\d+)`).FindStringSubmatch(v); m != nil {
		return "i" + m[1]
	}
	return v
}

// enddesign
