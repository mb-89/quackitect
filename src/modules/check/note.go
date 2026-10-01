// What a note reads as. The frontmatter, the chapters under it, and the items
// each chapter holds. A fence parks everything inside it, so a heading in a
// code block names no chapter.
// [[spec/design_output/schema#what-a-note-reads-as]]
package check

import (
	"quackitect/src/note"
	"quackitect/src/yaml"

	"regexp"
	"strings"
)

// The note reader stands in src/note, so the tickets module reads the same shape. [[spec/tickets/the-lens-reads-v1]]
type (
	Section = note.Section
	Front   = note.Front
	Note    = note.Note
)

var (
	readNote   = note.Read
	frontOf    = note.FrontOf
	sectionsOf = note.SectionsOf
	fenceAt    = note.FenceAt
)

var (
	itemAt     = regexp.MustCompile(`^\s*(?:\d+[.)]|[-*+])\s+\S`)
	numberedAt = regexp.MustCompile(`^(\d+)[.)]?\s`)
	commentsAt = regexp.MustCompile(`(?s)<!--.*?-->`)
)

// [[spec/design_output/schema#what-a-note-reads-as]]
func kindOf(text string) string {
	said := frontOf(yaml.SplitLines(text)).Said.Get("kind")
	if said == nil {
		return ""
	}
	return yaml.AsString(linkless(said))
}

type item struct {
	said string
	line int
}

// [[spec/design_output/schema#a-comment-counts-toward-nothing]]
func itemsIn(rows []string) []item {
	out := []item{}
	fenced := false
	for i, raw := range rows {
		if fenceAt.MatchString(raw) {
			fenced = !fenced
			continue
		}
		if fenced {
			continue
		}
		said := strings.TrimSpace(commentsAt.ReplaceAllString(raw, ""))
		if itemAt.MatchString(said) {
			out = append(out, item{said: said, line: i + 1})
		}
	}
	return out
}

func linkless(said any) any {
	if one, held := said.([]any); held {
		out := make([]any, 0, len(one))
		for _, each := range one {
			out = append(out, linkless(each))
		}
		return out
	}
	return yaml.LinkAt.ReplaceAllString(yaml.AsString(said), "$1")
}

func linked(said any) bool {
	if one, held := said.([]any); held {
		if len(one) == 0 {
			return false
		}
		for _, each := range one {
			if !yaml.LinkAt.MatchString(yaml.AsString(each)) {
				return false
			}
		}
		return true
	}
	return yaml.LinkAt.MatchString(yaml.AsString(said))
}
