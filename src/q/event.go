// The one shape every event of a session carries, which the hooks IO module
// writes and every fold over session/ reads.
// [[spec/design_output/model#the-events-of-a-session]]
package q

import "time"

// The words a prompt opens on where the pull spawns a hand of its own, which the spawn answer leaves untagged. [[spec/design_output/pull#a-hand-of-its-own]]
const HandOfItsOwn = "You are a hand of your own on this box"

// The box, the session and the agent, where the harness names one. [[spec/design_output/model#the-events-of-a-session]]
type Hand struct {
	Box     string `json:"box,omitempty"`
	Session string `json:"session"`
	Agent   string `json:"agent,omitempty"`
}

// [[spec/design_output/model#the-events-of-a-session]]
type Event struct {
	Seq     int64          `json:"seq"`
	At      time.Time      `json:"at"`
	Kind    string         `json:"kind"`
	Harness string         `json:"harness"`
	Hand    Hand           `json:"hand"`
	Fields  map[string]any `json:"fields,omitempty"`
}
