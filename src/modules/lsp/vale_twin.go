// Vale's captured answer as findings, which the check's Vale twin reads
// beside the JavaScript side until that twin leaves.
// [[spec/tickets/vale-leaves-the-tree]]
package lsp

import (
	"encoding/json"
	"regexp"
	"sort"
	"strings"
)

// The source a Vale row stands under. [[spec/tickets/the-lsp-server-leaves]]
const fromVale = "vale"

var valeCode = regexp.MustCompile(`^E\d+$`)

// Vale's answer as findings, and the fault it names in place of them. The shape follows fromJson and faultIn in .claude/skills/level0/lib/vale.js. [[spec/tickets/the-lsp-server-leaves]]
func (one *Tools) ValeRows(stdout string) ([]Finding, string) {
	if strings.TrimSpace(stdout) == "" {
		return []Finding{}, ""
	}
	var fault struct {
		Code string `json:"Code"`
		Text string `json:"Text"`
	}
	if json.Unmarshal([]byte(stdout), &fault) == nil && valeCode.MatchString(fault.Code) {
		first, _, _ := strings.Cut(fault.Text, "\n")
		return nil, strings.TrimSpace(fault.Code + " " + strings.TrimSpace(first))
	}
	var read map[string]json.RawMessage
	if json.Unmarshal([]byte(stdout), &read) != nil {
		return nil, "vale answered something other than JSON"
	}
	out := []Finding{}
	for file, raw := range read {
		var rows []struct {
			Check    string `json:"Check"`
			Line     int    `json:"Line"`
			Span     []int  `json:"Span"`
			Message  string `json:"Message"`
			Severity string `json:"Severity"`
		}
		if json.Unmarshal(raw, &rows) != nil {
			continue
		}
		path := strings.TrimPrefix(one.Check.Relative(one.Root, file), "./")
		for _, row := range rows {
			said := Finding{File: path, Rule: RuleOf(row.Check), Line: max(row.Line, 1), Column: 1, Message: row.Message, Severity: row.Severity, Source: fromVale}
			if len(row.Span) > 0 {
				said.Column = row.Span[0]
			}
			if said.Severity == "" {
				said.Severity = severe
			}
			out = append(out, said)
		}
	}
	sort.SliceStable(out, func(a, b int) bool {
		if out[a].File != out[b].File {
			return out[a].File < out[b].File
		}
		if out[a].Line != out[b].Line {
			return out[a].Line < out[b].Line
		}
		return out[a].Column < out[b].Column
	})
	return out, ""
}
