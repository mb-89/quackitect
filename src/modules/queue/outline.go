// The queue as an outline, ported from src/scripts/pull-outline.js. A row at
// the left takes one number, a ticket under it a sub-number, and a person's row
// a negative number that sorts first.
// [[spec/tickets/the-queue-moves-to-plan]]
package queue

import (
	"sort"
	"strconv"

	"quackitect/src/ticket"
)

// The words a todo carries in place of a row's name, and the place of a row a cloud branch holds. [[spec/design_output/pull#the-queue-is-an-outline]]
const (
	First      = "first"
	Last       = "last"
	End        = "end"
	CloudPlace = "∞"
)

// A segment reads as a float of this width, the width a JavaScript number holds. [[spec/design_output/pull#the-queue-is-an-outline]]
const floatBits = 64

// The rows read both ways off one pass, and the best ordinal under each name once a walk settles it. [[spec/design_output/pull#the-queue-is-an-outline]]
type tree struct {
	parent  map[string]string
	under   map[string][]string
	todo    map[string]string
	ordinal map[string]int
	best    map[string]int
	settled map[string]bool
}

// The outline, a place a name. The person's list comes first and counts down, a row in hand stands at zero, the rest count up, and a row in no list takes no place. [[spec/design_output/pull#the-queue-is-an-outline]]
func Outline(persons, held, rest, all []Row, places map[string]string) map[string]string {
	ordinal := map[string]int{}
	for _, list := range [][]Row{persons, held, rest} {
		for _, one := range list {
			if _, stands := ordinal[one.Name]; !stands {
				ordinal[one.Name] = len(ordinal)
			}
		}
	}
	kids := treeOf(all, places, ordinal)
	roots := []string{}
	for _, one := range all {
		if _, under := kids.parent[one.Name]; under {
			continue
		}
		if _, stands := kids.bestUnder(one.Name, map[string]bool{}); stands {
			roots = append(roots, one.Name)
		}
	}
	ordered := kids.anchored(roots)
	out := map[string]string{}
	own := []string{}
	for _, name := range ordered {
		if kids.best[name] < len(persons) {
			own = append(own, name)
		}
	}
	for at, name := range own {
		kids.numberUnder(name, strconv.Itoa(at-len(own)), out)
	}
	inHand := len(persons) + len(held)
	count := 0
	for _, name := range ordered {
		switch best := kids.best[name]; {
		case best >= inHand:
			count++
			kids.numberUnder(name, strconv.Itoa(count), out)
		case best >= len(persons):
			kids.numberUnder(name, "0", out)
		}
	}
	return out
}

// A row names its group, and the override on this box stands over the row's own todo. [[spec/design_output/pull#a-todo-forces-a-place]]
func treeOf(all []Row, places map[string]string, ordinal map[string]int) *tree {
	names := map[string]bool{}
	for _, one := range all {
		names[one.Name] = true
	}
	kids := &tree{
		parent:  map[string]string{},
		under:   map[string][]string{},
		todo:    map[string]string{},
		ordinal: ordinal,
		best:    map[string]int{},
		settled: map[string]bool{},
	}
	for _, one := range all {
		kids.todo[one.Name] = one.Todo
		if said := places[one.Name]; said != "" {
			kids.todo[one.Name] = said
		}
		if one.Group == "" || one.Group == one.Name || !names[one.Group] {
			continue
		}
		kids.parent[one.Name] = one.Group
		kids.under[one.Group] = append(kids.under[one.Group], one.Name)
	}
	return kids
}

// The best ordinal in a subtree, which is what the subtree sorts by, and nothing where none of it stands in a list. [[spec/design_output/pull#the-queue-is-an-outline]]
func (kids *tree) bestUnder(name string, seen map[string]bool) (int, bool) {
	if kids.settled[name] {
		best, stands := kids.best[name]
		return best, stands
	}
	if seen[name] {
		return 0, false
	}
	seen[name] = true
	held, stands := kids.ordinal[name]
	for _, kid := range kids.under[name] {
		if said, found := kids.bestUnder(kid, seen); found && (!stands || said < held) {
			held, stands = said, true
		}
	}
	kids.settled[name] = true
	if stands {
		kids.best[name] = held
	}
	return held, stands
}

// One level in order: by the best ordinal, then each todo moved before the row it names, or to the front where it names none standing here. [[spec/design_output/pull#a-todo-forces-a-place]]
func (kids *tree) anchored(names []string) []string {
	order := append([]string{}, names...)
	sort.SliceStable(order, func(a, b int) bool { return kids.best[order[a]] < kids.best[order[b]] })
	named := func(name string) string { return kids.levelOf(kids.todo[name], names) }
	var moved, last, ends, fronts []string
	for _, name := range order {
		switch kids.todo[name] {
		case "":
			continue
		case Last:
			last = append(last, name)
		case End:
			ends = append(ends, name)
		default:
			if !holds(names, named(name)) {
				fronts = append(fronts, name)
				continue
			}
			moved = append(moved, name)
		}
	}
	for _, name := range fronts {
		order = without(order, name)
	}
	order = append(append([]string{}, fronts...), order...)
	for _, name := range last {
		order = without(order, name)
		at := len(order)
		for spot, one := range order {
			if kids.todo[one] == "" {
				at = spot
				break
			}
		}
		order = insertAt(order, at, name)
	}
	for _, name := range ends {
		order = append(without(order, name), name)
	}
	// A todo naming a row moves after that row settles, so one naming a todo lands right before it. [[spec/design_output/pull#a-todo-forces-a-place]]
	pending := moved
	for len(pending) > 0 {
		ready := []string{}
		for _, name := range pending {
			if !holds(pending, named(name)) {
				ready = append(ready, name)
			}
		}
		turn := ready
		if len(ready) == 0 {
			turn = pending
		}
		for _, name := range turn {
			order = without(order, name)
			order = insertAt(order, indexOf(order, named(name)), name)
		}
		if len(ready) == 0 {
			break
		}
		rest := []string{}
		for _, name := range pending {
			if !holds(ready, name) {
				rest = append(rest, name)
			}
		}
		pending = rest
	}
	return order
}

// The row of this level a todo's name stands under, so a todo naming a ticket inside a group lands before that group. [[spec/design_output/pull#the-queue-is-an-outline]]
func (kids *tree) levelOf(said string, names []string) string {
	name := said
	seen := map[string]bool{}
	for name != "" && !holds(names, name) && !seen[name] {
		seen[name] = true
		name = kids.parent[name]
	}
	return name
}

// A row takes its number, and its kids take the number, a dot and their own place under it. [[spec/design_output/pull#the-queue-is-an-outline]]
func (kids *tree) numberUnder(name, place string, out map[string]string) {
	out[name] = place
	under := []string{}
	for _, kid := range kids.under[name] {
		if _, stands := kids.best[kid]; stands {
			under = append(under, kid)
		}
	}
	for at, kid := range kids.anchored(under) {
		kids.numberUnder(kid, place+"."+strconv.Itoa(at+1), out)
	}
}

// Two places compare segment by segment as numbers, so -2 stands before 1, and 1.2 before 1.10. [[spec/design_output/pull#the-queue-is-an-outline]]
func Compare(left, right string) int { return ticket.ComparePlaces(left, right) }

func holds(list []string, name string) bool {
	return indexOf(list, name) >= 0
}

func indexOf(list []string, name string) int {
	for at, one := range list {
		if one == name {
			return at
		}
	}
	return -1
}

func without(list []string, name string) []string {
	at := indexOf(list, name)
	if at < 0 {
		return list
	}
	return append(append([]string{}, list[:at]...), list[at+1:]...)
}

// An index counting back from the end where it reads below zero, the way a JavaScript splice takes one. [[spec/tickets/the-queue-moves-to-plan]]
func insertAt(list []string, at int, name string) []string {
	if at < 0 {
		at = max(0, len(list)+at)
	}
	at = min(at, len(list))
	out := append([]string{}, list[:at]...)
	out = append(out, name)
	return append(out, list[at:]...)
}
