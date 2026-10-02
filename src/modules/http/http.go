// The http IO module: the /v1 surface the index serves, and the wait a call
// over it takes where the request sets none.
// [[spec/design_output/model#a-caller-sets-its-wait]]
package http

import "quackitect/src/q"

// The local name of the default wait, in seconds, which the wiring binds under the instance. [[spec/tickets/actions-answer-over-http]]
const WaitKey = "wait"

// The module type the wiring loads as http. HTTP waits none by default, per the table of defaults. [[spec/design_output/model#a-caller-sets-its-wait]]
func Registers(c *q.Catalog) q.Writer {
	return q.CfgIn(c, WaitKey, 0, q.Doc("the seconds a call over /v1 waits on its action, where the request sends no Prefer: wait=N"))
}
