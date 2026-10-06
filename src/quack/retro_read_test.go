// The retro's reader verb over a seeded chapter: every owner prompt, fault and
// command, each with its file and line.
// [[spec/tickets/the-retro-finishes-its-asks]]
package main

import (
	"fmt"
	"testing"
)

// The time every line of the reader's input carries. [[spec/tickets/the-retro-finishes-its-asks]]
const retroReaderWhen = "2026-09-19T08:10:00.000Z"

// A transcript line of the given type, its content raw JSON. [[spec/tickets/the-retro-finishes-its-asks]]
func retroReaderSaid(kind, content string) string {
	return fmt.Sprintf(`{"type":%q,"timestamp":%q,"message":{"role":%q,"content":%s}}`, kind, retroReaderWhen, kind, content)
}

// The reader's tree: a transcript, a helper's transcript, a log, and the chapter holding their lines. [[spec/tickets/the-retro-finishes-its-asks]]
func retroReaderTree(t *testing.T) string {
	t.Helper()
	root := t.TempDir()
	retroReadingLay(t, root, retroReadingName, map[string]string{
		"input/transcripts/one/a.jsonl": retroReaderSaid("user", `"fix the land verb"`) + "\n" +
			retroReaderSaid("assistant", `[{"type":"tool_use","name":"Bash","input":{"command":"./RUNME.sh check"}}]`) + "\n" +
			retroReaderSaid("user", `[{"type":"tool_result","is_error":true,"content":"the check answers red"}]`) + "\n" +
			retroReaderSaid("assistant", `[{"type":"text","text":"a reply"}]`) + "\n" +
			retroReaderSaid("user", `[{"type":"text","text":"a prompt past the chapter"}]`),
		"input/transcripts/one/a/subagents/b.jsonl": retroReaderSaid("user", `"a helper's prompt"`),
		"input/log/session.jsonl": fmt.Sprintf(`{"at":%q,"level":"info","msg":"a quiet line"}`, retroReaderWhen) + "\n" +
			fmt.Sprintf(`{"at":%q,"level":"error","msg":"the door refuses"}`, retroReaderWhen),
		"chapters/c1.json": `{"id":"c1","lines":{` +
			`"transcripts/one/a.jsonl":[[1,4]],` +
			`"transcripts/one/a/subagents/b.jsonl":[[1,1]],` +
			`"log/session.jsonl":[[1,2]]}}`,
	})
	return root
}

// retro read prints every owner prompt, fault and command of the chapter with its file and line, in the chapter's order. [[spec/tickets/the-retro-finishes-its-asks]]
func TestRetroReadPrintsEveryOwnerPromptFaultAndCommandOfTheChapterWithItsFileAndLine(t *testing.T) {
	t.Parallel()
	root := retroReaderTree(t)

	code, out, errs := retroReadingRun(retroReadVerb, root, "retro", "read", retroReadingName, "c1")

	want := "transcripts/one/a.jsonl:1  prompt  fix the land verb\n" +
		"transcripts/one/a.jsonl:2  command  ./RUNME.sh check\n" +
		"transcripts/one/a.jsonl:3  fault  the check answers red\n" +
		"log/session.jsonl:2  fault  the door refuses\n"
	if code != 0 || out != want {
		t.Fatalf("read answers %d, %q, %q, want %q", code, out, errs, want)
	}
}

// retro read refuses a chapter the retro holds nowhere. [[spec/tickets/the-retro-finishes-its-asks]]
func TestRetroReadRefusesAChapterTheRetroHoldsNowhere(t *testing.T) {
	t.Parallel()
	root := retroReaderTree(t)

	code, _, errs := retroReadingRun(retroReadVerb, root, "retro", "read", retroReadingName, "c9")

	want := "retro read names a chapter the retro holds, and c9 stands nowhere under chapters.\n" +
		"  ./RUNME.sh retro read <retro> <chapter>\n"
	if code != 2 || errs != want {
		t.Fatalf("read answers %d, %q, want 2, %q", code, errs, want)
	}
}

// The reader marks a fault the way the timeline counts it, and a line reading as no JSON earns no row. [[spec/tickets/the-retro-finishes-its-asks]]
func TestRetroReadMarksAFaultAsTheTimelineCountsItAndALineOfNoJSONEarnsNone(t *testing.T) {
	t.Parallel()
	warn := fmt.Sprintf(`{"at":%q,"level":"warn","msg":"a slow door"}`, retroReaderWhen)
	if !retroFault.MatchString(warn) {
		t.Fatal("a warn line reads as no fault")
	}
	if got := retroRowsOf("log/session.jsonl", warn); len(got) != 1 || got[0] != (retroRow{kind: "fault", text: "a slow door"}) {
		t.Fatalf("a warn line earns %v", got)
	}
	if got := retroRowsOf("log/session.jsonl", "not json"); len(got) != 0 {
		t.Fatalf("a line of no JSON earns %v", got)
	}
	if got := retroRowsOf("transcripts/one/a.jsonl", retroReaderSaid("user", `"   "`)); len(got) != 0 {
		t.Fatalf("a blank prompt earns %v", got)
	}
}

// retro read counts a prompt the owner queues mid-turn and lists a refusal that carries no error mark; the queue's own line and a task's queued line earn none. [[spec/tickets/retro-read-reads-every-record]]
func TestRetroReadCountsAQueuedOwnerPromptAndListsAQuietRefusal(t *testing.T) {
	t.Parallel()
	root := t.TempDir()
	retroReadingLay(t, root, retroReadingName, map[string]string{
		"input/transcripts/one/a.jsonl": fmt.Sprintf(`{"type":"queue-operation","operation":"enqueue","timestamp":%q,"content":"stop and land it"}`, retroReaderWhen) + "\n" +
			fmt.Sprintf(`{"type":"attachment","timestamp":%q,"attachment":{"type":"queued_command","prompt":"stop and land it","origin":{"kind":"human"}}}`, retroReaderWhen) + "\n" +
			fmt.Sprintf(`{"type":"attachment","timestamp":%q,"attachment":{"type":"queued_command","prompt":"a task ends","origin":{"kind":"task-notification"}}}`, retroReaderWhen) + "\n" +
			retroReaderSaid("user", `[{"type":"tool_result","content":"refused\n  the leaf holds no hand"}]`) + "\n" +
			retroReaderSaid("user", `[{"type":"tool_result","content":"the leaf passes"}]`),
		"chapters/c1.json": `{"id":"c1","lines":{"transcripts/one/a.jsonl":[[1,5]]}}`,
	})

	code, out, errs := retroReadingRun(retroReadVerb, root, "retro", "read", retroReadingName, "c1")

	want := "transcripts/one/a.jsonl:2  prompt  stop and land it\n" +
		"transcripts/one/a.jsonl:4  refusal  the leaf holds no hand\n"
	if code != 0 || out != want {
		t.Fatalf("read answers %d, %q, %q, want %q", code, out, errs, want)
	}
}
