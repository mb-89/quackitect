package main

// config.go — rules-as-config, tier (a): pure-data vocabularies live in
// method/config JSON files (adr-rules-as-config). An entry edit changes
// behavior with no rebuild. The loader stays zero-dep: encoding/json is stdlib.

import (
	"encoding/json"
	"os"
	"path/filepath"
	"sort"
	"strings"
)

// design: go-rules-config  implements: req-config-split, req-prose-current
// This is the tier-(a) split. Lists load from method/config/*.json, resolved engine-root-relative like the model kind registry (go-model-registry). Two vocabularies ride it. weasel-words.json feeds the EARS lint through weaselWordsFromConfig; trust.go keeps its compiled list ONLY as the stub-workspace fallback. retired-vocabulary.json drives the prose-current check: every method prompt and workspace guide is scanned case-insensitively, and a finding names file and term.

// configDir resolves the engine's config home through the engine layer (EngineDir), so a
// vehicle inherits the vendored config instead of probing its own product/quackitect —
// the dogfood-path lint noise every vehicle saw (i0020 cold-run fix).
func configDir() string {
	return filepath.Join(EngineDir(), "method", "config")
}

// loadJSONConfig fills out from one config file. A missing or malformed file
// returns false and leaves out untouched — the caller decides its fallback.
func loadJSONConfig(name string, out interface{}) bool {
	raw, err := os.ReadFile(filepath.Join(configDir(), name))
	if err != nil {
		return false
	}
	return json.Unmarshal(raw, out) == nil
}

// VocabRule is one retired-vocabulary entry: the dead term and why it died.
type VocabRule struct {
	Term   string `json:"term"`
	Reason string `json:"reason"`
}

// retiredVocabRules loads the retired vocabulary (retired-vocabulary.json).
func retiredVocabRules() []VocabRule {
	var rules []VocabRule
	loadJSONConfig("retired-vocabulary.json", &rules)
	return rules
}

// proseScanFiles lists the surfaces the retired-vocabulary check covers:
// the method prompts (engine layer) and the workspace guides.
func proseScanFiles() []string {
	var files []string
	dirs := []string{
		filepath.Join(engineRoot(), "product", "quackitect", "method", "prompts"),
		filepath.Join(SPEC, "guides"),
	}
	for _, dir := range dirs {
		ents, err := os.ReadDir(dir)
		if err != nil {
			continue
		}
		for _, e := range ents {
			if e.IsDir() || !strings.HasSuffix(e.Name(), ".md") {
				continue
			}
			files = append(files, filepath.Join(dir, e.Name()))
		}
	}
	sort.Strings(files)
	return files
}

// retiredVocabFindings scans the prompts and guides for retired terms,
// case-insensitively. A finding names file and term. Zero findings means
// the prose is current.
func retiredVocabFindings() []string {
	rules := retiredVocabRules()
	var finds []string
	for _, p := range proseScanFiles() {
		raw, err := os.ReadFile(p)
		if err != nil {
			continue
		}
		low := strings.ToLower(string(raw))
		for _, r := range rules {
			if r.Term != "" && strings.Contains(low, strings.ToLower(r.Term)) {
				finds = append(finds, filepath.Base(p)+": retired term \""+r.Term+"\" ("+r.Reason+")")
			}
		}
	}
	return finds
}

// weaselWordsFromConfig loads the EARS weasel blocklist (weasel-words.json).
// Nil means the file is missing; the EARS lint then falls back to its
// compiled list (stub workspaces carry no config home).
func weaselWordsFromConfig() []string {
	var words []string
	loadJSONConfig("weasel-words.json", &words)
	return words
}

// enddesign
