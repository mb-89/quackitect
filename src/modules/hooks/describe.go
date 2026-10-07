// The door's answer to a tool describe: the verb line the Bash description
// carries, off the tools the store lists.
// [[spec/design_output/bash#the-description-names-verbs]]
package hooks

import (
	"strings"

	"quackitect/src/q/tool"
)

// The event a describe posts, the tool whose description carries the line, and the field the answer names. [[spec/tickets/describe-answers-off-the-door]]
const (
	describeEvent = "tool.describe"
	describedTool = "Bash"
	description   = "description"
)

// The verbs the line names where the store lists no verb tool, and the verbs whose tools it recommends: a verb holding a terminal stays off. [[spec/tickets/verbline-spares-blocking-verbs]]
var (
	lineVerbs = []string{"check", "branch", "tui", "doctor"}
	toolVerbs = []string{"check", "branch", "doctor"}
)

// The verbs the line names where the store lists no verb tool. A stub until implement lands the copy. [[spec/tickets/cage-libs-leave]]
func LineVerbs() []string { return nil }

// The refusals the shell door makes, which close the line. [[spec/design_output/bash#the-description-names-verbs]]
const refusals = "Level zero refuses a shell write to a file the rules reach, a commit carrying " +
	"no message, a branch name past five words, a test run naming no file, a commit " +
	"whose delta carries something private, a revert or a reset over a pull commit, " +
	"and every git command that writes the repository, naming the verb standing for it."

// Answers a describe of Bash with the verb line, and nothing on any other tool. [[spec/tickets/describe-answers-off-the-door]]
func (d *Door) describes(post Post) (Effect, bool) {
	if post.Event != describeEvent {
		return Effect{}, false
	}
	if name, _ := post.E["tool"].(string); name != describedTool {
		return Effect{}, false
	}
	return Effect{Kind: afterKind, Name: description, Text: verbLine(d.toolNames())}, true
}

// The tool names the store lists, one an action it can call. [[spec/tickets/describe-answers-off-the-door]]
func (d *Door) toolNames() map[string]bool {
	names := map[string]bool{}
	store := d.from.Store
	if store == nil {
		return names
	}
	for _, action := range store.Names() {
		if _, _, ok := store.Types(action); ok {
			names[tool.NameOf(store, action)] = true
		}
	}
	return names
}

// The tool standing for a verb: its own under the verb topic, or its topic's where the verb names one. [[spec/tickets/agents-call-quack-directly]]
func toolOf(verb string, names map[string]bool) string {
	if names[tool.Prefix+"verb_"+verb] {
		return tool.Served + tool.Prefix + "verb_" + verb
	}
	for name := range names {
		if strings.HasPrefix(name, tool.Prefix+verb+"_") {
			return tool.Served + tool.Prefix + verb + "_<verb>"
		}
	}
	return ""
}

// The line the Bash description carries: the verb tools where the store lists them, the verbs otherwise, and the refusals. [[spec/design_output/bash#the-description-names-verbs]]
func verbLine(names map[string]bool) string {
	named := []string{}
	for _, verb := range toolVerbs {
		if one := toolOf(verb, names); one != "" {
			named = append(named, one)
		}
	}
	if len(named) > 0 {
		return "This tree answers its verbs as tools, and each one runs the checks that belong to it: " +
			strings.Join(named, ", ") + ". Reach for the tool before the shell. " + refusals
	}
	verbs := make([]string, len(lineVerbs))
	for i, verb := range lineVerbs {
		verbs[i] = "./RUNME.sh " + verb
	}
	return "This tree owns its own verbs, and each one runs the checks that belong to it: " +
		strings.Join(verbs, ", ") + ". Reach for the verb before the raw command. " + refusals
}
