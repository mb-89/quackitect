// A markdown table in a detail draws as a grid, and a grid wider than the pane
// draws one card a row, so no pipe or dash wraps into the prose around it.
// [[spec/design_output/tui#a-table-draws-a-grid]]

package draw

import "strings"

const (
	// The rows a block holds at least to read as a table: the header and the rule under it. [[spec/design_output/tui#a-table-draws-a-grid]]
	tableLeastRows = 2
	// The room between two cells of a grid, as " │ " takes it. [[spec/design_output/tui#a-table-draws-a-grid]]
	cellGap = 3
)

// Every table block among the lines drawn at the width, and every other line as it stands. [[spec/design_output/tui#a-table-draws-a-grid]]
func tabled(lines []string, width int) []string {
	var out []string
	for at := 0; at < len(lines); {
		end := at
		for end < len(lines) && piped(lines[end]) {
			end++
		}
		if end-at >= tableLeastRows && ruled(lines[at+1]) {
			out = append(out, drawTable(lines[at:end], width)...)
			at = end
			continue
		}
		if end == at {
			end = at + 1
		}
		out = append(out, lines[at:end]...)
		at = end
	}
	return out
}

func piped(line string) bool {
	return strings.HasPrefix(strings.TrimSpace(line), "|")
}

// The row under a header: pipes, dashes, colons and spaces alone. [[spec/design_output/tui#a-table-draws-a-grid]]
func ruled(line string) bool {
	body := strings.TrimSpace(line)
	return strings.Contains(body, "-") && strings.Trim(body, "|-: ") == ""
}

// The cells of a row, with an escaped pipe kept inside its cell. [[spec/design_output/tui#a-table-draws-a-grid]]
func cellsOf(line string) []string {
	body := strings.TrimSpace(line)
	body = strings.TrimPrefix(body, "|")
	if strings.HasSuffix(body, "|") && !strings.HasSuffix(body, `\|`) {
		body = body[:len(body)-1]
	}
	var out []string
	var cur strings.Builder
	for at := 0; at < len(body); at++ {
		if body[at] == '\\' && at+1 < len(body) && body[at+1] == '|' {
			cur.WriteByte('|')
			at++
			continue
		}
		if body[at] == '|' {
			out = append(out, strings.TrimSpace(cur.String()))
			cur.Reset()
			continue
		}
		cur.WriteByte(body[at])
	}
	return append(out, strings.TrimSpace(cur.String()))
}

func drawTable(block []string, width int) []string {
	head := cellsOf(block[0])
	var rows [][]string
	for _, line := range block[2:] {
		rows = append(rows, cellsOf(line))
	}
	wide := make([]int, len(head))
	for _, row := range append([][]string{head}, rows...) {
		for at := range wide {
			if at < len(row) {
				wide[at] = max(wide[at], runes(row[at]))
			}
		}
	}
	total := cellGap * (len(wide) - 1)
	for _, one := range wide {
		total += one
	}
	if total <= width {
		return grid(head, rows, wide)
	}
	return cards(head, rows)
}

// Every cell padded to its column, a bar between two, and a rule under the header. [[spec/design_output/tui#a-table-draws-a-grid]]
func grid(head []string, rows [][]string, wide []int) []string {
	line := func(row []string) string {
		cells := make([]string, len(wide))
		for at := range wide {
			cell := ""
			if at < len(row) {
				cell = row[at]
			}
			cells[at] = cell + strings.Repeat(" ", wide[at]-runes(cell))
		}
		return strings.TrimRight(strings.Join(cells, " │ "), " ")
	}
	rule := make([]string, len(wide))
	for at, one := range wide {
		rule[at] = strings.Repeat("─", one)
	}
	out := []string{line(head), strings.Join(rule, "─┼─")}
	for _, row := range rows {
		out = append(out, line(row))
	}
	return out
}

// One card a row: each cell under its header's name, two spaces between, so a long value wraps under itself. [[spec/design_output/tui#a-table-draws-a-grid]]
func cards(head []string, rows [][]string) []string {
	wide := 0
	for _, one := range head {
		wide = max(wide, runes(one))
	}
	var out []string
	for at, row := range rows {
		if at > 0 {
			out = append(out, "")
		}
		for col, name := range head {
			cell := ""
			if col < len(row) {
				cell = row[col]
			}
			label := name
			if label == "" {
				label = "-"
			}
			out = append(out, label+strings.Repeat(" ", wide-runes(label)+2)+cell)
		}
	}
	return out
}

func runes(text string) int {
	return len([]rune(text))
}
