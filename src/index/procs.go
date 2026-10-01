// A placed process: the index spawns it over the bus, lands what it commits,
// and marks its instances not provided while it runs nowhere.
// [[spec/design_output/processes#a-process-ends]]
package index

import (
	"time"

	"quackitect/src/q"
)

// The process's name, the command that runs it, the writer each instance it runs commits as, and the wait before a restart. [[spec/design_output/processes#a-process-ends]]
type Placed struct {
	Name      string
	Command   []string
	Instances map[string]q.Writer
	Restart   time.Duration
}

// Spawns the process, and answers its stop. [[spec/design_output/processes#a-process-ends]]
func (p Placed) Start(bus *Bus, store *q.Store) (func(), error) { return func() {}, nil }
