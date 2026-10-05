// The output style: every guidance note's Actionables, numbered, with its
// Examples table under them, in one file the client sends with every request.
// The guidance reading ports the part of guidance.js the style reads.
// [[spec/design_output/projection#the-third-target]] [[spec/tickets/config-verbs-port-to-go]]
package projection

import (
	"regexp"
	"sort"
	"strconv"
	"strings"
)

// The name the style file and its frontmatter carry. [[spec/design_output/projection#the-third-target]]
const styleName = "level0"

// The chapters the style reads off a note. [[spec/design_output/level0#the-standing-layer]]
const (
	actionablesChapter = "Actionables"
	examplesChapter    = "Examples"
	tableMark          = "|"
)

var (
	noteFront   = regexp.MustCompile(`^---\r?\n[\s\S]*?\r?\n---\r?\n`)
	noteLines   = regexp.MustCompile(`\r?\n`)
	noteHeading = regexp.MustCompile(`^#\s+(.+?)\s*$`)
	noteItem    = regexp.MustCompile(`^\s*(?:\d+[.)]|[-*+])\s+(.*)$`)
	// The star a rule wanting argument ends in, bare or in a code span. [[spec/schemas]]
	ruleStar = regexp.MustCompile("\\s*`?\\*`?$")
	noteEnd  = regexp.MustCompile(`[.]md$`)
	noteGaps = regexp.MustCompile(`[-_]`)
)

// The output style the guidance folder writes, or nothing where no note carries a rule. [[spec/design_output/projection#the-third-target]]
func styleFrom(entry Entry, texts map[string]string) map[string]string {
	out := map[string]string{}
	folder := folderOf(joinString(entry.raw.Get("from")))
	paths := []string{}
	for path := range texts {
		if strings.HasPrefix(path, folder+"/") && strings.HasSuffix(path, noteEnding) {
			paths = append(paths, path)
		}
	}
	sort.Strings(paths)
	notes := []named{}
	for _, path := range paths {
		name := path[len(folder)+1:]
		if !strings.Contains(name, "/") && len(actionables(texts[path])) > 0 {
			notes = append(notes, named{name: name, text: texts[path]})
		}
	}
	if len(notes) == 0 {
		return out
	}
	body := []string{}
	for _, note := range notes {
		body = append(body, "## "+noteGaps.ReplaceAllString(bareName(note.name), " "), "")
		body = append(body, rulesOf(note.text)...)
		body = append(body, "")
	}
	lines := []string{
		"---",
		"name: " + styleName,
		"description: " + quoted(styleSays(notes)),
		"keep-coding-instructions: true",
		"generated: " + quoted(saysGenerated(entry.shown("from"))),
		"---",
		"",
		"# How this tree works",
		"",
		"These rules hold over every answer you write. Vale holds the mechanical",
		"ones at the write door, so a write breaking one comes back with the",
		"reason and the line.",
		"",
	}
	out[entry.folder()+"/"+styleName+noteEnding] = strings.Join(append(lines, body...), "\n")
	return out
}

// A note's name with its .md cut. [[spec/design_output/projection#the-third-target]]
func bareName(name string) string { return noteEnd.ReplaceAllString(name, "") }

// The description naming every note the style carries. [[spec/design_output/projection#the-third-target]]
func styleSays(notes []named) string {
	names := make([]string, len(notes))
	for i, one := range notes {
		names[i] = bareName(one.name)
	}
	return "The " + strings.Join(names, ", ") + " rules of this tree, sent with every request."
}

// The chapters of a note by heading, its frontmatter cut. [[spec/design_output/level0#the-standing-layer]]
func chaptersOf(text string) map[string]string {
	body := text
	if found := noteFront.FindStringIndex(text); found != nil {
		body = text[found[1]:]
	}
	out := map[string]string{}
	heading, open := "", false
	held := []string{}
	shut := func() {
		if open {
			out[heading] = jsTrim(strings.Join(held, "\n"))
		}
		held = []string{}
	}
	for _, line := range noteLines.Split(body, -1) {
		if found := noteHeading.FindStringSubmatch(line); found != nil {
			shut()
			heading, open = found[1], true
			continue
		}
		if open {
			held = append(held, line)
		}
	}
	shut()
	return out
}

// The items of a note's Actionables chapter, a wrapped item joined into one line. [[spec/design_output/level0#the-standing-layer]]
func itemsIn(text string) []string {
	chapter := chaptersOf(text)[actionablesChapter]
	if chapter == "" {
		return nil
	}
	out := []string{}
	held := ""
	for _, line := range noteLines.Split(chapter, -1) {
		if found := noteItem.FindStringSubmatch(line); found != nil {
			if held != "" {
				out = append(out, held)
			}
			held = jsTrim(found[1])
			continue
		}
		switch {
		case held != "" && jsTrim(line) != "":
			held += " " + jsTrim(line)
		case held != "":
			out = append(out, held)
			held = ""
		}
	}
	if held != "" {
		out = append(out, held)
	}
	return out
}

// A note's rules, each with its star cut. [[spec/design_output/level0#the-standing-layer]]
func actionables(text string) []string {
	out := []string{}
	for _, one := range itemsIn(text) {
		if said := jsTrim(ruleStar.ReplaceAllString(one, "")); said != "" {
			out = append(out, said)
		}
	}
	return out
}

// The rows of a note's Examples table. [[spec/design_output/level0#the-examples-ride-the-rules]]
func examples(text string) []string {
	out := []string{}
	for _, line := range noteLines.Split(chaptersOf(text)[examplesChapter], -1) {
		if said := jsTrim(line); strings.HasPrefix(said, tableMark) {
			out = append(out, said)
		}
	}
	return out
}

// A note's rules, numbered, and its Examples table under them. [[spec/design_output/level0#the-examples-ride-the-rules]]
func rulesOf(text string) []string {
	out := []string{}
	for i, one := range actionables(text) {
		out = append(out, strconv.Itoa(i+1)+". "+one)
	}
	if shown := examples(text); len(shown) > 0 {
		out = append(append(out, ""), shown...)
	}
	return out
}
