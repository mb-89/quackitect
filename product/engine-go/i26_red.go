package main

import (
	"os"
	"path/filepath"
	"strings"
)

// selftestBlessPreflight verifies that direct bless cannot skip the work that
// next would have forced: prerequisites must be satisfied, and first-time active
// iteration review checks must have evidence.
func selftestBlessPreflight() bool {
	nodes := map[string]Node{
		"parent": {ID: "parent", Class: "review"},
		"child":  {ID: "child", Class: "review", DependsOn: []string{"parent"}},
	}
	st := map[string]string{"parent": "OPEN", "child": "OPEN"}
	if v := blessPreflightVerdict("child", nodes["child"], nodes, st, nil); !strings.Contains(v, "unfinished prerequisite parent") {
		return false
	}

	cfg := readProjectConfig()
	if cfg.Version == "" {
		return false
	}
	old := evidenceBaseOverride
	dir, err := os.MkdirTemp("", "q26-evidence-*")
	if err != nil {
		return false
	}
	defer os.RemoveAll(dir)
	defer func() { evidenceBaseOverride = old }()
	evidenceBaseOverride = dir
	iterDir := filepath.Join(dir, cfg.Version)
	if os.MkdirAll(iterDir, 0o755) != nil {
		return false
	}
	gatePath := filepath.Join(SPEC, "iterations", cfg.Version, "tasks", "gate.md")
	gate := Node{ID: "gate", Class: "review", Milestone: 1, Path: gatePath}
	if v := blessPreflightVerdict("gate", gate, map[string]Node{"gate": gate}, map[string]string{"gate": "OPEN"}, nil); !strings.Contains(v, "no evidence section") {
		return false
	}
	if os.WriteFile(filepath.Join(iterDir, "M1-frame.md"), []byte("## Frame -> gate\n"), 0o644) != nil {
		return false
	}
	return blessPreflightVerdict("gate", gate, map[string]Node{"gate": gate}, map[string]string{"gate": "OPEN"}, nil) == ""
}

var i26Tests = []namedTest{
	{"bless-preflight", selftestBlessPreflight},
	{"budget-best-positive", selftestBudgetBestPositive},
	{"ifu-coverage", selftestIFUCoverage},
}

func selftestBudgetBestPositive() bool {
	return budgetBestPositive(12000, 250, 600) == 250 &&
		budgetBestPositive(-1, 300) == 300 &&
		budgetBestPositive(-1, -1) < 0
}

func selftestIFUCoverage() bool {
	nodes := map[string]Node{
		"uc-a": {ID: "uc-a", Type: "usecase", Path: filepath.Join(SPEC, "iterations", "i0001_x", "uc-a.md")},
		"uc-b": {ID: "uc-b", Type: "usecase", Path: filepath.Join(SPEC, "iterations", "i0001_x", "uc-b.md")},
		"deck": {ID: "deck", Type: "manifest", Mode: "deck", Kind: "ifu", Path: "deck.md", RegionBody: ""},
	}
	old := manifestBodyOverride
	manifestBodyOverride = map[string]string{"deck.md": "# IFU\n\n[uc-a](uc-a)"}
	defer func() { manifestBodyOverride = old }()
	if !sameSet(ifuCoverageMissing(nodes, "i0001_x"), "uc-b") {
		return false
	}
	manifestBodyOverride = map[string]string{"deck.md": "# IFU\n\n[uc-a](uc-a) [uc-b](uc-b)"}
	return len(ifuCoverageMissing(nodes, "i0001_x")) == 0 && coverageRuleUncached(nodes, "ifu-usecases", "i0001_x")
}
