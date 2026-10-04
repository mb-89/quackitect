// A note's rules as the pull prints them under a step: numbered as the note
// numbers them, its Examples table under them, off rulesOf in
// .claude/skills/level0/lib/guidance.js.
// [[spec/design_output/level0#the-examples-ride-the-rules]]
package brief

import "strconv"

// [[spec/design_output/level0#the-examples-ride-the-rules]]
func RulesOf(text string) []string {
	rules := actionables(text)
	out := make([]string, 0, len(rules))
	for i, one := range rules {
		out = append(out, strconv.Itoa(i+1)+". "+one)
	}
	if shown := examplesOf(text); len(shown) > 0 {
		out = append(append(out, ""), shown...)
	}
	return out
}
