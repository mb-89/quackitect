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

	// What the harness wrote down. It is read only to recover prompts the
	// harness never sent an event for.
	TranscriptPath string `json:"transcript_path"`
}

type toolInput struct {
	FilePath string `json:"file_path"`
	Path     string `json:"path"`
	Command  string `json:"command"`
	Content  string `json:"content"`
}

// Deny is the shape Claude Code reads for a tool decision.
func denyToolUse(reason string) {
	out, _ := json.Marshal(map[string]any{
		"hookSpecificOutput": map[string]any{
			"hookEventName":            "PreToolUse",
			"permissionDecision":       "deny",
			"permissionDecisionReason": reason,
		},
	})
	fmt.Println(string(out))
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

// Block is the shape a Stop hook reads. The reason reaches the agent.
func blockStop(reason string) {
	out, _ := json.Marshal(map[string]any{"decision": "block", "reason": reason})
	fmt.Println(string(out))
}

func runHook(args []string) {
	raw, err := io.ReadAll(os.Stdin)
	if err != nil {
		// A guard that cannot read its input must not pass silently. It says
		// so and allows, because a broken guard must not stop a person from
		// working. The record carries the failure.
		fmt.Fprintln(os.Stderr, "hook: cannot read the event:", err)
		return
	}
	var in hookIn
	if err := json.Unmarshal(raw, &in); err != nil {
		fmt.Fprintln(os.Stderr, "hook: the event is not readable JSON:", err)
		return
	}
	method := ""
	for i := 0; i < len(args); i++ {
		switch args[i] {
		case "--method":
			if i+1 < len(args) {
				method = args[i+1]
				i++
			}
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
	roots, err := FindRoots(work)
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

	log, err := OpenExistingLog(roots.Private("log"))
	if err != nil {
		// No log means no engine. The guard still answers, because the answer
		// is about a file and not about a session.
		log = nil
	} else {
		defer log.Close()
	}

	actor := in.AgentID
	if actor == "" {
		actor = "main"
	}

	cfg := LoadConfig(roots)
	emergency := LoadEmergency(roots)

	switch in.Event {
	case "PreToolUse":
		decidePreToolUse(roots, cfg, emergency, log, in, actor)
	case "Stop":
		decideStop(roots, cfg, log, in, actor)
	case "UserPromptSubmit":
		// The prompt is private. It is in the log, and the log is private
		// material, so this is not a second place it can leak from.
		record(log, "user", "prompt", actor, firstLine(in.Prompt+in.UserPrompt), nil, nil)
	case "SessionStart":
		// A session that resumes after a compaction starts with nothing read.
		if in.Source == "compact" || in.Source == "clear" {
			ForgetReads(roots, in.Source)
		}
		record(log, "agent", "session", actor, "session started, "+in.Source, Yes(),
			map[string]any{"source": in.Source, "session": in.SessionID})
	case "SessionEnd":
		record(log, "agent", "session", actor, "session ended", Yes(), nil)
	case "SubagentStart":
		// Every agent has an identity, and the record says which one acted.
		NoteAgent(roots, in.AgentID, in.AgentType)
		record(log, "agent", "helper", actor, "helper started: "+in.AgentType, Yes(),
			map[string]any{"agent_type": in.AgentType})
	case "SubagentStop":
		// A helper stopping is not the walk stopping. It is recorded and
		// never refused.
		record(log, "agent", "helper", actor, "helper stopped", Yes(), nil)
	case "PreCompact":
		// What was read is no longer held, so it is no longer claimed as read.
		n := ForgetReads(roots, "compaction")
		record(log, "engine", "compact", actor, "context compacted, read evidence reset", Yes(),
			map[string]any{"forgotten": n})
	case "PostToolUse":
		// A read is evidence. A write means what anyone read of that file is
		// no longer what is there.
		notePostTool(roots, in, actor)
		record(log, "engine", "answer", actor, describe(in.ToolName, pathOf(in), ""), Yes(),
			map[string]any{"tool": in.ToolName, "path": pathOf(in)})
	case "ConfigChange":
		// The files that changed were read under rules that no longer hold.
		ForgetReads(roots, "configuration changed")
		record(log, "engine", "config", actor, "configuration changed, read evidence reset", Yes(), nil)
	case "PostToolUseFailure":
		record(log, "engine", "error", actor, in.ToolName+" failed", No(),
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
	_ = json.Unmarshal(in.ToolInput, &ti)
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
		NoteRead(roots, actor, path)
	case "Write", "Edit", "MultiEdit", "NotebookEdit":
		ForgetRead(roots, path)
	}
}

func decidePreToolUse(roots Roots, cfg Config, emergency Emergency, log *Log, in hookIn, actor string) {
	// A PROMPT SENT INTO A RUNNING TURN REACHES THE RECORD HERE. Waiting for
	// the stop would mean a person watching the log sees what they said only
	// after the turn ends, which is the one time they are not watching.
	if in.TranscriptPath != "" {
		BackfillPrompts(roots.Private("log"), in.TranscriptPath, actor)
	}

	// ANYTHING YOU DO AFTER CLAIMING A STOP ERASES THE CLAIM. A claim says the
	// next thing is stopping. An agent that claims and then carries on has
	// changed its mind, whether or not it noticed.
	//
	// It is spent here because this is the hook that sees every action. The
	// claim itself is made by a tool call, and this fires before that call
	// runs, so a claim never spends itself.
	SpendClaim(roots, actor)

	var ti toolInput
	_ = json.Unmarshal(in.ToolInput, &ti)
	path := ti.FilePath
	if path == "" {
		path = ti.Path
	}

	writes := map[string]bool{"Write": true, "Edit": true, "NotebookEdit": true, "MultiEdit": true}
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
			denyToolUse(reason)
			return
		}
	}

	// Written text is checked against the mechanical form rules. Only those:
	// pattern and vocabulary are reproducible, and a refusal nobody can
	// reproduce is an obstacle rather than a rule.
	if writes[in.ToolName] && isProse(path) && ti.Content != "" {
		rules, err := LoadVoiceRules(roots.Method)
		if err != nil {
			// The checker cannot run. That is said, loudly, and the write is
			// allowed: a broken checker must not stop a person from working.
			record(log, "engine", "error", actor, "the voice rules could not be read", No(),
				map[string]any{"reason": err.Error()})
		} else if found := rules.Check(ti.Content); len(found) > 0 {
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
			denyToolUse("This text breaks rules the voice check can see. Nothing is wrong with the file: " +
				"fix these and write it again.\n" + strings.Join(lines, "\n"))
			return
		}
	}

	// PRIVATE ORIGINALS DO NOT TRAVEL. Digests do. A copy is a hash match, so
	// this is a comparison and never a judgement about content.
	if writes[in.ToolName] && path != "" && ti.Content != "" {
		if from, yes := copyOfAPrivateOriginal(roots, ti.Content); yes && !underPrivate(roots, path) {
			record(log, "engine", "refusal", actor,
				"write refused: this is a copy of a private original", No(),
				map[string]any{"rule": "private-originals-do-not-travel", "path": path, "copy_of": from})
			denyToolUse(fmt.Sprintf(
				"This is the content of %s, which is private and does not travel. "+
					"Write a digest of it instead, or keep it under .se.", from))
			return
		}
	}

	record(log, "agent", "call", actor, describe(in.ToolName, path, ti.Command), nil,
		map[string]any{"tool": in.ToolName, "path": path})
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

// copyOfAPrivateOriginal compares the content being written against what is
// in the private folder. A match is a copy, and a copy is a hash, so nothing
// here reads or judges what the file says.
func copyOfAPrivateOriginal(roots Roots, content string) (string, bool) {
	want := sha256.Sum256([]byte(content))
	var found string
	_ = filepath.Walk(roots.Private(), func(p string, info os.FileInfo, err error) error {
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
func decideStop(roots Roots, cfg Config, log *Log, in hookIn, actor string) {
	// A PROMPT THE HARNESS NEVER SENT AN EVENT FOR IS STILL A PROMPT. This is
	// the last moment the record can be made whole before the turn is over.
	if in.TranscriptPath != "" {
		if n := BackfillPrompts(roots.Private("log"), in.TranscriptPath, actor); n > 0 {
			record(log, "engine", "record", actor, "recovered prompts the harness sent no event for", Yes(),
				map[string]any{"prompts": n})
		}
	}

	if !cfg.StopNeedsClaim {
		record(log, "agent", "stop", actor, "stopped", Yes(), nil)
		return
	}
	if c, ok := TakeClaim(roots, actor); ok {
		record(log, "agent", "stop", actor, "stopped: "+c.Because+" — "+c.Why, Yes(),
			map[string]any{"because": c.Because, "why": c.Why})
		return
	}
	// AN AUTHORITY MAY EXIST, AND THIS ASKS IT. It does not decide whether the
	// stop is refused. It says what else the agent is holding, so the refusal
	// names the work rather than only the rule.
	record(log, "agent", "stop", actor, "stop refused, no reason claimed", No(), nil)
	blockStop(TheList(askTheAuthority(roots, actor).Reason))
}

func describe(tool, path, command string) string {
	switch {
	case command != "":
		return tool + " " + firstLine(command)
	case path != "":
		return tool + " " + path
	}
	return tool
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
