// The chapter a marked item wants. A schema saying `matches` names the
// frontmatter key holding the note, and every marked item there wants a
// chapter of its number here.
// [[spec/design_output/lsp#a-second-copy-draws]]
package main

import (
	"fmt"
	"regexp"
	"strconv"
	"strings"

	"quackitect/yaml"
)

var (
	markedItem = regexp.MustCompile(`^\s*(\d+)\.\s+.*\*\s*$`)
	chapterAt  = regexp.MustCompile(`^\s*(\d+)\.`)
	linkOut    = regexp.MustCompile(`\[\[([^\]]+)\]\]`)
)

// [[spec/design_output/lsp#a-second-copy-draws]]
func markedFaults(tree *Tree, note Note, schema *yaml.Doc, where string) []Finding {
	out := []Finding{}
	if tree == nil {
		return out
	}
	body := yaml.AsDoc(schema.Get("body"))
	if body == nil {
		return out
	}

	level := 1
	if body.Has("headingLevel") {
		level = yaml.AsInt(body.Get("headingLevel"))
	}
	for _, one := range yaml.AsList(body.Get("sections")) {
		rule := yaml.AsDoc(one)
		if rule == nil {
			continue
		}
		spec := yaml.AsDoc(rule.Get("subsections"))
		if spec == nil || yaml.AsString(spec.Get("matches")) == "" {
			continue
		}
		out = append(out, wantedChapters(tree, note, rule, spec, level, where)...)
	}
	return out
}

// [[spec/design_output/lsp#a-second-copy-draws]]
func wantedChapters(tree *Tree, note Note, rule, spec *yaml.Doc, level int, where string) []Finding {
	header := yaml.AsString(rule.Get("header"))
	held, stands := sectionNamed(note, header, level)
	if !stands {
		return nil
	}
	marked := markedIn(tree, linkedTo(note, yaml.AsString(spec.Get("matches"))))
	if len(marked) == 0 {
		return nil
	}

	under := level + 1
	if spec.Has("headingLevel") {
		under = yaml.AsInt(spec.Get("headingLevel"))
	}
	held.at = indexOf(note, held.Line)
	stood := chaptersHeld(note, held, under)

	out := []Finding{}
	for _, said := range marked {
		if stood[said] {
			continue
		}
		out = append(out, schemaFault(header, where, held.Line,
			fmt.Sprintf("%s opens no chapter %d, and the note it explains marks that item.", header, said)))
	}
	return out
}

func sectionNamed(note Note, header string, level int) (standingAt, bool) {
	for at, one := range note.Sections {
		if one.Level == level && one.Header == header {
			return standingAt{Section: one, at: at}, true
		}
	}
	return standingAt{}, false
}

func indexOf(note Note, line int) int {
	for at, one := range note.Sections {
		if one.Line == line {
			return at
		}
	}
	return 0
}

func chaptersHeld(note Note, held standingAt, level int) map[int]bool {
	out := map[int]bool{}
	for _, one := range note.Sections[held.at+1:] {
		if one.Level <= held.Level {
			break
		}
		if one.Level != level {
			continue
		}
		if found := chapterAt.FindStringSubmatch(one.Header); found != nil {
			said, _ := strconv.Atoi(found[1])
			out[said] = true
		}
	}
	return out
}

// [[spec/design_output/lsp#a-second-copy-draws]]
func linkedTo(note Note, key string) string {
	said := yaml.AsString(note.Front.Said.Get(key))
	if said == "" {
		return ""
	}
	if found := linkOut.FindStringSubmatch(said); found != nil {
		said = found[1]
	}
	return strings.TrimSpace(said)
}

// [[spec/design_output/lsp#a-second-copy-draws]]
func markedIn(tree *Tree, path string) []int {
	out := []int{}
	if path == "" {
		return out
	}
	for _, end := range []string{"", ".md"} {
		where := path + end
		if !tree.Exists(where) {
			continue
		}
		for _, line := range yaml.SplitLines(tree.Read(where)) {
			if found := markedItem.FindStringSubmatch(line); found != nil {
				said, _ := strconv.Atoi(found[1])
				out = append(out, said)
			}
		}
		return out
	}
	return out
}
