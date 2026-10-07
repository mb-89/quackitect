// The holds fold: the state the bridge's holds keep on its box, folded over a
// session's events, and the answer the chain gives the newest call. The door
// stamps the config each hold reads on every event, under held, so the fold
// reads no file. [[spec/tickets/cage-call-holds-port]]
package hooks

import (
	"quackitect/src/yaml"

	"math"
	"regexp"
	"strconv"
	"strings"
	"time"
	"unicode/utf16"

	"quackitect/src/q"
)

// The local name of the fold, and the word of a block that rides the call. [[spec/tickets/cage-call-holds-port]]
const (
	HoldsName = "holds/<id>"
	RideWord  = "ride"
)

// The events the fold reads, the field the door stamps, and the words and tools the holds name, off src/bridge/stop.js, grace.js, plan.js, answer.js and ask.js. [[spec/tickets/cage-call-holds-port]]
const (
	promptEvent  = "prompt.submit"
	displayEvent = "classic.MessageDisplay"
	spokeEvent   = "agent.spoke"
	turnEvent    = "turn.complete"
	heldField    = "held"
	finishHold   = "finish"
	stopHold     = "stop"
	offHold      = "off"
	quiet        = "quiet"
	godBinding   = "god"
	levelZero    = "mcp__level0__"
	planCall     = levelZero + "plan"
	reportCall   = levelZero + "report"
	logCall      = levelZero + "log"
	askTool      = "AskUserQuestion"
	schemaTool   = "ToolSearch"
	promptWhy    = "The owner sent a prompt"
	planReact    = "call " + planCall + " with the answers"
	saidCap      = 80
	leastGrace   = 1
	answerReason = "answer"
)

// The config words the door stamps under held, by the keys the bridge reads them under. [[spec/tickets/cage-call-holds-port]]
const (
	heldHold        = "stop.hold"
	heldFinishGrace = "grace.finish"
	heldAsk         = "ask.wanted"
	heldUpdateGrace = "grace.update"
	heldPlanEvery   = "plan.everyCalls"
	heldPlanGrace   = "plan.grace"
	heldPlanMost    = "plan.mostOpen"
	heldBinding     = "engine.binding"
	heldCloud       = "cloud"
	heldWorking     = "plan.working"
	heldTodos       = "plan.todos"
)

// The calls a turn ends with, which the holds let through, and the calls that reach the owner, which the answer door lets through. [[spec/design_output/stop#the-hold]]
var (
	endsTurn = map[string]bool{reportCall: true, levelZero + "stop": true, levelZero + "check_answer": true}
	reaches  = map[string]bool{askTool: true, reportCall: true}
	owners   = map[string]bool{"composer": true, "sdk": true}
	spaces   = regexp.MustCompile(`\s+`)
)

// The refusal of a cloud box's question, off ASKS_NOBODY in src/bridge/cloud-ask.js. [[spec/design_output/level0#the-cloud-ask-door]]
const asksNobody = "Nobody sits beside this cloud box, so a question in the chat meets nobody. Where you can decide, decide, and say what you weigh and assume. Where a person alone can, mint a ticket on the person route: `./RUNME.sh mint ticket spec/tickets/<name>.md --process=person`. Write every command they need into its ask, push it, and go on with the branch. Rule 7 of spec/guidance/cloud/cloud says why."

// What the holds keep over a session: the finish calls of the turn, the agent's calls since the plan's last answer, the engine's ask, the reply the owner waits for, the update ask standing, the newest text, and the answer to the newest event. [[spec/tickets/cage-call-holds-port]]
type Holds struct {
	Finish int     `json:"finish"`
	Calls  int     `json:"calls"`
	Grace  *Grace  `json:"grace,omitempty"`
	Demand *Demand `json:"demand,omitempty"`
	Asked  string  `json:"asked,omitempty"`
	Spoken string  `json:"spoken,omitempty"`
	Said   Said    `json:"said"`
	// The owner's hold the turn's end dropped, which the stop vote reads until a prompt opens the next turn. [[spec/tickets/cage-hold-drops-port]]
	Stood string `json:"stood,omitempty"`
	// The questions the owner's last prompt asks, which the answer check reads. [[spec/tickets/prose-tools-answer-in-go]]
	Questions int `json:"questions,omitempty"`
}

// The engine's ask, off wants in src/bridge/grace.js. [[spec/design_output/stop#the-grace]]
type Grace struct {
	Why   string `json:"why"`
	React string `json:"react"`
	Tool  string `json:"tool"`
	Left  int    `json:"left"`
}

// The reply the owner waits for, off demands in src/bridge/answer.js. Block says the demand's block rides its skips, and Update names the update ask it pays. [[spec/design_output/level0#the-owners-prompt-comes-first]]
type Demand struct {
	Why    string `json:"why"`
	Seen   string `json:"seen"`
	Skips  int    `json:"skips"`
	Block  bool   `json:"block,omitempty"`
	Prompt bool   `json:"prompt,omitempty"`
	Before string `json:"before,omitempty"`
	Update string `json:"update,omitempty"`
	// The chapters a full update carries, which a text lacking one pays nothing of. [[spec/tickets/cage-stop-rules-port]]
	Chapters []string `json:"chapters,omitempty"`
}

// The answer the holds give one event: its place, the word, and the refusal's text. No word lets the event through. [[spec/tickets/cage-call-holds-port]]
type Said struct {
	Seq  int64  `json:"seq"`
	Word string `json:"word,omitempty"`
	Text string `json:"text,omitempty"`
	// The config keys the event drops, and the value each drops to. [[spec/tickets/cage-hold-drops-port]]
	Drops map[string]string `json:"drops,omitempty"`
	// The handover marks the event writes and drops, which the stops fold names. [[spec/tickets/cage-stop-marks-port]]
	Marks *Marks `json:"marks,omitempty"`
	// The rows of the session log the event names, and the text an owner's prompt answers with, the answer-first line in front. [[spec/tickets/prompt-answers-off-the-door]]
	Rows   []LogRow `json:"rows,omitempty"`
	Prompt string   `json:"prompt,omitempty"`
	// The text a log, report or stop call answers with. Set at tests-green. [[spec/tickets/log-report-stop-in-go]]
	Result string `json:"result,omitempty"`
}

// The fold's step. Every hold skips a helper's event, so a helper's event moves nothing. [[spec/design_output/level0#a-helper-ends-no-turn]]
func stepHolds(state Holds, event q.Event) Holds {
	state = state.copied()
	state.Said = Said{Seq: event.Seq}
	fields := event.Fields
	if event.Hand.Agent != "" {
		// A helper's log and report answer as the main agent's do, as the bridge answers them. [[spec/tickets/helpers-calls-answer-too]]
		if event.Kind == toolEvent {
			state.answers(fields, heldIn(fields), event.At)
		}
		return state
	}
	switch event.Kind {
	case promptEvent:
		state.Stood = ""
		state.prompted(fields, event.At)
	case displayEvent:
		if text := strings.TrimSpace(textOf(fields, "delta")); text != "" {
			state.Spoken = text
			if state.Demand != nil && state.Demand.lacks(text) == "" {
				state.paid(text, heldIn(fields))
			}
		}
	case spokeEvent:
		state.spoke(fields)
	case turnEvent:
		state.turnEnds(fields)
	case toolEvent:
		state.called(fields, event.At)
	}
	return state
}

func (state Holds) copied() Holds {
	if state.Grace != nil {
		grace := *state.Grace
		state.Grace = &grace
	}
	if state.Demand != nil {
		demand := *state.Demand
		state.Demand = &demand
	}
	return state
}

// A prompt names its row, a prompt row for an owner and an agent row for anything else. An owner's prompt opens a demand, keyed by the newest row the bridgehead found at it, and answers with the answer-first line in front, as onPromptSubmit in src/bridge/answer.js does. A prompt naming a note waits on the note, which the port leaves to the bridge. [[spec/design_output/level0#which-prompt-opens-a-turn]] [[spec/tickets/prompt-answers-off-the-door]]
func (state *Holds) prompted(fields map[string]any, at time.Time) {
	origin, _ := fields["origin"].(map[string]any)
	from, text := textOf(origin, "kind"), textOf(fields, "text")
	kind := agentRow
	if owners[from] {
		kind = promptRow
	}
	state.Said.Rows = append(state.Said.Rows, rowOf(at, kind, text, from))
	if !owners[from] {
		return
	}
	state.Demand = &Demand{Why: promptWhy, Seen: state.Spoken, Prompt: true, Before: textOf(fields, "before")}
	state.Said.Prompt = warns(promptWhy) + "\n\n" + text
	state.Questions = questionsIn(text)
}

// The questions a prompt asks: each run of marks closing a word, outside a fence, off questionsIn in lib/answer.js. [[spec/tickets/prose-tools-answer-in-go]]
func questionsIn(text string) int {
	fenced, count := false, 0
	for _, line := range lineBreak.Split(text, -1) {
		if fenceLine.MatchString(line) {
			fenced = !fenced
			continue
		}
		if fenced {
			continue
		}
		for _, at := range questionRun.FindAllStringIndex(line, -1) {
			if at[1] == len(line) || strings.ContainsRune(" \t\f\v\r", rune(line[at[1]])) {
				count++
			}
		}
	}
	return count
}

// A line break, a fence's opening line, and a run of question marks. [[spec/tickets/prose-tools-answer-in-go]]
var (
	lineBreak   = regexp.MustCompile(`\r?\n`)
	fenceLine   = regexp.MustCompile("^\\s*(```|~~~)")
	questionRun = regexp.MustCompile(`\?+`)
)

// The answer-first line, off warns in .claude/skills/level0/lib/answer.js. [[spec/tickets/prompt-answers-off-the-door]]
func warns(why string) string {
	return why + ", and nothing has answered it yet. Write the answer in the chat, as text before the next tool call: what you understood and what you do next. Level zero refuses that call until an answer stands in the chat."
}

// The spoke post pays with a fresh text fitting the demand, refuses naming what the newest one lacks, and names the last text seen where none stands. [[spec/design_output/level0#the-owners-prompt-comes-first]] [[spec/tickets/cage-stop-rules-port]]
func (state *Holds) spoke(fields map[string]any) {
	if state.Demand == nil {
		return
	}
	fresh := freshTexts(fields, state.Demand)
	for at := len(fresh) - 1; at >= 0; at-- {
		if state.Demand.lacks(fresh[at]) == "" {
			state.paid(fresh[at], heldIn(fields))
			return
		}
	}
	if len(fresh) > 0 {
		newest := fresh[len(fresh)-1]
		state.Said.Word = RefuseWord
		state.Said.Text = state.Demand.lacks(newest) + " The last text seen (" + strconv.Itoa(len(utf16.Encode([]rune(newest)))) + " characters) reads: \"" + head(newest) + "\"."
		return
	}
	state.Said.Word = RefuseWord
	state.Said.Text = says(state.Demand.Why) + " The last text seen stands from before the ask, and reads: \"" + head(state.Demand.Seen) + "\"."
}

// The turn's end pays with its answer or drops the demand, and puts the finish calls back. A finish or a stop hold drops to off and stands as the stood mark, as dropsHold in src/bridge/stop.js does. [[spec/design_output/stop#the-hold]] [[spec/tickets/cage-hold-drops-port]]
func (state *Holds) turnEnds(fields map[string]any) {
	held := heldIn(fields)
	if hold := textOf(held, heldHold); hold == finishHold || hold == stopHold {
		state.Stood = hold
		state.drops(heldHold, offHold)
	}
	text := strings.TrimSpace(textOf(fields, "answer"))
	answered := textOf(fields, "reason") == answerReason && text != ""
	switch {
	case answered && state.Demand != nil && state.Demand.lacks(text) == "":
		state.paid(text, held)
	case answered:
		state.Spoken = text
	}
	// A full update's demand outlives the turn that lacks its chapters. [[spec/tickets/cage-stop-rules-port]]
	if state.Demand != nil && len(state.Demand.Chapters) == 0 {
		state.Demand = nil
	}
	state.Finish = 0
}

// The pay clears the demand. Where it pays an update and the ask still stands at the paid value, the ask drops to quiet, as dropsAsk in src/bridge/ask.js does. A value pressed since stands. [[spec/tickets/cage-hold-drops-port]]
func (state *Holds) paid(text string, held map[string]any) {
	if wanted := state.Demand.Update; wanted != "" {
		state.Asked = ""
		if textOf(held, heldAsk) == wanted {
			state.drops(heldAsk, quiet)
		}
	}
	state.Demand = nil
	state.Spoken = text
}

// Names one config key the event drops, and the value it drops to. [[spec/tickets/cage-hold-drops-port]]
func (state *Holds) drops(key, value string) {
	if state.Said.Drops == nil {
		state.Said.Drops = map[string]string{}
	}
	state.Said.Drops[key] = value
}

// The config the door stamps on an event, or none. [[spec/tickets/cage-hold-drops-port]]
func heldIn(fields map[string]any) map[string]any {
	held, _ := fields[heldField].(map[string]any)
	return held
}

// A call meets the update ask and the plan's count, then the chain onToolCall runs: the owner's hold, the cloud ask, the grace, then the answer door. The first that answers ends the chain, and a call the chain lets through meets its tool's own door. [[spec/tickets/cage-call-holds-port]]
func (state *Holds) called(fields map[string]any, at time.Time) {
	held := heldIn(fields)
	tool := textOf(fields, "tool")
	state.asksForUpdate(held)
	if _, rides := fields["plan"].(map[string]any); rides && strings.HasPrefix(tool, levelZero) && tool != planCall {
		state.planned()
	}
	state.Calls++
	state.asksForPlan(held)
	word, text := state.chain(tool, held)
	if word != RideWord && word != "" && textOf(held, heldBinding) == godBinding {
		word, text = "", ""
	}
	state.Said.Word, state.Said.Text = word, text
	if word == RefuseWord || word == HoldWord {
		return
	}
	if tool == planCall {
		state.planned()
	}
	state.answers(fields, held, at)
}

// The update ask opens a demand whose block rides its grace, unless an unpaid prompt stands or the same ask stands already. A full update's demand carries the chapters the door stamps. [[spec/design_output/extension#the-ask-is-a-line]] [[spec/tickets/cage-stop-rules-port]]
func (state *Holds) asksForUpdate(held map[string]any) {
	wanted := textOf(held, heldAsk)
	if wanted == "" {
		wanted = quiet
	}
	if wanted == quiet || (state.Demand != nil && state.Demand.Prompt) || (state.Asked == wanted && state.Demand != nil) {
		return
	}
	state.Asked = wanted
	grace := numberOf(held, heldUpdateGrace)
	if grace < leastGrace {
		grace = leastGrace
	}
	state.Demand = &Demand{Why: "The owner asks for a " + wanted + " update", Seen: state.Spoken, Skips: grace, Block: true, Update: wanted, Chapters: chaptersIn(held)}
}

// The plan's answer starts the count over and answers the engine's ask. [[spec/design_output/stop#the-plan]]
func (state *Holds) planned() {
	state.Calls = 0
	if state.Grace != nil && state.Grace.Tool == planCall {
		state.Grace = nil
	}
}

// Once the count reaches the number, the engine asks its questions over the grace, naming the work in hand first. [[spec/design_output/stop#the-plan]]
func (state *Holds) asksForPlan(held map[string]any) {
	every := numberOf(held, heldPlanEvery)
	if every <= 0 || state.Calls < every || state.Grace != nil {
		return
	}
	questions := []string{"what do you work on now, by its title or ticket name", "which todos did you finish"}
	if most := numberOf(held, heldPlanMost); !(most > 0 && numberOf(held, heldTodos) >= most) {
		questions = append(questions, "which todos do you add, each with its place")
	}
	why := "The engine asks: " + strings.Join(questions, "; ") + "."
	if working := textOf(held, heldWorking); working != "" {
		why = "You work on " + working + ". " + why
	}
	left := numberOf(held, heldPlanGrace)
	if left < 0 {
		left = 0
	}
	state.Grace = &Grace{Why: why, React: planReact, Tool: planCall, Left: left}
}

func (state *Holds) chain(tool string, held map[string]any) (string, string) {
	if word, text, ok := state.holdsCall(tool, held); ok {
		return word, text
	}
	if tool == askTool && yaml.Truthy(held[heldCloud]) {
		return RefuseWord, asksNobody
	}
	// ToolSearch loads a schema and changes nothing, so it passes the grace and the demand and spends neither, and a context the handover clears still loads the tool the grace asks for. [[spec/tickets/toolsearch-rides-the-plan-ask]]
	if tool == schemaTool {
		return "", ""
	}
	if grace := state.Grace; grace != nil && !endsTurn[tool] && !(grace.Tool != "" && tool == grace.Tool) {
		if grace.Left > 0 {
			grace.Left--
			return RideWord, ""
		}
		return RefuseWord, refusedByGrace(*grace)
	}
	if demand := state.Demand; demand != nil && !reaches[tool] {
		if demand.Skips > 0 {
			demand.Skips--
			if demand.Block {
				return RideWord, ""
			}
			return "", ""
		}
		return HoldWord, ""
	}
	return "", ""
}

// The owner's hold: the stop hold refuses every call but the ones ending a turn, and the finish hold rides its grace first. Either one's block ends the chain. [[spec/design_output/stop#the-grace]]
func (state *Holds) holdsCall(tool string, held map[string]any) (string, string, bool) {
	hold := textOf(held, heldHold)
	if hold != finishHold && hold != stopHold {
		return "", "", false
	}
	if hold == finishHold {
		state.Finish++
	}
	most := numberOf(held, heldFinishGrace)
	spent := hold == finishHold && most > 0 && state.Finish > most
	if (hold == stopHold || spent) && !endsTurn[tool] {
		return RefuseWord, refusedByHold(tool), true
	}
	return RideWord, "", true
}

// [[spec/design_output/stop#the-hold]]
func refusedByHold(tool string) string {
	if tool == "" {
		tool = "this call"
	}
	return "The owner holds this session at stop, so " + tool + " is refused. Put the work down where it stands. Make no other call. Say what stands and what is left, hand the last word in through " + reportCall + ", and end the turn with the stop line."
}

// [[spec/design_output/stop#the-grace]]
func refusedByGrace(grace Grace) string {
	react := grace.React
	if react != "" {
		react = strings.ToUpper(react[:1]) + react[1:]
	}
	load := ""
	if grace.Tool != "" {
		load = " Where " + grace.Tool + " stands unloaded, call " + schemaTool + " with the query select:" + grace.Tool + " first."
	}
	return grace.Why + " The grace is spent, so this call is refused. " + react + ", and the calls pass again." + load
}

// The answer door's words, off SAYS in src/bridge/answer.js. [[spec/design_output/level0#the-reply-line]]
func says(why string) string {
	return why + ", and nothing has answered it. Answer it before the next tool call: write it in the chat as text, which pays this door the moment the chat shows it. Call " + reportCall + " with the same text so the log carries it. Say what you understood and what you do next. Then work."
}

// A prompt's demand reads the transcript past its own row, and every other one the texts past the last one seen. [[spec/tickets/a-reply-follows-its-prompt]]
func freshTexts(fields map[string]any, demand *Demand) []string {
	rows, isRows := fields["rows"].([]any)
	if !demand.Prompt || !isRows {
		return textsSince(fields, demand.Seen)
	}
	if demand.Before == "" {
		return nil
	}
	return pastRow(rows, demand.Before)
}

func textsSince(fields map[string]any, seen string) []string {
	var texts []string
	listed, _ := fields["texts"].([]any)
	for _, one := range append(listed, fields["text"]) {
		if said, _ := one.(string); strings.TrimSpace(said) != "" {
			texts = append(texts, strings.TrimSpace(said))
		}
	}
	at := -1
	for where, one := range texts {
		if one == seen {
			at = where
		}
	}
	var out []string
	for where, one := range texts {
		fresh := (at >= 0 && where > at) || (at < 0 && one != seen)
		if fresh && !has(out, one) {
			out = append(out, one)
		}
	}
	return out
}

func pastRow(rows []any, before string) []string {
	at := -1
	for where, one := range rows {
		if row, _ := one.(map[string]any); textOf(row, "id") == before {
			at = where
			break
		}
	}
	if at < 0 {
		return nil
	}
	owner := -1
	for where := at + 1; where < len(rows); where++ {
		if row, _ := rows[where].(map[string]any); textOf(row, "role") == "user" && !yaml.Truthy(row["results"]) {
			owner = where
			break
		}
	}
	if owner < 0 {
		return nil
	}
	var out []string
	for _, one := range rows[owner+1:] {
		if row, _ := one.(map[string]any); textOf(row, "role") == "assistant" {
			if text := strings.TrimSpace(textOf(row, "text")); text != "" {
				out = append(out, text)
			}
		}
	}
	return out
}

// The text cut to the characters a log line names, with its runs of space as one. [[spec/design_output/level0#the-owners-prompt-comes-first]]
func head(text string) string {
	said := []rune(spaces.ReplaceAllString(text, " "))
	if len(said) > saidCap {
		said = said[:saidCap]
	}
	return string(said)
}

func has(list []string, one string) bool {
	for _, each := range list {
		if each == one {
			return true
		}
	}
	return false
}

// A number the door stamps, whole or read back off JSON. [[spec/tickets/cage-call-holds-port]]
func numberOf(from map[string]any, key string) int {
	switch one := from[key].(type) {
	case int:
		return one
	case int64:
		return int(one)
	case float64:
		if math.IsNaN(one) {
			return 0
		}
		return int(one)
	}
	return 0
}
