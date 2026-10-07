// The measure's score and its tables: the findings a thousand words, the rules
// ranked by fires, the TOTAL row, and the tables padded as the JavaScript pads.
// [[spec/design_output/projection#the-second-target]]
package voice

import (
	"fmt"
	"math"
	"slices"
	"sort"
	"strconv"
	"strings"
)

const (
	half = 0.5
)

// The findings a thousand words, to one place, rounding half up as Math.round does. [[spec/design_output/projection#the-second-target]]
func ScoreOf(words, findings int) float64 {
	if words == 0 {
		return 0
	}
	return jsRound(float64(findings)/float64(words)*per*tenths) / tenths
}

// Math.round: the nearest integer, a half rounding up. [[spec/design_output/projection#the-second-target]]
func jsRound(x float64) float64 {
	down := math.Floor(x)
	if x-down >= half {
		return down + 1
	}
	return down
}

// A rule's leaf: the name past its last dot, so a style prefix drops off. [[spec/design_output/projection#the-second-target]]
func LeafOf(said string) string {
	flat := jsTrim(said)
	if at := strings.LastIndex(flat, "."); at >= 0 {
		return flat[at+1:]
	}
	return flat
}

// The rules ranked by how often each fires, a tie in localeCompare order. [[spec/design_output/projection#the-second-target]]
func RuleCounts(found []Finding) []Count {
	out := []Count{}
	at := map[string]int{}
	for _, one := range found {
		rule := LeafOf(one.Rule)
		if rule == "" {
			continue
		}
		if i, ok := at[rule]; ok {
			out[i].N++
			continue
		}
		at[rule] = len(out)
		out = append(out, Count{rule, 1})
	}
	sort.SliceStable(out, func(a, b int) bool {
		if out[a].N != out[b].N {
			return out[a].N > out[b].N
		}
		return localeCompare(out[a].Rule, out[b].Rule) < 0
	})
	return out
}

// The measure rows: each file's words, findings, score and top rules. [[spec/design_output/projection#the-second-target]]
func MeasuredRows(files []Scored) []ScoreRow {
	out := make([]ScoreRow, 0, len(files))
	for _, one := range files {
		counts := RuleCounts(one.Found)
		out = append(out, ScoreRow{
			File:     one.File,
			Words:    one.Words,
			Findings: len(one.Found),
			Score:    ScoreOf(one.Words, len(one.Found)),
			Top:      counts[:min(top, len(counts))],
		})
	}
	return out
}

// The TOTAL row: the words and findings summed, and their score. [[spec/design_output/projection#the-second-target]]
func TotalOf(rows []ScoreRow) ScoreRow {
	words, findings := 0, 0
	for _, one := range rows {
		words += one.Words
		findings += one.Findings
	}
	return ScoreRow{File: "TOTAL", Words: words, Findings: findings, Score: ScoreOf(words, findings), Top: []Count{}}
}

// A table: each column padded to its widest cell in UTF-16 units, the right columns padded on the left, each line trimmed at its end. [[spec/design_output/projection#the-second-target]]
func Tabled(head []string, rows [][]string, right []int) string {
	all := append([][]string{head}, rows...)
	wide := make([]int, len(head))
	for i := range head {
		for _, row := range all {
			if i < len(row) {
				wide[i] = max(wide[i], units(row[i]))
			}
		}
	}
	drawn := make([]string, 0, len(all))
	for _, row := range all {
		cells := make([]string, 0, len(row))
		for i, one := range row {
			pad := ""
			if i < len(wide) {
				pad = strings.Repeat(" ", max(0, wide[i]-units(one)))
			}
			if slices.Contains(right, i) {
				cells = append(cells, pad+one)
			} else {
				cells = append(cells, one+pad)
			}
		}
		drawn = append(drawn, strings.TrimRightFunc(strings.Join(cells, "  "), jsSpace))
	}
	return strings.Join(drawn, "\n")
}

// The measure table: file, words, findings, score to one place, and the top rules. [[spec/design_output/projection#the-second-target]]
func MeasureTable(rows []ScoreRow) string {
	shownRows := make([][]string, 0, len(rows))
	for _, one := range rows {
		tops := make([]string, 0, len(one.Top))
		for _, count := range one.Top {
			tops = append(tops, fmt.Sprintf("%s %d", count.Rule, count.N))
		}
		shownRows = append(shownRows, []string{
			one.File, strconv.Itoa(one.Words), strconv.Itoa(one.Findings),
			strconv.FormatFloat(one.Score, 'f', 1, floatBits), strings.Join(tops, ", "),
		})
	}
	return Tabled(heads, shownRows, numeric)
}

// The refused table: rule, fires and phrase. [[spec/design_output/projection#the-second-target]]
func RefusedTable(ranked []Refusal) string {
	shownRows := make([][]string, 0, len(ranked))
	for _, one := range ranked {
		shownRows = append(shownRows, []string{one.Rule, strconv.Itoa(one.Fires), one.Phrase})
	}
	return Tabled([]string{"rule", "fires", "phrase"}, shownRows, []int{1})
}
