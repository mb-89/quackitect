// The facts a note restates. One measure answers both rules: the longest run of
// words the places share, over the notes a pointer ties together.
// [[spec/design_output/lsp#a-second-copy-draws]]
package main

import (
	"quackitect/yaml"

	"regexp"
	"strconv"
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
	// The run a slug turns into one hyphen, compiled once, because every anchor reads it. [[spec/design_output/lsp#a-change-reads-one-note]]
	slugGap = regexp.MustCompile(`[^a-z0-9]+`)
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
	note := tree.parsed(path)
	rows := yaml.SplitLines(note.text)
	for _, one := range note.sections {
		for _, said := range pointersUnder(rows, one, note.sections) {
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
	held := map[string][]ruleAt{}
	// The pairs compare again where a guidance text changes, so a keystroke in any other note pays nothing here. [[spec/design_output/lsp#a-change-reads-one-note]]
	key := strings.Builder{}
	key.WriteString(strconv.Itoa(most))
	for _, path := range notesIn(tree) {
		if strings.HasPrefix(path, guidanceIn) {
			note := tree.parsed(path)
			held[path] = note.rules
			key.WriteString("\x00" + path + "\x00" + note.text)
		}
	}
	return tree.rulesOnce(key.String(), func() []Finding {
		out := []Finding{}
		for path, mine := range held {
			for other, theirs := range held {
				if other >= path {
					continue
				}
				out = append(out, sameRules(path, mine, other, theirs, most)...)
			}
		}
		return out
	})
}

// A rule line, and its words read once, because every pair of rules compares them. [[spec/design_output/lsp#a-change-reads-one-note]]
type ruleAt struct {
	said  string
	line  int
	words []string
}

func sameRules(path string, mine []ruleAt, other string, theirs []ruleAt, most int) []Finding {
	out := []Finding{}
	for _, one := range mine {
		for _, two := range theirs {
			if runOf(one.words, two.words) < most {
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
	return runOf(wordsOf(one), wordsOf(other))
}

// The longest run two word lists share. [[spec/design_output/lsp#a-second-copy-draws]]
func runOf(mine, theirs []string) int {
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
			out = append(out, ruleAt{said: found[1], line: i + 1, words: wordsOf(found[1])})
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
		note := tree.parsed(where)
		for i, one := range note.sections {
			if note.slugs[i] == anchor {
				return one, true
			}
		}
	}
	return Section{}, false
}

// [[spec/design_output/vocabulary#the-slug-reads-one-source]]
func slugOf(said string) string {
	out := quotesOut.ReplaceAllString(strings.ToLower(said), "")
	out = slugGap.ReplaceAllString(out, "-")
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
