// ticket note writes a private ticket off the note process and carries on,
// off the roads test/level0/ticket-verb.test.js, ticket-todo.test.js and
// roots.test.js cover.
// [[spec/design_input/the-agent-pulls-tickets#processes-are-routes]]
package main

import (
	"encoding/json"
	"os"
	"path/filepath"
	"regexp"
	"strconv"
	"strings"
	"testing"
)

// The note route the cases mint off, as ticket-doors.js seeds it. [[spec/design_input/the-agent-pulls-tickets#processes-are-routes]]
const noteCaseProcess = `for: a thing to look at later
ask:
  - name: line
    form: text
    says: the smallest case that shows it
steps:
  - name: decide
    does: says what the note becomes
    from: anyone
    by: retro
    to: retro
    input: ask
    evidence:
      - name: outcome
        form: text
        says: what the note becomes
`

// A Vale that behaves over stdin: a semicolon breaks Characters as a warning, and the marker breaks Private at error. [[spec/design_output/doors#a-fake-behaves]]
const noteCaseVale = `#!/bin/sh
for a in "$@"; do case "$a" in --path=*) p="${a#--path=}";; esac; done
awk -v p="$p" '
function row(rule, line, said, message, severity) { r = r (n ? "," : "") sprintf("{\"Check\":\"VoiceVale.%s\",\"Line\":%d,\"Span\":[1,1],\"Match\":\"%s\",\"Message\":\"%s\",\"Severity\":\"%s\"}", rule, line, said, message, severity); n++ }
index($0, ";") { row("Characters", NR, ";", "A semicolon joins two sentences.", "warning") }
index($0, "SECRET") { row("Private", NR, "SECRET", "A private name leaves the box.", "error") }
END { if (n) printf "{\"%s\":[%s]}\n", p, r; else print "{}" }'
`

// A tree holding the ticket schema this tree holds and the note route, its work root the same. [[spec/design_input/the-agent-pulls-tickets#processes-are-routes]]
func noteCaseTree(t *testing.T) string {
	t.Helper()
	root := t.TempDir()
	t.Setenv(workRootVar, "")
	noteCaseMethod(t, root)
	return root
}

// Seeds the schema and the note route under the method root. [[spec/design_output/vehicle#the-work-root-inherits]]
func noteCaseMethod(t *testing.T, root string) {
	t.Helper()
	schema, err := os.ReadFile(filepath.Join("..", "..", "spec", "schemas", "ticket.schema.yaml"))
	if err != nil {
		t.Fatal(err)
	}
	seedsFile(t, root, "spec/schemas/ticket.schema.yaml", string(schema))
	seedsFile(t, root, "spec/processes/note.yaml", noteCaseProcess)
}

// Seeds the wiring this tree holds, so the config answers the words a name holds. [[spec/tickets/prose-verbs-land-first-try]]
func noteCaseWiring(t *testing.T, root string) {
	t.Helper()
	wiring, err := os.ReadFile(filepath.Join("..", "..", "spec", "wiring.yaml"))
	if err != nil {
		t.Fatal(err)
	}
	seedsFile(t, root, "spec/wiring.yaml", string(wiring))
}

// Seeds the fake Vale where the voice finds it. [[spec/design_output/doors#a-fake-behaves]]
func noteCaseVoice(t *testing.T, root string) {
	t.Helper()
	seedsFile(t, root, ".se/.runtime/bin/vale", noteCaseVale)
	if err := os.Chmod(filepath.Join(root, ".se", ".runtime", "bin", "vale"), 0o755); err != nil {
		t.Fatal(err)
	}
}

// Whether the text holds a row the pattern matches whole. [[spec/design_input/the-agent-pulls-tickets#processes-are-routes]]
func holdsRow(text, pattern string) bool {
	return regexp.MustCompile("(?m)^" + pattern + "$").MatchString(text)
}

func TestTicketNote(t *testing.T) {
	t.Run("note writes a private ticket off the note process, and says so", func(t *testing.T) {
		root := noteCaseTree(t)
		code, out, errs := runsApart(t, root, false, "ticket", "note", "slow-lint", "The", "lint", "drags.")
		if code != 0 || out != slowLint+" stands, and it waits for a retro to decide it.\n" || errs != "" {
			t.Fatalf("note answers %d, %q, %q", code, out, errs)
		}
		text, _ := readsBack(t, root, slowLint)
		for _, row := range []string{`kind: \[\[ticket\]\]`, "state: open", "step: decide", `process: \[\[spec/processes/note\]\]`, "process_hash: [0-9a-f]{16}", `The lint drags\.`} {
			if !holdsRow(text, row) {
				t.Errorf("the note holds no row %s:\n%s", row, text)
			}
		}
		if holdsRow(text, "todo:.*") {
			t.Errorf("a note minted without the flag carries a todo:\n%s", text)
		}
	})
	t.Run("note names a standing open note whose words match the line, before it writes", func(t *testing.T) {
		root := noteCaseTree(t)
		seedsFile(t, root, "spec/tickets/lint-drags.md", "---\nkind: [[ticket]]\nstate: open\n---\n\n# Ask\n\nThe lint drags past a minute.\n\n# Discussion\n")
		seedsFile(t, root, "spec/tickets/lint-closed.md", "---\nkind: [[ticket]]\nstate: done\n---\n\n# Ask\n\nThe lint drags past a minute.\n\n# Discussion\n")
		code, said := runsVerb(t, root, "ticket", "note", "slow-lint", "The lint drags past a minute on each run.")
		want := "spec/tickets/lint-drags.md stands open and carries these words. Add the line there in place of a twin.\n" + slowLint + " stands, and it waits for a retro to decide it.\n"
		if code != 0 || said != want {
			t.Fatalf("note answers %d, %q, and wants %q", code, said, want)
		}
		if _, stands := readsBack(t, root, slowLint); !stands {
			t.Fatal("the note lands nowhere")
		}
	})
	t.Run("note --talk marks the decide step a person's, and the line loses the flag", func(t *testing.T) {
		root := noteCaseTree(t)
		code, out, _ := runsApart(t, root, false, "ticket", "note", "slow-lint", "--talk", "The", "lint", "drags.")
		text, _ := readsBack(t, root, slowLint)
		if code != 0 || out != slowLint+" stands, and it waits for a person to decide it.\n" {
			t.Fatalf("note --talk answers %d, %q", code, out)
		}
		if !holdsRow(text, "    by: person") || !holdsRow(text, `The lint drags\.`) || strings.Contains(text, "--talk") {
			t.Fatalf("the note holds:\n%s", text)
		}
	})
	t.Run("note --todo writes the field, and keeps the line clean", func(t *testing.T) {
		root := noteCaseTree(t)
		code, out, _ := runsApart(t, root, false, "ticket", "note", "slow-lint", "The", "lint", "drags.", "--todo")
		text, _ := readsBack(t, root, slowLint)
		if code != 0 || out != slowLint+" stands at todo, and the next pull hands it back first.\n" {
			t.Fatalf("note --todo answers %d, %q", code, out)
		}
		if !holdsRow(text, "todo: true") || !holdsRow(text, `The lint drags\.`) || strings.Contains(text, "--todo") {
			t.Fatalf("the note holds:\n%s", text)
		}
	})
	t.Run("note writes a note row carrying its whole line, past the row's width", func(t *testing.T) {
		root := noteCaseTree(t)
		long := "The lint drags, " + strings.Repeat("and it drags on ", 8) + "so the row clips it."
		if code, _, errs := runsApart(t, root, false, "ticket", "note", "slow-lint", long); code != 0 {
			t.Fatalf("note answers %d, %q", code, errs)
		}
		log, _ := readsBack(t, root, sessionLog)
		var row map[string]any
		if err := json.Unmarshal([]byte(strings.TrimSpace(log)), &row); err != nil {
			t.Fatalf("the log holds %q: %v", log, err)
		}
		said, _ := row["said"].(string)
		if row["level"] != "info" || row["kind"] != "note" || row["text"] != long || row["ticket"] != "slow-lint" || said == "" || !strings.HasPrefix(long, said) {
			t.Fatalf("the row reads %v", row)
		}
	})
	t.Run("note writes from off the hold, as the ticket and the step in hand", func(t *testing.T) {
		root := noteCaseTree(t)
		seedsFile(t, root, ".se/.runtime/hold/box-1.json", `{"ticket":"a-route-is-a-graph","step":"implement/change"}`)
		if code, _, errs := runsApart(t, root, false, "ticket", "note", "slow-lint", "The lint drags."); code != 0 {
			t.Fatalf("note answers %d, %q", code, errs)
		}
		if text, _ := readsBack(t, root, slowLint); !holdsRow(text, "    from: a-route-is-a-graph/implement/change") {
			t.Fatalf("the note holds:\n%s", text)
		}
	})
	t.Run("note takes a name and a line", func(t *testing.T) {
		root := noteCaseTree(t)
		for _, argv := range [][]string{{"ticket", "note"}, {"ticket", "note", "slow-lint"}, {"ticket", "note", "slow-lint", "--todo", "--talk"}} {
			code, out, errs := runsApart(t, root, false, argv...)
			if code != 2 || out != "" || errs != "ticket note needs a name and a line: ./RUNME.sh ticket note slow-lint \"...\"\n" {
				t.Errorf("%v answers %d, %q, %q", argv, code, out, errs)
			}
		}
	})
	t.Run("note refuses a note standing already", func(t *testing.T) {
		root := noteCaseTree(t)
		runsApart(t, root, false, "ticket", "note", "slow-lint", "The lint drags.")
		was, _ := readsBack(t, root, slowLint)
		code, out, errs := runsApart(t, root, false, "ticket", "note", "slow-lint", "Again.")
		if code != 2 || out != "" || errs != slowLint+" stands already. Name a note nothing holds yet.\n" {
			t.Fatalf("the second note answers %d, %q, %q", code, out, errs)
		}
		if now, _ := readsBack(t, root, slowLint); now != was {
			t.Fatalf("a refused note writes %q", now)
		}
	})
	t.Run("note cuts a name past the cap, writes under the cut name and says so", func(t *testing.T) {
		root := noteCaseTree(t)
		noteCaseWiring(t, root)
		long := "one-two-three-four-five-six"
		code, out, errs := runsApart(t, root, false, "ticket", "note", long, "A line.")
		want := long + " holds more than 5 words, so the note stands as one-two-three-four-five.\n.se/tickets/one-two-three-four-five.md stands, and it waits for a retro to decide it.\n"
		if code != 0 || out != want {
			t.Fatalf("note answers %d, %q, %q", code, out, errs)
		}
		if _, stands := readsBack(t, root, ".se/tickets/one-two-three-four-five.md"); !stands {
			t.Error("the cut name lands nowhere")
		}
		if _, stands := readsBack(t, root, ".se/tickets/"+long+".md"); stands {
			t.Error("the long name lands")
		}
	})
	t.Run("note writes a line the lint warns on, and names Characters at its line", func(t *testing.T) {
		root := noteCaseTree(t)
		noteCaseVoice(t, root)
		code, out, errs := runsApart(t, root, false, "ticket", "note", "a-name", "one; two")
		text, stands := readsBack(t, root, ".se/tickets/a-name.md")
		if code != 0 || !stands || out != ".se/tickets/a-name.md stands, and it waits for a retro to decide it.\n" {
			t.Fatalf("note answers %d, %q, %q, and the note stands: %v", code, out, errs, stands)
		}
		line := 0
		for i, row := range strings.Split(text, "\n") {
			if row == "one; two" {
				line = i + 1
			}
		}
		want := ".se/tickets/a-name.md holds an Ask that breaks a rule of form, and it lands. Leave the lines as they stand, and carry on:\n  line " + strconv.Itoa(line) + " breaks Characters: A semicolon joins two sentences.\n"
		if line == 0 || errs != want {
			t.Fatalf("note warns %q, and wants %q", errs, want)
		}
	})
	t.Run("note refuses a line carrying a private name, and writes nothing", func(t *testing.T) {
		root := noteCaseTree(t)
		noteCaseVoice(t, root)
		code, out, errs := runsApart(t, root, false, "ticket", "note", "a-name", "the note names SECRET")
		if code != 1 || out != "" || !strings.HasPrefix(errs, ".se/tickets/a-name.md would hold an Ask that breaks the voice rules, so the verb writes nothing:\n  line ") || !strings.HasSuffix(errs, " breaks Private: A private name leaves the box.\n\nRewrite the line, then run the verb again.\n") {
			t.Fatalf("note answers %d, %q, %q", code, out, errs)
		}
		if _, stands := readsBack(t, root, ".se/tickets/a-name.md"); stands {
			t.Fatal("a refused note writes a file")
		}
	})
	t.Run("note writes under the work root, off the note process under the method root", func(t *testing.T) {
		method, work := t.TempDir(), t.TempDir()
		noteCaseMethod(t, method)
		t.Setenv(workRootVar, work)
		if code, _, errs := runsApart(t, method, false, "ticket", "note", "slow-lint", "The", "lint", "drags."); code != 0 {
			t.Fatalf("note answers %d, %q", code, errs)
		}
		if text, _ := readsBack(t, work, slowLint); !holdsRow(text, `process: \[\[spec/processes/note\]\]`) {
			t.Fatalf("the work root holds:\n%s", text)
		}
		if _, stands := readsBack(t, method, slowLint); stands {
			t.Fatal("the note lands in the method root")
		}
	})
	t.Run("a dry run says what it writes, and writes nothing", func(t *testing.T) {
		root := noteCaseTree(t)
		code, out, _ := runsApart(t, root, true, "ticket", "note", "slow-lint", "The lint drags.")
		if code != 0 || out != slowLint+" stands, and it waits for a retro to decide it.\n" {
			t.Fatalf("the dry note answers %d, %q", code, out)
		}
		if _, stands := readsBack(t, root, slowLint); stands {
			t.Fatal("the dry note writes a file")
		}
		if _, stands := readsBack(t, root, sessionLog); stands {
			t.Fatal("the dry note writes a log row")
		}
	})
}
