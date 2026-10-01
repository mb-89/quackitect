// The waits module: the wait tool, which returns on the first signal it hears,
// a helper's report, an output's end, or a quiet set of files, and at its cap
// where none comes, off src/bridge/wait.js. A stub until tests-green.
// [[spec/tickets/find-and-wait-in-go]]
package waits

import (
	"time"

	"quackitect/src/q"
)

// The module a wait action lists its request to. [[spec/tickets/find-and-wait-in-go]]
const Module = "waits"

// The IO flag the registration carries at tests-green, which lets the module's test read the disk. [[spec/design_output/model#io-modules-are-modules]]
var _ = q.IO()

// A wait: the helper whose report returns it, the output whose end returns it, and the files whose quiet returns it. [[spec/design_output/level0#the-wait-returns-on-signals]]
type Wait struct {
	Agent  string   `json:"agent,omitempty" doc:"the helper's agent id, whose report returns the wait"`
	Output string   `json:"output,omitempty" doc:"an output file, whose quiet or whose process's exit returns the wait"`
	Pid    *float64 `json:"pid,omitempty" doc:"the process writing the output, whose exit returns the wait"`
	Files  []string `json:"files,omitempty" doc:"files whose quiet, every one of them, returns the wait"`
}

// What the module reads: the tree, the clock and its pause, the cap and the quiet span, a helper's report, and a process's life. [[spec/tickets/find-and-wait-in-go]]
type Outside struct {
	Root     string
	Now      func() time.Time
	Pause    func(time.Duration)
	Most     time.Duration
	Quiet    time.Duration
	Reported func(agent string) bool
	Alive    func(pid int) bool
}

// [[spec/tickets/find-and-wait-in-go]]
func Registers(c *q.Catalog) q.Writer {
	return q.Join()
}

// The IO side of the module: it answers each request a wait action lists. [[spec/tickets/find-and-wait-in-go]]
func Accept(from Outside) func(q.Request) (any, error) {
	return func(q.Request) (any, error) { return nil, nil }
}
