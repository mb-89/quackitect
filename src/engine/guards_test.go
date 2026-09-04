package main

import (
	"encoding/json"
	"os"
	"path/filepath"
	"strings"
	"testing"
)

// THE MECHANICAL GUARDS, DRIVEN THROUGH THE HOOK THE WAY THE HARNESS DRIVES IT.

// aGuardedTree is a method tree with a session open, so the guard has a
// record to write and a session to key its state by.
func aGuardedTree(t *testing.T) (string, Roots) {
	t.Helper()
	exe := buildEngine(t)
	r := guidanceTree(t)
	Project(r)
	l, err := OpenLog(r.Private("log"))
	if err != nil {
		t.Fatal(err)
	}
	l.Write("engine", "start", "engine", "engine started", Yes(), nil)
	l.Close()
	return exe, r
}

func decisionOf(t *testing.T, said string) (decision string, out map[string]any) {
	t.Helper()
	if said == "" {
		return "", nil
	}
	// A tool decision rides in hookSpecificOutput, and a stop decision is the
	// top-level decision field. Both are read, so one reader serves both.
	var v struct {
		Out      map[string]any `json:"hookSpecificOutput"`
		Decision string         `json:"decision"`
	}
	if err := json.Unmarshal([]byte(said), &v); err != nil {
		t.Fatalf("the guard answered something that is not a decision: %q", said)
	}
	if v.Decision != "" {
		return v.Decision, v.Out
	}
	d, _ := v.Out["permissionDecision"].(string)
	return d, v.Out
}

func TestAWriteToAFileThatChangedSinceItWasReadIsRefused(t *testing.T) {
	t.Parallel()
	exe, r := aGuardedTree(t)
	file := filepath.Join(r.Work, "notes.md")
	os.WriteFile(file, []byte("first\n"), 0o644)
	read := map[string]any{"cwd": r.Work, "tool_name": "Read", "agent_id": "helper-1",
		"tool_input": map[string]any{"file_path": file}}
	hookSays(t, exe, r.Method, "PostToolUse", read)

	// SOMEBODY ELSE CHANGES THE FILE. The write is refused, and it names the
	// remedy.
	os.WriteFile(file, []byte("second\n"), 0o644)
	write := map[string]any{"cwd": r.Work, "tool_name": "Edit", "agent_id": "helper-1",
		"tool_input": map[string]any{"file_path": file, "old_string": "first", "new_string": "third"}}
	d, out := decisionOf(t, hookSays(t, exe, r.Method, "PreToolUse", write))
	if d != "deny" || !strings.Contains(out["permissionDecisionReason"].(string), "Read it again") {
		t.Fatalf("the stale write was answered %q: %v", d, out)
	}

	// READ AGAIN, AND THIS GUARD LETS THE WRITE THROUGH. The write gate below
	// it still asks for a token, so what is checked is the reason.
	hookSays(t, exe, r.Method, "PostToolUse", read)
	if _, out := decisionOf(t, hookSays(t, exe, r.Method, "PreToolUse", write)); out != nil {
		if why, _ := out["permissionDecisionReason"].(string); strings.Contains(why, "changed since") {
			t.Fatalf("a write after a fresh read was refused as stale: %s", why)
		}
	}
}

func TestAReadAlreadyHeldUnchangedIsRefusedOnce(t *testing.T) {
	t.Parallel()
	exe, r := aGuardedTree(t)
	file := filepath.Join(r.Work, "notes.md")
	os.WriteFile(file, []byte("the same\n"), 0o644)
	read := map[string]any{"cwd": r.Work, "tool_name": "Read", "agent_id": "helper-1",
		"tool_input": map[string]any{"file_path": file}}
	if d, _ := decisionOf(t, hookSays(t, exe, r.Method, "PreToolUse", read)); d == "deny" {
		t.Fatal("a first read was refused")
	}
	hookSays(t, exe, r.Method, "PostToolUse", read)

	cases := []struct {
		name string
		call map[string]any
		deny bool
	}{
		{"the same read by the same agent", read, true},
		{"the same file by another agent", map[string]any{"cwd": r.Work, "tool_name": "Read", "agent_id": "helper-2",
			"tool_input": map[string]any{"file_path": file}}, false},
		{"another range of the same file", map[string]any{"cwd": r.Work, "tool_name": "Read", "agent_id": "helper-1",
			"tool_input": map[string]any{"file_path": file, "offset": 1, "limit": 1}}, false},
	}
	for _, c := range cases {
		t.Run(c.name, func(t *testing.T) {
			d, _ := decisionOf(t, hookSays(t, exe, r.Method, "PreToolUse", c.call))
			if (d == "deny") != c.deny {
				t.Fatalf("answered %q, want deny=%v", d, c.deny)
			}
		})
	}

	// THE FILE MOVES, AND THE READ IS PAID FOR AGAIN WITHOUT A WORD.
	os.WriteFile(file, []byte("changed\n"), 0o644)
	if d, _ := decisionOf(t, hookSays(t, exe, r.Method, "PreToolUse", read)); d == "deny" {
		t.Fatal("a read of a changed file was refused as already held")
	}
}

func TestTheSameFailingCallIsRefusedAfterThreeFailures(t *testing.T) {
	t.Parallel()
	exe, r := aGuardedTree(t)
	// A tool no other guard stands in front of, so the only refusal in play
	// is the loop breaker's. Grep was that tool until the index took over
	// searching and the search guard stood in front of it.
	call := map[string]any{"cwd": r.Work, "tool_name": "WebSearch", "agent_id": "helper-1", "tool_use_id": "t1",
		"tool_input": map[string]any{"query": "nothing matches this"}}
	for i := 0; i < failuresBeforeRefusal; i++ {
		if d, _ := decisionOf(t, hookSays(t, exe, r.Method, "PreToolUse", call)); d == "deny" {
			t.Fatalf("failure %d was refused before it happened", i+1)
		}
		hookSays(t, exe, r.Method, "PostToolUseFailure", call)
	}
	d, out := decisionOf(t, hookSays(t, exe, r.Method, "PreToolUse", call))
	if d != "deny" || !strings.Contains(out["permissionDecisionReason"].(string), "Change something") {
		t.Fatalf("the fourth try was answered %q: %v", d, out)
	}
	// A DIFFERENT CALL IS NOT THE LOOP.
	other := map[string]any{"cwd": r.Work, "tool_name": "WebSearch", "agent_id": "helper-1", "tool_use_id": "t2",
		"tool_input": map[string]any{"query": "something else"}}
	if d, _ := decisionOf(t, hookSays(t, exe, r.Method, "PreToolUse", other)); d == "deny" {
		t.Fatal("a different call was refused as the loop")
	}
	// AND A CALL THAT CAME BACK ENDS IT.
	hookSays(t, exe, r.Method, "PostToolUse", other)
	if d, _ := decisionOf(t, hookSays(t, exe, r.Method, "PreToolUse", call)); d == "deny" {
		t.Fatal("the loop was still refused after a call came back")
	}
}

func TestARefusedStopRelentsBeforeTheHarnessOverridesIt(t *testing.T) {
	t.Parallel()
	exe, r := aGuardedTree(t)
	stop := map[string]any{"cwd": r.Work, "agent_id": "helper-1"}
	// The first stop of the session is granted, so it is spent before the
	// refusals under test are counted.
	hookSays(t, exe, r.Method, "Stop", stop)
	for i := 1; i < stopRefusalsBeforeRelenting; i++ {
		d, _ := decisionOf(t, hookSays(t, exe, r.Method, "Stop", stop))
		if d != "block" {
			t.Fatalf("stop %d was answered %q, want a refusal", i, d)
		}
	}
	// THE LAST ONE IS GRANTED, AND THE RECORD SAYS SO.
	if said := hookSays(t, exe, r.Method, "Stop", stop); said != "" {
		t.Fatalf("the relenting stop was answered %q", said)
	}
	var relented bool
	for _, line := range logLines(t, r) {
		if strings.Contains(line, "relents") {
			relented = true
		}
	}
	if !relented {
		t.Fatal("the record does not say the guard relented")
	}
	// AND THE COUNT STARTS OVER.
	if d, _ := decisionOf(t, hookSays(t, exe, r.Method, "Stop", stop)); d != "block" {
		t.Fatalf("the stop after relenting was answered %q, want a refusal", d)
	}
}

func TestAnAPIEndingIsRecordedWithItsType(t *testing.T) {
	t.Parallel()
	exe, r := aGuardedTree(t)
	hookSays(t, exe, r.Method, "StopFailure", map[string]any{"cwd": r.Work, "agent_id": "main",
		"error_type": "max_output_tokens"})
	var found bool
	for _, line := range logLines(t, r) {
		if strings.Contains(line, "max_output_tokens") {
			found = true
		}
	}
	if !found {
		t.Fatal("the record does not carry the kind of ending")
	}
}

func TestAHelperReturningWhatItReadIsSentBackToDigest(t *testing.T) {
	t.Parallel()
	exe, r := aGuardedTree(t)
	big := filepath.Join(r.Work, "material.md")
	os.WriteFile(big, []byte(strings.Repeat("a line of material the helper read\n", 2000)), 0o644)
	hookSays(t, exe, r.Method, "PostToolUse", map[string]any{"cwd": r.Work, "tool_name": "Read",
		"agent_id": "helper-7", "tool_input": map[string]any{"file_path": big}})

	// The floor is what a small answer always gets, whatever was read.
	stop := func(answer string) string {
		return hookSays(t, exe, r.Method, "SubagentStop", map[string]any{"cwd": r.Work,
			"agent_id": "helper-7", "agent_type": "reader", "last_assistant_message": answer})
	}
	if said := stop(strings.Repeat("x", TheFloor().HelperFloorBytes-1)); said != "" {
		t.Fatalf("an answer under the floor was refused: %s", said)
	}
	// A tenth of what it read is the budget, and the material read was well
	// over ten times the floor, so an answer over that tenth goes back.
	read := BytesReadBy(r, "helper-7")
	over := strings.Repeat("y", int(read/int64(TheFloor().HelperRatio))+1)
	d, out := decisionOf(t, stop(over))
	if d != "block" {
		t.Fatalf("an answer over budget was answered %q: %v", d, out)
	}
	// Bounded: the refusal relents rather than being overridden in silence.
	for i := 0; i < stopRefusalsBeforeRelenting; i++ {
		stop(over)
	}
	if said := stop(strings.Repeat("z", 10)); said != "" {
		t.Fatalf("a short answer after the loop was refused: %s", said)
	}
}

// AN EDIT IS A WRITE OF ITS NEW TEXT. The content guards read only the
// content field, and an Edit arrives as old_string and new_string, so what an
// edit wrote walked past every content rule.
func TestAnEditsNewTextWalksTheContentRules(t *testing.T) {
	t.Parallel()
	exe, r := aGuardedTree(t)
	edit := map[string]any{"cwd": r.Work, "tool_name": "Edit", "agent_id": "helper-1",
		"tool_input": map[string]any{"file_path": filepath.Join(r.Work, "doc", "note.md"),
			"old_string": "one thing", "new_string": "This is one thing; this is another.\n"}}
	d, out := decisionOf(t, hookSays(t, exe, r.Method, "PreToolUse", edit))
	why, _ := out["permissionDecisionReason"].(string)
	if d != "deny" || !strings.Contains(why, "no semicolon") {
		t.Fatalf("an edit putting in a semicolon was answered %q without naming the rule: %v", d, out)
	}
}

// THE MAP AND THE PAYLOAD SHAPES MOVE TOGETHER. A tool declared as writing
// whose payload yields no text is a tool whose writes skip every content
// rule, which is how the Edit hole opened. This walks the declaration.
func TestEveryWritingToolsPayloadYieldsItsText(t *testing.T) {
	t.Parallel()
	shapes := map[string]string{
		"Write":        `{"file_path":"a.md","content":"the text"}`,
		"Edit":         `{"file_path":"a.md","old_string":"x","new_string":"the text"}`,
		"MultiEdit":    `{"file_path":"a.md","edits":[{"old_string":"x","new_string":"the"},{"old_string":"y","new_string":"text"}]}`,
		"NotebookEdit": `{"notebook_path":"a.ipynb","new_source":"the text"}`,
	}
	for tool := range writesTools {
		shape, ok := shapes[tool]
		if !ok {
			t.Errorf("%s writes and this table has no payload for it, so what it writes is invisible to the guards", tool)
			continue
		}
		var ti toolInput
		if err := json.Unmarshal([]byte(shape), &ti); err != nil {
			t.Fatal(err)
		}
		if got := ti.writtenText(); !strings.Contains(got, "the") || !strings.Contains(got, "text") {
			t.Errorf("%s's payload yields %q, so what it writes walks no content rule", tool, got)
		}
	}
}

// AND SO IS EVERY MEMBER OF A MULTI-EDIT, not only the first. A private
// original leaving in the second member is the original leaving.
func TestAPrivatePassageDoesNotTravelThroughAMultiEdit(t *testing.T) {
	t.Parallel()
	exe, r := aGuardedTree(t)
	private := strings.Repeat("this is a line of private material that nobody has cleaned up yet\n", 5)
	os.MkdirAll(r.Private("work"), 0o755)
	os.WriteFile(r.Private("work", "wk-private.md"), []byte("---\nkind: [[work-token]]\ntitle: private\n---\n\n"+private), 0o644)
	db, err := openIndex(r)
	if err != nil {
		t.Fatal(err)
	}
	if _, err := Reindex(r, db); err != nil {
		t.Fatal(err)
	}
	markFresh(t, db)
	db.Close()

	d, out := decisionOf(t, hookSays(t, exe, r.Method, "PreToolUse", map[string]any{"cwd": r.Work,
		"tool_name": "MultiEdit", "agent_id": "helper-1",
		"tool_input": map[string]any{"file_path": filepath.Join(r.Work, "doc", "note.md"),
			"edits": []map[string]any{
				{"old_string": "a", "new_string": "A heading nobody minds.\n"},
				{"old_string": "b", "new_string": private},
			}}}))
	why, _ := out["permissionDecisionReason"].(string)
	if d != "deny" || !strings.Contains(why, "wk-private.md") {
		t.Fatalf("a pasted passage in a multi-edit was answered %q without naming the original: %v", d, out)
	}
}

func TestAPassageOfAPrivateNoteDoesNotTravel(t *testing.T) {
	t.Parallel()
	exe, r := aGuardedTree(t)
	private := strings.Repeat("this is a line of private material that nobody has cleaned up yet\n", 5)
	os.MkdirAll(r.Private("work"), 0o755)
	os.WriteFile(r.Private("work", "wk-private.md"), []byte("---\nkind: [[work-token]]\ntitle: private\n---\n\n"+private), 0o644)
	db, err := openIndex(r)
	if err != nil {
		t.Fatal(err)
	}
	if _, err := Reindex(r, db); err != nil {
		t.Fatal(err)
	}
	markFresh(t, db)
	db.Close()

	write := func(content string) (string, map[string]any) {
		return decisionOf(t, hookSays(t, exe, r.Method, "PreToolUse", map[string]any{"cwd": r.Work,
			"tool_name": "Write", "agent_id": "helper-1",
			"tool_input": map[string]any{"file_path": filepath.Join(r.Work, "doc", "note.md"), "content": content}}))
	}
	// A run of lines pasted whole is refused, and the refusal names the file.
	d, out := write("# A note\n\n" + private)
	if d != "deny" || !strings.Contains(out["permissionDecisionReason"].(string), "wk-private.md") {
		t.Fatalf("a pasted passage was answered %q: %v", d, out)
	}
	// One sentence quoted is not a passage, and the other guards say why a
	// write may still be refused, so what is checked is the reason.
	if _, out := write("# A note\n\nAs the note says: this is a line of private material that nobody has cleaned up yet.\n"); out != nil {
		if why, _ := out["permissionDecisionReason"].(string); strings.Contains(why, "passage") {
			t.Fatalf("a quoted sentence was refused as a passage: %s", why)
		}
	}
}
