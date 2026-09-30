// The sweep: the rules that moved in from the LSP, over the files the index
// mirrors, with the counts they take read off the layers the way src/config
// reads them.
// [[spec/tickets/lsp-rules-move-to-check]]
package check

import (
	"encoding/json"
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

// The two config files and the keys the rules count by, which src/config names for the LSP. src/config reads the disk, so this module spells them again. [[spec/design_output/config#the-resolver-holds-the-layers]]
const (
	trackedConfig = "spec/config/level0.json"
	schemaConfig  = "spec/config/level0.schema.json"
	localConfig   = ".se/.runtime/config.json" // .claude/skills/level0/lib/folders.js owns this name
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
	return CheckerOver(tree, countOf(texts, in.Env, pointerKey), countOf(texts, in.Env, ruleKey)).Sweep()
}

// A count off the layers: the local file beats the variable, the variable beats the tracked file, and the tracked file beats the schema's default, as src/config reads them. [[spec/design_output/config#the-resolver-holds-the-layers]]
func countOf(texts Texts, env map[string]string, key string) int {
	said, _ := valueAt(texts[schemaConfig], "properties."+strings.ReplaceAll(key, ".", ".properties.")+".default")
	if held, found := valueAt(texts[trackedConfig], key); found {
		said = held
	}
	if held := strings.TrimSpace(env[envOf(key)]); held != "" {
		said = held
	}
	if held, found := valueAt(texts[localConfig], key); found {
		said = held
	}
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

// The variable naming a key, as EnvOf in src/config names it. [[spec/design_output/config#the-go-reader]]
func envOf(key string) string {
	return "SE_" + strings.ToUpper(strings.NewReplacer(".", "_", "-", "_").Replace(key))
}

// The value a JSON text holds at a dotted key. [[spec/design_output/config#the-go-reader]]
func valueAt(text, key string) (any, bool) {
	var here any
	if json.Unmarshal([]byte(text), &here) != nil {
		return nil, false
	}
	for _, part := range strings.Split(key, ".") {
		step, ok := here.(map[string]any)
		if !ok {
			return nil, false
		}
		if here, ok = step[part]; !ok {
			return nil, false
		}
	}
	return here, true
}
