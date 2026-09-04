package main

import (
	"crypto/sha256"
	"encoding/json"
	"fmt"
	"io"
	"os"
	"path/filepath"
	"strings"
)

// The guard. The harness runs this program for every event it has, hands it
// one JSON object on standard input, and reads the answer from standard
// output.
//
// ONE COMMAND FOR EVERY EVENT. The event names itself in the input, so the
// cage does not have to spell each one, and adding an event is a line in the
// cage rather than a new program.
//
// LEVEL 0 DECIDES ALMOST NOTHING. It records everything, and it enforces the
// short list that files and identities state fully. Everything about the work
// is asked of an authority, and with no authority present the answer is yes.

type hookIn struct {
	SessionID      string          `json:"session_id"`
	Cwd            string          `json:"cwd"`
	Event          string          `json:"hook_event_name"`
	ToolName       string          `json:"tool_name"`
	ToolInput      json.RawMessage `json:"tool_input"`
	ToolUseID      string          `json:"tool_use_id"`
	Prompt         string          `json:"prompt"`
	UserPrompt     string          `json:"user_prompt"`
	Source         string          `json:"source"`
	AgentID        string          `json:"agent_id"`
	AgentType      string          `json:"agent_type"`
	StopHookActive bool            `json:"stop_hook_active"`
	Transcript     string          `json:"transcript_path"`
	// ErrorType is what ended a turn on an API error: rate_limit,
	// max_output_tokens and the rest. It comes with StopFailure only.
	ErrorType string `json:"error_type"`
	// LastAssistantMessage is what the agent, or a helper, said last. It
	// comes with Stop and SubagentStop, and for a helper it is the answer
	// handed back to whoever spawned it.
	LastAssistantMessage string `json:"last_assistant_message"`
}

type toolInput struct {
	FilePath string `json:"file_path"`
	Path     string `json:"path"`
	Command  string `json:"command"`
	Content  string `json:"content"`
	// NewString is what an Edit puts in, which is a write of that text.
	NewString string `json:"new_string"`
	// Actor is the name a lane call acts as: se_pull, se_run and the rest
	// carry it as a field where a shell command carries it as --actor.
	Actor string `json:"actor"`
	// NewSource is what a NotebookEdit puts in a cell, which is a write too.
	NewSource string `json:"new_source"`
	// Edits is a MultiEdit's manifest, and every member of it writes.
	Edits []struct {
		NewString string `json:"new_string"`
	} `json:"edits"`
	// The range a read asked for. Offset is the first line and Limit how
	// many, and both are zero when the read asked for the whole file.
	Offset int `json:"offset"`
	Limit  int `json:"limit"`
}

// THE TOOLS THAT WRITE A FILE THE HARNESS NAMES, declared once.
var writesTools = map[string]bool{"Write": true, "Edit": true, "NotebookEdit": true, "MultiEdit": true}

// writtenText is everything a writing tool is about to put on disk, whichever
// field its shape carries the text in, joined so a guard reads all of it.
//
// EVERY MEMBER, NOT THE FIRST. The content guards read only the content
// field, so an Edit's new_string, a MultiEdit's members and a NotebookEdit's
// new_source all walked past every content rule.
func (ti toolInput) writtenText() string {
	parts := make([]string, 0, 3+len(ti.Edits))
	for _, s := range []string{ti.Content, ti.NewString, ti.NewSource} {
		if s != "" {
			parts = append(parts, s)
		}
	}
	for _, e := range ti.Edits {
		if e.NewString != "" {
			parts = append(parts, e.NewString)
		}
	}
	return strings.Join(parts, "\n")
}

// Deny is the shape Claude Code reads for a tool decision.
func (g *guard) deny(reason string) {
	out, _ := json.Marshal(map[string]any{
		"hookSpecificOutput": map[string]any{
			"hookEventName":            "PreToolUse",
			"permissionDecision":       "deny",
			"permissionDecisionReason": reason,
		},
	})
	fmt.Fprintln(g.out, string(out))
}

// THE BACK CHANNEL. An authority above may exist, and this is where it speaks.
//
// Level 0 refuses a stop for reasons it does not hold and cannot read. A level
// above registers a check, the guard runs it, and the reason it returns is
// carried to the agent word for word. Nothing here learns what the reason is
// about, which is what lets this file stay free of every word the levels above
// are built from.
//
// The list is empty when Level 0 runs alone, and an empty list refuses nothing.
// A ruling is opaque. Permitted, and words to pass on. Level 0 reads the
// first and never the second.
type Ruling struct {
	Permitted bool
	Reason    string
}

type StopCheck func(Roots, string) Ruling

var stopChecks []StopCheck

// RegisterStopCheck is called from an init in the level that owns the reason.
// Registration rather than a call means this file never names that level.
func RegisterStopCheck(c StopCheck) { stopChecks = append(stopChecks, c) }

// askTheAuthority runs every registered check and carries the first refusal.
// First rather than all, because an agent acts on one thing at a time, and a
// refusal it cannot act on whole is a refusal it acts on badly.
func askTheAuthority(roots Roots, actor string) Ruling {
	for _, c := range stopChecks {
		if r := c(roots, actor); !r.Permitted {
			return r
		}
	}
	return Ruling{Permitted: true}
}

// The one call that is allowed while an answer is owed is the one that gives
// it. Anything else would be a refusal nobody could satisfy.
//
// IT MATCHES THE COMMAND AND NOT THE TEXT. A substring match opened the guard
// for anything that mentioned the words, and a submission carrying the phrase
// se_answer in its evidence would have walked straight through.
func isAnswering(in hookIn) bool {
	if in.ToolName == "se_answer" || in.ToolName == "mcp__quackitect__se_answer" {
		return true
	}
	var ti toolInput
	_ = json.Unmarshal(in.ToolInput, &ti) // a call whose input will not read names no file, and the caller checks that
	return runsTheEngineWith(ti.Command, "--answer")
}

// runsTheEngineWith answers whether a shell command runs the engine and passes
// this flag as an argument of its own.
//
// A FLAG IS AN ARGUMENT, NOT A SUBSTRING. It is looked for among the words
// after the program, and the program has to be the engine, so a file named
// --answer.md or a sentence containing the word does not count.
func runsTheEngineWith(command, flag string) bool {
	words := strings.Fields(command)
	program := -1
	for i, w := range words {
		if isTheEngine(w) {
			program = i
			break
		}
	}
	if program < 0 {
		return false
	}
	for _, w := range words[program+1:] {
		if w == flag || strings.HasPrefix(w, flag+"=") {
			return true
		}
	}
	return false
}

// runsTheEngine answers whether this command runs the engine at all, whatever
// it asks the engine to do.
//
// IT IS THE NAMED EXCEPTION TO THE WRITE GATE. Minting a token, saying which
// one you are on, answering the person: an agent with nothing in hand does all
// of those through the engine, so gating them would be a gate nobody could ever
// pass. It is deliberately the whole program rather than a list of verbs: a
// list of verbs is a set described rather than asked for, and it goes short the
// day somebody adds one.
// THE ENGINE HAS TO BE THE PROGRAM, AND THE ONLY ONE.
//
// This asked whether any word was the engine, so the write gate was skipped for
// any command that merely mentioned it: echo se was in the exception, and so was
// echo se && rm -rf src/engine. And a compound whose first half ran the engine
// took its second half through with it, because the gate reads one string.
//
// SO IT ANCHORS THE WAY runsTheEngineWith ALREADY DOES. The engine is the first
// word, and a separator introducing a second program takes the command back out
// of the exception. A separator inside quotes is data and not a separator, which
// is why the quoted spans come out first: an answer carrying a semicolon is an
// answer, and refusing it would break the one call an agent with nothing in hand
// has to be able to make.
func runsTheEngine(command string) bool {
	// THE PROGRAM IS READ WITH ITS QUOTES ON, because a path with a space in it
	// is one word and this machine has several. The separators are read with the
	// quotes off, because punctuation inside them is somebody's prose.
	if !isTheEngine(firstWord(command)) {
		return false
	}
	// A REDIRECTION IS A WRITE AND IT NEEDS NO SECOND PROGRAM. This list held the
	// separators that introduce another program and not the ones that write a
	// file, so `se --version > src/engine/gate.go` was inside the exception: an
	// ungated write of the gate's own source. A reviewer found it on the shipped
	// binary, with the redirection allowed and a plain search from the same actor
	// refused.
	// ONE WALK, AND EVERY QUESTION READ OFF IT. Where the quoted spans begin
	// and end is one fact about the string, so a second pass with its own
	// delimiters builds a second parse and at most one of them is bash's.
	//
	// THAT SECOND PARSE IS HOW THIS LEAKED A FOURTH TIME. The substitution
	// scan demoted the double quote, so an apostrophe in ordinary English --
	// it's, don't -- opened a span for it, and everything to the next
	// apostrophe was invisible to the only scan hunting $( and a backtick.
	// rev-25 drove `se work --detail "it's $(...)"` past the gate, and a bare
	// substitution behind an earlier apostrophe with it.
	separators, substitutions := theQuotings(command)
	// A SEPARATOR IS LITERAL INSIDE EITHER KIND OF QUOTE, which is what keeps
	// `se work --detail "a sentence; with punctuation"` working.
	if strings.ContainsAny(separators, ";&|<>\n") {
		return false
	}
	// A SUBSTITUTION IS LITERAL IN SINGLE QUOTES AND LIVE IN DOUBLE ONES.
	return !strings.Contains(substitutions, "$(") && !strings.Contains(substitutions, "`")
}

// theQuotings walks a command once in bash's own state machine and answers both
// readings of it: separators is everything unquoted, and substitutions is
// everything except the single-quoted spans.
//
// SPLIT THE ANSWER, NEVER THE WALK. A single quote is literal inside a
// double-quoted span and a double quote is literal inside a single-quoted one,
// so where the spans lie is decided once, here, and each scan reads its own
// string off that one decision.
func theQuotings(command string) (separators, substitutions string) {
	var sep, sub strings.Builder
	quote := rune(0)
	for _, r := range command {
		switch {
		case quote == '\'':
			if r == '\'' {
				quote = 0
			}
		case quote == '"':
			if r == '"' {
				quote = 0
				continue
			}
			sub.WriteRune(r)
		case r == '\'' || r == '"':
			quote = r
			sep.WriteRune(' ')
			if r == '\'' {
				sub.WriteRune(' ')
			}
		default:
			sep.WriteRune(r)
			sub.WriteRune(r)
		}
	}
	return sep.String(), sub.String()
}

// The first word of a command, with a quoted span counting as part of one word.
func firstWord(command string) string {
	var out strings.Builder
	quote := rune(0)
	for _, r := range command {
		switch {
		case quote != 0:
			if r == quote {
				quote = 0
				continue
			}
			out.WriteRune(r)
		case r == '"' || r == '\'':
			quote = r
		case r == ' ' || r == '\t':
			if out.Len() > 0 {
				return out.String()
			}
		default:
			out.WriteRune(r)
		}
	}
	return out.String()
}

// isTheEngine answers whether this word names the engine, wherever it was
// started from and however it is quoted.
func isTheEngine(word string) bool {
	w := strings.Trim(word, `"'`)
	w = strings.ReplaceAll(w, `\`, "/")
	if i := strings.LastIndex(w, "/"); i >= 0 {
		w = w[i+1:]
	}
	return w == "se" || w == "se.exe"
}

// Block is the shape a Stop hook reads. The reason reaches the agent.
func (g *guard) blockStop(reason string) {
	out, _ := json.Marshal(map[string]any{"decision": "block", "reason": reason})
	fmt.Fprintln(g.out, string(out))
}

// runHook is the command form: the event on standard input, the decision on
// standard output. The engine that lives serves the same function over HTTP.
func runHook(args []string) {
	raw, err := io.ReadAll(os.Stdin)
	if err != nil {
		// A guard that cannot read its input must not pass silently. It says
		// so and allows, because a broken guard must not stop a person from
		// working. The record carries the failure.
		fmt.Fprintln(os.Stderr, "hook: cannot read the event:", err)
		return
	}
	answerHook(raw, args, os.Stdout, nil)
}

// answerHook is the guard: one event in, one decision out. held is the
// record when the engine that lives is answering, and nil when a process
// per event is, which then opens the record for the length of the event.
func answerHook(raw []byte, args []string, out io.Writer, held *Log) {
	g := &guard{out: out}
	var in hookIn
	if err := json.Unmarshal(raw, &in); err != nil {
		fmt.Fprintln(os.Stderr, "hook: the event is not readable JSON:", err)
		return
	}
	method, wake := "", false
	for i := 0; i < len(args); i++ {
		switch args[i] {
		case "--method":
			if i+1 < len(args) {
				method = args[i+1]
				i++
			}
		case "--wake":
			wake = true
		default:
			if in.Event == "" {
				in.Event = args[i] // a harness that names the event on the line
			}
		}
	}

	work := in.Cwd
	if work == "" {
		work, _ = os.Getwd()
	}
	roots, err := FindRoots(work, "")
	if err != nil {
		fmt.Fprintln(os.Stderr, "hook:", err)
		return
	}
	// THE CAGE SAYS WHERE THE METHOD IS. A guard is started by the harness
	// from wherever the harness happens to be, so it cannot work the method
	// root out from its own path. The cage is itself a projection, and a
	// projection knows both roots.
	if method != "" {
		if abs, err := filepath.Abs(method); err == nil {
			roots.Method = abs
		}
	}

	// THE WAKE. A command hook that does one thing: an engine that is down is
	// brought up. It runs at session start and once per prompt, so a crash
	// costs at most the rest of one turn, and every per-call event goes to
	// the engine over HTTP with no process at all.
	if wake {
		ensureEngine(roots)
		return
	}

	log := held
	if log == nil {
		opened, err := OpenExistingLog(roots.Private("log"))
		if err != nil {
			// No log means no engine. The guard still answers, because the
			// answer is about a file and not about a session.
			log = nil
		} else {
			log = opened
			defer opened.Close()
		}
	}

	// A HASH IN THE ACTOR COLUMN TELLS A READER NOTHING. The harness names an
	// agent with one, and Level 0 gives it a speaking name when it starts.
	//
	// The identity is still the harness's, and it is what everything is keyed
	// by. The name is what the record shows.
	if in.Event == "SubagentStart" {
		NoteAgent(roots, in.AgentID, in.AgentType, in.SessionID)
	}
	// WHOEVER IS CALLING IS HERE, whether or not this run saw them arrive.
	// An end event is the one call that says the opposite, and it is
	// handled below rather than registered here.
	if in.Event != "SessionEnd" && in.Event != "SubagentStop" {
		AgentSeen(roots, in.SessionID, in.AgentID, in.AgentType)
	}
	actor := NameOf(roots, in.AgentID)

	cfg := LoadConfig(roots)
	emergency := LoadEmergency(roots)

	// A PERSON PUT EVERYTHING DOWN. Nothing the agent asks for is allowed
	// while it is on, and the only thing left to do is stop. No claim is
	// wanted: the button is the grant.
	if h := LoadHold(roots); h.On {
		switch in.Event {
		case "PreToolUse":
			record(log, "engine", "hold", actor, "refused: everything is on hold", No(),
				map[string]any{"tool": in.ToolName})
			g.deny(h.Says)
			return
		case "Stop":
			record(log, "agent", "stop", actor, "stopped: everything is on hold", Yes(), nil)
			return
		}
	}

	// WHAT THE PERSON SAID MID-TURN, COPIED BY THE ENGINE.
	//
	// The harness fires no event for a message written into a running turn, and
	// it writes one to its own transcript. The guard runs on every tool call,
	// so a message is in the record by the agent's next call whatever the agent
	// remembers to do.
	// AN ANSWER SETTLES WHAT WAS OUTSTANDING WHEN IT WAS WRITTEN, so the clear
	// comes before this event's new messages are copied. Copying first recorded
	// the new question and then deleted it in the same event, and the answer
	// that discharged it was composed before that question existed.
	//
	// THE GUARD CLEARS IT, BECAUSE ONLY THE GUARD KNOWS WHO ANSWERED. The
	// answer verb runs as a program with no idea which agent called it.
	if in.Event == "PostToolUse" && isAnswering(in) {
		_ = TheyWereAnswered(roots, actor) // an answer it cannot clear is cleared on the next call
	}
	if in.Event == "PreToolUse" || in.Event == "PostToolUse" || in.Event == "Stop" {
		CopyWhatWasHeard(roots, in.Transcript, log, actor)
	}

	// AN ANSWER IS OWED, AND NOTHING ELSE HAPPENS UNTIL IT IS GIVEN.
	//
	// The person is waiting to be answered, and the agent going quiet into its
	// work is the thing they see. The engine knows because it writes the log.
	// A CALL ALREADY IN FLIGHT IS NOT AN AGENT GOING QUIET. A prompt lands while
	// a tool call is on its way, so refusing that call kills work the agent
	// began before it could have known. The first few calls are warned and the
	// rest are refused, and the warning says how many are left.
	if in.Event == "PreToolUse" && cfg.AnswerFirst && !isAnswering(in) {
		if said, refuse := AnswerOwedNow(roots, actor); said != "" {
			if refuse {
				record(log, "engine", "owed", actor, "refused: they are waiting for an answer", No(),
					map[string]any{"tool": in.ToolName})
				g.deny("THEY ARE WAITING FOR AN ANSWER, and nothing else happens until you " +
					"give one.\n\nWhat they said:\n\n" + firstLines(said, 12) +
					"\n\nAnswer them, in full, with se_answer. Then carry on with the work you hold. " +
					"You do not have to stop the turn to be heard.")
				return
			}
			record(log, "engine", "owed", actor, "warned: they are waiting for an answer", Yes(),
				map[string]any{"tool": in.ToolName})
			g.warn(firstLines(said, 12) +
				"\n\nAnswer them with se_answer. You do not have to stop the turn to be heard.")
		}
	}

	switch in.Event {
	case "PreToolUse":
		decidePreToolUse(g, roots, cfg, emergency, log, in, actor)
	case "Stop":
		// THE TURN ENDED, and its foreground helpers with it.
		if in.AgentID == "" {
			HelpersGoneWith(roots, in.SessionID)
		}
		decideStop(g, roots, cfg, log, in, actor)
	case "UserPromptSubmit":
		// A NEW PROMPT IS A NEW TURN, and the last turn's helpers are gone
		// with it, interrupted or finished. One still calling comes back.
		if in.AgentID == "" {
			HelpersGoneWith(roots, in.SessionID)
		}
		// THE PROMPT IS WHAT THEY WROTE, WHOLE. firstLine took the first line
		// and cut it at two hundred characters, so a person reading the log for
		// what they said found the beginning of it.
		//
		// It is private. It is in the log, and the log is private material, so
		// this is not a second place it can leak from.
		record(log, "user", "prompt", actor, in.Prompt+in.UserPrompt, nil, nil)
		// A PROMPT THAT STARTS A TURN IS RECORDED HERE, so the transcript pass
		// must not record it again. Everything up to now is read.
		StartWhereItIs(roots, in.Transcript)
		// A PROMPT GOING IN FLIPS THE FLAG, here for a prompt that starts a
		// turn and in the said verb for one written into a running turn.
		_ = TheyAsked(roots, actor, in.Prompt+in.UserPrompt) // the guard answers whether or not it can note the question
	case "SessionStart":
		// A session that resumes after a compaction starts with nothing read.
		if in.Source == "compact" || in.Source == "clear" {
			ForgetReads(roots, in.Source)
		}
		record(log, "agent", "session", actor, "session started, "+in.Source, Yes(),
			map[string]any{"source": in.Source, "session": in.SessionID})
		// THE SESSION IS AN AGENT AND IT HAS ARRIVED. What is present is
		// answered off this register, so a panel says who is here rather
		// than who has pulled.
		NoteSession(roots, in.SessionID)
		// THE ENGINE IS UP BEFORE THE FIRST CALL, because every call from
		// here on is answered by it.
		ensureEngine(roots)
	case "StopFailure":
		// A TURN ENDED BY THE API, WITH THE KIND OF ENDING. Without the type
		// every such ending read as unknown, and the one class the agent can
		// fix itself, running out of output, looked like the ones it cannot.
		record(log, "agent", "stop", actor, "turn ended by the API: "+orElse(in.ErrorType, "unknown"), No(),
			map[string]any{"error_type": orElse(in.ErrorType, "unknown")})
	case "SessionEnd":
		record(log, "agent", "session", actor, "session ended", Yes(), nil)
		AgentsGoneWith(roots, in.SessionID)
	case "SubagentStart":
		// Every agent has an identity, and the record says which one acted.
		record(log, "agent", "helper", actor, "helper started: "+in.AgentType, Yes(),
			map[string]any{"agent_type": in.AgentType})
	case "SubagentStop":
		// A HELPER'S ANSWER IS A DIGEST, OR IT GOES BACK TO BE ONE. A helper
		// that returns what it read moves the tokens into the parent's context
		// with extra steps, and today that looks like a slow turn. The budget
		// is a ratio of what it read, with a floor for a helper given a small
		// job, and the refusal is bounded so the harness never overrides it
		// silently.
		if why, refuse := aHelperReturningTooMuch(roots, cfg, in); refuse {
			if countRefusedStop(roots, "helper:"+in.AgentID) {
				record(log, "agent", "helper", actor, "helper stopped, its answer over budget and the guard relenting", No(),
					map[string]any{"relented": true})
				break
			}
			record(log, "agent", "helper", actor, "helper stop refused: its answer is over budget", No(),
				map[string]any{"returned": len(in.LastAssistantMessage), "read": BytesReadBy(roots, in.AgentID)})
			g.blockStop(why)
			break
		}
		forgetRefusedStops(roots, "helper:"+in.AgentID)
		AgentGone(roots, in.AgentID)
		record(log, "agent", "helper", actor, "helper stopped", Yes(), nil)
	case "PreCompact":
		// What was read is no longer held, so it is no longer claimed as read.
		n := ForgetReads(roots, "compaction")
		record(log, "engine", "compact", actor, "context compacted, read evidence reset", Yes(),
			map[string]any{"forgotten": n})
	case "PostToolUse":
		// The obligation was already cleared above, before this event's new
		// messages were copied.
		//
		// A read is evidence. A write means what anyone read of that file is
		// no longer what is there.
		notePostTool(roots, in, actor)
		// A call that came back ends any run of failures: the loop is over.
		clearFailures(roots, actor)
		// THE SOURCE IS WHOEVER ASKED. The engine answered, and what the line
		// is about is the agent's call.
		said := takeCall(roots, in.ToolUseID)
		if said == "" {
			said = describe(in.ToolName, pathOf(in), "")
		}
		record(log, "agent", "call", actor, said, Yes(),
			map[string]any{"tool": in.ToolName, "path": pathOf(in)})
	case "ConfigChange":
		// The files that changed were read under rules that no longer hold.
		ForgetReads(roots, "configuration changed")
		record(log, "engine", "config", actor, "configuration changed, read evidence reset", Yes(), nil)
	case "PostToolUseFailure":
		// THE FAILURE IS COUNTED, so the same call failing the same way over
		// and over is refused before the turn dies of it.
		noteFailure(roots, actor, in)
		// The same one line, and the ok column is what says it failed.
		said := takeCall(roots, in.ToolUseID)
		if said == "" {
			said = describe(in.ToolName, pathOf(in), "")
		}
		record(log, "agent", "call", actor, said, No(),
			map[string]any{"tool": in.ToolName})
	case "Notification":
		record(log, "engine", "note", actor, firstLine(string(raw)), nil, nil)
	default:
		record(log, "engine", "hook", actor, in.Event, nil, map[string]any{"event": in.Event})
	}
}

// pathOf is the file a call is about, under whichever name the harness used.
func pathOf(in hookIn) string {
	var ti toolInput
	_ = json.Unmarshal(in.ToolInput, &ti) // a call whose input will not read names no file, and the caller checks that
	if ti.FilePath != "" {
		return ti.FilePath
	}
	return ti.Path
}

func notePostTool(roots Roots, in hookIn, actor string) {
	path := pathOf(in)
	if path == "" {
		return
	}
	switch in.ToolName {
	case "Read", "NotebookRead":
		var ti toolInput
		_ = json.Unmarshal(in.ToolInput, &ti) // a range that will not read is the whole file
		NoteReadPage(roots, actor, path, pageOf(ti))
	case "Write", "Edit", "MultiEdit", "NotebookEdit":
		ForgetRead(roots, path)
	}
}

func decidePreToolUse(g *guard, roots Roots, cfg Config, emergency Emergency, log *Log, in hookIn, actor string) {
	// ANYTHING YOU DO AFTER CLAIMING A STOP ERASES THE CLAIM. A claim says the
	// next thing is stopping. An agent that claims and then carries on has
	// changed its mind, whether or not it noticed.
	//
	// It is spent here because this is the hook that sees every action. The
	// claim itself is made by a tool call, and this fires before that call
	// runs, so a claim never spends itself.
	SpendClaim(roots, actor)

	var ti toolInput
	_ = json.Unmarshal(in.ToolInput, &ti) // a call whose input will not read names no file, and the caller checks that
	path := ti.FilePath
	if path == "" {
		path = ti.Path
	}

	// THE QUEUE WANTS MORE HANDS, and the main agent is held until it has
	// spawned them. Every other guard waits behind this one, because a tool
	// call that is not a spawn is not what the queue is waiting for.
	if why, refuse := AStaffShortfall(roots, cfg, actor, in.ToolName); refuse {
		record(log, "engine", "staffing", actor, "refused: the queue wants more hands than are here", No(),
			map[string]any{"tool": in.ToolName})
		g.deny(why)
		return
	}

	// THE SAME CALL FAILING THE SAME WAY AGAIN IS STOPPED HERE, before the
	// tokens are spent on it once more.
	if why, refuse := aRepeatedFailure(roots, actor, in); refuse {
		record(log, "engine", "loop", actor, "refused: the same call failed again and again", No(),
			map[string]any{"tool": in.ToolName})
		g.deny(why)
		return
	}

	// A READ IS DEDUPLICATED AND CLAMPED. The range the read will take is
	// settled first, so the dedup asks about the read that will happen and
	// not the one that was asked for.
	if in.ToolName == "Read" && path != "" {
		effective := ti
		lines, clamp := aReadTooLarge(cfg, path, ti)
		if clamp {
			effective.Limit = cfg.ReadClampLines
		}
		if why, refuse := aReadAlreadyHeld(roots, actor, path, pageOf(effective)); refuse {
			record(log, "engine", "dedup", actor, "refused: a read already held, unchanged", No(),
				map[string]any{"path": path})
			g.deny(why)
			return
		}
		if clamp {
			updated := map[string]any{"file_path": ti.FilePath, "limit": cfg.ReadClampLines}
			if ti.Offset > 0 {
				updated["offset"] = ti.Offset
			}
			record(log, "engine", "clamp", actor,
				fmt.Sprintf("read corrected: %d lines asked for, %d handed over", lines, cfg.ReadClampLines), Yes(),
				map[string]any{"path": path, "lines": lines, "limit": cfg.ReadClampLines})
			g.correct(updated, fmt.Sprintf("%s has %d lines. This read is cut to %d; read on with offset.",
				filepath.Base(path), lines, cfg.ReadClampLines))
			return
		}
	}

	// A WRITE AGAINST CONTENT THE WRITER HAS NOT SEEN IS REFUSED, and never
	// corrected, because nobody knows what was meant against it.
	if writesTools[in.ToolName] && path != "" {
		if why, refuse := aStaleWrite(roots, path); refuse {
			record(log, "engine", "stale", actor, "refused: the file changed since it was read", No(),
				map[string]any{"path": path})
			g.deny(why)
			return
		}
	}

	// A SEARCH OVER THE TREE GOES THROUGH THE INDEX. Grep and Glob aimed
	// inside the tree, and rg or grep run over it, are refused and told the
	// door: se find answers off the index the engine keeps in step, path,
	// line and text. Outside the tree the disk is the agent's own.
	if cfg.SearchViaIndex {
		if why, refuse := AToolSearchOverTheTree(in.ToolName, path, roots.Work); refuse {
			record(log, "engine", "search", actor, "refused: a search over the tree, which the index answers", No(),
				map[string]any{"tool": in.ToolName, "path": path})
			g.deny(why)
			return
		}
		if ti.Command != "" {
			if why, refuse := ASearchOverTheTree(ti.Command, roots.Work); refuse {
				record(log, "engine", "search", actor, "refused: a search over the tree, which the index answers", No(),
					map[string]any{"tool": in.ToolName})
				g.deny(why)
				return
			}
		}
	}

	// THE ENGINE OWNS THE TESTS. A test run by hand inside the tree is
	// refused and told to hand the engine its delta instead.
	if cfg.TestsViaEngine && ti.Command != "" {
		if why, refuse := ATestRunByHand(ti.Command, roots.Work); refuse {
			record(log, "engine", "tests", actor, "refused: a test run by hand, which the engine decides", No(),
				map[string]any{"tool": in.ToolName})
			g.deny(why)
			return
		}
	}

	// AND IT OWNS ITS OWN REPLACEMENT. A build aimed at .bin under a live
	// engine leaves the running program and the one on disk as two builds,
	// and the swap door is what does it without severing anything.
	if cfg.BuildViaEngine && ti.Command != "" {
		if why, refuse := ABuildRunByHand(ti.Command, roots.Method); refuse {
			record(log, "engine", "build", actor, "refused: a build aimed at .bin, which the engine does", No(),
				map[string]any{"tool": in.ToolName})
			g.deny(why)
			return
		}
	}

	// SEARCH WITH THE TOOL THE PROBE FOUND. It is on this machine, the engine
	// wrote it down at boot, and the agent went on typing the one its fingers
	// knew. Every rule an agent is asked to remember is one it forgets, so this
	// is a refusal, and it names what the probe found rather than a tool.
	if ti.Command != "" {
		if better, found := TheSearcher(roots, sessionOf(filepath.Join(roots.Private("log"), Current))); found {
			if why, refuse := ARecursiveSearch(ti.Command, better); refuse {
				record(log, "engine", "search", actor, "refused: a recursive search over the tree", No(),
					map[string]any{"tool": in.ToolName, "better": better.Name})
				g.deny(why)
				return
			}
		}
	}

	writes := writesTools
	if writes[in.ToolName] && path != "" && cfg.GuardProjections {
		if yes, instead := IsProjection(roots, path); yes {
			// Emergency mode widens the floor, because repair needs powers
			// the floor deliberately lacks. It is loud in the record.
			if emergency.Armed {
				record(log, "engine", "emergency", actor,
					"projection written under "+emergency.Describe(), Yes(),
					map[string]any{"path": path, "armed_by": emergency.By, "reason": emergency.Reason})
				return
			}
			// The one refusal with no override. The answer names the original,
			// because the writer wants an effect and not a file.
			reason := fmt.Sprintf(
				"%s is a projection. It is written from %s and an edit here is lost on the next write. Write the source instead.",
				filepath.Base(path), instead)
			record(log, "engine", "refusal", actor, "write refused: "+filepath.Base(path)+" is a projection", No(),
				map[string]any{"rule": "projection-is-output", "path": path, "write_instead": instead})
			g.deny(reason)
			return
		}
	}

	// Written text is checked against the mechanical form rules. Only those:
	// pattern and vocabulary are reproducible, and a refusal nobody can
	// reproduce is an obstacle rather than a rule. It is the joined text of
	// whichever shape the tool carries, so an edit's new text walks the same
	// rules a whole write does.
	written := ti.writtenText()
	if writes[in.ToolName] && isProse(path) && written != "" {
		rules, err := LoadVoiceRules(roots.Method)
		if err != nil {
			// The checker cannot run. That is said, loudly, and the write is
			// allowed: a broken checker must not stop a person from working.
			record(log, "engine", "error", actor, "the voice rules could not be read", No(),
				map[string]any{"reason": err.Error()})
		} else if found := rules.Check(written); len(found) > 0 {
			lines := make([]string, 0, len(found))
			for _, f := range found {
				lines = append(lines, "  "+f.String())
			}
			record(log, "engine", "refusal", actor,
				fmt.Sprintf("write refused: %d voice findings in %s", len(found), filepath.Base(path)), No(),
				map[string]any{"rule": "voice", "path": path, "findings": lines})
			// This refuses a FORM, never a place. The same file, written
			// properly, goes through. Say so, so the refusal is not read as
			// a ban on the folder.
			g.deny("This text breaks rules the voice check can see. Nothing is wrong with the file: " +
				"fix these and write it again.\n" + strings.Join(lines, "\n"))
			return
		}
	}

	// A NOTE IS HELD TO ITS SCHEMA AT THE WRITE, NOT AFTERWARDS.
	//
	// The editor gets this from the language server as it types. An agent has
	// no editor, so without this it writes, moves on, and finds out at the next
	// lint, which is a round trip per mistake.
	//
	// EVERY DEPARTURE AT ONCE. ValidateNote answers all of them rather than the
	// first, so one refusal carries the whole list and the agent fixes them
	// together instead of one call at a time.
	//
	// A FILE THAT NAMES NO KIND IS NOT A NOTE and is left alone. So is one
	// whose schema cannot be read: a checker that cannot run must not stop
	// somebody working, the same as the voice rules above.
	if writes[in.ToolName] && isProse(path) && written != "" {
		if kind := kindOf(written); kind != "" {
			if schema, err := LoadSchema(roots.Method, kind); err != nil {
				record(log, "engine", "error", actor, "the schema could not be read", No(),
					map[string]any{"reason": err.Error(), "kind": kind})
			} else if found := ValidateNote(schema, written, roots.Method); len(found) > 0 {
				lines := make([]string, 0, len(found))
				for _, d := range found {
					lines = append(lines, fmt.Sprintf("  line %d: %s", d.Line, d.Says))
				}
				record(log, "engine", "refusal", actor,
					fmt.Sprintf("write refused: %d schema findings in %s", len(found), filepath.Base(path)), No(),
					map[string]any{"rule": "schema", "path": path, "kind": kind, "findings": lines})
				g.deny("This note does not match the schema its kind names. " +
					"Every departure is below, so fix them together and write it again.\n" +
					strings.Join(lines, "\n"))
				return
			}
		}
	}

	// PRIVATE ORIGINALS DO NOT TRAVEL. Digests do. A copy is a hash match, so
	// this is a comparison and never a judgement about content.
	if writes[in.ToolName] && path != "" && written != "" && !underPrivate(roots, path) {
		if from, yes := copyOfAPrivateOriginal(roots, written); yes {
			record(log, "engine", "refusal", actor,
				"write refused: this is a copy of a private original", No(),
				map[string]any{"rule": "private-originals-do-not-travel", "path": path, "copy_of": from})
			g.deny(fmt.Sprintf(
				"This is the content of %s, which is private and does not travel. "+
					"Write a digest of it instead, or keep it under .se.", from))
			return
		}
		// AND NEITHER DOES A PASSAGE OF ONE. A sentence may be quoted; a run
		// of lines pasted whole is the original leaving in pieces.
		if from, line, yes := copiedPassageOf(roots, written); yes {
			record(log, "engine", "refusal", actor,
				"write refused: a passage of a private original", No(),
				map[string]any{"rule": "private-originals-do-not-travel", "path": path, "copy_of": from, "line": line})
			g.deny(fmt.Sprintf(
				"This carries a passage copied whole from %s, from line %d. A private note does not travel "+
					"in pieces either: write it in your own words, or quote one sentence.", from, line))
			return
		}
	}

	// NO TOKEN, NO WRITING.
	//
	// A write says which work it belongs to, and saying it is what puts that
	// token in work. So the queue on the person's screen is the truth about what
	// is being done, rather than a thing the agent has to remember to update.
	//
	// THERE IS NO EXCEPTION FOR THE ENGINE'S OWN COMMANDS ANY MORE.
	//
	// It was here because an agent with nothing in hand has to be able to get a
	// token, and the only door was a shell. Now the door is the lane: se_work
	// mints one and se_run runs anything, both of them tools the gate does not
	// stand in front of. So the exception had no user left, and an open door
	// with no user is the one that gets found.
	//
	// WHAT IT LET THROUGH. `se --version > src/engine/gate.go` was caught by the
	// redirection check, and it took four goes to get that check right: an
	// apostrophe in ordinary English opened a quoted span, and a substitution
	// behind it went past. A parser that has been wrong four times about its own
	// grammar is not the thing to leave holding a gate.
	//
	// IT IS ASKED LAST, AFTER THE GUARDS THAT READ THE WRITE ITSELF. A refusal
	// naming the projection, the voice rule or the private original tells the
	// agent something about this write. This one tells it something about the
	// queue, and the specific answer is the more useful of the two.
	// THE PULL GOING PAST IS WHERE THE TWO NAMES MEET. The harness calls this
	// agent one thing and the command says what it pulls with, so the guard
	// writes the link down here and the gate can ask about both.
	NoteTheNameItPullsWith(roots, actor, ti.Command)
	if ti.Actor != "" {
		NoteTheNameItActsAs(roots, actor, ti.Actor)
	}

	if why, refuse := WriteNeedsAToken(roots, actor, in.ToolName, pathOf(in)); refuse {
		record(log, "engine", "gate", actor, "refused: it cannot name its token", No(),
			map[string]any{"tool": in.ToolName})
		g.deny(why)
		return
	}

	// A PLAN IS WORK, AND WORK IS A TOKEN. The harness's list is refused here
	// rather than in the write gate above, because it writes nothing in the tree
	// and the refusal has a different thing to say.
	if why, refuse := TodoIsASubToken(roots, actor, in.ToolName); refuse {
		record(log, "engine", "gate", actor, "refused: a todo is a sub-token", No(),
			map[string]any{"tool": in.ToolName})
		g.deny(why)
		return
	}

	// ONE LINE PER CALL, and it is written when the call comes back.
	//
	// A call and an answer are one thing: the answer already carries what was
	// asked, so two lines say the same thing twice and the reader scrolls past
	// half a log to find one call. What is remembered here is what was asked,
	// because the answer's event does not carry a shell command.
	//
	// A CALL THAT NEVER RETURNS LEAVES NOTHING. That is the cost, and the
	// failure event covers the ordinary way a call ends badly.
	rememberCall(roots, in.ToolUseID, describe(in.ToolName, path, ti.Command))
}

// WHAT WAS ASKED, HELD UNTIL THE ANSWER COMES. The guard is a fresh process per
// event and holds nothing between them, so it is a file.
func callPath(r Roots) string { return r.Private("calls.json") }

func rememberCall(r Roots, id, said string) {
	if id == "" || said == "" {
		return
	}
	_ = locked(callPath(r), func() error { // the guard answers whether or not it can count the call
		calls := loadCalls(r)
		calls[id] = said
		// A call that never came back would keep its line for ever. The newest
		// few are what an answer can still be waiting for.
		if len(calls) > 64 {
			calls = map[string]string{id: said}
		}
		b, err := json.Marshal(calls)
		if err != nil {
			return err
		}
		return writeAtomic(callPath(r), b, 0o644)
	})
}

func takeCall(r Roots, id string) string {
	if id == "" {
		return ""
	}
	var said string
	_ = locked(callPath(r), func() error { // the guard answers whether or not it can count the call
		calls := loadCalls(r)
		said = calls[id]
		if said == "" {
			return nil
		}
		delete(calls, id)
		b, err := json.Marshal(calls)
		if err != nil {
			return err
		}
		return writeAtomic(callPath(r), b, 0o644)
	})
	return said
}

func loadCalls(r Roots) map[string]string {
	out := map[string]string{}
	b, err := os.ReadFile(callPath(r))
	if err != nil || json.Unmarshal(b, &out) != nil {
		return map[string]string{}
	}
	return out
}

// underPrivate says whether a path is inside the folder that holds what does
// not travel.
func underPrivate(roots Roots, path string) bool {
	abs, err := filepath.Abs(path)
	if err != nil {
		return false
	}
	rel, err := filepath.Rel(roots.Private(), abs)
	if err != nil {
		return false
	}
	return !strings.HasPrefix(rel, "..")
}

// copiedPassageOf asks whether content carries a passage of a private file.
// The model answers first, then the index file while it is fresh. With
// neither there is no cheap way to know, and the write goes through: the
// whole-file check above still holds, and the record shows which path
// answered.
func copiedPassageOf(roots Roots, content string) (string, int, bool) {
	if from, line, found, answered := copiedPassageViaModel(roots, content); answered {
		return fromPrivate(roots, from), line, found
	}
	if from, line, found, trusted := copiedPassageInIndex(roots, content); trusted {
		return fromPrivate(roots, from), line, found
	}
	return "", 0, false
}

func fromPrivate(roots Roots, rel string) string {
	if rel == "" {
		return ""
	}
	return filepath.Join(roots.Work, filepath.FromSlash(rel))
}

// copyOfAPrivateOriginal compares the content being written against what is
// in the private folder. A match is a copy, and a copy is a hash, so nothing
// here reads or judges what the file says.
func copyOfAPrivateOriginal(roots Roots, content string) (string, bool) {
	// THE INDEX ANSWERS FIRST, AND THE WALK ANSWERS WHEN IT CANNOT. The walk
	// grew with the work: measured at tens of milliseconds today and seconds
	// at twenty thousand tokens, paid on every write. Against the index it is
	// one lookup by size and hash. An index the daemon is not keeping fresh
	// is not trusted, and then the walk is what it always was.
	// THE MODEL FIRST, THE INDEX FILE SECOND, THE WALK LAST. Each answers
	// only when it can, and the next one is what it always was.
	if from, found, answered := privateCopyViaModel(roots, content); answered {
		return from, found
	}
	if from, found, trusted := privateCopyInIndex(roots, content); trusted {
		return from, found
	}
	want := sha256.Sum256([]byte(content))
	var found string
	_ = filepath.Walk(roots.Private(), func(p string, info os.FileInfo, err error) error { // a walk that cannot finish answers what it found
		if err != nil || info.IsDir() || found != "" {
			return nil
		}
		// The record and the parameters are this system's own, not material
		// somebody put there.
		if strings.Contains(filepath.ToSlash(p), "/log/") {
			return nil
		}
		if info.Size() != int64(len(content)) {
			return nil // the size settles it without reading the file
		}
		b, err := os.ReadFile(p)
		if err != nil {
			return nil
		}
		if sha256.Sum256(b) == want {
			found = p
		}
		return nil
	})
	return found, found != ""
}

// Prose is what the rules are about. Code, data and everything else is not.
func isProse(path string) bool {
	switch strings.ToLower(filepath.Ext(path)) {
	case ".md", ".markdown", ".txt":
		return true
	}
	return false
}

// STOPPING IS REFUSED UNTIL IT IS CLAIMED, and open work is not what decides.
//
// A rule that bites only over open work leaves the commonest bad stop
// untouched: the agent that has nothing open, wants to say what it did, and
// ends the turn to say it. Wanting to give an update is not a sanctioned
// reason, so refusing every unclaimed stop is what makes that one stop.
//
// A CLAIM IS WHAT GRANTS IT, AND NOT A RETRY. The harness sets its own retry
// flag, so asking twice proves the harness retried and nothing about what the
// agent decided. v3 measured that: block, pass, block, pass, and the tooth
// never bit.
func decideStop(g *guard, roots Roots, cfg Config, log *Log, in hookIn, actor string) {
	if !cfg.StopNeedsClaim {
		record(log, "agent", "stop", actor, "stopped", Yes(), nil)
		return
	}
	first := firstStopOfSession(roots, actor)
	if c, ok := StandingClaim(roots, actor); ok {
		// THE CLAIM IS JUDGED AGAIN AT THE STOP, because the queue moves
		// between the claim and the stop it covers.
		if c.Because == "blocked" {
			if refusal, lied := BlockedIsFalse(roots, actor); lied {
				record(log, "agent", "stop", actor, "stop refused: blocked is not true", No(),
					map[string]any{"because": c.Because})
				g.blockStop("You claimed blocked, and " + refusal)
				return
			}
		}
		forgetRefusedStops(roots, actor)
		record(log, "agent", "stop", actor, "stopped: "+c.Because+" — "+c.Why, Yes(),
			map[string]any{"because": c.Because, "why": c.Why})
		return
	}
	// THE FIRST STOP OF THE SESSION IS GRANTED. The kickoff says be ready and
	// wait, so the first stop is obedience, and a claim for obedience teaches
	// nothing. One per actor per session, and the record says it was the first.
	if first {
		forgetRefusedStops(roots, actor)
		record(log, "agent", "stop", actor, "stopped: the first stop of the session, granted", Yes(),
			map[string]any{"first": true})
		return
	}
	// A REFUSAL THAT KEEPS BEING REFUSED NOTICES, AND RELENTS. The harness
	// overrides a hook that blocks too many times in a row, so past that the
	// refusal would stop existing without a word. Granting it here, with the
	// count in the record, keeps the failure visible instead.
	if countRefusedStop(roots, actor) {
		record(log, "agent", "stop", actor,
			fmt.Sprintf("stop granted with no reason claimed: refused %d times in a row, so the guard relents",
				stopRefusalsBeforeRelenting), No(),
			map[string]any{"relented": true, "refusals": stopRefusalsBeforeRelenting})
		return
	}
	// AN AUTHORITY MAY EXIST, AND THIS ASKS IT. It does not decide whether the
	// stop is refused. It says what else the agent is holding, so the refusal
	// names the work rather than only the rule.
	record(log, "agent", "stop", actor, "stop refused, no reason claimed", No(), nil)
	g.blockStop(TheList(askTheAuthority(roots, actor).Reason))
}

func describe(tool, path, command string) string {
	switch {
	case command != "":
		// THE COMMAND IS SQUASHED, NOT CUT AT ITS FIRST LINE. Agents write
		// multi-line commands whose whole first line is `python -c "`, so the
		// record said that and nothing else, and the owner read it as the same
		// call failing over and over. The newlines fold to spaces, the cap
		// still holds, and the transcript keeps the whole thing.
		return tool + " " + squashed(command)
	case path != "":
		return tool + " " + path
	}
	return tool
}

// squashed folds every run of whitespace to one space and keeps the cap
// firstLine keeps, so a multi-line command reads as its content rather than
// as its shortest line.
func squashed(s string) string {
	s = strings.Join(strings.Fields(s), " ")
	if len(s) > 200 {
		s = s[:200] + "…"
	}
	return s
}

func firstLine(s string) string {
	s = strings.TrimSpace(s)
	if i := strings.IndexByte(s, '\n'); i >= 0 {
		s = s[:i]
	}
	if len(s) > 200 {
		s = s[:200] + "…"
	}
	return s
}

func record(log *Log, src, kind, actor, msg string, ok *bool, data map[string]any) {
	if log == nil {
		return
	}
	log.Write(src, kind, actor, msg, ok, data)
}

// warnTheAgent says something without refusing anything.
//
// A WARNING IS NOT A REFUSAL, and it needs its own shape. denyToolUse kills the
// call, which is the thing the grace exists to stop for the first few. Claude
// Code reads additionalContext on a PreToolUse that allows, so the call goes
// through and the agent is told anyway.
func (g *guard) warn(said string) {
	out, _ := json.Marshal(map[string]any{
		"hookSpecificOutput": map[string]any{
			"hookEventName":     "PreToolUse",
			"additionalContext": said,
		},
	})
	fmt.Fprintln(g.out, string(out))
}
