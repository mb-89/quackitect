// The migration module: the switches of the migration's slices, each a shared
// key the default file alone sets, and nothing else.
// [[spec/design_output/model#config-comes-off-the-registrations]]
package migration

import "quackitect/src/q"

// The key of the open-tasks slice, by its local name. [[spec/tickets/open-tasks-run-in-shadow]]
const OpenTasksKey = "opentasks"

// The module type the wiring loads as migration. [[spec/tickets/open-tasks-run-in-shadow]]
func Registers(c *q.Catalog) q.Writer {
	return q.CfgIn(c, OpenTasksKey, "new", q.Shared(), q.Doc("the open-tasks slice, switched over to new"))
}
