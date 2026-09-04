package main

import (
	"bufio"
	"bytes"
	"encoding/json"
	"fmt"
	"os"
	"path/filepath"
	"strings"
	"testing"
)

// The server is driven the way an editor drives it, over framed stdio, so a
// case here fails for the same reason the editor would see nothing.

func framed(bodies ...string) string {
	var b strings.Builder
	for _, one := range bodies {
		fmt.Fprintf(&b, "Content-Length: %d\r\n\r\n%s", len(one), one)
	}
	return b.String()
}

// spoken answers every message the server sent back.
func spoken(t *testing.T, out string) []rpcMessage {
	t.Helper()
	var got []rpcMessage
	r := bufio.NewReader(strings.NewReader(out))
	for {
		body, err := readFramed(r)
		if err != nil {
			return got
		}
		var m rpcMessage
		if err := json.Unmarshal(body, &m); err != nil {
			t.Fatalf("the server sent something that is not a message: %s", body)
		}
		got = append(got, m)
	}
}

// drive runs a conversation against a server rooted at a method tree.
func drive(t *testing.T, root string, bodies ...string) []rpcMessage {
	t.Helper()
	var out bytes.Buffer
	s := &server{roots: Roots{Method: root, Work: root}, docs: map[string]string{}, out: &out}
	if err := s.serve(strings.NewReader(framed(bodies...))); err != nil && err.Error() != "EOF" {
		// EOF is how a finished conversation ends, and it is not a failure.
		_ = err
	}
	return spoken(t, out.String())
}

const openBroken = `{"jsonrpc":"2.0","method":"textDocument/didOpen","params":{"textDocument":{"uri":"file:///n.md","text":"---\nkind: note\n---\n\n# A note\n\n## One\n\nShort.\n\n## Two\n\n- one two three four five\n"}}}`

func TestTheServerAnswersInitializeWithWhatItCanDo(t *testing.T) {
	t.Parallel()
	got := drive(t, aSchema(t, theTestSchema),
		`{"jsonrpc":"2.0","id":1,"method":"initialize","params":{}}`)
	if len(got) != 1 {
		t.Fatalf("initialize was answered %d times", len(got))
	}
	b, _ := json.Marshal(got[0].Result)
	for _, want := range []string{"textDocumentSync", "completionProvider"} {
		if !strings.Contains(string(b), want) {
			t.Errorf("the server does not offer %s: %s", want, b)
		}
	}
}

// A BUFFER IS DIAGNOSED, NOT A FILE. Nothing here was ever written to disk.
func TestAnOpenBufferIsDiagnosedWhereTheProblemIs(t *testing.T) {
	t.Parallel()
	got := drive(t, aSchema(t, theTestSchema), openBroken)
	if len(got) != 1 || got[0].Method != "textDocument/publishDiagnostics" {
		t.Fatalf("the server did not publish diagnostics: %+v", got)
	}
	var p struct {
		URI         string       `json:"uri"`
		Diagnostics []diagnostic `json:"diagnostics"`
	}
	json.Unmarshal(got[0].Params, &p)
	if len(p.Diagnostics) != 1 {
		t.Fatalf("wanted the one long item, got %+v", p.Diagnostics)
	}
	d := p.Diagnostics[0]
	if !strings.Contains(d.Message, "runs to 5 words") {
		t.Errorf("the diagnostic says %q", d.Message)
	}
	// The item is on file line 13, and LSP counts rows from zero.
	if d.Range.Start.Line != 12 {
		t.Errorf("the mark is on row %d and the item is on row 12", d.Range.Start.Line)
	}
	if d.Range.End.Character == 0 {
		t.Error("the mark has no width, so nothing is underlined")
	}
}

// A CHANGE IS DIAGNOSED AGAIN, because the point of this is live.
func TestEditingTheBufferRepublishes(t *testing.T) {
	t.Parallel()
	fixed := `{"jsonrpc":"2.0","method":"textDocument/didChange","params":{"textDocument":{"uri":"file:///n.md"},"contentChanges":[{"text":"---\nkind: note\n---\n\n# A note\n\n## One\n\nShort.\n\n## Two\n\n- one two\n"}]}}`
	got := drive(t, aSchema(t, theTestSchema), openBroken, fixed)
	if len(got) != 2 {
		t.Fatalf("wanted a publish per edit, got %d", len(got))
	}
	var p struct {
		Diagnostics []diagnostic `json:"diagnostics"`
	}
	json.Unmarshal(got[1].Params, &p)
	if len(p.Diagnostics) != 0 {
		t.Errorf("the edit fixed the note and the marks stayed: %+v", p.Diagnostics)
	}
}

// A markdown file that is not a note is left alone.
func TestADocumentWithNoKindIsNotNagged(t *testing.T) {
	t.Parallel()
	open := `{"jsonrpc":"2.0","method":"textDocument/didOpen","params":{"textDocument":{"uri":"file:///r.md","text":"# Just a readme\n\nNothing to do with notes.\n"}}}`
	got := drive(t, aSchema(t, theTestSchema), open)
	var p struct {
		Diagnostics []diagnostic `json:"diagnostics"`
	}
	json.Unmarshal(got[0].Params, &p)
	if len(p.Diagnostics) != 0 {
		t.Errorf("a plain markdown file was marked up: %+v", p.Diagnostics)
	}
}

func TestCompletionOffersWhatTheSchemaAllows(t *testing.T) {
	t.Parallel()
	root := aSchema(t, theTestSchema)
	ask := func(text string, line, char int) []completionItem {
		t.Helper()
		open := fmt.Sprintf(`{"jsonrpc":"2.0","method":"textDocument/didOpen","params":{"textDocument":{"uri":"file:///c.md","text":%s}}}`,
			mustJSON(text))
		comp := fmt.Sprintf(`{"jsonrpc":"2.0","id":9,"method":"textDocument/completion","params":{"textDocument":{"uri":"file:///c.md"},"position":{"line":%d,"character":%d}}}`,
			line, char)
		got := drive(t, root, open, comp)
		for _, m := range got {
			if len(m.ID) == 0 {
				continue
			}
			var items []completionItem
			b, _ := json.Marshal(m.Result)
			json.Unmarshal(b, &items)
			return items
		}
		return nil
	}
	labels := func(items []completionItem) string {
		var out []string
		for _, i := range items {
			out = append(out, i.Label)
		}
		return strings.Join(out, ",")
	}

	// A value for kind is offered from the schemas this copy has.
	if got := labels(ask("---\nkind: \n---\n\n# x\n", 1, 6)); !strings.Contains(got, "note") {
		t.Errorf("kind was not offered its own value, got %q", got)
	}
	// A key is offered, and one already written is not offered twice.
	if got := labels(ask("---\nkind: note\n\n---\n\n# x\n", 2, 0)); strings.Contains(got, "kind") {
		t.Errorf("kind was offered again although it is written, got %q", got)
	}
	// A chapter heading is offered from the schema's own list.
	got := labels(ask("---\nkind: note\n---\n\n# x\n\n## \n", 6, 3))
	for _, want := range []string{"One", "Two"} {
		if !strings.Contains(got, want) {
			t.Errorf("the %s chapter was not offered, got %q", want, got)
		}
	}
}

func mustJSON(s string) string {
	b, _ := json.Marshal(s)
	return string(b)
}

// A request the server does not answer is still answered, or the editor waits.
// THE SCRATCHPAD IS NOT NOTES. A fixture under .se/scratchpad written to look
// broken must not reach the problems panel, and the tokens under .se/work
// still must.
func TestTheWorkspaceScanLeavesTheScratchpadAlone(t *testing.T) {
	t.Parallel()
	root := t.TempDir()
	for dir, name := range map[string]string{
		filepath.Join(root, ".se", "scratchpad"): "broken.md",
		filepath.Join(root, ".se", "work"):       "wk-under-test.md",
	} {
		if err := os.MkdirAll(dir, 0o755); err != nil {
			t.Fatal(err)
		}
		note := "---\nkind: [[work-token]]\ntitle: a note\n---\n\n## detail\n\nwords\n"
		if err := os.WriteFile(filepath.Join(dir, name), []byte(note), 0o644); err != nil {
			t.Fatal(err)
		}
	}
	notes, err := notesUnder(root)
	if err != nil {
		t.Fatal(err)
	}
	for _, p := range notes {
		if strings.Contains(filepath.ToSlash(p), ".se/scratchpad") {
			t.Fatalf("the scan read the scratchpad: %s", p)
		}
	}
	if len(notes) != 1 {
		t.Fatalf("the scan answered %d note(s), want the one under .se/work: %v", len(notes), notes)
	}
}

func TestAnUnknownRequestIsStillAnswered(t *testing.T) {
	t.Parallel()
	got := drive(t, aSchema(t, theTestSchema),
		`{"jsonrpc":"2.0","id":4,"method":"textDocument/hover","params":{}}`)
	if len(got) != 1 {
		t.Fatalf("an unknown request was not answered: %+v", got)
	}
}
