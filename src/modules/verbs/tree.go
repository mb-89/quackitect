// The tree verbs: every verb cli.js answers outside a topic, each standing as
// an action of the verb topic through the node module.
// [[spec/tickets/agents-call-quack-directly]]
package verbs

import "quackitect/src/q"

// The topic the tree verbs stand under, which names no word of their own. [[spec/tickets/agents-call-quack-directly]]
const TreeTopic = "verb"

// Every verb in help order with its usage line, the topics among them. [[spec/tickets/cli-js-leaves]]
var Commands = []Verb{}

// Every verb cli.js answers outside a topic, with its usage line as its doc. [[spec/tickets/agents-call-quack-directly]]
var TreeVerbs = []Verb{
	{Name: "check", Doc: "the tests, the doors, the server, then the rules over the tree"},
	{Name: "lint", Doc: "the rules over the tree, or over what you name"},
	{Name: "fix", Doc: "the fixes a program can make"},
	{Name: "test", Doc: "the tests alone, or the test files and Go folders you name"},
	{Name: "rules", Doc: "the mechanical rules Vale holds"},
	{Name: "standing", Doc: "what level zero hands the agent every session"},
	{Name: "doctor", Doc: "what is installed, and what level zero found"},
	{Name: "tools", Doc: "ask this box where every tool stands, and write it down"},
	{Name: "doors", Doc: "every door, and the contract test that holds it"},
	{Name: "project", Doc: "write every projection again, from the source it names"},
	{Name: "config", Doc: "every key, its value, and the layer answering it"},
	{Name: "cloud", Doc: "the cloud routine: trigger"},
	{Name: "dispatch", Doc: "the dispatcher's plan: --dry prints it, --json prints it as JSON, and --fire fires the workers"},
	{Name: "mint", Doc: "write a new note of a kind, in the shape its schema names"},
	{Name: "graph", Doc: "a process or a ticket, drawn as the graph the editor reads"},
	{Name: "probe", Doc: "measure the client itself: compact says what a compaction keeps"},
	{Name: "voice", Doc: "measure scores a folder, and refused ranks what the doors turn away"},
	{Name: "tui", Doc: "the window this tree builds, which holds a terminal, so a tool call answers with its refusal"},
	{Name: "log", Doc: "the session log, narrowed by span, level, kind and count"},
	{Name: "split", Doc: "cut a file past the ceiling into the targets you name, with one undo"},
	{Name: "commit", Doc: "read the message, land the commit, run the check, and push on green from a cloud box"},
	{Name: "push", Doc: "push the branch you stand on, once the check answers green on it"},
	{Name: "serve", Doc: "the server behind the bridgehead, which stands detached, so the call returns"},
	{Name: "find", Doc: "every line carrying the words, out of the index, or out of the session log with --log"},
	{Name: "notes", Doc: "the notes the words belong to, ranked by name and body"},
	{Name: "links", Doc: "what reaches a note, and what reaches nothing"},
	{Name: "index", Doc: "the index itself: standing, reindex, or same <path>"},
	{Name: "rename", Doc: "move a name and rewrite every reach: rename <from> <to>"},
}

// The module type of the tree verbs, each handing the verb and the caller's words to the node module. [[spec/tickets/agents-call-quack-directly]]
func Tree(verbs []Verb) func(*q.Catalog) q.Writer {
	return actions(verbs, func(verb string) []string { return []string{verb} })
}
