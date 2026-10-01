// The plans module: the plan tool, which writes the plan file the queue reads
// and answers the place each new todo takes, off src/bridge/plan.js. It stands
// off the wiring until the flip. A stub until tests-green.
// [[spec/tickets/plan-writes-off-go]]
package plans

import (
	"time"

	"quackitect/src/q"
)

// The module a plan action lists its request to. [[spec/tickets/plan-writes-off-go]]
const Module = "plans"

// The IO flag the registration carries at tests-green. [[spec/design_output/model#io-modules-are-modules]]
var _ = q.IO()

// What the module reads: the plan file's text and its write, the clock, the most open todos, and the queue's places over a plan text. [[spec/tickets/plan-writes-off-go]]
type Outside struct {
	Read   func() (string, error)
	Write  func(text string) error
	Now    func() time.Time
	Most   int
	Places func(planText string) map[string]string
}

// [[spec/tickets/plan-writes-off-go]]
func Registers(c *q.Catalog) q.Writer {
	return q.Join()
}

// [[spec/tickets/plan-writes-off-go]]
func Accept(from Outside) func(q.Request) (any, error) {
	return func(q.Request) (any, error) { return nil, nil }
}
