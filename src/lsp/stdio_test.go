// The pipe to the editor: a frame goes out whole under many writers, an
// emptied buffer draws nothing stale, and a column counts UTF-16 units.
// [[spec/design_output/lsp#the-editor-speaks-over-stdio]]
package main

import (
	"bufio"
	"bytes"
	"encoding/json"
	"fmt"
	"path/filepath"
	"runtime"
	"sync"
	"testing"
)

// A writer taking one byte at a time and yielding between, so two frames written at once interleave where no lock holds them. [[spec/design_output/lsp#the-editor-speaks-over-stdio]]
type tricklingWriter struct {
	guard  sync.Mutex
	buffer bytes.Buffer
}

func (one *tricklingWriter) Write(said []byte) (int, error) {
	for _, each := range said {
		one.guard.Lock()
		one.buffer.WriteByte(each)
		one.guard.Unlock()
		runtime.Gosched()
	}
	return len(said), nil
}

func (one *tricklingWriter) String() string {
	one.guard.Lock()
	defer one.guard.Unlock()
	return one.buffer.String()
}

func saysAtOnce(one *server, count int) {
	var group sync.WaitGroup
	for i := 0; i < count; i++ {
		group.Add(1)
		go func(n int) {
			defer group.Done()
			one.says("test/said", map[string]int{"n": n})
		}(i)
	}
	group.Wait()
}

func heardOnce(t *testing.T, said []message, count int) {
	t.Helper()
	if len(said) != count {
		t.Fatalf("%d frames go out, and %d read back whole", count, len(said))
	}
	seen := map[string]bool{}
	for _, one := range said {
		seen[string(one.Params)] = true
	}
	if len(seen) != count {
		t.Fatalf("%d frames go out, and %d distinct ones read back", count, len(seen))
	}
}

// [[spec/design_output/lsp#the-editor-speaks-over-stdio]]
func TestFramesGoOutWholeUnderManyWriters(t *testing.T) {
	out := &tricklingWriter{}
	one := &server{checker: &Checker{tree: fixture(t, nil)}, out: out, panel: newPanel()}
	saysAtOnce(one, 30)
	heardOnce(t, spoken(t, out.String()), 30)
}

// [[spec/design_output/lsp#the-editor-speaks-over-stdio]]
func TestAFlushBesideTheWritersSplitsNoFrame(t *testing.T) {
	under := &tricklingWriter{}
	out := &wire{out: bufio.NewWriterSize(under, 16)}
	one := &server{checker: &Checker{tree: fixture(t, nil)}, out: out, panel: newPanel()}
	done := make(chan bool)
	go func() {
		for {
			select {
			case <-done:
				return
			default:
				out.Flush()
				runtime.Gosched()
			}
		}
	}()
	saysAtOnce(one, 30)
	close(done)
	out.Flush()
	heardOnce(t, spoken(t, under.String()), 30)
}

// The last list a file draws, and how many lists it draws. [[spec/design_output/lsp#the-editor-speaks-over-stdio]]
func lastDrawnOn(said []message, uri string) ([]diagnostic, int) {
	out, count := []diagnostic(nil), 0
	for _, one := range said {
		var told struct {
			URI   string       `json:"uri"`
			Drawn []diagnostic `json:"diagnostics"`
		}
		if one.Method != "textDocument/publishDiagnostics" || json.Unmarshal(one.Params, &told) != nil || told.URI != uri {
			continue
		}
		out, count = told.Drawn, count+1
	}
	return out, count
}

// A buffer emptied to nothing stands in the tree as the empty text, so the rows the last text drew leave. [[spec/design_output/lsp#the-editor-speaks-over-stdio]]
func TestAnEmptiedBufferDrawsNothingStale(t *testing.T) {
	tree := wholeTree(t, map[string]string{
		"spec/schemas/handover.schema.yaml": handoverSchema,
		"spec/one.md":                       departing,
	})
	uri := uriOf(filepath.Join(tree.Root, "spec", "one.md"))
	open := fmt.Sprintf(`{"jsonrpc":"2.0","method":"textDocument/didOpen","params":{"textDocument":{"uri":%q,"text":%q}}}`, uri, departing)
	change := fmt.Sprintf(`{"jsonrpc":"2.0","method":"textDocument/didChange","params":{"textDocument":{"uri":%q},"contentChanges":[{"text":""}]}}`, uri)
	out := &guardedBuffer{}
	if err := Speaks(&Checker{tree: tree}, framed(open, change), out); err != nil {
		t.Fatal(err)
	}

	said := spoken(t, out.String())
	if drawn := drawnOn(said, uri); len(drawn) == 0 || drawn[0].Code != "Schema.status" {
		t.Fatalf("the open draws %v", drawn)
	}
	drawn, count := lastDrawnOn(said, uri)
	if count != 2 || len(drawn) != 0 {
		t.Fatalf("the emptied buffer draws %v over %d publishes", drawn, count)
	}
	if !tree.Held("spec/one.md") || tree.Read("spec/one.md") != "" {
		t.Fatalf("the tree reads %q for an emptied buffer", tree.Read("spec/one.md"))
	}
}

// A finding counts bytes, and the diagnostic counts UTF-16 units, so a wide character before the column keeps the column in place. [[spec/design_output/lsp#a-finding-is-a-diagnostic]]
func TestAColumnCountsUTF16Units(t *testing.T) {
	row := "ä 😀 x"
	drawn := drawsAs(Finding{Rule: "One", Line: 1, Column: len("ä 😀 ") + 1, Severity: SeverityWarning}, []string{row})
	if drawn.Range.Start != (position{Line: 0, Character: 5}) || drawn.Range.End != (position{Line: 0, Character: 6}) {
		t.Fatalf("the x after ä and an emoji draws over %+v", drawn.Range)
	}
	if drawn.Severity != severityWarning {
		t.Fatalf("a warning draws at severity %d", drawn.Severity)
	}

	whole := drawsAs(Finding{Rule: "One", Line: 1, Column: 1}, []string{row})
	if whole.Range.Start.Character != 0 || whole.Range.End.Character != 6 {
		t.Fatalf("the whole line draws over %+v", whole.Range)
	}
	if inside := unitsTo(row, 1); inside != 0 {
		t.Fatalf("a byte inside ä counts from its start, and it answers %d", inside)
	}
	if at := byteAt(row, 4); at != len("ä 😀") {
		t.Fatalf("four units in reach the byte past the emoji, and it answers %d", at)
	}
}
