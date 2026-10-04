// A note's rules as a hand reads them, which the branch guidance verb prints
// off the one reader the standing layer reads.
// [[spec/design_output/level0#the-examples-ride-the-rules]]
package brief

import "strconv"

// A note's rules, numbered, and its Examples table under them. [[spec/design_output/level0#the-examples-ride-the-rules]]
func RulesOf(text string) []string {
	var out []string
	for at, one := range actionables(text) {
		out = append(out, strconv.Itoa(at+1)+". "+one)
	}
	if shown := examplesOf(text); len(shown) > 0 {
		out = append(append(out, ""), shown...)
	}
	return out
}
