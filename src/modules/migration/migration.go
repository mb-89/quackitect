// The migration module: the switches of the migration's slices, each a shared
// key the default file alone sets, and nothing else.
// [[spec/design_output/model#config-comes-off-the-registrations]]
package migration

import "quackitect/src/q"

// The key of the open-tasks slice, by its local name. [[spec/tickets/open-tasks-run-in-shadow]]
const OpenTasksKey = "opentasks"

// The keys of the read-only topic slices, by their local names. [[spec/tickets/read-topics-land-in-shadow]]
const (
	ConfigKey   = "config"
	LogKey      = "log"
	GuidanceKey = "guidance"
	CheckKey    = "check"
	ProseKey    = "prose"
)

// The key of the verbs slice, the road ./RUNME.sh hands a verb down, by its local name. [[spec/tickets/runme-hands-verbs-to-quack]]
const VerbsKey = "verbs"

// Every slice this module switches, its built-in mode, and what each covers. The open-tasks slice stands switched over to new. [[spec/tickets/read-topics-land-in-shadow]]
var slices = []struct{ key, mode, doc string }{
	{OpenTasksKey, "new", "the open-tasks slice, switched over to new"},
	{ConfigKey, "old", "the config slice, every <instance>/config/ subtopic: old, shadow or new"},
	{LogKey, "old", "the log slice, the session rows and their level ladder: old, shadow or new"},
	{GuidanceKey, "old", "the guidance slice, the rules a step reads: old, shadow or new"},
	{CheckKey, "old", "the check slice, the check/ names and their twins: old, shadow or new"},
	{ProseKey, "old", "the prose slice, the prose checks in Go beside wink: old, shadow or new"},
	{VerbsKey, "old", "the verbs slice, the road ./RUNME.sh hands a verb down: old, shadow or new"},
}

// The module type the wiring loads as migration. It returns the first key's writer, which no caller reads. [[spec/tickets/open-tasks-run-in-shadow]]
func Registers(c *q.Catalog) q.Writer {
	var first q.Writer
	for i, one := range slices {
		writer := q.CfgIn(c, one.key, one.mode, q.Shared(), q.Doc(one.doc))
		if i == 0 {
			first = writer
		}
	}
	return first
}
