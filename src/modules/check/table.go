// The table a chapter holds, where its schema names one: the heads it opens
// with, and each row naming an item of the chapter it follows.
// [[spec/design_output/schema#a-chapter-holds-a-table]]
package check

import (
	"fmt"
	"regexp"
	"strconv"
	"strings"

	"quackitect/src/yaml"
)

var (
	tableRowAt  = regexp.MustCompile(`^\s*\|(.*)\|\s*$`)
	tableRuleAt = regexp.MustCompile(`^[\s|:-]+$`)
	wholeAt     = regexp.MustCompile(`^\d+$`)
)

// [[spec/design_output/schema#a-chapter-holds-a-table]]
func tableFaults(held standingAt, spec *yaml.Doc, note Note, where string) []Finding {
	heads := yaml.StringsOf(spec.Get("heads"))
	rows := tableRowsIn(held.Own)
	if len(rows) == 0 {
		return []Finding{schemaFault(held.Header, where, held.Line,
			fmt.Sprintf("%s holds a table headed %s.", held.Header, strings.Join(heads, ", ")))}
	}
	out := []Finding{}
	if len(heads) > 0 && strings.Join(cellsOf(rows[0].said), "|") != strings.Join(heads, "|") {
		out = append(out, schemaFault(held.Header, where, held.Line+rows[0].line,
			fmt.Sprintf("The table under %s opens with the heads %s.", held.Header, strings.Join(heads, ", "))))
	}
	namesOf := yaml.AsString(spec.Get("namesOf"))
	if namesOf == "" {
		return out
	}
	items := 0
	for _, one := range note.Sections {
		if one.Header == namesOf && one.Level == held.Level {
			items = len(itemsIn(one.Own))
			break
		}
	}
	last := 0
	for _, row := range rows[1:] {
		first := "nothing"
		if cells := cellsOf(row.said); cells[0] != "" {
			first = cells[0]
		}
		number := 0
		if wholeAt.MatchString(first) {
			number, _ = strconv.Atoi(first)
		}
		if number < 1 || number > items {
			out = append(out, schemaFault(held.Header, where, held.Line+row.line,
				fmt.Sprintf("A row of %s opens with the number of an item of %s, and this one opens with %s.", held.Header, namesOf, first)))
			continue
		}
		if number < last {
			out = append(out, schemaFault(held.Header, where, held.Line+row.line,
				fmt.Sprintf("A row of %s for item %d stands after one for item %d, and the numbers run up.", held.Header, number, last)))
		}
		last = number
	}
	return out
}

// The rows of the table a chapter holds, with the rule line under the head out. [[spec/design_output/schema#a-chapter-holds-a-table]]
func tableRowsIn(rows []string) []item {
	out := []item{}
	fenced := false
	for i, row := range rows {
		if fenceAt.MatchString(row) {
			fenced = !fenced
			continue
		}
		if fenced || !tableRowAt.MatchString(row) || tableRuleAt.MatchString(row) {
			continue
		}
		out = append(out, item{said: row, line: i + 1})
	}
	return out
}

func cellsOf(row string) []string {
	found := tableRowAt.FindStringSubmatch(row)
	if found == nil {
		return []string{""}
	}
	out := []string{}
	for _, one := range strings.Split(found[1], "|") {
		out = append(out, strings.TrimSpace(one))
	}
	return out
}
