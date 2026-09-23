// Each note's parse, kept by the text it came from, so a keystroke re-parses
// the note it changes and reads every other one from what it holds.
// [[spec/design_output/lsp#a-change-reads-one-note]]
package main

import (
	"strings"

	"quackitect/yaml"
)

// A note's headings and, for a guidance note, its rule lines, beside the text they come from. [[spec/design_output/lsp#a-change-reads-one-note]]
type parse struct {
	text     string
	sections []Section
	slugs    []string
	rules    []ruleAt
}

// The note's parse, made again where its text differs from the one it came from. [[spec/design_output/lsp#a-change-reads-one-note]]
func (one *Tree) parsed(path string) parse {
	text := one.Read(path)
	one.guard.Lock()
	held, known := one.parses[path]
	one.guard.Unlock()
	if known && held.text == text {
		return held
	}
	made := parse{text: text, sections: sectionsOf(yaml.SplitLines(text))}
	for _, section := range made.sections {
		made.slugs = append(made.slugs, slugOf(section.Header))
	}
	if strings.HasPrefix(path, guidanceIn) {
		made.rules = rulesIn(text)
	}
	one.guard.Lock()
	one.parses[path] = made
	one.guard.Unlock()
	return made
}

// The pairs of guidance rules, compared again where a guidance note's text changes and read back otherwise. [[spec/design_output/lsp#a-change-reads-one-note]]
func (one *Tree) rulesOnce(key string, pass func() []Finding) []Finding {
	one.guard.Lock()
	found, held := one.ruleFound, one.ruleKey == key
	one.guard.Unlock()
	if held {
		return found
	}
	found = pass()
	one.guard.Lock()
	one.ruleKey, one.ruleFound = key, found
	one.guard.Unlock()
	return found
}
