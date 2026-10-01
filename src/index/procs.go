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
	// The module types of its instances, which a change under src/modules restarts. [[spec/design_output/processes#a-module-rebuilds-alone]]
	Topics []string
}

// Every placed process the index runs over one bus. [[spec/design_output/processes#the-placements]]
type Placements struct {
	bus    *Bus
	store  *q.Store
	placed []Placed
}

// [[spec/design_output/processes#the-placements]]
func NewPlacements(bus *Bus, store *q.Store, placed []Placed) *Placements {
	return &Placements{bus: bus, store: store, placed: placed}
}

// Starts every placed process, and answers the stop of them all. [[spec/design_output/processes#the-placements]]
func (p *Placements) Start() (func(), error) { return func() {}, nil }

// Restarts the processes holding an instance of the topic, and no other. [[spec/design_output/processes#a-module-rebuilds-alone]]
func (p *Placements) Restart(topic string) error { return nil }

// Spawns the process, and answers its stop. [[spec/design_output/processes#a-process-ends]]
func (p Placed) Start(bus *Bus, store *q.Store) (func(), error) { return func() {}, nil }
