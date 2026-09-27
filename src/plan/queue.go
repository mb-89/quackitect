// The queue's score, ported from src/scripts/pull-queue.js. The mark stands
// over the score, and the score weighs what waits under a row, how long it
// stands and how often a hand failed on it. A caller hands the rows in, so the
// order reads no git and no file.
// [[spec/tickets/the-queue-moves-to-plan]]
package plan

import (
	"sort"
	"strings"
)

// The weights the config names, and the units the clock and the git log count in. [[spec/design_output/pull#the-queue-is-a-score]]
const (
	blockWeight = "block"
	dayWeight   = "day"
	failWeight  = "fail"
	msASecond   = 1000
	secondsADay = 86400
)

// A row as the queue reads it off a ticket or a todo. [[spec/tickets/the-queue-moves-to-plan]]
type Row struct {
	Name      string   `json:"name"`
	Path      string   `json:"path"`
	Group     string   `json:"group"`
	Todo      string   `json:"todo"`
	Urgent    bool     `json:"urgent"`
	DependsOn []string `json:"depends_on"`
	Fails     int      `json:"fails"`
	Order     int      `json:"order"`
}

// What a score reads past the rows: the clock in milliseconds, the weights the config holds, and the second each path came in. [[spec/tickets/the-queue-moves-to-plan]]
type At struct {
	Now     int64              `json:"now"`
	Weights map[string]float64 `json:"weights"`
	Stood   map[string]int64   `json:"stood"`
}

type scored struct {
	one   Row
	mark  bool
	score float64
}

// The mark stands over the score, the score over the plan's order, and the name breaks what ties. [[spec/design_output/pull#the-queue-is-a-score]]
func Queued(list, all []Row, at At) []Row {
	waits := waitsUnder(all)
	rows := make([]scored, 0, len(list))
	for _, one := range list {
		rows = append(rows, scored{one: one, mark: one.Urgent, score: scoreOf(one, waits, at)})
	}
	sort.SliceStable(rows, func(a, b int) bool {
		left, right := rows[a], rows[b]
		switch {
		case left.mark != right.mark:
			return left.mark
		case left.score != right.score:
			return left.score > right.score
		case left.one.Order != right.one.Order:
			return left.one.Order < right.one.Order
		}
		return compareNames(left.one.Name, right.one.Name) < 0
	})
	out := make([]Row, 0, len(rows))
	for _, one := range rows {
		out = append(out, one.one)
	}
	return out
}

// The sum of the terms, in the weights the config holds. [[spec/design_output/pull#the-queue-is-a-score]]
func scoreOf(one Row, waits map[string][]string, at At) float64 {
	return at.Weights[blockWeight]*float64(chainUnder(one.Name, waits, map[string]bool{one.Name: true})) +
		at.Weights[dayWeight]*float64(daysStood(at.Stood[one.Path], at.Now)) +
		at.Weights[failWeight]*float64(one.Fails)
}

// Every row waiting on each one, read straight off its waits. [[spec/design_output/pull#the-queue-is-a-score]]
func waitsUnder(all []Row) map[string][]string {
	out := map[string][]string{}
	for _, one := range all {
		for _, dep := range one.DependsOn {
			out[dep] = append(out[dep], one.Name)
		}
	}
	return out
}

// The walk reaches the whole chain, so a blocker of a blocker counts. [[spec/design_output/pull#the-queue-is-a-score]]
func chainUnder(name string, waits map[string][]string, seen map[string]bool) int {
	count := 0
	for _, one := range waits[name] {
		if seen[one] {
			continue
		}
		seen[one] = true
		count += 1 + chainUnder(one, waits, seen)
	}
	return count
}

// The whole days since a path came in, and none where either end reads nothing. [[spec/design_output/pull#the-queue-is-a-score]]
func daysStood(since, now int64) int64 {
	if since == 0 || now == 0 {
		return 0
	}
	return max(0, (now/msASecond-since)/secondsADay)
}

// A tie reads the name the way localeCompare reads the tree's names: the letters whatever their case, then a small letter before its capital. [[spec/tickets/the-queue-moves-to-plan]]
func compareNames(left, right string) int {
	if said := strings.Compare(strings.ToLower(left), strings.ToLower(right)); said != 0 {
		return said
	}
	return strings.Compare(right, left)
}
