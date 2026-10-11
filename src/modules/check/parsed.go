// Each note's parse, kept by the text it came from, so a keystroke re-parses
// the note it changes and reads every other one from what it holds.
// [[spec/design_output/lsp#a-change-reads-one-note]]
package check

import (
	"strings"

	"quackitect/src/yaml"
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
