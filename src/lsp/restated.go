// The facts a note restates. One measure answers both rules: the longest run of
// words two places share, over the notes a pointer ties together.
// [[spec/design_output/lsp#a-second-copy-draws]]
package main

import (
	"quackitect/yaml"

	"regexp"
	"strings"
)

const (
	// The rule over a heading retelling the heading its pointer names. [[spec/design_output/lsp#a-second-copy-draws]]
	RestatedPointer = "RestatedPointer"
	// The rule over one rule line standing in two guidance notes. [[spec/design_output/lsp#a-second-copy-draws]]
	RestatedRule = "RestatedRule"
	guidanceIn   = "spec/guidance/"
)

var (
	spanAt    = regexp.MustCompile("`[^`]*`")
	linkAt    = regexp.MustCompile(`\[\[[^\]]*\]\]`)
	ruleLine  = regexp.MustCompile(`^\s*\d+\.\s+(.*)$`)
	anchorAt  = regexp.MustCompile(`\[\[([^\]#]+)#([^\]]+)\]\]`)
	wordAt    = regexp.MustCompile(`[A-Za-z0-9]+`)
	quotesOut = regexp.MustCompile("[`']")
)

// [[spec/design_output/lsp#a-second-copy-draws]]
func restatedFaults(tree *Tree, pointer, rule int) []Finding {
	out := []Finding{}
	if pointer > 0 {
		for _, path := range notesIn(tree) {
			out = append(out, pointerFaults(tree, path, pointer)...)
		}
	}
	if rule > 0 {
		out = append(out, ruleFaults(tree, rule)...)
	}
	return sorted(out)
}

// A note names a chapter of another note, and its own heading says the same thing twice. [[spec/design_output/lsp#a-second-copy-draws]]
func pointerFaults(tree *Tree, path string, most int) []Finding {
	out := []Finding{}
	rows := yaml.SplitLines(tree.Read(path))
	for _, one := range sectionsOf(rows) {
		for _, said := range pointersUnder(rows, one, sectionsOf(rows)) {
			there := headingNamed(tree, said.path, said.anchor)
			if there == "" || sharedRun(one.Header, there) < most {
				continue
			}
			out = append(out, warn(RestatedPointer, path, one.Line,
				"This heading retells the chapter its pointer names. Say what this note adds, and let the pointer carry the rest."))
		}
	}
	return out
}

// One rule standing in two guidance notes drifts, because a hand rewords one of them. [[spec/design_output/lsp#a-second-copy-draws]]
func ruleFaults(tree *Tree, most int) []Finding {
	out := []Finding{}
	held := map[string][]ruleAt{}
	for _, path := range notesIn(tree) {
		if strings.HasPrefix(path, guidanceIn) {
			held[path] = rulesIn(tree.Read(path))
		}
	}
	for path, mine := range held {
		for other, theirs := range held {
			if other >= path {
				continue
			}
			out = append(out, sameRules(path, mine, other, theirs, most)...)
		}
	}
	return out
}

type ruleAt struct {
	said string
	line int
}

func sameRules(path string, mine []ruleAt, other string, theirs []ruleAt, most int) []Finding {
	out := []Finding{}
	for _, one := range mine {
		for _, two := range theirs {
			if sharedRun(one.said, two.said) < most {
				continue
			}
			out = append(out, warn(RestatedRule, path, one.line,
				"This rule stands in "+other+" too. Keep it in one note, and point at that note from the other."))
		}
	}
	return out
}

// The longest run of words two texts share, with a code span and a link blanked out. [[spec/design_output/lsp#a-second-copy-draws]]
func sharedRun(one, other string) int {
	mine := wordsOf(one)
	theirs := wordsOf(other)
	most := 0
	for at := range mine {
		for from := range theirs {
			run := 0
			for at+run < len(mine) && from+run < len(theirs) && mine[at+run] == theirs[from+run] {
				run++
			}
			if run > most {
				most = run
			}
		}
	}
	return most
}

func wordsOf(said string) []string {
	blank := linkAt.ReplaceAllString(said, " ")
	blank = spanAt.ReplaceAllString(blank, " ")
	out := []string{}
	for _, one := range wordAt.FindAllString(strings.ToLower(blank), -1) {
		out = append(out, one)
	}
	return out
}

func rulesIn(text string) []ruleAt {
	out := []ruleAt{}
	fenced := false
	for i, line := range yaml.SplitLines(text) {
		if fenceAt.MatchString(line) {
			fenced = !fenced
			continue
		}
		if fenced {
			continue
		}
		if found := ruleLine.FindStringSubmatch(line); found != nil {
			out = append(out, ruleAt{said: found[1], line: i + 1})
		}
	}
	return out
}

type namedChapter struct {
	path   string
	anchor string
}

func pointersUnder(rows []string, one Section, every []Section) []namedChapter {
	out := []namedChapter{}
	for i := one.Line; i < len(rows) && i < endOf(one, every, len(rows)); i++ {
		for _, found := range anchorAt.FindAllStringSubmatch(rows[i], -1) {
			out = append(out, namedChapter{path: found[1], anchor: found[2]})
		}
	}
	return out
}

func endOf(one Section, every []Section, rows int) int {
	for _, two := range every {
		if two.Line > one.Line {
			return two.Line - 1
		}
	}
	return rows
}

// The slug turns a heading into the anchor a pointer names. [[spec/design_output/vocabulary#the-slug-reads-one-source]]
func headingNamed(tree *Tree, path, anchor string) string {
	found, _ := chapterOf(tree, path, anchor)
	return found.Header
}

// The chapter an anchor names, with the line its heading stands on, and whether one stands. [[spec/design_output/lsp#a-pointer-opens-its-target]]
func chapterOf(tree *Tree, path, anchor string) (Section, bool) {
	for _, end := range []string{"", ".md"} {
		where := path + end
		if !tree.Exists(where) {
			continue
		}
		for _, one := range sectionsOf(yaml.SplitLines(tree.Read(where))) {
			if slugOf(one.Header) == anchor {
				return one, true
			}
		}
	}
	return Section{}, false
}

// [[spec/design_output/vocabulary#the-slug-reads-one-source]]
func slugOf(said string) string {
	out := quotesOut.ReplaceAllString(strings.ToLower(said), "")
	out = regexp.MustCompile(`[^a-z0-9]+`).ReplaceAllString(out, "-")
	return strings.Trim(out, "-")
}

func notesIn(tree *Tree) []string {
	out := []string{}
	for _, one := range tree.Paths() {
		if strings.HasSuffix(one, ".md") {
			out = append(out, one)
		}
	}
	return out
}

func warn(rule, file string, line int, message string) Finding {
	said := fault(rule, file, line, message)
	said.Severity = SeverityWarning
	return said
}
