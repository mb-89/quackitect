// What a note reads as. The frontmatter, the chapters under it, and the items
// each chapter holds. A fence parks everything inside it, so a heading in a
// code block names no chapter.
// [[spec/design_output/schema#what-a-note-reads-as]]
package main

import (
	"quackitect/yaml"

	"regexp"
	"strings"
)

var (
	headingAt  = regexp.MustCompile(`^(#{1,6})\s+(.+?)\s*$`)
	fenceAt    = regexp.MustCompile("^\\s*(?:```|~~~)")
	itemAt     = regexp.MustCompile(`^\s*(?:\d+[.)]|[-*+])\s+\S`)
	numberedAt = regexp.MustCompile(`^(\d+)[.)]?\s`)
	commentsAt = regexp.MustCompile(`(?s)<!--.*?-->`)
)

type Section struct {
	Header string
	Level  int
	Line   int
	Own    []string
}

type Front struct {
	Stands   bool
	Said     *yaml.Doc
	Lines    map[string]int
	LineKeys []string
	// The row of the closing fence, counted from zero. [[spec/design_input/the-editor-draws-the-ticket#one-file-holds-both-halves]]
	Close int
}

type Note struct {
	Front    Front
	Sections []Section
}

func readNote(text string) Note {
	rows := yaml.SplitLines(text)
	return Note{Front: frontOf(rows), Sections: sectionsOf(rows)}
}

func frontOf(rows []string) Front {
	blank := Front{Said: yaml.New(), Lines: map[string]int{}}
	if len(rows) == 0 || strings.TrimSpace(rows[0]) != "---" {
		return blank
	}
	close := -1
	for i := 1; i < len(rows); i++ {
		if strings.TrimSpace(rows[i]) == "---" {
			close = i
			break
		}
	}
	if close < 0 {
		return blank
	}

	held := rows[1:close]
	lines := map[string]int{}
	order := []string{}
	for i, line := range held {
		pair := yaml.PairAt.FindStringSubmatch(line)
		if pair == nil {
			continue
		}
		if where := yaml.FirstWord.FindStringIndex(line); where == nil || where[0] != 0 {
			continue
		}
		key := strings.TrimSpace(pair[1])
		if _, twice := lines[key]; !twice {
			order = append(order, key)
		}
		lines[key] = i + 2
	}

	said := yaml.AsDoc(yaml.Read(strings.Join(held, "\n")))
	if said == nil {
		said = yaml.New()
	}
	return Front{Stands: true, Said: said, Lines: lines, LineKeys: order, Close: close}
}

func sectionsOf(rows []string) []Section {
	out := []Section{}
	fenced := false
	for i, line := range rows {
		if fenceAt.MatchString(line) {
			fenced = !fenced
			continue
		}
		if fenced {
			continue
		}
		if found := headingAt.FindStringSubmatch(line); found != nil {
			out = append(out, Section{Header: found[2], Level: len(found[1]), Line: i + 1})
			continue
		}
		if len(out) > 0 {
			out[len(out)-1].Own = append(out[len(out)-1].Own, line)
		}
	}
	return out
}

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
