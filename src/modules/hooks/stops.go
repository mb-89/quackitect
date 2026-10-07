// The stops fold: what the bridge keeps on its box for the turn's end, and the
// answer to a Stop in the order the bridge's classic.Stop ran:
// a helper's stop, holdsForHandover, then onStop in src/bridge/stop.js. The
// fold reads the tree off the door's stamp and the holds off their own fold.
// [[spec/tickets/cage-stop-rules-port]]
package hooks

import (
	"quackitect/src/yaml"

	"encoding/json"
	"strconv"
	"strings"
	"time"

	"quackitect/src/modules/hooks/stop"
	"quackitect/src/q"
)

// The local name of the fold, and the fields the door stamps for it. [[spec/tickets/cage-stop-rules-port]]
const (
	StopsName    = "stops/<id>"
	stoppedField = "stopped"
	holdsField   = "holds"
)

// The events the fold reads beside the holds fold's, the stop call, and the words of the handover and the todo list, off src/bridge/handover.js and lib/stop.js. [[spec/tickets/cage-stop-rules-port]]
const (
	startEvent   = "session.start"
	endEvent     = "session.end"
	measureEvent = "session.measure"
	saidEvent    = "turn.said"
	spawnEvent   = "agent.spawn"
	clearReason  = "clear"
	stopCall     = levelZero + "stop"
	dueFinish    = "finish"
	handoverKey  = "context.handoverAt"
	taskMade     = "TaskCreate"
	taskEnded    = "TaskUpdate"
	helperTask   = "subagent"
	taskRunning  = "running"
	fillFormat   = 'f'
	fillBits     = 64
	allDigits    = -1
)

// The word the fold answers a turn's end with where the conversation clears, the kind the door answers it as, and the prompt the next conversation opens on. RESUME in src/bridge/handover.js owns the prompt, and the package spells it again. [[spec/tickets/clear-answers-off-the-door]]
const (
	ClearWord    = "clear"
	clearKind    = "clear"
	resumePrompt = "Level zero cleared the conversation, because the context passed `" + handoverKey + "`. Run `./RUNME.sh ticket pull`: `read-handover` stands in your hand, and the handover block says where the work stands."
)

// The statuses a todo ends under. [[spec/design_output/stop#what-the-todo-list-says]]
var todoDone = map[string]bool{"completed": true, "deleted": true}

// What the box keeps for the turn's end: the holds in a row, the report and the claim of the turn, the helpers spawned, the todo list, the owner's prompts, the handover and the fill, the binding as first read, and the answer to the newest event. [[spec/tickets/cage-stop-rules-port]]
type Stops struct {
	InARow     int          `json:"inARow"`
	Reported   bool         `json:"reported,omitempty"`
	Claim      string       `json:"claim,omitempty"`
	Helpers    int          `json:"helpers,omitempty"`
	Listed     bool         `json:"listed,omitempty"`
	List       []string     `json:"list,omitempty"`
	Made       int          `json:"made,omitempty"`
	Ended      int          `json:"ended,omitempty"`
	Prompts    int          `json:"prompts,omitempty"`
	Handover   *Handover    `json:"handover,omitempty"`
	Fill       float64      `json:"fill,omitempty"`
	Cleared    bool         `json:"cleared,omitempty"`
	StandsDown bool         `json:"standsDown,omitempty"`
	Binding    *BindingRead `json:"binding,omitempty"`
	Said       Said         `json:"said"`
}

// The handover a session due stands in: finish until the pull hands the clear, and the asks it has made. [[spec/design_output/stop#the-context-hands-over]]
type Handover struct {
	Phase string `json:"phase"`
	Asked int    `json:"asked"`
}

// The binding as the box last read it, and the moment it read it so. [[spec/design_output/stop#a-refusal-names-the-binding]]
type BindingRead struct {
	Value string `json:"value"`
	Layer string `json:"layer"`
	At    string `json:"at"`
}

// What the door stamps for the fold: the stop settings, and what the tree says where the event reads it. [[spec/tickets/cage-stop-rules-port]]
type Stopped struct {
	Off        bool        `json:"off,omitempty"`
	Most       int         `json:"most,omitempty"`
	HandoverAt int         `json:"handoverAt,omitempty"`
	Layer      string      `json:"layer,omitempty"`
	Rules      []stop.Rule `json:"rules,omitempty"`
	Working    string      `json:"working,omitempty"`
	Planned    []string    `json:"planned,omitempty"`
	Holds      int         `json:"holds,omitempty"`
	Clear      bool        `json:"clear,omitempty"`
	Retro      bool        `json:"retro,omitempty"`
	Group      bool        `json:"group,omitempty"`
	Private    bool        `json:"private,omitempty"`
	Queue      bool        `json:"queue,omitempty"`
	PersonStep bool        `json:"personStep,omitempty"`
}

// The fold's step. A helper's event moves the fill and ends a helper alone. [[spec/tickets/cage-stop-rules-port]]
func stepStops(state Stops, event q.Event) Stops {
	state = state.copied()
	state.Said = Said{Seq: event.Seq}
	fields := event.Fields
	held, facts := heldIn(fields), stoppedIn(fields)
	// The bridgehead reads the fill at every call, so a long turn reaches the key before it ends. [[spec/design_output/stop#the-context-hands-over]]
	if fill, ok := fillOf(fields["fill"]); ok {
		state.measures(fill, held, facts)
	}
	if event.Hand.Agent != "" {
		// A helper's end reaches the server as its stop. [[spec/tickets/helper-mark-drops-at-stop]]
		if event.Kind == stopEvent && state.Helpers > 0 {
			state.Helpers--
		}
		// A helper's stop call answers as the main agent's does. [[spec/tickets/helpers-calls-answer-too]]
		if event.Kind == toolEvent && textOf(fields, "tool") == stopCall {
			state.claims(fields, held, facts, holdsOf(fields))
		}
		return state
	}
	switch event.Kind {
	case startEvent:
		state.Handover, state.Cleared, state.StandsDown = nil, false, false
	case endEvent:
		if textOf(fields, "reason") == clearReason {
			state.Handover, state.Cleared = nil, true
		}
	case promptEvent:
		state.prompted(fields, held, facts, event.At)
	case saidEvent:
		state.Reported = state.Reported || stop.ReportStands(textOf(fields, "text"))
	case spawnEvent:
		if yaml.Truthy(fields["background"]) {
			state.Helpers++
		}
	case measureEvent:
		context, _ := fields["context"].(map[string]any)
		if fill, ok := fillOf(context["tokens"]); ok {
			state.measures(fill, held, facts)
		}
	case toolEvent:
		state.sawCall(fields)
		if textOf(fields, "tool") == stopCall {
			state.claims(fields, held, facts, holdsOf(fields))
		}
	case stopEvent:
		state.stops(fields, held, facts, holdsOf(fields), event.At)
	}
	return state
}

func (state Stops) copied() Stops {
	if state.Handover != nil {
		handover := *state.Handover
		state.Handover = &handover
	}
	if state.Binding != nil {
		binding := *state.Binding
		state.Binding = &binding
	}
	return state
}

// A prompt from outside the plugin puts the run of holds back, an owner's prompt opens a turn no report answers yet, and the binding reads again. [[spec/design_output/stop#the-tooth-holds-its-state]]
func (state *Stops) prompted(fields, held map[string]any, facts Stopped, at time.Time) {
	if !yaml.Truthy(fields["mine"]) {
		state.InARow = 0
	}
	origin, _ := fields["origin"].(map[string]any)
	if owners[textOf(origin, "kind")] {
		state.Reported = false
		state.Prompts++
	}
	state.readsBinding(held, facts, at)
}

// The todo list a call writes, or the tasks it makes and ends. [[spec/design_output/stop#what-the-todo-list-says]]
func (state *Stops) sawCall(fields map[string]any) {
	if listed, ok := fields["todos"].([]any); ok {
		state.Listed, state.List = true, make([]string, 0, len(listed))
		for _, one := range listed {
			row, _ := one.(map[string]any)
			state.List = append(state.List, textOf(row, "status"))
		}
		return
	}
	switch textOf(fields, "tool") {
	case taskMade:
		state.Made++
	case taskEnded:
		if todoDone[textOf(fields, "status")] {
			state.Ended++
		}
	}
}

// Whether a todo stands unfinished. [[spec/design_output/stop#what-the-todo-list-says]]
func (state Stops) standing() bool {
	if !state.Listed {
		return state.Made > state.Ended
	}
	for _, one := range state.List {
		if !todoDone[one] {
			return true
		}
	}
	return false
}

// A fill past the key marks the session due, where the queue alone clears. [[spec/design_output/stop#the-context-hands-over]]
func (state *Stops) measures(fill float64, held map[string]any, facts Stopped) {
	if !(fill > 0) {
		return
	}
	state.Fill = fill
	if !clearsHere(held, facts) {
		state.Handover = nil
		state.marks().DropDue = true
		return
	}
	at := float64(facts.HandoverAt)
	if !(at > 0) {
		return
	}
	// The first reading after a clear is what the next conversation opens on, and a key under it hands over into a loop. [[spec/design_output/stop#the-context-hands-over]]
	if state.Cleared {
		state.Cleared = false
		state.StandsDown = state.StandsDown || fill >= at
	}
	if state.Handover != nil || state.StandsDown || fill < at {
		return
	}
	state.Handover = &Handover{Phase: dueFinish}
	// The pull runs apart from the door, so the mark stands on disk. [[spec/design_input/the-clear-hands-ephemeral-tickets#the-ticket-ends-first]]
	state.marks().Due = &DueMark{Tokens: fill, At: facts.HandoverAt}
}

// The queue alone clears, and a retro in hand runs to its end in one conversation. [[spec/design_output/stop#the-queue-alone-clears]]
func clearsHere(held map[string]any, facts Stopped) bool {
	return textOf(held, heldBinding) == stop.QueueBinding && !facts.Retro
}

// The stop call records its claim where the holds let the call through, the reason is one the tree holds, and its check stands. [[spec/design_output/stop#the-claim-rides-the-call]]
func (state *Stops) claims(fields, held map[string]any, facts Stopped, holds Holds) {
	if holds.Said.Word == RefuseWord || holds.Said.Word == HoldWord {
		return
	}
	reason := callField(fields, "reason")
	rule, known := stop.ReasonOf(facts.Rules, reason)
	// The call words its answer as claims in src/bridge/stop.js does. [[spec/tickets/log-report-stop-in-go]]
	if !known {
		var ids []string
		for _, one := range stop.StopReasons(rulesOr(facts.Rules)) {
			ids = append(ids, one.ID)
		}
		state.Said.Result = reason + " names no reason this tree holds. The ids: " + strings.Join(ids, ", ") + "."
		return
	}
	if !stop.ReadsText[rule.Runs] {
		if falls := stop.ClaimFalls(state.factsOf(held, facts, holds, reason, "")); falls != "" {
			state.Said.Result = "The claim falls. " + falls
			return
		}
	}
	state.Claim = reason
	state.Said.Result = "The claim stands. The answer before this call carries the report, so end the turn with the line stop: " + reason + " alone. The owner reads the answer once."
}

// The turn's end, in the bridge's order: the handover, the full update's shape, then the vote and the tooth. [[spec/tickets/cage-stop-rules-port]]
func (state *Stops) stops(fields, held map[string]any, facts Stopped, holds Holds, at time.Time) {
	text := textOf(fields, "last_assistant_message")
	if answered, block := state.holdsForHandover(text, held, facts); answered {
		state.blocks(block)
		return
	}
	if block := holdsTurn(holds, text); block != "" {
		state.blocks(block)
		return
	}
	state.Reported = state.Reported || stop.ReportStands(text)
	claimed := state.claimOf(text)
	state.Claim = ""
	facts.Rules = rulesOr(facts.Rules)
	found := state.factsOf(held, facts, holds, claimed, text)
	found.Running = tasksRun(fields["background_tasks"])
	decision := stop.Decide(facts.Rules, claimed, func(name string) (bool, bool) { return stop.Ran(name, found) })
	said, next := stop.AtTurnEnd(decision, state.InARow, facts.Most, stop.Pinned(found))
	state.InARow = next
	if said.Ends {
		return
	}
	// A line naming a reason whose check falls hears which check, and what it sees. [[spec/design_output/stop#a-refusal-names-its-check]]
	why := ""
	if stop.ReadsTheLine(said) {
		why = stop.ClaimFalls(state.factsOf(held, facts, holds, claimed, text))
	}
	if why == "" && said.Go != nil {
		why = said.Go.Says
	}
	state.blocks(stop.AsksForStop(facts.Rules, why, state.readsBinding(held, facts, at)))
}

// A block answers the Stop, and nothing lets it through. [[spec/tickets/cage-stop-rules-port]]
func (state *Stops) blocks(text string) {
	if text != "" {
		state.Said.Word, state.Said.Text = BlockWord, text
	}
}

// A held clear ends the turn whatever the tooth votes, a ticket in hand leaves it to the tooth, and a session due holding nothing is sent to the pull. It answers whether it decides the turn, and the block where it holds it. [[spec/design_output/stop#the-context-hands-over]]
func (state *Stops) holdsForHandover(text string, held map[string]any, facts Stopped) (bool, string) {
	// A stop waiting on the owner holds the clear: the tooth votes, and the next turn's end clears. [[spec/tickets/the-clear-keeps-questions]]
	waits := stop.WaitsForOwner(rulesOr(facts.Rules), state.claimOf(text))
	if facts.Clear {
		if !clearsHere(held, facts) {
			state.Handover = nil
			state.marks().DropClear = true
			return false, ""
		}
		if waits {
			return false, ""
		}
		// The Stop answers the clear, since `turn.complete` lands before it or after it, and the plugin runs it once the session stands idle. [[spec/tickets/the-clear-continues-the-session]]
		state.Handover = nil
		state.Said.Word, state.Said.Text = ClearWord, resumePrompt
		// The read takes the clear's place as the clear is answered, so the pull after it hands the next leaf. [[spec/tickets/the-clear-hands-back-the-leaf]]
		state.marks().ReadNext = true
		return true, ""
	}
	due := state.Handover
	if due == nil || due.Phase != dueFinish || waits || facts.Holds > 0 {
		return false, ""
	}
	due.Asked++
	// The same cap the tooth keeps, so a session that pulls nothing runs away nowhere. [[spec/design_output/stop#three-in-a-row]]
	if facts.Most > 0 && due.Asked > facts.Most {
		state.Handover = nil
		state.marks().DropDue = true
		return false, ""
	}
	fill := "more"
	if state.Fill > 0 {
		fill = strconv.FormatFloat(state.Fill, fillFormat, allDigits, fillBits)
	}
	return true, strings.Join([]string{
		"# The context hands over",
		"",
		"The context holds " + fill + " tokens, past `" + handoverKey + "` at " + strconv.Itoa(facts.HandoverAt) + ".",
		"Run `./RUNME.sh ticket pull`. It hands the handover ticket, then the clear,",
		"and the clear ends the turn.",
	}, "\n")
}

// The turn's claim: the stop call's reason, or the last line's. [[spec/design_output/stop#the-claim-rides-the-call]]
func (state Stops) claimOf(text string) string {
	if state.Claim != "" {
		return state.Claim
	}
	return stop.LastLineReason(text)
}

// What the checks read: the facts the door stamped, the hold over the turn, and what the box keeps. The hold that stood over the turn is the owner's now, or the one the turn's end dropped. [[spec/design_output/stop#the-hold-outlives-its-drop]]
func (state Stops) factsOf(held map[string]any, facts Stopped, holds Holds, claimed, text string) stop.Facts {
	hold := textOf(held, heldHold)
	if hold != stop.FinishHold && hold != stop.StopHold {
		hold = holds.Stood
	}
	return stop.Facts{
		Off: facts.Off, Hold: hold, Claimed: claimed, Text: text, Cloud: yaml.Truthy(held[heldCloud]), Binding: textOf(held, heldBinding),
		Prompts: state.Prompts, Todos: state.standing(), Helpers: state.Helpers, Reported: state.Reported,
		Group: facts.Group, Holds: facts.Holds, Private: facts.Private, Queue: facts.Queue, PersonStep: facts.PersonStep,
		Working: facts.Working, Planned: facts.Planned, Rules: facts.Rules,
	}
}

// The box keeps the binding it last read, so a change moves the moment the line names. [[spec/design_output/stop#a-refusal-names-the-binding]]
func (state *Stops) readsBinding(held map[string]any, facts Stopped, at time.Time) string {
	value := textOf(held, heldBinding)
	if state.Binding == nil || state.Binding.Value != value || state.Binding.Layer != facts.Layer {
		state.Binding = &BindingRead{Value: value, Layer: facts.Layer, At: at.UTC().Format(stampLayout)}
	}
	return stop.BindingLine(value, facts.Layer, state.Binding.At)
}

// The harness names every task it runs in the background at the turn's end. [[spec/design_output/stop#a-helper-still-runs]]
func tasksRun(tasks any) bool {
	listed, _ := tasks.([]any)
	for _, one := range listed {
		if task, _ := one.(map[string]any); textOf(task, "type") == helperTask && textOf(task, "status") == taskRunning {
			return true
		}
	}
	return false
}

// The events the fill rides: every call of the agent's own, and the turn's end, which the harness measures only after the vote. [[spec/design_output/stop#the-context-hands-over]]
var filled = map[string]bool{toolEvent: true, stopEvent: true}

// The fill a post carries where the door reads it: on a filled event of the main agent. The bridgehead sends the session's fill on every event, and a helper's event measures the main agent's context, so it reads none. [[spec/design_output/stop#the-context-hands-over]] [[spec/tickets/level0-hooks-hold-no-rule]]
func filledOf(post Post) any {
	if !filled[post.Event] || textOf(post.E, "agentId", "agent_id") != "" {
		return nil
	}
	return post.Fill
}

// A fill as the bridge's Number reads it, and whether one stands. [[spec/design_output/stop#the-context-hands-over]]
func fillOf(said any) (float64, bool) {
	switch one := said.(type) {
	case float64:
		return one, true
	case int:
		return float64(one), true
	case string:
		fill, err := strconv.ParseFloat(strings.TrimSpace(one), fillBits)
		return fill, err == nil
	}
	return 0, false
}

func rulesOr(rules []stop.Rule) []stop.Rule {
	if rules == nil {
		return []stop.Rule{}
	}
	return rules
}

// The facts the door stamped on an event, as it stamped them or read back off JSON. [[spec/tickets/cage-stop-rules-port]]
func stoppedIn(fields map[string]any) Stopped {
	var facts Stopped
	switch said := fields[stoppedField].(type) {
	case Stopped:
		return said
	case map[string]any:
		if body, err := json.Marshal(said); err == nil {
			_ = json.Unmarshal(body, &facts)
		}
	}
	return facts
}

// The holds after the same event, which the door hands the fold. [[spec/tickets/cage-stop-rules-port]]
func holdsOf(fields map[string]any) Holds {
	holds, _ := fields[holdsField].(Holds)
	return holds
}

// The name the stops fold of a session stands under. [[spec/tickets/cage-stop-rules-port]]
func (d *Door) stopsOf(session string) string {
	return d.from.Bound(strings.Replace(StopsName, sessionKey, session, 1))
}

// Lands the event on the stops fold, beside the holds the same event left. [[spec/tickets/cage-stop-rules-port]]
func (d *Door) landsStops(session string, event q.Event) error {
	return d.from.Store.Land(d.stopsOf(session), d.besideHolds(session, event))
}

// The block the stops fold answers the newest Stop with, where it blocks, or the clear, where the conversation clears. [[spec/tickets/cage-stop-rules-port]] [[spec/tickets/the-clear-continues-the-session]]
func (d *Door) blocked(session string, post Post) (Effect, bool) {
	if post.Event != stopEvent {
		return Effect{}, false
	}
	state, ok := d.from.Store.Snapshot().Read(d.stopsOf(session)).(Stops)
	d.mu.Lock()
	seq := d.seqs[session]
	d.mu.Unlock()
	if !ok || state.Said.Seq != seq {
		return Effect{}, false
	}
	if state.Said.Word == BlockWord {
		return Effect{Kind: blockKind, Text: state.Said.Text}, true
	}
	if state.Said.Word == ClearWord {
		return Effect{Kind: clearKind, Text: state.Said.Text}, true
	}
	return Effect{}, false
}
