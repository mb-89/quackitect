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
	Local   = ".se/config.json"
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
