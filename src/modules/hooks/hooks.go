// The hooks IO module: it writes each hook event of a session under
// events/<id>, lands it on the folds over session/, and answers the effects
// the hook module runs. Its fake replays a recording.
// [[spec/tickets/the-hooks-door-lands]]
package hooks

import (
	"time"

	"quackitect/src/q"
)

// The local names the module declares: its out-port, and its default wait in seconds. [[spec/design_output/model#a-caller-sets-its-wait]]
const (
	EventsName  = "events/<id>"
	WaitKey     = "wait"
	defaultWait = 1
)

// The file the listen writes its port to, under the root, which the bridge reads in shadow. [[spec/tickets/the-hooks-door-lands]]
const StandingFile = ".se/.runtime/hooks.json"

// One post of the hook protocol. Old carries the bridge's own decision, in shadow. [[spec/design_output/model#a-post-and-its-answer]]
type Post struct {
	Event   string         `json:"event"`
	E       map[string]any `json:"e"`
	Root    string         `json:"root,omitempty"`
	Session string         `json:"session,omitempty"`
	Harness string         `json:"harness,omitempty"`
	Fill    any            `json:"fill,omitempty"`
	Old     any            `json:"old,omitempty"`
}

// [[spec/design_output/model#the-effects]]
type Effect struct {
	Kind   string `json:"kind"`
	Text   string `json:"text,omitempty"`
	Result any    `json:"result,omitempty"`
}

// [[spec/design_output/model#a-post-and-its-answer]]
type Answer struct {
	Effects []Effect `json:"effects"`
}

// The result within the wait, or the operation still running past it, field for field as the manager answers it. [[spec/design_output/model#a-caller-sets-its-wait]]
type Called struct {
	Result   any           `json:"result,omitempty"`
	Error    string        `json:"error,omitempty"`
	Running  bool          `json:"running"`
	Handle   string        `json:"handle"`
	Fraction float64       `json:"fraction"`
	Gone     time.Duration `json:"gone"`
}

// The manager's call of an action. [[spec/design_output/model#a-caller-sets-its-wait]]
type Call func(name string, input any, caller string, wait time.Duration) (Called, error)

// One operation of a session, as the manager's book holds it. [[spec/design_output/model#the-agent-does-not-poll]]
type Op struct {
	Handle   string        `json:"handle"`
	Action   string        `json:"action"`
	State    string        `json:"state"`
	Fraction float64       `json:"fraction"`
	Gone     time.Duration `json:"gone"`
	Result   any           `json:"result,omitempty"`
	Error    string        `json:"error,omitempty"`
}

// What the door reaches: the store and the writer of its out-port, the name a local name binds to, the manager's call and its book, and the clock. [[spec/tickets/the-hooks-door-lands]]
type Outside struct {
	Store *q.Store
	As    q.Writer
	Bound func(local string) string
	Call  Call
	Ops   func(caller string) []Op
	Now   func() time.Time
}

// [[spec/tickets/the-hooks-door-lands]]
type Door struct {
	from Outside
}

// One line of a recording whose answer differs from the door's. [[spec/design_output/model#an-inbound-fake-replays]]
type Mismatch struct {
	Line int
	Want string
	Got  string
}

// The module type the wiring loads as hooks. [[spec/tickets/the-hooks-door-lands]]
func Registers(c *q.Catalog) q.Writer {
	return q.Join(
		q.OutIn(c, EventsName, q.Event{}, q.IO(), q.Doc("the newest hook event of a session")),
		q.CfgIn(c, WaitKey, defaultWait, q.Doc("the seconds an agent's call waits on its action, where the call sets none")),
	)
}

// [[spec/tickets/the-hooks-door-lands]]
func New(from Outside) *Door { return &Door{from: from} }

// [[spec/tickets/the-hooks-door-lands]]
func (d *Door) Hook(post Post) (Answer, error) { return Answer{}, nil }

// [[spec/tickets/the-hooks-door-lands]]
func Listen(root string, door *Door) (func(), error) { return func() {}, nil }

// [[spec/design_output/model#an-inbound-fake-replays]]
func Replay(door *Door, recording []byte) ([]Mismatch, error) { return nil, nil }
