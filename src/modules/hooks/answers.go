// The log, report and stop tools off the Go side: the folds word the text the
// bridge answers, and the door answers it as the tool's result.
// [[spec/tickets/log-report-stop-in-go]]
package hooks

import (
	"slices"
	"strings"
	"time"

	"quackitect/src/q"
)

// The row kind a reply lands under, the levels a log line takes, and the module the three tools register under. Ladder in src/modules/log/log.go owns the levels. [[spec/design_output/log#the-log-tool]]
const (
	replyRow    = "reply"
	toolsModule = "hooks"
)

var logLevels = []string{"debug", infoLevel, "warn", "error", "fatal"}

// The log tool's input, which this package declares. [[spec/design_output/log#the-log-tool]]
type LogInput struct {
	Kind  string `json:"kind" doc:"What the line is, such as status or note."`
	Said  string `json:"said" doc:"One sentence, 80 characters at most."`
	Text  string `json:"text,omitempty" doc:"The whole text, where said runs short."`
	Level string `json:"level,omitempty" doc:"debug, info, warn, error or fatal."`
}

// The report tool's input, as the bridge's reportSpec declared it. [[spec/design_output/extension#the-ask-is-a-line]]
type ReportInput struct {
	Text string `json:"text" doc:"The reply, as you would write it in the chat."`
}

// The stop tool's input, as the stop tool declares it. [[spec/design_output/stop#the-claim-rides-the-call]]
type StopInput struct {
	Reason string `json:"reason" doc:"The id of your reason, one of the stop rules this tree holds."`
	Next   string `json:"next" doc:"What the owner does next, in one sentence."`
}

// The review tool's input, which this package declares. [[spec/tickets/level0-tools-leave-the-bridge]]
type ReviewInput struct {
	Branch string `json:"branch" doc:"The branch to read, such as the-config-holds-numbers."`
}

// The four tools list off the index, and the door answers each before its action runs, so none lists a request. [[spec/tickets/log-report-stop-in-go]] [[spec/tickets/level0-tools-leave-the-bridge]]
func toolActions(c *q.Catalog) q.Writer {
	none := func() []q.Request { return nil }
	return q.Join(
		q.ActionIn(c, toolsModule+"/log", func(LogInput) []q.Request { return none() },
			q.Doc("Writes one line to this session's log, the one the owner reads in the viewer. The hook stamps the time. Name the kind, such as status or note, and say one sentence; text carries more where one sentence runs short. An answer to the owner's prompt stands in the chat, as text, and the hook logs it from there under kind reply. This tool answers no prompt."), q.ToolName("log"), q.IO()),
		q.ActionIn(c, toolsModule+"/report", func(ReportInput) []q.Request { return none() },
			q.Doc("Answers the owner between calls: a prompt sent mid-turn, or an ask from the sidebar. The text lands in the log as your reply at once, and the work goes on. A short ask takes a line or two. A full ask takes four chapters as headings, each with text under it: Done, Now, Open, ETA."), q.ToolName("report"), q.IO()),
		q.ActionIn(c, toolsModule+"/stop", func(StopInput) []q.Request { return none() },
			q.Doc("Ends this turn, every turn of a session alike. Call it last, once your answer stands, and write nothing after it. The result says whether the stop stands, and where it falls, the result names the fact, so carry on. A reason no rule holds answers the ids this tree holds."), q.ToolName("stop"), q.IO()),
		q.ActionIn(c, toolsModule+"/review", func(ReviewInput) []q.Request { return none() },
			q.Doc("Reads a work branch against the ask its group ticket carries, and answers a short report: what the branch does, what it touches beyond the ask, which rules it adds without a test, whether the check passes, and whether the handback carries a retro. It holds no merge back. Takes one branch name, with or without the work/ prefix."), q.ToolName("review_branch"), q.IO()),
	)
}

// The log and report calls answer the bridge's text, and land the rows the bridge's log writes. [[spec/tickets/log-report-stop-in-go]]
func (state *Holds) answers(fields, held map[string]any, at time.Time) {
	switch textOf(fields, "tool") {
	case reportCall:
		state.reports(strings.TrimSpace(callField(fields, "text")), held, at)
	case logCall:
		state.logs(fields, at)
	}
}

// The report pays the demand it fits, says what it lacks, or stands as a reply nothing asked for. [[spec/design_output/extension#the-ask-is-a-line]]
func (state *Holds) reports(said string, held map[string]any, at time.Time) {
	if said == "" {
		state.Said.Result = "report takes the text of the reply."
		return
	}
	if state.Demand == nil {
		state.Spoken = said
		state.Said.Rows = append(state.Said.Rows, rowOf(at, replyRow, said, ""))
		state.Said.Result = "The reply stands in the log. Nothing asked for one, so carry on, and write it in the chat too where the owner reads it."
		return
	}
	if lacks := state.Demand.lacks(said); lacks != "" {
		state.Said.Result = lacks
		return
	}
	why := state.Demand.Why
	state.paid(said, held)
	state.Said.Rows = append(state.Said.Rows, rowOf(at, replyRow, said, "answers: "+why))
	state.Said.Result = "The reply stands in the log, and it answers: " + why + ". Write it in the chat too, as text, and carry on."
}

// The log lands one row at the level the call names, as the bridge's writesLine answered it. [[spec/design_output/log#the-log-tool]]
func (state *Holds) logs(fields map[string]any, at time.Time) {
	kind, said := strings.TrimSpace(callField(fields, "kind")), strings.TrimSpace(callField(fields, "said"))
	if kind == "" || said == "" {
		state.Said.Result = "log takes a kind and one sentence."
		return
	}
	row := rowOf(at, kind, said, "")
	if level := callField(fields, "level"); slices.Contains(logLevels, level) {
		row.Level = level
	}
	row.Text = strings.TrimSpace(callField(fields, "text"))
	state.Said.Rows = append(state.Said.Rows, row)
	state.Said.Result = "The line stands in the log under " + kind + "."
}

// The text the holds or the stops word for the session's newest call, as the tool's result. An event whose folds word none passes on. [[spec/tickets/log-report-stop-in-go]]
func (d *Door) answers(session string, post Post) (Effect, bool) {
	if post.Event != toolEvent {
		return Effect{}, false
	}
	snap := d.from.Store.Snapshot()
	d.mu.Lock()
	seq := d.seqs[session]
	d.mu.Unlock()
	if holds, ok := snap.Read(d.holdsOf(session)).(Holds); ok && holds.Said.Seq == seq && holds.Said.Result != "" {
		return Effect{Kind: resultKind, Result: map[string]any{"result": holds.Said.Result}}, true
	}
	if stops, ok := snap.Read(d.stopsOf(session)).(Stops); ok && stops.Said.Seq == seq && stops.Said.Result != "" {
		return Effect{Kind: resultKind, Result: map[string]any{"result": stops.Said.Result}}, true
	}
	return Effect{}, false
}
