// The fixes the rules offer, applied: each replace action rewrites the text it
// matched, so a fixer needs no outside tool.
// [[spec/tickets/vale-leaves-the-tree]]
package rules

import (
	"sort"
	"strings"
	"unicode/utf8"
)

// One swap a finding makes: its byte offsets into the text, and what stands there after. [[spec/tickets/vale-leaves-the-tree]]
type swap struct {
	begin, end int
	said       string
}

// The text with each finding's replace action applied, the first choice taken. A finding with no action, or whose match no longer stands at its line and span, leaves the text, and a swap overlapping a later one gives way. [[spec/tickets/vale-leaves-the-tree]]
func Apply(text string, found []Finding) string {
	starts := lineStarts(text)
	var swaps []swap
	for _, one := range found {
		if one.Action == nil || one.Action.Name != ActionReplace || len(one.Action.Params) == 0 || one.Match == "" {
			continue
		}
		if begin, ok := offsetOf(text, starts, one.Line, one.Span[0]); ok && strings.HasPrefix(text[begin:], one.Match) {
			swaps = append(swaps, swap{begin, begin + len(one.Match), one.Action.Params[0]})
		}
	}
	sort.SliceStable(swaps, func(a, b int) bool { return swaps[a].begin > swaps[b].begin })
	limit := len(text)
	for _, one := range swaps {
		if one.end > limit {
			continue
		}
		text = text[:one.begin] + one.said + text[one.end:]
		limit = one.begin
	}
	return text
}

// The byte offset a line and a rune column name, and whether the line holds that column. [[spec/tickets/vale-leaves-the-tree]]
func offsetOf(text string, starts []int, line, column int) (int, bool) {
	if line < 1 || line > len(starts) || column < 1 {
		return 0, false
	}
	at := starts[line-1]
	for range column - 1 {
		if at >= len(text) || text[at] == '\n' {
			return 0, false
		}
		_, size := utf8.DecodeRuneInString(text[at:])
		at += size
	}
	return at, true
}
