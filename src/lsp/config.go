// The words a name holds, read off the same layers the resolver reads: the
// local file beats the environment, and the environment beats the tracked one.
// [[spec/design_output/config#the-resolver-holds-the-layers]]
package main

import (
	"os"
	"path/filepath"
	"strconv"
	"strings"
)

const (
	Tracked = "spec/config/level0.json"
	// The local layer, owned by .claude/skills/level0/lib/folders.js and spelled again here because a Go module imports no JavaScript. [[spec/design_output/config#the-three-layers]]
	Local   = ".se/.runtime/config.json"
	WordsAt = "names.words"
	WordsIn = "SE_NAMES_WORDS"
	// The block holding the two runs the restated rules refuse. [[spec/design_output/config#the-resolver-holds-the-layers]]
	Restated  = "restated"
	PointerIn = "SE_RESTATED_POINTER"
	RuleIn    = "SE_RESTATED_RULE"
)

func wordsHere(root string) int {
	out := 0
	if said, held := wordsFrom(root, Tracked); held {
		out = said
	}
	if said := strings.TrimSpace(os.Getenv(WordsIn)); said != "" {
		if whole, err := strconv.Atoi(said); err == nil {
			out = whole
		}
	}
	if said, held := wordsFrom(root, Local); held {
		out = said
	}
	return out
}

// The runs the restated rules refuse, read off the same layers. [[spec/design_output/config#the-resolver-holds-the-layers]]
func restatedHere(root string) (int, int) {
	pointer, rule := 0, 0
	if said, held := numbersFrom(root, Tracked, Restated); held {
		pointer, rule = boundIn(said, "pointer", pointer), boundIn(said, "rule", rule)
	}
	pointer, rule = wholeIn(PointerIn, pointer), wholeIn(RuleIn, rule)
	if said, held := numbersFrom(root, Local, Restated); held {
		pointer, rule = boundIn(said, "pointer", pointer), boundIn(said, "rule", rule)
	}
	return pointer, rule
}

func boundIn(said map[string]any, key string, out int) int {
	if one, whole := said[key].(float64); whole {
		return int(one)
	}
	return out
}

func wholeIn(name string, out int) int {
	said := strings.TrimSpace(os.Getenv(name))
	if said == "" {
		return out
	}
	whole, err := strconv.Atoi(said)
	if err != nil {
		return out
	}
	return whole
}

func numbersFrom(root, path, key string) (map[string]any, bool) {
	read, err := os.ReadFile(filepath.Join(root, filepath.FromSlash(path)))
	if err != nil {
		return nil, false
	}
	said, held := parsedJSON(string(read))[key].(map[string]any)
	return said, held
}

func wordsFrom(root, path string) (int, bool) {
	read, err := os.ReadFile(filepath.Join(root, filepath.FromSlash(path)))
	if err != nil {
		return 0, false
	}
	said := parsedJSON(string(read))
	names, held := said["names"].(map[string]any)
	if !held {
		return 0, false
	}
	words, whole := names["words"].(float64)
	if !whole {
		return 0, false
	}
	return int(words), true
}

// [[spec/design_output/tools#what-the-survey-writes]]
func nodeHere() string {
	said, err := runs("node", "--version")
	if err != nil {
		return ""
	}
	return strings.TrimPrefix(strings.TrimSpace(said), "v")
}
