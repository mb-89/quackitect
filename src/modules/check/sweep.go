// The sweep: the rules that moved in from the LSP, over the files the index
// mirrors, with the counts they take read off the layers the way src/config
// reads them.
// [[spec/tickets/lsp-rules-move-to-check]]
package check

import (
	"encoding/json"
	"slices"
	"strconv"
	"strings"

	"quackitect/src/q"
)

// The port and the files it derives off, by their local names. [[spec/design_output/model#the-wiring-file]]
const (
	SweepPort = "sweep"
	FilesPort = "files/<path...>"
	EnvPort   = "env/<name>"
	// The unsaved text of each path an editor holds open, which the lsp IO module writes. [[spec/tickets/buffers-feed-the-checks]]
	BuffersPort = "buffers/<path...>"
	// The paths git tracks, which the git IO module writes. [[spec/tickets/check-sweep-reads-tracked]]
	TrackedPort = "tracked"
)

// The config files q names, and the keys the rules count by. [[spec/design_output/config#the-resolver-holds-the-layers]]
const (
	trackedConfig = q.TrackedConfig
	schemaConfig  = q.SchemaConfig
	localConfig   = q.LocalConfig
	wordsKey      = "names.words"
	pointerKey    = "restated.pointer"
	ruleKey       = "restated.rule"
)

type sweepIn struct {
	Files map[string]q.Content `q:"files/<path...>"`
	Env   map[string]string    `q:"env/<name>,optional"`
	// [[spec/tickets/buffers-feed-the-checks]]
	Buffers map[string]string `q:"buffers/<path...>,optional"`
	// [[spec/tickets/check-sweep-reads-tracked]]
	Tracked []string `q:"tracked"`
}

// Every rule over the files, as the LSP's own sweep answers it over the same tree. [[spec/tickets/lsp-rules-move-to-check]]
func sweepOf(in sweepIn) []Finding {
	texts := Texts{}
	for at, file := range in.Files {
		if file.Hash != "" {
			texts[at] = file.Text
		}
	}
	// The rules read the files git tracks, as the LSP's sweep does, and the counts read every layer, the local file git ignores among them. [[spec/design_output/lsp#a-pointer-reaches-a-heading]]
	tracked := map[string]bool{}
	for _, at := range in.Tracked {
		tracked[at] = true
	}
	swept := Texts{}
	for at, text := range texts {
		if tracked[at] {
			swept[at] = text
		}
	}
	tree := TreeOver("", swept)
	// A buffer stands over its file, as the LSP's overlay holds an open editor's text, and adds no path. [[spec/tickets/buffers-feed-the-checks]]
	// A closed buffer stands as the empty text, and its file reads as it does on disk. [[spec/tickets/lsp-door-lands-in-shadow]]
	for at, text := range in.Buffers {
		if text != "" && tracked[at] {
			tree.Holds(at, text)
		}
	}
	tree.Words = countOf(texts, in.Env, wordsKey)
	found := CheckerOver(tree, countOf(texts, in.Env, pointerKey), countOf(texts, in.Env, ruleKey)).Sweep()
	return slices.DeleteFunc(found, func(one Finding) bool { return slices.Contains(boxRules, one.Rule) })
}

// The rules that read the survey on the box, which stands outside what git tracks, so the lint decides them off the box and the sweep leaves them out. [[spec/tickets/sweep-skips-box-rules]]
var boxRules = []string{"SurveyFindsNode"}

// A count off the layers at rest, in the order q.Settled holds. [[spec/design_output/model#a-keys-layers]]
func countOf(texts Texts, env map[string]string, key string) int {
	literal, _, _ := q.Settled(key, orderedOf(texts[schemaConfig]), orderedOf(texts[trackedConfig]), orderedOf(texts[localConfig]), env)
	var said any
	_ = json.Unmarshal([]byte(literal), &said)
	switch one := said.(type) {
	case float64:
		return int(one)
	case string:
		if whole, err := strconv.Atoi(strings.TrimSpace(one)); err == nil {
			return whole
		}
	}
	return 0
}

// A config file's text as q reads it, or the empty value where it holds no JSON. [[spec/design_output/config#the-go-reader]]
func orderedOf(text string) q.Ordered {
	out, err := q.JSON.Parse([]byte(text))
	if err != nil {
		return q.Ordered{}
	}
	return out
}
