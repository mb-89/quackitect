// The queue module: the plan the engine writes, a loaded projection of
// files/ under queue/.
// [[spec/design_output/model#everything-on-disk-mirrors]]
package queue

import "quackitect/src/q"

// The plan's file, which src/modules/check/folders.go owns and a module spells again. [[spec/design_output/model#everything-on-disk-mirrors]]
const Plan = ".se/.runtime/plan.json"

// [[spec/design_output/model#everything-on-disk-mirrors]]
func Registers(c *q.Catalog) q.Writer {
	return q.ProjectIn(c, "queue", Plan, q.JSON, q.Loaded, q.Ordered{}, q.Doc("the plan: the work in hand and the todos"))
}
