// The watchdog: the leases, the wait before a restart, the alarms, and the
// given name session/alarms.
// [[spec/design_output/watchdogs]]
package watchdog

import (
	"time"

	"quackitect/src/q"
)

const AlarmsName = "session/alarms"

// [[spec/design_output/watchdogs#a-lease]]
type Lease struct {
	Part    string
	Renewed time.Time
	Term    time.Duration
}

// [[spec/design_output/watchdogs#sessionalarms]]
type Alarm struct {
	Part   string    `json:"part"`
	Since  time.Time `json:"since"`
	Faults int       `json:"faults"`
	Error  string    `json:"error"`
	Clears string    `json:"clears"`
}

// [[spec/design_output/watchdogs#restarts]]
type Settings struct {
	First  time.Duration
	Cap    time.Duration
	Faults int
	Window time.Duration
}

type Dog struct{}

func Registers(c *q.Catalog) {}

func New(now func() time.Time, store *q.Store, settings Settings) *Dog { return &Dog{} }

func (d *Dog) Hold(part string, term time.Duration)               {}
func (d *Dog) Beat(part string)                                   {}
func (d *Dog) Check() []string                                    { return nil }
func (d *Dog) Fault(part string, err error) (time.Duration, bool) { return 0, true }
func (d *Dog) Alarms() []Alarm                                    { return nil }
func (d *Dog) Clear(part string) error                            { return nil }
