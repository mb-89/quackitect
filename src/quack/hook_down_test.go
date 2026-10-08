// The hook verb's down word over fakes, off the cases caged-door.test.js and
// start.test.js held, now gone: the cloud start, the door asked again once it stands,
// the refusal of a guarded call, the cage block, the codes and the fall line.
// [[spec/tickets/level0-hooks-forward-to-go]]
package main

import (
	"encoding/json"
	"errors"
	"strings"
	"testing"
	"time"

	"quackitect/src/modules/hooks"
)

// A fake box under the down word: the runs it takes and what each answers, the door's posts, and the log's rows. [[spec/tickets/level0-hooks-forward-to-go]]
type downBox struct {
	runs    [][]string
	code    int
	stderr  string
	posts   []hooks.Post
	stands  bool
	effects []hooks.Effect
	rows    []copilotRow
}

// The run the down word starts the index with: the door stands once the standing exits 0. [[spec/tickets/level0-hooks-forward-to-go]]
func (b *downBox) run(argv []string, _ string) (int, string, error) {
	b.runs = append(b.runs, argv)
	if b.code == 0 {
		b.stands = true
	}
	return b.code, b.stderr, nil
}

// The door, which answers nothing until it stands. [[spec/tickets/level0-hooks-forward-to-go]]
func (b *downBox) ask(post hooks.Post) (hooks.Answer, error) {
	b.posts = append(b.posts, post)
	if !b.stands {
		return hooks.Answer{}, errors.New("Unable to connect")
	}
	return hooks.Answer{Effects: b.effects}, nil
}

// What one down word answers: its exit, the answer it prints, and its error stream. [[spec/tickets/level0-hooks-forward-to-go]]
type downSaid struct {
	code   int
	out    string
	answer hooks.Answer
	errs   string
}

// Runs the down word for the event over the box, on a cloud box or a desk, with the event's fields on stdin. [[spec/tickets/level0-hooks-forward-to-go]]
func downs(t *testing.T, b *downBox, cloud bool, event, input string) downSaid {
	t.Helper()
	// level0: OutsideInDoors - the case hands the hook doors one wall reading, as the verb's root hands it in
	d := hookDoorsOver(t.TempDir(), cloud, nil, input, time.Now())
	d.ask, d.run = b.ask, b.run
	d.log = func(level, kind, line string, fields map[string]any) error {
		b.rows = append(b.rows, copilotRow{level, kind, line, fields})
		return nil
	}
	var said downSaid
	said.code, said.out, said.errs = runsTwin(hookVerb(d), "hook", "down", event)
	if err := json.Unmarshal([]byte(strings.TrimSpace(said.out)), &said.answer); err != nil {
		t.Fatalf("the down word for %s prints %q, and wants the door's answer as JSON", event, said.out)
	}
	return said
}

// The text of the effect of the kind, or nothing. [[spec/tickets/level0-hooks-forward-to-go]]
func effectText(said hooks.Answer, kind string) (string, bool) {
	for _, one := range said.Effects {
		if one.Kind == kind {
			return one.Text, true
		}
	}
	return "", false
}

// Whether a row of the level saying the line stands in the log. [[spec/tickets/level0-hooks-forward-to-go]]
func logged(b *downBox, level, line string) bool {
	for _, row := range b.rows {
		if row.level == level && strings.Contains(row.line, line) {
			return true
		}
	}
	return false
}

func TestTheDownWordStartsTheIndexOnACloudBoxAlone(t *testing.T) {
	t.Parallel()
	desk := &downBox{}
	downs(t, desk, false, "session.start", `{"session_id":"s1"}`)
	if len(desk.runs) != 0 {
		t.Fatalf("the down word on a desk runs %v, and wants no start, since a person starts the index there", desk.runs)
	}
	cloud := &downBox{}
	downs(t, cloud, true, "session.start", `{"session_id":"s1"}`)
	if len(cloud.runs) != 1 || len(cloud.runs[0]) != 2 || !strings.HasSuffix(cloud.runs[0][0], serveIndexBin) || cloud.runs[0][1] != "standing" {
		t.Fatalf("the down word on a cloud box runs %v, and wants the index standing once", cloud.runs)
	}
}

func TestTheDownWordAnswersTheDoorOnceItStands(t *testing.T) {
	t.Parallel()
	b := &downBox{effects: []hooks.Effect{{Kind: "after", Text: "from the door"}}}
	said := downs(t, b, true, "prompt.submit", `{"session_id":"s1","text":"go"}`)
	if text, ok := effectText(said.answer, "after"); said.code != 0 || !ok || text != "from the door" {
		t.Fatalf("the down word answers %d, %q, and wants the door's answer once the index stands", said.code, said.out)
	}
	last := b.posts[len(b.posts)-1]
	if last.Event != "prompt.submit" || last.E["text"] != "go" || last.Root == "" {
		t.Errorf("the door takes %+v, and wants the event and its fields under the root", last)
	}
	if level, reason := startReasonOf(0); reason == "" || !logged(b, level, reason) {
		t.Errorf("the log takes %+v, and wants the start's own row", b.rows)
	}
	if said.errs != "" {
		t.Errorf("the down word says %q, and wants nothing said where the door stands", said.errs)
	}
}

func TestTheDownWordRefusesAGuardedCallWhileTheDoorStandsDown(t *testing.T) {
	t.Parallel()
	said := downs(t, &downBox{}, false, "tool.call", `{"session_id":"s1","tool":"Write","file_path":"spec/a.md","content":"x"}`)
	if text, _ := effectText(said.answer, "result"); !strings.HasPrefix(text, "Level zero refuses Write: the index answers nothing,") {
		t.Fatalf("a write while the door stands down answers %q, and wants the refusal naming Write", said.out)
	}
	for _, input := range []string{
		`{"session_id":"s1","tool":"Read","file_path":"a.md"}`,
		`{"session_id":"s1","tool":"Bash","command":"git status"}`,
	} {
		if passed := downs(t, &downBox{}, false, "tool.call", input); len(passed.answer.Effects) > 0 && passed.answer.Effects[0].Kind != "pass" {
			t.Errorf("%s while the door stands down answers %q, and wants it through", input, passed.out)
		}
	}
}

func TestTheDownWordHandsThePromptContextTheCageBlock(t *testing.T) {
	t.Parallel()
	b := &downBox{code: 1, stderr: "the door falls over"}
	said := downs(t, b, true, "prompt.context", `{"session_id":"s1"}`)
	var block *hooks.Effect
	for at, one := range said.answer.Effects {
		if one.Kind == "after" && one.Name == cageBlock {
			block = &said.answer.Effects[at]
		}
	}
	if block == nil {
		t.Fatalf("the prompt context answers %q, and wants the block %s", said.out, cageBlock)
	}
	if !strings.HasPrefix(block.Text, "LEVEL ZERO STANDS DOWN ON THIS BOX.") || !strings.Contains(block.Text, "the door falls over") || !strings.Contains(block.Text, "./RUNME.sh serve") {
		t.Errorf("the cage block reads %q, and wants the fault the standing names and the command that starts it", block.Text)
	}
	if !logged(b, "warn", "standing") {
		t.Errorf("the log takes %+v, and wants a warn row saying the standing fails", b.rows)
	}
	if session := downs(t, &downBox{code: 1, stderr: "the door falls over"}, true, "session.start", `{"session_id":"s1"}`); strings.Contains(session.out, cageBlock) {
		t.Errorf("the session start answers %q, and wants the cage block on the prompt context alone", session.out)
	}
}

func TestEveryStartCodeReadsAsALevelAndAReason(t *testing.T) {
	t.Parallel()
	for code, level := range map[int]string{0: "info", 1: "warn", 3: "", 4: "warn", 5: "warn", 7: "info", 8: "warn", 9: "warn"} {
		got, reason := startReasonOf(code)
		if got != level || reason == "" {
			t.Errorf("the code %d reads %q, %q, and wants the level %q and a reason", code, got, reason, level)
		}
	}
	if level, reason := startReasonOf(42); level != "warn" || !strings.Contains(reason, "42") {
		t.Errorf("an unnamed code reads %q, %q, and wants a warning naming it", level, reason)
	}
}

func TestTheSessionStartFallSaysNothingToThePerson(t *testing.T) {
	t.Parallel()
	b := &downBox{}
	said := downs(t, b, false, "session.start", `{"session_id":"s1"}`)
	if said.code != 0 || said.errs != "" {
		t.Fatalf("the session start's fall answers %d, %q, and wants nothing said to the person", said.code, said.errs)
	}
	if !logged(b, "warn", "answers nothing") {
		t.Errorf("the log takes %+v, and wants the fall's row all the same", b.rows)
	}
	prompt := downs(t, &downBox{}, false, "prompt.submit", `{"session_id":"s1","text":"go"}`)
	if !strings.HasPrefix(prompt.errs, "LEVEL ZERO ANSWERS NOTHING.") || !strings.Contains(prompt.errs, "Unable to connect") {
		t.Errorf("a prompt's fall says %q, and wants the fall line naming the fault", prompt.errs)
	}
}

func TestTheDownWordNamingNoEventPrintsTheUsage(t *testing.T) {
	t.Parallel()
	// level0: OutsideInDoors - the case hands the hook doors one wall reading, as the verb's root hands it in
	code, out, errs := runsTwin(hookVerb(hookDoorsOver(t.TempDir(), false, nil, "", time.Now())), "hook", "down")
	if code != exitFailed || out != "" || !strings.Contains(errs, "down <event>") {
		t.Fatalf("the down word with no event answers %d, %q, %q, and wants the usage naming the event it takes", code, out, errs)
	}
}
