// The holds at the door: it stamps the config each hold reads on a call, and
// answers what the holds fold answers the call, a refusal or the rows it asks
// back for. A spoke post naming no session meets the session of the call the
// door held last under its root. [[spec/tickets/cage-call-holds-port]]
package hooks

import (
	"encoding/json"
	"strconv"
	"strings"
)

// The fold the session module keeps under each session, the words its answer takes, the post the bridgehead sends after a held call, and the binding that lets every hold through. [[spec/tickets/cage-call-holds-port]]
const (
	holdsFold   = "session/<id>/holds"
	heldField   = "held"
	spokeEvent  = "agent.spoke"
	godBinding  = "god"
	callJoin    = ":"
	planWorking = "working"
	planTodos   = "todos"
)

// .claude/skills/level0/lib/runs.js owns the plan's file, and the package spells it again. [[spec/tickets/cage-call-holds-port]]
const planFile = ".se/.runtime/plan.json"

// The config words each hold reads, by the keys the bridge reads them under, and the plan's work in hand and its open todos. [[spec/tickets/cage-call-holds-port]]
func heldOf(settings Settings, root string) map[string]any {
	working, todos := planOf(root)
	return map[string]any{
		"stop.hold":       settings.Hold,
		"grace.finish":    settings.FinishGrace,
		"ask.wanted":      settings.Ask,
		"grace.update":    settings.UpdateGrace,
		"plan.everyCalls": settings.PlanEvery,
		"plan.grace":      settings.PlanGrace,
		"plan.mostOpen":   settings.PlanMostOpen,
		"engine.binding":  settings.Binding,
		"cloud":           settings.Cloud,
		"plan.working":    working,
		"plan.todos":      todos,
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

// The answer the holds fold gives the newest event of the session, read off the store as the fold writes it. [[spec/tickets/cage-call-holds-port]]
type holdSaid struct {
	Seq  int64  `json:"seq"`
	Word string `json:"word"`
	Text string `json:"text"`
}

// The effect the holds answer the event with, where they answer it: a refusal's text, or the rows a held call asks back for. A ride and a pass answer none. [[spec/tickets/cage-call-holds-port]]
func (d *Door) held(session string, post Post, root string) (Effect, bool) {
	if post.Event != toolEvent && post.Event != spokeEvent {
		return Effect{}, false
	}
	value := d.from.Store.Snapshot().Read(strings.Replace(holdsFold, sessionKey, session, 1))
	body, err := json.Marshal(value)
	if err != nil {
		return Effect{}, false
	}
	var state struct {
		Said holdSaid `json:"said"`
	}
	d.mu.Lock()
	seq := d.seqs[session]
	d.mu.Unlock()
	if json.Unmarshal(body, &state) != nil || state.Said.Seq != seq {
		return Effect{}, false
	}
	switch state.Said.Word {
	case RefuseWord:
		return Effect{Kind: resultKind, Text: state.Said.Text}, true
	case HoldWord:
		d.mu.Lock()
		d.heldIn[root] = session
		d.mu.Unlock()
		return Effect{Kind: rowsKind, Call: session + callJoin + strconv.FormatInt(seq, 10)}, true
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
