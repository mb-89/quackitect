// The words a name holds, read off the same layers the resolver reads: the
// local file beats the environment, and the environment beats the tracked one.
// [[spec/design_output/config#the-resolver-holds-the-layers]]
package main

import (
	"strconv"
	"strings"

	"quackitect/config"
)

const (
	Tracked = config.Tracked
	Local   = config.Local
	WordsAt = "names.words"
	WordsIn = "SE_NAMES_WORDS"
	// The block holding the two runs the restated rules refuse. [[spec/design_output/config#the-resolver-holds-the-layers]]
	Restated  = "restated"
	PointerIn = "SE_RESTATED_POINTER"
	RuleIn    = "SE_RESTATED_RULE"
)

// The shared reader answers the key, and this one turns what it answers into a count. [[spec/design_output/config#the-go-reader]]
func wordsHere(root string) int {
	return countAt(root, WordsAt)
}

// The runs the restated rules refuse, read off the same layers as the words. [[spec/design_output/config#the-resolver-holds-the-layers]]
func restatedHere(root string) (int, int) {
	return countAt(root, "restated.pointer"), countAt(root, "restated.rule")
}

// A count the shared reader answers, or zero where the key stands nowhere. [[spec/design_output/config#the-go-reader]]
func countAt(root, key string) int {
	said, held := config.Value(root, key)
	if !held {
		return 0
	}
	switch one := said.(type) {
	case float64:
		return int(one)
	case string:
		if whole, err := strconv.Atoi(one); err == nil {
			return whole
		}
	}
	return 0
}

// [[spec/design_output/tools#what-the-survey-writes]]
func nodeHere() string {
	said, err := runs("node", "--version")
	if err != nil {
		return ""
	}
	return strings.TrimPrefix(strings.TrimSpace(said), "v")
}
