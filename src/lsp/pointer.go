// The pointers a tracked file writes, and where each one lands. A pointer
// names a file, and a chapter after a hash, and this rule follows every one
// the way a reader does.
// [[spec/design_output/lsp#every-pointer-resolves]]
package main

import (
	"quackitect/yaml"

	"regexp"
	"strings"
)

// [[spec/design_output/lsp#every-pointer-resolves]]
const EveryPointerResolves = "EveryPointerResolves"

var (
	bracketsAt = regexp.MustCompile(`\[\[([^\[\]]*)\]\]`)
	// Where a comment opens in a line of code, which is the one place a pointer stands in code. [[spec/design_output/lsp#every-pointer-resolves]]
	commentAt = regexp.MustCompile(`(^|\s)(//|#|\*|/\*|<!--)`)
	indentAt  = regexp.MustCompile(`^(\t|    )`)
	// A quote or a bracket inside the brackets is a script guarding the shape, and no pointer. [[spec/design_output/lsp#every-pointer-resolves]]
	guarded = regexp.MustCompile(`[<>"'()]`)
)

// The endings a pointer leaves off, in the order the index tries them. [[spec/design_output/index#a-note-and-its-links]]
var pointerEndings = []string{"", ".md", ".yaml", ".yml"}

const sniffBytes = 8000

// Every place a pointer lands: a path, a note's id, or a folder. [[spec/design_output/lsp#every-pointer-resolves]]
type places struct {
	paths   map[string]bool
	ids     map[string]string
	folders map[string]bool
}

func placesIn(tree *Tree) places {
	out := places{paths: map[string]bool{}, ids: map[string]string{}, folders: map[string]bool{}}
	for _, path := range tree.Paths() {
		out.paths[path] = true
		name := path[strings.LastIndex(path, "/")+1:]
		for _, end := range pointerEndings[1:] {
			if strings.HasSuffix(name, end) {
				out.ids[strings.TrimSuffix(name, end)] = path
			}
		}
		parts := strings.Split(path, "/")
		for i := 1; i < len(parts); i++ {
			out.folders[strings.Join(parts[:i], "/")] = true
		}
	}
	return out
}

// The file a pointer names, resolved the way the index resolves a link. [[spec/design_output/index#a-note-and-its-links]]
func (held places) fileOf(target string) string {
	name := strings.Trim(strings.TrimSpace(target), "/")
	if name == "" {
		return ""
	}
	for _, end := range pointerEndings {
		if held.paths[name+end] {
			return name + end
		}
	}
	if at, ok := held.ids[name]; ok {
		return at
	}
	if held.folders[name] {
		return name
	}
	return ""
}

// [[spec/design_output/lsp#every-pointer-resolves]]
func everyPointerResolves(tree *Tree) []Finding {
	out := []Finding{}
	held := placesIn(tree)
	for _, path := range tree.Paths() {
		out = append(out, pointerFaultsIn(tree, held, path)...)
	}
	return out
}

// [[spec/design_output/lsp#every-pointer-resolves]]
func pointerFaultsIn(tree *Tree, held places, path string) []Finding {
	out := []Finding{}
	text := tree.Read(path)
	if !textual(text) {
		return out
	}
	for _, one := range pointersIn(path, yaml.SplitLines(text)) {
		if why := unresolved(tree, held, one.target); why != "" {
			out = append(out, fault(EveryPointerResolves, path, one.line, why))
		}
	}
	return out
}

// A pointer, its line, and the byte span of its brackets in that line, so a link covers what a reader clicks. [[spec/design_output/lsp#a-pointer-opens-its-target]]
type pointerAtLine struct {
	target     string
	line       int
	start, end int
}

// A code span blanked to spaces, so a bracket past it keeps its column. [[spec/design_output/lsp#a-pointer-opens-its-target]]
func spansBlanked(row string) string {
	return spanAt.ReplaceAllStringFunc(row, func(span string) string {
		return strings.Repeat(" ", len(span))
	})
}

// The pointers a file writes as pointers: a note's frontmatter past its kind, its body outside a quoted shape, a yaml file whole, and the comments of any other file. [[spec/design_output/lsp#every-pointer-resolves]]
func pointersIn(path string, rows []string) []pointerAtLine {
	out := []pointerAtLine{}
	note := strings.HasSuffix(path, ".md")
	data := strings.HasSuffix(path, ".yaml") || strings.HasSuffix(path, ".yml")
	front := note && len(rows) > 0 && strings.TrimSpace(rows[0]) == "---"
	fenced := false
	for i, row := range rows {
		said, base := row, 0
		switch {
		case front && i == 0:
			continue
		case front:
			if strings.TrimSpace(row) == "---" {
				front = false
				continue
			}
			if strings.HasPrefix(strings.TrimSpace(row), "kind:") {
				continue
			}
			said = spansBlanked(row)
		case note && fenceAt.MatchString(row):
			fenced = !fenced
			continue
		case note && (fenced || indentAt.MatchString(row)):
			continue
		case note, data:
			said = spansBlanked(row)
		default:
			at := commentAt.FindStringIndex(row)
			if at == nil {
				continue
			}
			said, base = row[at[0]:], at[0]
		}
		for _, found := range bracketsAt.FindAllStringSubmatchIndex(said, -1) {
			target := strings.TrimSpace(said[found[2]:found[3]])
			if target == "" || guarded.MatchString(target) {
				continue
			}
			out = append(out, pointerAtLine{target: target, line: i + 1, start: base + found[0], end: base + found[1]})
		}
	}
	return out
}

// Why a pointer lands nowhere, and the empty string where it lands. [[spec/design_output/lsp#every-pointer-resolves]]
func unresolved(tree *Tree, held places, target string) string {
	name, anchor, chaptered := strings.Cut(target, "#")
	at := held.fileOf(name)
	if at == "" {
		return "This pointer names a note nobody wrote: " + target + ". Point at a file the tree holds."
	}
	if !chaptered {
		return ""
	}
	if !strings.HasSuffix(at, ".md") {
		return "This pointer names a chapter of a file holding none: " + target + ". Point at the file alone."
	}
	if headingNamed(tree, at, strings.TrimSpace(anchor)) == "" {
		return "This pointer names a chapter nobody wrote: " + target + ". Point at a heading of " + at + ", or write the chapter."
	}
	return ""
}

func textual(text string) bool {
	head := text
	if len(head) > sniffBytes {
		head = head[:sniffBytes]
	}
	return !strings.ContainsRune(head, 0)
}
