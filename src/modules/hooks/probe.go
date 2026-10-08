// The reply probe's words: the marker a prompt carries, the event its row
// carries, and the line its prompt asks for. The fold in fold.go arms the probe
// and writes its row through probeRowOf in rows.go.
// [[spec/tickets/level0-hooks-forward-to-go]] [[spec/tickets/level0-hooks-hold-no-rule]]
package hooks

// The reply probe's marker, the event its row carries, the line its prompt asks for, and the kind its row logs under. [[spec/tickets/the-reply-probe-runs]] [[spec/tickets/guidance-lib-leaves]]
const (
	ReplyMarker = "se-probe-reply"
	ReplyEvent  = "probe.reply"
	ReplySays   = ReplyMarker + " writes this line"
	probeKind   = "probe"
)
