// What a note reads as: the frontmatter, and the chapters under it. A fence
// parks everything inside it, so a heading in a code block names no chapter.
// A pure package, so the check module and the tickets module read one shape.
// [[spec/design_output/schema#what-a-note-reads-as]]
package note

import (
	"regexp"
	"strings"

	"quackitect/src/yaml"
)

var (
	headingAt = regexp.MustCompile(`^(#{1,6})\s+(.+?)\s*$`)
	FenceAt   = regexp.MustCompile("^\\s*(?:```|~~~)")
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

// [[spec/design_output/schema#what-a-note-reads-as]]
func Read(text string) Note {
	rows := yaml.SplitLines(text)
	return Note{Front: FrontOf(rows), Sections: SectionsOf(rows)}
}

// [[spec/design_output/schema#what-a-note-reads-as]]
func FrontOf(rows []string) Front {
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

// [[spec/design_output/schema#what-a-note-reads-as]]
func SectionsOf(rows []string) []Section {
	out := []Section{}
	fenced := false
	for i, line := range rows {
		if FenceAt.MatchString(line) {
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

// The section a step's chapter opens on, one heading level a step deep, or -1, the rule sectionAt in .claude/skills/level0/lib/schema-read.js holds. [[spec/tickets/the-lens-reads-v1]]
func SectionAt(sections []Section, path string) int {
	parts := strings.Split(path, "/")
	from, found := 0, -1
	for depth, part := range parts {
		level := depth + 1
		found = -1
		for i := from; i < len(sections); i++ {
			if sections[i].Level < level && i > from {
				break
			}
			if sections[i].Level == level && sections[i].Header == part {
				found = i
				break
			}
		}
		if found < 0 {
			return -1
		}
		from = found + 1
	}
	return found
}
