package main

// i17_red2.go — the i0017_pruning EXTENSION battery. Tests
// first, they FAIL until the build. Each case carries its trace line:
// test-<id> -> selftest:<name>. The stubs at the bottom define the build's
// API surface and are replaced at the green steps.

import (
	"os"
	"path/filepath"
	"strings"
)

// i17bTests: this file's checks, in battery order (selftestRegistry in
// selftest.go concatenates the per-file slices).
var i17bTests = []namedTest{
	{"expedition-authority", selftestExpeditionAuthority},
	{"question-nodes", selftestQuestionNodes},
	{"cone-triage", selftestConeTriage},
	{"ask-hardening", selftestAskHardening},
	{"models-complete-book", selftestModelsCompleteBook},
	{"render-once", selftestRenderOnce},
}

// test-expedition-authority -> selftest:expedition-authority
func selftestExpeditionAuthority() bool {
	raw, err := os.ReadFile(filepath.Join(EngineDir(), "method", "prompts", "refine.md"))
	if err != nil {
		return false
	}
	low := strings.ToLower(string(raw))
	for _, must := range []string{"zero authority", "promotion gate", "ledger"} {
		if !strings.Contains(low, must) {
			return false // the expedition invariant lives in the refine method
		}
	}
	eng, err := os.ReadFile(filepath.Join(EngineDir(), "method", "prompts", "engage.md"))
	if err != nil {
		return false
	}
	return strings.Contains(strings.ToLower(string(eng)), "expedition") // engage names it
}

// test-question-nodes -> selftest:question-nodes
func selftestQuestionNodes() bool {
	dir, err := os.MkdirTemp("", "q17q")
	if err != nil {
		return false
	}
	defer os.RemoveAll(dir)
	it := filepath.Join(dir, "iterations", "i0001_fix")
	os.MkdirAll(it, 0o755)
	os.WriteFile(filepath.Join(it, "q-format.md"), []byte("---\nid: q-format\ntype: question\nstatement: which export format should the deck use\nstate: open\nclass: review\nkiller: false\n---\n"), 0o644)
	os.WriteFile(filepath.Join(it, "q-done.md"), []byte("---\nid: q-done\ntype: question\nstatement: settled probe question\nstate: decided\ndecided_via: owner ruling 2026-07-10\nclass: review\nkiller: false\n---\n"), 0o644)
	nodes := loadNodesUnder(dir)
	qa, ok := nodes["q-format"]
	if !ok || qa.Type != "question" || questionState(qa) != "open" {
		return false // an open question is a first-class node
	}
	qb, ok := nodes["q-done"]
	if !ok || questionState(qb) != "decided" || decidedVia(qb) == "" {
		return false // a decided node records how it was decided
	}
	return true
}

// test-cone-triage -> selftest:cone-triage
func selftestConeTriage() bool {
	got := waveBlessFilter(map[string]string{"g-a": "SUSPECT", "g-b": "OPEN", "g-c": "DONE"})
	if len(got) != 1 || got[0] != "g-a" {
		return false // a wave bless touches suspects only, never OPEN gates
	}
	return triageAvailable() // and the cone is listable, split by re-ruling need
}

// test-ask-hardening -> selftest:ask-hardening
func selftestAskHardening() bool {
	merged := askStoreMergeIDs([]string{"ask-a"}, []string{"ask-b"})
	if len(merged) != 2 {
		return false // concurrent saves union, they never clobber
	}
	if !answerStaleRefused("2026-07-10T12:00:00Z", "2026-07-10T11:00:00Z") {
		return false // an answer older than its ask must be refused
	}
	if answerStaleRefused("2026-07-10T12:00:00Z", "2026-07-10T13:00:00Z") {
		return false // a fresh answer must not be
	}
	return awaitReloadsPerLoop()
}

// test-models-complete-book -> selftest:models-complete-book
func selftestModelsCompleteBook() bool {
	html, live := bookOnceHTML()
	if !live {
		return true // nested probe: the outer run decides
	}
	nodes := LoadAll()
	for id, n := range nodes {
		if n.Type == "model" && !strings.Contains(html, id) {
			return false // every declared model renders in the real book
		}
	}
	for _, f := range modelKindFiles() {
		kind := strings.TrimSuffix(filepath.Base(f), filepath.Ext(f))
		if !strings.Contains(html, "data-kind-example=\""+kind+"\"") {
			// every shipped kind is USED in this workspace, so each renders; an
			// unused kind would be honestly absent (req-model-kinds-catalog)
			return false
		}
	}
	return true
}

// test-render-once -> selftest:render-once
func selftestRenderOnce() bool {
	sites := 0
	filepath.Walk(EngineSrc(), func(path string, fi os.FileInfo, err error) error {
		if err != nil || fi.IsDir() {
			return nil
		}
		base := filepath.Base(path)
		if !strings.HasSuffix(base, "_red.go") && base != "selftest_spec.go" {
			return nil
		}
		raw, rerr := os.ReadFile(path)
		if rerr != nil {
			return nil
		}
		sites += strings.Count(string(raw), "renderBookHTML(LoadAll())")
		return nil
	})
	return sites <= 1 // the battery pays for at most one real render (the shared memo)
}

// ---- build API surface: the stubs dissolved; the surface lives in its feature files ----
