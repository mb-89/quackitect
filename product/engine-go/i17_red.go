package main

// i17_red.go — the i0017_pruning RED battery: tests first, they FAIL until the
// build. Each case carries its trace line: test-<id> -> selftest:<name>. The
// stubs at the bottom define the build's API surface and are replaced at the
// green steps.

import (
	"os"
	"path/filepath"
	"strings"
)

// i17Tests: this file's checks, in battery order (selftestRegistry in
// selftest.go concatenates the per-file slices).
var i17Tests = []namedTest{
	{"trace-clustered", selftestTraceClustered},
	{"metrics-removed", selftestMetricsRemoved},
	{"prose-current", selftestProseCurrent},
	{"iterations-compacted", selftestIterationsCompacted},
	{"go-analysis", selftestGoAnalysis},
	{"config-split", selftestConfigSplit},
	{"ask-context", selftestAskContext},
}

// test-trace-clustered -> selftest:trace-clustered
func selftestTraceClustered() bool {
	n := 0
	filepath.Walk(filepath.Join(SPEC, "iterations"), func(path string, fi os.FileInfo, err error) error {
		if err == nil && !fi.IsDir() && strings.HasPrefix(filepath.Base(path), "req-") && strings.HasSuffix(path, ".md") {
			n++
		}
		return nil
	})
	if n == 0 || n > 240 {
		return false // the sprawl tripwire; raised 200 -> 240 by owner ruling after the i27 reopen minted real, traced scope
	}
	return coverageRuleUncached(LoadAll(), "req-traced", "") // every cluster still traces
}

// test-metrics-removed -> selftest:metrics-removed
func selftestMetricsRemoved() bool {
	for _, f := range []string{"readout.go", "report.go", "report_assets.go", "board.go", "ops.go", "coverage.go"} {
		raw, err := os.ReadFile(filepath.Join(EngineSrc(), f))
		if err != nil {
			continue
		}
		low := strings.ToLower(string(raw))
		for _, tok := range []string{"reversal rate", "rework rate", "self-cert", "selfcert"} {
			if strings.Contains(low, tok) {
				return false // the three retired metrics are gone from every surface
			}
		}
	}
	return true
}

// test-prose-current -> selftest:prose-current
func selftestProseCurrent() bool {
	rules := retiredVocabRules()
	if len(rules) < 3 {
		return false // the rule-set loads from config and is non-trivial
	}
	finds := retiredVocabFindings()
	return len(finds) == 0 // prompts and guides carry no retired vocabulary
}

// test-iterations-compacted -> selftest:iterations-compacted
func selftestIterationsCompacted() bool {
	dir, err := os.MkdirTemp("", "q17c")
	if err != nil {
		return false
	}
	defer os.RemoveAll(dir)
	it := filepath.Join(dir, "iterations", "i0001_fix")
	os.MkdirAll(filepath.Join(it, "tasks"), 0o755)
	os.WriteFile(filepath.Join(it, "req-a.md"), []byte("---\nid: req-a\ntype: requirement\nstatement: the fixture shall hold\nclass: review\nkiller: false\n---\n"), 0o644)
	os.WriteFile(filepath.Join(it, "tasks", "f1-m1-gate.md"), []byte("---\nid: f1-m1-gate\nstatement: fixture gate\nmilestone: M1\nclass: review\nkiller: true\n---\n"), 0o644)
	before := loadNodesUnder(dir)
	memoB := map[string]string{}
	hb := map[string]string{}
	for id := range before {
		hb[id] = fullHash(id, before, memoB)
	}
	if err := compactIteration(dir, "i0001_fix"); err != nil {
		return false
	}
	after := loadNodesUnder(dir)
	if len(after) != len(before) {
		return false // every node survives the compaction
	}
	memoA := map[string]string{}
	for id, h := range hb {
		if fullHash(id, after, memoA) != h {
			return false // a recorded hash moved - the kill-criterion
		}
	}
	files := 0
	filepath.Walk(it, func(path string, fi os.FileInfo, err error) error {
		if err == nil && fi != nil && !fi.IsDir() {
			files++
		}
		return nil
	})
	return files <= 1 // the working set shrank to the archive form
}

// test-go-analysis -> selftest:go-analysis
func selftestGoAnalysis() bool {
	dir, err := os.MkdirTemp("", "q17g")
	if err != nil {
		return false
	}
	defer os.RemoveAll(dir)
	os.WriteFile(filepath.Join(dir, "bad.go"), []byte("package x\nfunc  Bad( ) {  }\n"), 0o644)
	if len(buildAnalysisFindings(dir)) == 0 {
		return false // a planted formatting finding fails
	}
	os.WriteFile(filepath.Join(dir, "bad.go"), []byte("package x\n\nfunc Good() {}\n"), 0o644)
	return len(buildAnalysisFindings(dir)) == 0 // clean passes
}

// test-config-split -> selftest:config-split
func selftestConfigSplit() bool {
	ws := weaselWordsFromConfig()
	if len(ws) < 5 {
		return false // the weasel set loads from config
	}
	found := false
	for _, w := range ws {
		if w == "should" {
			found = true
		}
	}
	return found // and carries the known members
}

// test-ask-context -> selftest:ask-context
func selftestAskContext() bool {
	card := "CARD LINE ONE\nCARD LINE TWO"
	ctx := "the narrative paragraph, identical on both lanes"
	body := askComposeBody(card, ctx)
	ci := strings.Index(body, "CARD LINE ONE")
	xi := strings.Index(body, ctx)
	if ci != 0 || xi < 0 || xi < ci {
		return false // the card renders FIRST, the narrative below
	}
	return askComposeBody(card, "") == card // no context, no trailing noise
}

// (build-surface stubs live in i17_stubs_*.go, one file per build step's owner)
