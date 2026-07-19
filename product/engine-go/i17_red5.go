package main

// i17_red5.go — the post-ship feedback batch probes. Registered green-at-birth
// against the already-landed build (post-ship batch, noted in the batch report):
// presets-visible    — every emitted data-view token resolves to ≥1 visible chapter;
//                      the agent view surfaces the guidance chapter
// book-self-link     — the embedded README's own book link is an in-book no-op,
//                      never a repo-relative href that breaks from out/ or docs/
// readme-further-table — the scaffolded further-reading block is a markdown table
// register-quality-type — quality is a filterable register TYPE; the scenario
//                      fields render in the row expand
// decided-in-mint    — mint stamps decided_in from the target's active iteration
// decided-in-display — the ch9 iteration column prefers decided_in; the field is
//                      identity (hash moves) and the strict parser accepts it

import (
	"os"
	"path/filepath"
	"regexp"
	"strings"
)

var i17eTests = []namedTest{
	{"presets-visible", selftestPresetsVisible},
	{"book-self-link", selftestBookSelfLink},
	{"readme-further-table", selftestReadmeFurtherTable},
	{"register-quality-type", selftestRegisterQualityType},
	{"decided-in-mint", selftestDecidedInMint},
	{"decided-in-display", selftestDecidedInDisplay},
}

// selftest:presets-visible — the post-ship preset incident's guard: a data-view
// token the shell can enter into the filter MUST resolve to at least one chapter
// carrying the matching in-man-preset-* class, else one click hides the whole book.
func selftestPresetsVisible() bool {
	html, live := bookOnceHTML()
	if !live {
		return true // nested probe: the outer run decides
	}
	toks := regexp.MustCompile(`data-view="([^"]+)"`).FindAllStringSubmatch(html, -1)
	if len(toks) == 0 {
		return false // the filter help always bakes the preset buttons
	}
	for _, m := range toks {
		norm := strings.TrimPrefix(m[1], "man-preset-")
		cls := regexp.MustCompile(`<article [^>]*class="[^"]*in-man-preset-` + regexp.QuoteMeta(norm) + `[\s"]`)
		if !cls.MatchString(html) {
			return false // a dead token filters everything away
		}
	}
	// the agent view surfaces the guidance chapter (owner note 2)
	agent := regexp.MustCompile(`<article id="man-guidance" class="[^"]*in-man-preset-agent[\s"]`)
	return agent.MatchString(html)
}

// selftest:book-self-link — the README chapter's further-reading link to the book
// itself renders as an in-book affordance, never a relative href (owner note 1:
// it breaks when the copy opens from out/ or docs/).
func selftestBookSelfLink() bool {
	md := "## Further reading\n\n| Link | What it is |\n|---|---|\n| [The book](spec/book.html) | The whole spec. |\n| [Other](docs/other.html) | A sibling. |\n"
	html := renderReadme(md)
	if strings.Contains(html, `href="spec/book.html"`) {
		return false // the broken-relative form must be gone
	}
	if !strings.Contains(html, `class="self-link"`) || !strings.Contains(html, "you are reading it") {
		return false // the no-op affordance says what it is
	}
	return strings.Contains(html, `href="docs/other.html"`) // other relative links stay links
}

// selftest:readme-further-table — the scaffold's further-reading block is a
// markdown TABLE (owner note 11), with and without a git origin remote.
func selftestReadmeFurtherTable() bool {
	dir, err := os.MkdirTemp("", "qfrt")
	if err != nil {
		return false
	}
	defer os.RemoveAll(dir)
	bare := furtherReadingSection(dir)
	if !strings.Contains(bare, "## Further reading") ||
		!strings.Contains(bare, "| Link | What it is |") ||
		!strings.Contains(bare, "|---|---|") ||
		!strings.Contains(bare, "| [The book](spec/book.html) |") ||
		!strings.Contains(bare, "no git origin remote") {
		return false
	}
	os.MkdirAll(filepath.Join(dir, ".git"), 0o755)
	os.WriteFile(filepath.Join(dir, ".git", "config"),
		[]byte("[remote \"origin\"]\n\turl = https://github.com/o/r.git\n"), 0o644)
	linked := furtherReadingSection(dir)
	if !strings.Contains(linked, "| [Read the book in the browser](https://o.github.io/r/book.html) |") {
		return false
	}
	// every non-heading content line is a table row: the block renders as a table on GitHub
	for _, ln := range strings.Split(strings.TrimSpace(linked), "\n") {
		t := strings.TrimSpace(ln)
		if t == "" || strings.HasPrefix(t, "#") {
			continue
		}
		if !strings.HasPrefix(t, "|") {
			return false
		}
	}
	return true
}

// selftest:register-quality-type — a kind-quality requirement lands in the design
// input register as TYPE "quality", its six-part scenario in the expand (owner
// note 5: the qualities section died into the register).
func selftestRegisterQualityType() bool {
	dir, err := os.MkdirTemp("", "qqty")
	if err != nil {
		return false
	}
	defer os.RemoveAll(dir)
	qp := filepath.Join(dir, "req-quick.md")
	os.WriteFile(qp, []byte("---\nid: req-quick\ntype: requirement\nkind: quality\nstatement: The probe shall answer fast.\nstimulus_source: the user\nstimulus: a command\nartifact: the evaluation\nenvironment: warm cache\nresponse: the board renders\nresponse_measure: under one probe-second\n---\n"), 0o644)
	cp := filepath.Join(dir, "req-bound.md")
	os.WriteFile(cp, []byte("---\nid: req-bound\ntype: requirement\nkind: constraint\nstatement: The probe shall obey the norm.\n---\n"), 0o644)
	nodes := map[string]Node{
		"req-quick": {ID: "req-quick", Type: "requirement", Kind: "quality", Statement: "The probe shall answer fast.", Path: qp},
		"req-bound": {ID: "req-bound", Type: "requirement", Kind: "constraint", Statement: "The probe shall obey the norm.", Path: cp},
	}
	html := renderInputRegister(nodes)
	if !strings.Contains(html, `data-e1="quality"`) || !strings.Contains(html, `data-e1="constraint"`) {
		return false // both kinds are filterable TYPE values
	}
	return strings.Contains(html, "Quality scenario") &&
		strings.Contains(html, "under one probe-second") // the scenario rides the expand
}

// selftest:decided-in-mint — mint stamps decided_in on a decision from the TARGET
// workspace's active iteration; a workspace without one (v0) stays unstamped; the
// strict referee accepts the stamped node.
func selftestDecidedInMint() bool {
	dir, err := os.MkdirTemp("", "qdin")
	if err != nil {
		return false
	}
	defer os.RemoveAll(dir)
	sp := filepath.Join(dir, "spec")
	os.MkdirAll(sp, 0o755)
	os.WriteFile(filepath.Join(sp, "project.toml"),
		[]byte("[iteration]\nversion = \"i0099_probe\"\n"), 0o644)
	p, err := mintNodeAtX(filepath.Join(sp, "decisions"), "adr", "probe",
		map[string]string{"statement": "The probe decision."})
	if err != nil {
		return false
	}
	raw, _ := os.ReadFile(p)
	if !strings.Contains(string(raw), "decided_in: i0099_probe\n") {
		return false // the stamp rides the minted frontmatter
	}
	if ParseNode(p).DecidedIn != "i0099_probe" {
		return false // the parser reads it back
	}
	if len(StrictIssues(sp)) != 0 {
		return false // the strict allowlist accepts decided_in
	}
	// a workspace with no active iteration mints WITHOUT the stamp
	v0 := filepath.Join(dir, "v0", "spec")
	os.MkdirAll(v0, 0o755)
	os.WriteFile(filepath.Join(v0, "project.toml"), []byte("[iteration]\nversion = \"v0\"\n"), 0o644)
	p2, err := mintNodeAtX(filepath.Join(v0, "decisions"), "adr", "bare",
		map[string]string{"statement": "The bare decision."})
	if err != nil {
		return false
	}
	raw2, _ := os.ReadFile(p2)
	return !strings.Contains(string(raw2), "decided_in")
}

// selftest:decided-in-display — the decisions-table iteration column PREFERS the
// recorded decided_in and falls back to the addresses-derivation without it; the
// field folds into the node identity (a stamp moves the hash).
func selftestDecidedInDisplay() bool {
	reqPath := filepath.Join(SPEC, "iterations", "i0009_probe", "req-it.md")
	adrPath := filepath.Join(SPEC, "decisions", "adr-probe.md")
	nodes := map[string]Node{
		"req-it":    {ID: "req-it", Type: "requirement", Statement: "The it.", Path: reqPath},
		"adr-probe": {ID: "adr-probe", Type: "adr", Statement: "The probe.", Addresses: []string{"req-it"}, Path: adrPath},
	}
	if decisionIteration(nodes["adr-probe"], nodes) != "i0009_probe" {
		return false // the addresses-derivation is the fallback
	}
	h1 := fullHash("adr-probe", nodes, map[string]string{})
	n := nodes["adr-probe"]
	n.DecidedIn = "i0031_probe"
	nodes["adr-probe"] = n
	if decisionIteration(nodes["adr-probe"], nodes) != "i0031_probe" {
		return false // decided_in wins over the derivation
	}
	return fullHash("adr-probe", nodes, map[string]string{}) != h1 // the field is identity
}
