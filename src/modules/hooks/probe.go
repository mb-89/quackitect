// The reply probe at the door: a prompt carrying the marker arms the main
// agent's next call, which lands in the session log as the probe's row.
// [[spec/tickets/level0-hooks-forward-to-go]]
package hooks

import (
	"encoding/json"
	"strings"
)

// The reply probe's marker and the said its row carries, as REPLY_PROBE in .claude/skills/level0/lib/guidance.js names them. [[spec/tickets/the-reply-probe-runs]]
const (
	ReplyMarker = "se-probe-reply"
	ReplyEvent  = "probe.reply"
	probeKind   = "probe"
	// The cap on a string the probe's row carries. [[spec/tickets/the-reply-probe-runs]]
	slimCap = 4000
)

// Arms the probe on a marked prompt, and writes the row of the main agent's first call after it. A post standing in no tree writes nothing. [[spec/tickets/the-reply-probe-runs]]
func (d *Door) probes(session string, post Post, root string) {
	d.mu.Lock()
	defer d.mu.Unlock()
	if post.Event == promptEvent {
		d.probing[session] = strings.Contains(textOf(post.E, "text"), ReplyMarker)
		return
	}
	if post.Event != toolEvent || !d.probing[session] || textOf(post.E, "agentId", "agent_id") != "" {
		return
	}
	delete(d.probing, session)
	if root == "" {
		return
	}
	detail, _ := json.Marshal(slim(post.E))
	row := rowOf(d.now(), probeKind, ReplyEvent, string(detail))
	row.Text = ""
	_ = appendRows(disk{root}.at(sessionLog), []LogRow{row})
}

// The event cut to its short strings, its numbers and its flags. [[spec/tickets/the-reply-probe-runs]]
func slim(e map[string]any) map[string]any {
	out := map[string]any{}
	for key, value := range e {
		switch one := value.(type) {
		case string:
			if len(one) > slimCap {
				one = one[:slimCap]
			}
			out[key] = one
		case float64, int, bool:
			out[key] = one
		}
	}
	return out
}
