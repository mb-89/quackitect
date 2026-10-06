// The reply probe at the door: a prompt carrying the marker arms the main
// agent's next call, which lands in the session log as the probe's row.
// [[spec/tickets/level0-hooks-forward-to-go]]
package hooks

// The reply probe's marker and the said its row carries. [[spec/tickets/level0-hooks-forward-to-go]]
const (
	ReplyMarker = "se-probe-reply"
	ReplyEvent  = "probe.reply"
)

// Arms the probe on a marked prompt, and writes the row of the first call after it. [[spec/tickets/level0-hooks-forward-to-go]]
func (d *Door) probes(_ string, _ Post, _ string) {}
