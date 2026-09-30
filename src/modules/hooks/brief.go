// The brief fold: the canary debt the bridge keeps on its box, off sessionHere,
// paid, onTurnComplete, owesCanary and onSessionCompact in src/bridge/guidance.js,
// and the blocks the door answers off it. The door stamps the brief on every
// event, so the fold reads no file. [[spec/tickets/brief-answers-off-the-door]]
package hooks

import (
	"encoding/json"
	"os"
	"strings"

	"quackitect/src/modules/hooks/brief"
	"quackitect/src/q"
)

// The local name of the fold, the field the door stamps, and the events the fold reads beside the holds fold's. [[spec/tickets/brief-answers-off-the-door]]
const (
	BriefName    = "brief/<id>"
	briefField   = "brief"
	contextEvent = "prompt.context"
	compactEvent = "session.compact"
)

// What the door stamps for the fold: the counts off the notes, and the canary sentence they make. [[spec/tickets/brief-answers-off-the-door]]
type Stamp struct {
	Counts   brief.Counts `json:"counts"`
	Sentence string       `json:"sentence"`
}

// What the brief keeps over a session: the context reads, whether the first turn ended, whether the layer reached the session, whether the line paid the debt, whether the debt stands open, the newest stamp, and the answer to the newest event. [[spec/tickets/brief-answers-off-the-door]]
type Brief struct {
	Reads  int       `json:"reads,omitempty"`
	Turned bool      `json:"turned,omitempty"`
	Given  bool      `json:"given,omitempty"`
	Paid   bool      `json:"paid,omitempty"`
	Owes   bool      `json:"owes,omitempty"`
	Stamp  Stamp     `json:"stamp"`
	Said   BriefSaid `json:"said"`
}

// The answer the brief gives one event: its place, whether the layer rides it, and whether the debt line does. [[spec/tickets/brief-answers-off-the-door]]
type BriefSaid struct {
	Seq   int64 `json:"seq"`
	Layer bool  `json:"layer,omitempty"`
	Owes  bool  `json:"owes,omitempty"`
}

// The fold's step. A helper's event moves the stamp alone. [[spec/tickets/brief-answers-off-the-door]]
func stepBrief(state Brief, event q.Event) Brief {
	state.Said = BriefSaid{Seq: event.Seq}
	fields := event.Fields
	state.Stamp = stampIn(fields)
	if event.Hand.Agent != "" {
		return state
	}
	switch event.Kind {
	case startEvent:
		state = Brief{Stamp: state.Stamp, Said: state.Said}
	case contextEvent:
		state.reads()
	case saidEvent:
		state.pays(textOf(fields, "text"))
	case turnEvent:
		state.turnEnds(fields)
	case compactEvent:
		// The debt opens again, so the line that paid it pays no second time. [[spec/design_output/level0#the-layer-after-a-compaction]]
		state.Owes, state.Paid = true, false
	case toolEvent:
		state.called(holdsOf(fields).Said.Word)
	}
	return state
}

// A read of the context hands the layer over, and marks the session as holding it. [[spec/design_output/level0#rules-ride-the-first-answer]]
func (state *Brief) reads() {
	state.Reads++
	state.Given = true
	state.Said.Layer = true
}

// The line pays once a session, so no later answer opens the debt again. [[spec/design_output/level0#the-line-lands-once]]
func (state *Brief) pays(text string) bool {
	if state.Paid {
		return true
	}
	if brief.CanaryIn(text, state.Stamp.Sentence) != brief.Same {
		return false
	}
	state.Paid, state.Owes = true, false
	return true
}

// The first turn ending on no canary line opens the debt. [[spec/design_output/level0#the-canary-owes-a-debt]]
func (state *Brief) turnEnds(fields map[string]any) {
	if textOf(fields, "reason") != answerReason {
		return
	}
	if !state.pays(textOf(fields, "answer")) && !state.Turned {
		state.Owes = true
	}
	state.Turned = true
}

// A call the holds let through takes the layer where no context read reached the session, and the debt line while the debt stands open and no hold rides the call. [[spec/design_output/level0#rules-ride-the-first-answer]]
func (state *Brief) called(word string) {
	if word == RefuseWord || word == HoldWord {
		return
	}
	if !state.Given {
		state.reads()
	}
	state.Said.Owes = state.Owes && word == ""
}

// The stamp the door wrote on an event, as it stamped it or read back off JSON. [[spec/tickets/brief-answers-off-the-door]]
func stampIn(fields map[string]any) Stamp {
	var stamp Stamp
	switch said := fields[briefField].(type) {
	case Stamp:
		return said
	case map[string]any:
		if body, err := json.Marshal(said); err == nil {
			_ = json.Unmarshal(body, &stamp)
		}
	}
	return stamp
}

// The counts off the notes under the method root with the post's root over it, and the sentence they make. A post standing in no tree counts none. [[spec/design_output/vehicle#the-work-root-inherits]]
func (d *Door) stampOf(settings Settings, root string) Stamp {
	var counts brief.Counts
	if root != "" {
		counts = brief.CountsOf(d.treeAt(root), os.Getenv)
	}
	return Stamp{Counts: counts, Sentence: brief.Canary(counts, !settings.StopOff)}
}

// The name the brief fold of a session stands under. [[spec/tickets/brief-answers-off-the-door]]
func (d *Door) briefOf(session string) string {
	return d.from.Bound(strings.Replace(BriefName, sessionKey, session, 1))
}

// The event with the holds the same event left beside it, which the stops and the brief folds read. [[spec/tickets/cage-stop-rules-port]]
func (d *Door) besideHolds(session string, event q.Event) q.Event {
	holds, _ := d.from.Store.Snapshot().Read(d.holdsOf(session)).(Holds)
	fields := make(map[string]any, len(event.Fields)+1)
	for key, value := range event.Fields {
		fields[key] = value
	}
	fields[holdsField] = holds
	event.Fields = fields
	return event
}

// The after effects the brief answers the newest event with: one a block where the layer rides, each by its name, then the debt line. [[spec/tickets/brief-answers-off-the-door]]
func (d *Door) briefs(session, root string, settings Settings) []Effect {
	state, ok := d.from.Store.Snapshot().Read(d.briefOf(session)).(Brief)
	d.mu.Lock()
	seq := d.seqs[session]
	d.mu.Unlock()
	if !ok || state.Said.Seq != seq {
		return nil
	}
	var out []Effect
	if state.Said.Layer {
		tools := ""
		if root != "" {
			tools = brief.ToolsText(disk{root}.text(brief.ToolsFile), brief.TiersLine(settings.Helpers))
		}
		for _, one := range brief.BlocksOf(tools, state.Stamp.Counts, state.Stamp.Sentence, handoverAt(root)) {
			out = append(out, Effect{Kind: afterKind, Name: one.Name, Text: one.Text})
		}
	}
	if state.Said.Owes {
		out = append(out, Effect{Kind: afterKind, Text: brief.Owes(state.Stamp.Sentence)})
	}
	return out
}

// The handover reaches one read, so the read removes it, as handoverHere in src/bridge/guidance.js does. A post standing in no tree reads none. [[spec/design_output/work#one-handover-stands]]
func handoverAt(root string) string {
	if root == "" {
		return ""
	}
	tree := disk{root}
	text, ok := tree.Read(brief.HandoverFile)
	if !ok {
		return ""
	}
	_ = os.Remove(tree.at(brief.HandoverFile))
	return strings.TrimSpace(text)
}

// Whether the answer so far passes the event on, which the brief rides alone. [[spec/design_output/level0#rules-ride-the-first-answer]]
func passesOn(effects []Effect) bool {
	return len(effects) == 1 && effects[0].Kind == passKind
}
