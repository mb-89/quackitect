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
	for _, path := range []string{Tracked, Local} {
		if said, held := numbersFrom(root, path, "restated"); held {
			if one, whole := said["pointer"].(float64); whole {
				pointer = int(one)
			}
			if one, whole := said["rule"].(float64); whole {
				rule = int(one)
			}
		}
	}
	return pointer, rule
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
