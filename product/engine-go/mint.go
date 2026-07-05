package main

import (
	"fmt"
	"os"
	"path/filepath"
	"strings"
)

// design: go-mint  implements: req-mint, req-mint-dedupe, req-mint-rationale
// Deterministic minting (adr-deterministic-mint): the engine emits every node skeleton — typed
// frontmatter, engine-stamped id, placeholder statement — so a node is schema-valid at BIRTH; the
// agent fills content, never authors shape (the strict parser guarded READ time since i8; mint moves
// the guarantee to creation). Sugar forms stamp the decision edges the classifier derives from:
// `mint veto --of <id>`, `mint defer --of <id> --ready-when "<cond>"`, `mint supersede <old>` — so a
// veto/defer/supersession can never be misspelled into the wrong class. Decisions land in
// spec/decisions/; other types land in the active iteration.
var mintPrefix = map[string]string{
	"need": "need-", "usecase": "uc-", "requirement": "req-", "test": "test-", "adr": "adr-",
}

// sugarAddresses stamps the decision edges for veto/defer: the target plus the sink — and never
// the sink twice when the target IS the sink (i10 defect fix for addresses: [scrap, scrap]).
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

func mintBody(kind, id string, extra map[string]string) string {
	var b strings.Builder
	b.WriteString("---\n")
	b.WriteString("id: " + id + "\n")
	b.WriteString("type: " + kind + "\n")
	switch kind {
	case "usecase":
		b.WriteString("refines: [" + extra["of"] + "]\n")
	case "requirement":
		b.WriteString("refines: [" + extra["of"] + "]\n")
		b.WriteString("depends_on: []\n")
	case "test":
		b.WriteString("verifies: [" + extra["of"] + "]\n")
	case "adr":
		addr := extra["addresses"]
		if addr == "" {
			addr = extra["of"]
		}
		b.WriteString("addresses: [" + addr + "]\n")
		b.WriteString("adjudicated_by: human\n")
		if extra["ready_when"] != "" {
			b.WriteString("ready_when: " + extra["ready_when"] + "\n")
		}
		if extra["supersedes"] != "" {
			b.WriteString("supersedes: [" + extra["supersedes"] + "]\n")
		}
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
	b.WriteString("killer: false\n---\n## Rationale (not load-bearing)\n" + rat + "\n")
	return b.String()
}

func mintNodeAt(dir, kind, id string) (string, error) {
	return mintNodeAtX(dir, kind, id, map[string]string{})
}

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
	if err := os.WriteFile(path, []byte(mintBody(kind, full, extra)), 0o644); err != nil {
		return "", err
	}
	return path, nil
}

func mintDefaultDir(kind string) string {
	if kind == "adr" {
		return filepath.Join(SPEC, "decisions")
	}
	cfg := readProjectConfig()
	if cfg.Version != "" {
		return filepath.Join(SPEC, "iterations", cfg.Version)
	}
	return filepath.Join(SPEC, "trace")
}

func cmdMint(args []string) {
	if len(args) == 0 {
		fmt.Println("usage: mint <need|usecase|requirement|test|adr> [--id slug] [--of id] [--statement \"...\"] [--rationale \"...\"] [--dir path]")
		fmt.Println("       mint veto --of <id> [--statement \"...\"]      (decision: scrapped, final)")
		fmt.Println("       mint defer --of <id> --ready-when \"<cond>\"    (decision: parked until)")
		fmt.Println("       mint supersede <old-id> [--statement \"...\"]  (decision: replaced by this)")
		return
	}
	kind := args[0]
	extra := map[string]string{
		"of": flagVal(args, "--of"), "statement": flagVal(args, "--statement"),
		"ready_when": flagVal(args, "--ready-when"), "rationale": flagVal(args, "--rationale"),
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
