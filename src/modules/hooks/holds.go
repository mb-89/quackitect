// The holds at the door: it stamps the config each hold reads on an event, and
// answers what the holds fold answers the call, a refusal or the rows it asks
// back for. A spoke post naming no session meets the session of the call the
// door held last under its root. [[spec/tickets/cage-call-holds-port]]
package hooks

import (
	"encoding/json"
	"sort"
	"strconv"
	"strings"
)

// The joint and the base of a held call's id, and the plan's fields the grace reads. [[spec/tickets/cage-call-holds-port]]
const (
	callJoin    = ":"
	callBase    = 10
	planWorking = "working"
	planTodos   = "todos"
)

// .claude/skills/level0/lib/folders.js owns the runtime folder and runs.js the plan's file, and the package spells them again. [[spec/tickets/cage-call-holds-port]]
const planFile = ".se/.runtime/plan.json"

// The config words each hold reads, and the plan's work in hand and its open todos. [[spec/tickets/cage-call-holds-port]]
func heldOf(settings Settings, root string) map[string]any {
	working, todos := planOf(root)
	return map[string]any{
		heldHold:        settings.Hold,
		heldFinishGrace: settings.FinishGrace,
		heldAsk:         settings.Ask,
		heldUpdateGrace: settings.UpdateGrace,
		heldPlanEvery:   settings.PlanEvery,
		heldPlanGrace:   settings.PlanGrace,
		heldPlanMost:    settings.PlanMostOpen,
		heldBinding:     settings.Binding,
		heldCloud:       settings.Cloud,
		heldWorking:     working,
		heldTodos:       todos,
		heldChapters:    chaptersAt(root, settings.Ask),
	}
}

// The plan's work in hand and its open todos under the root, or none where the file stands nowhere. [[spec/design_output/stop#the-plan]]
func planOf(root string) (string, int) {
	if root == "" {
		return "", 0
	}
	text, ok := disk{root}.Read(planFile)
	if !ok {
		return "", 0
	}
	var plan map[string]any
	if json.Unmarshal([]byte(text), &plan) != nil {
		return "", 0
	}
	todos, _ := plan[planTodos].([]any)
	return strings.TrimSpace(textOf(plan, planWorking)), len(todos)
}

// The name the holds fold of a session stands under. [[spec/tickets/cage-call-holds-port]]
func (d *Door) holdsOf(session string) string {
	return d.from.Bound(strings.Replace(HoldsName, sessionKey, session, 1))
}

// The effect the holds answer the event with, where they answer it: a refusal's text, or the rows a held call asks back for. A ride and a pass answer none. [[spec/tickets/cage-call-holds-port]]
func (d *Door) held(session string, post Post, root string) (Effect, bool) {
	if post.Event != toolEvent && post.Event != spokeEvent {
		return Effect{}, false
	}
	state, ok := d.from.Store.Snapshot().Read(d.holdsOf(session)).(Holds)
	d.mu.Lock()
	seq := d.seqs[session]
	d.mu.Unlock()
	if !ok || state.Said.Seq != seq {
		return Effect{}, false
	}
	switch state.Said.Word {
	case RefuseWord:
		return Effect{Kind: resultKind, Text: state.Said.Text}, true
	case HoldWord:
		d.mu.Lock()
		d.heldIn[root] = session
		d.mu.Unlock()
		return Effect{Kind: rowsKind, Call: session + callJoin + strconv.FormatInt(seq, callBase)}, true
	}
	return Effect{}, false
}

// A spoke post names no session, so it meets the session of the newest call the door held under its root. [[spec/tickets/cage-call-holds-port]]
func (d *Door) sessionFor(post Post, root string) string {
	session := sessionOf(post)
	if post.Event != spokeEvent || session != noSession {
		return session
	}
	d.mu.Lock()
	defer d.mu.Unlock()
	if held, ok := d.heldIn[root]; ok {
		return held
	}
	return session
}

// Hands each drop the holds fold names at the event's own place to the door's writer, in key order. A door with no writer writes nothing, and a failing write leaves the answer standing, as the shadow write does. [[spec/tickets/cage-hold-drops-port]]
func (d *Door) drops(session, root string) {
	if d.from.Drop == nil {
		return
	}
	state, ok := d.from.Store.Snapshot().Read(d.holdsOf(session)).(Holds)
	d.mu.Lock()
	seq := d.seqs[session]
	d.mu.Unlock()
	if !ok || state.Said.Seq != seq {
		return
	}
	keys := make([]string, 0, len(state.Said.Drops))
	for key := range state.Said.Drops {
		keys = append(keys, key)
	}
	sort.Strings(keys)
	for _, key := range keys {
		_ = d.from.Drop(root, key, state.Said.Drops[key])
	}
}
