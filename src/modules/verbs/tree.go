// The verb table: every verb in help order, and the tree verbs among them,
// each standing as an action of the verb topic through the node module.
// [[spec/tickets/cli-js-leaves]]
package verbs

import "quackitect/src/q"

// The topic the tree verbs stand under, which names no word of their own. [[spec/tickets/agents-call-quack-directly]]
const TreeTopic = "verb"

// The verbs that stand as topics of their own, and so as no tree verb. [[spec/tickets/agents-call-quack-directly]]
var topics = map[string]bool{"branch": true, "ticket": true, "retro": true, "vehicle": true, "stub": true}

// Every verb in help order with its usage line, the topics among them. Each registers in Go. [[spec/tickets/program-of-drops-node]]
var Commands = []Verb{
	{Name: "check", Doc: "the tests, the doors, the server, then the rules over the tree"},
	{Name: "lint", Doc: "the rules over the tree, or over what you name"},
	{Name: "fix", Doc: "the fixes a program can make"},
	{Name: "test", Doc: "the tests alone, or the test files and Go folders you name"},
	{Name: "rules", Doc: "the mechanical rules Vale holds"},
	{Name: "standing", Doc: "what level zero hands the agent every session"},
	{Name: "doctor", Doc: "what is installed, and what level zero found"},
	{Name: "tools", Doc: "ask this box where every tool stands, and write it down"},
	{Name: "setup", Doc: "the install's steps that run JavaScript: the editor, the browser, the survey, the Copilot setup and the brand"},
	{Name: "doors", Doc: "every door, and the contract test that holds it"},
	{Name: "guards", Doc: "every guard over the tracked tree against its baseline, and --update writes each baseline again"},
	{Name: "project", Doc: "write every projection again, from the source it names"},
	{Name: "config", Doc: "every key, its value, and the layer answering it"},
	{Name: "branch", Doc: "work branches and groups: new, take, sync, done, list, merge, close, test"},
	{Name: "cloud", Doc: "the cloud routine: trigger"},
	{Name: "dispatch", Doc: "the dispatcher's plan: --dry prints it, --json prints it as JSON, and --fire fires the workers"},
	{Name: "ticket", Doc: "tickets: pull, note, update, open, todo, route, yours, fill"},
	{Name: "retro", Doc: "the retro a group's route runs: notes"},
	{Name: "mint", Doc: "write a new note of a kind, in the shape its schema names"},
	{Name: "graph", Doc: "a process or a ticket, drawn as the graph the editor reads"},
	{Name: "probe", Doc: "measure the client itself: compact says what a compaction keeps"},
	{Name: "voice", Doc: "measure scores a folder, and refused ranks what the doors turn away"},
	{Name: "tui", Doc: "the window this tree builds, which holds a terminal, so a tool call answers with its refusal"},
	{Name: "log", Doc: "the session log, narrowed by span, level, kind and count"},
	{Name: "failure", Doc: "failures by id: raise one, write a new node, count them in the session log"},
	{Name: "split", Doc: "cut a file past the ceiling into the targets you name, with one undo"},
	{Name: "commit", Doc: "read the message, land the commit, run the check, and push on green from a cloud box"},
	{Name: "push", Doc: "push the branch you stand on, once the check answers green on it"},
	{Name: "serve", Doc: "the server behind the bridgehead, which stands detached, so the call returns"},
	{Name: "find", Doc: "every line carrying the words, out of the index, or out of the session log with --log"},
	{Name: "vehicle", Doc: "this vehicle, the project it drives, and a vehicle made elsewhere"},
	{Name: "stub", Doc: "a bare project this vehicle drives: into <folder> [--upstream <url>]"},
	{Name: "notes", Doc: "the notes the words belong to, ranked by name and body"},
	{Name: "links", Doc: "what reaches a note, and what reaches nothing"},
	{Name: "index", Doc: "the index itself: standing, reindex, or same <path>"},
	{Name: "rename", Doc: "move a name and rewrite every reach: rename <from> <to>"},
}

// Every verb of the table outside a topic, with its usage line as its doc. [[spec/tickets/cli-js-leaves]]
var TreeVerbs = lessTopics(Commands)

func lessTopics(all []Verb) []Verb {
	var out []Verb
	for _, one := range all {
		if !topics[one.Name] {
			out = append(out, one)
		}
	}
	return out
}

// The module type of the tree verbs, each handing the verb and the caller's words to the node module. [[spec/tickets/agents-call-quack-directly]]
func Tree(verbs []Verb) func(*q.Catalog) q.Writer {
	return actions(verbs, func(verb string) []string { return []string{verb} })
}
