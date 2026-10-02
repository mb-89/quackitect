// The stop rules, read off the files under spec/config/stop the way
// .claude/skills/level0/lib/rulefile.js and pool in lib/stop.js read them: a
// rule it cannot read stands out of the vote.
// [[spec/tickets/cage-stop-rules-port]]
package stop

import (
	"fmt"
	"regexp"
	"strconv"
	"strings"
)

// The folder the rules stand in, the sides a rule takes, and what decides it. [[spec/design_output/stop#where-the-rules-live]]
const (
	Rules      = "spec/config/stop"
	RuleEnd    = ".yml"
	StopSide   = "stop"
	GoSide     = "continue"
	Claimed    = "claimed"
	Mechanical = "mechanical"
	ownerWaits = "owner"
)

// The lines a rule file opens an entry with, carries a list item on, and pairs a key with. [[spec/design_output/stop#where-the-rules-live]]
var (
	lineEnd  = regexp.MustCompile(`\r?\n`)
	trailing = regexp.MustCompile(`\s+$`)
	lead     = regexp.MustCompile(`^\s{0,2}`)
	opens    = regexp.MustCompile(`^-\s+(\S.*)$`)
	item     = regexp.MustCompile(`^\s*-\s+(.*)$`)
	pair     = regexp.MustCompile(`^([A-Za-z_][A-Za-z0-9_]*):\s*(.*)$`)
	whole    = regexp.MustCompile(`^-?\d+$`)
)

// One rule of the vote. [[spec/design_output/stop#where-the-rules-live]]
type Rule struct {
	ID       string `json:"id"`
	Side     string `json:"side"`
	Priority int    `json:"priority"`
	Decides  string `json:"decides"`
	Runs     string `json:"runs,omitempty"`
	Asks     string `json:"asks,omitempty"`
	Says     string `json:"says,omitempty"`
	Waits    string `json:"waits,omitempty"`
	Yields   bool   `json:"yields,omitempty"`
	Beside   bool   `json:"beside,omitempty"`
}

// One rule file: its name and its text. [[spec/design_output/stop#where-the-rules-live]]
type File struct {
	Name string
	Text string
}

// Every rule the files hold, in file order, and the name of each file holding a rule it cannot read or none, as pool does. [[spec/design_output/stop#where-the-rules-live]]
func Pool(files []File) ([]Rule, []string) {
	var rules []Rule
	var broken []string
	for _, one := range files {
		said, faults := RulesOf(one.Text)
		if faults > 0 || len(said) == 0 {
			broken = append(broken, one.Name)
		}
		rules = append(rules, said...)
	}
	return rules, broken
}

// The whole rules one file holds, and the count of entries it cannot read. [[spec/design_output/stop#where-the-rules-live]]
func RulesOf(text string) ([]Rule, int) {
	var rules []Rule
	broken := 0
	for _, one := range entriesOf(text) {
		if rule, ok := ruleOf(one); ok {
			rules = append(rules, rule)
		} else {
			broken++
		}
	}
	return rules, broken
}

// The entries of a file, one a line opening on a dash, as readEntries reads them. [[spec/design_output/stop#where-the-rules-live]]
func entriesOf(text string) []map[string]any {
	var out []map[string]any
	var held []string
	flush := func() {
		if one := readRule(strings.Join(held, "\n")); len(one) > 0 {
			out = append(out, one)
		}
	}
	for _, raw := range lineEnd.Split(text, -1) {
		if found := opens.FindStringSubmatch(trailing.ReplaceAllString(raw, "")); found != nil {
			if len(held) > 0 {
				flush()
			}
			held = []string{found[1]}
			continue
		}
		if len(held) > 0 {
			held = append(held, lead.ReplaceAllString(raw, ""))
		}
	}
	if len(held) > 0 {
		flush()
	}
	return out
}

// One entry's keys: a scalar a key, or a list under a key naming no value, as readRule reads them. [[spec/design_output/stop#where-the-rules-live]]
func readRule(text string) map[string]any {
	out := map[string]any{}
	list := ""
	for _, raw := range lineEnd.Split(text, -1) {
		line := trailing.ReplaceAllString(raw, "")
		if strings.TrimSpace(line) == "" || strings.HasPrefix(strings.TrimSpace(line), "#") {
			continue
		}
		if found := item.FindStringSubmatch(line); found != nil && list != "" {
			out[list] = append(out[list].([]any), unquote(found[1]))
			continue
		}
		found := pair.FindStringSubmatch(line)
		if found == nil {
			continue
		}
		if strings.TrimSpace(found[2]) == "" {
			out[found[1]] = []any{}
			list = found[1]
			continue
		}
		list = ""
		out[found[1]] = valueOf(unquote(found[2]))
	}
	return out
}

func unquote(said string) string {
	t := strings.TrimSpace(said)
	if len(t) >= 2 && (t[0] == '"' && t[len(t)-1] == '"' || t[0] == '\'' && t[len(t)-1] == '\'') {
		return t[1 : len(t)-1]
	}
	return t
}

func valueOf(said string) any {
	switch {
	case said == "true":
		return true
	case said == "false":
		return false
	case whole.MatchString(said):
		if n, err := strconv.Atoi(said); err == nil {
			return n
		}
	}
	return said
}

// The rule an entry reads as, where it carries every key the vote needs, a side and a decider it knows, and a whole priority. [[spec/design_output/stop#where-the-rules-live]]
func ruleOf(one map[string]any) (Rule, bool) {
	for _, key := range []string{"id", "side", "priority", "decides"} {
		if said, ok := one[key]; !ok || said == "" {
			return Rule{}, false
		}
	}
	priority, ok := one["priority"].(int)
	rule := Rule{
		ID: textOf(one["id"]), Side: textOf(one["side"]), Priority: priority, Decides: textOf(one["decides"]),
		Runs: textOf(one["runs"]), Asks: textOf(one["asks"]), Says: textOf(one["says"]), Waits: textOf(one["waits"]),
		Yields: truthy(one["yields"]), Beside: truthy(one["beside"]),
	}
	if !ok || (rule.Side != StopSide && rule.Side != GoSide) || (rule.Decides != Claimed && rule.Decides != Mechanical) {
		return Rule{}, false
	}
	return rule, true
}

// A value as the bridge's String reads it, and nothing where the key stands nowhere. [[spec/tickets/cage-stop-rules-port]]
func textOf(said any) string {
	switch one := said.(type) {
	case nil:
		return ""
	case string:
		return one
	case []any:
		parts := make([]string, 0, len(one))
		for _, each := range one {
			parts = append(parts, textOf(each))
		}
		return strings.Join(parts, ",")
	}
	return fmt.Sprint(said)
}

// A value as the bridge's Boolean reads it. [[spec/tickets/cage-stop-rules-port]]
func truthy(said any) bool {
	switch one := said.(type) {
	case nil:
		return false
	case bool:
		return one
	case int:
		return one != 0
	case string:
		return one != ""
	}
	return true
}
