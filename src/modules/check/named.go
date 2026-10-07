// A path a note's code span or a code file's comment names stands in the tree,
// so a reader following it finds the file.
// [[spec/tickets/every-named-path-resolves]]
package check

import (
	"quackitect/src/yaml"

	"regexp"
	"strings"
)

// [[spec/tickets/every-named-path-resolves]]
const EveryNamedPathStands = "EveryNamedPathStands"

var (
	// A tracked root, plain path letters, and a file ending. [[spec/tickets/every-named-path-resolves]]
	pathShape = regexp.MustCompile(`^(src|spec|test|\.claude)/[A-Za-z0-9_./-]*\.[a-z0-9]+$`)
	// A glob or a placeholder reads as a shape, and names no one file. [[spec/tickets/every-named-path-resolves]]
	shapeMarks = "*<{$"
	// The marks a comment word carries before a path, and after it. [[spec/tickets/every-named-path-resolves]]
	wordLeads = "`'\"(["
	wordTails = "`'\")],;:!?."
)

// [[spec/tickets/every-named-path-resolves]]
func everyNamedPathStands(tree *Tree) []Finding {
	out := []Finding{}
	held := placesIn(tree)
	for _, path := range tree.Paths() {
		out = append(out, namedPathFaultsIn(tree, held, path)...)
	}
	return out
}

// The paths a file names that the tree lacks, past a ticket, which names the files its own change writes. [[spec/tickets/every-named-path-resolves]]
func namedPathFaultsIn(tree *Tree, held places, path string) []Finding {
	out := []Finding{}
	where := slashed(relativeTo(tree.Root, path))
	if strings.HasPrefix(where, ticketsAt) {
		return out
	}
	text := tree.Read(path)
	if !textual(text) {
		return out
	}
	note := strings.HasSuffix(where, ".md")
	for _, one := range rowsSaid(where, yaml.SplitLines(text)) {
		for _, named := range namedIn(one, note) {
			if held.fileOf(named) == "" {
				out = append(out, fault(EveryNamedPathStands, path, one.line,
					"This names a path the tree lacks: "+named+". Name a file the tree holds."))
			}
		}
	}
	return out
}

// The paths a row names: a note body's code spans, and a comment's words. [[spec/tickets/every-named-path-resolves]]
func namedIn(one rowSaid, note bool) []string {
	out := []string{}
	switch {
	case note && one.part == inBody:
		for _, span := range spanAt.FindAllString(one.said, -1) {
			out = append(out, pathNamed(strings.TrimSpace(strings.Trim(span, "`")))...)
		}
	case one.part == inComment && !midRowStar(one):
		for _, word := range strings.Fields(bracketsAt.ReplaceAllString(one.said, " ")) {
			out = append(out, pathNamed(strings.TrimRight(strings.TrimLeft(word, wordLeads), wordTails))...)
		}
	}
	return out
}

// A star past code on its row multiplies, and opens no comment. [[spec/tickets/every-named-path-resolves]]
func midRowStar(one rowSaid) bool {
	return strings.HasPrefix(strings.TrimSpace(one.said), "*") && !strings.HasPrefix(strings.TrimSpace(one.said), "*/") && strings.TrimSpace(one.row[:one.base]) != ""
}

// The word as a path, or nothing where it reads as a shape or no path. [[spec/tickets/every-named-path-resolves]]
func pathNamed(word string) []string {
	if strings.ContainsAny(word, shapeMarks) || !pathShape.MatchString(word) {
		return nil
	}
	return []string{word}
}
