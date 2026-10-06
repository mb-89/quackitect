// The lsp IO module draws a walk-around as the check module finds it: at
// error over a refusing door, and as a hint in an open buffer over a door at
// report.
// [[spec/design_output/doors#nothing-walks-around-a-door]]
package main

import (
	"encoding/json"
	"sync"
	"testing"

	"quackitect/src/modules/check"
	"quackitect/src/modules/lsp"
	"quackitect/src/q"
	"quackitect/src/q/qtest"
)

const (
	walkedAt   = "src/engine/wait.go"
	walkedURI  = "file:///tree/" + walkedAt
	walkedText = "package engine\n\nimport \"time\"\n\nfunc For() { time.Sleep(1) }\n"
	// The levels a diagnostic carries, as the protocol numbers them. [[spec/design_output/lsp#a-finding-is-a-diagnostic]]
	drawnError = 1
	drawnHint  = 4
)

type drawnRow struct {
	Severity int    `json:"severity"`
	Code     string `json:"code"`
	Source   string `json:"source"`
}

// A server over the files, wired to the check module as quack wires it, its tools answering nothing of their own. [[spec/tickets/lsp-module-draws-the-tools]]
func doorsServer(t *testing.T, files map[string]string) (*lsp.Server, func() [][]byte) {
	t.Helper()
	c := q.New()
	as := lsp.Registers(c)
	q.OutIn(c, "files/<path...>", q.Content{}, q.Doc("a file, as the case seeds it"))
	q.OutIn(c, "tracked", []string{}, q.Doc("the paths git tracks, as the case seeds them"))
	checks := lspChecks("/tree")
	quiet := func(_, _, _ string, _ ...string) (string, error) { return "{}", nil }
	tools := &lsp.Tools{Root: "/tree", Vale: "vale", Biome: "biome", Config: ".vale.ini", Run: quiet, Check: checks}
	server := lsp.New(lsp.Outside{
		Root: "/tree", Store: qtest.Over(t, c, as).Store(), As: as, Bound: func(local string) string { return local },
		Sweep: func() any { return []lsp.Finding{} }, Tools: tools, Check: checks,
		Files: func() map[string]string { return files }, Clock: wall,
	})
	var (
		mu     sync.Mutex
		pushed [][]byte
	)
	server.Pushes(func(bodies ...[]byte) {
		mu.Lock()
		defer mu.Unlock()
		pushed = append(pushed, bodies...)
	})
	return server, func() [][]byte {
		mu.Lock()
		defer mu.Unlock()
		return append([][]byte{}, pushed...)
	}
}

// The walk-around rows the last publish for the URI draws. [[spec/design_output/lsp#a-finding-is-a-diagnostic]]
func walkRows(bodies [][]byte, uri string) []drawnRow {
	var out []drawnRow
	for _, body := range bodies {
		var one struct {
			Method string `json:"method"`
			Params struct {
				URI         string     `json:"uri"`
				Diagnostics []drawnRow `json:"diagnostics"`
			} `json:"params"`
		}
		if json.Unmarshal(body, &one) != nil || one.Method != "textDocument/publishDiagnostics" || one.Params.URI != uri {
			continue
		}
		out = []drawnRow{}
		for _, row := range one.Params.Diagnostics {
			if row.Code == check.WalksAroundADoor {
				out = append(out, row)
			}
		}
	}
	return out
}

func TestAWalkAroundDrawsAsAnErrorDiagnostic(t *testing.T) {
	t.Parallel()
	server, _ := doorsServer(t, map[string]string{"src/modules/clock/owns.yaml": "clock:\n  go: [time.Sleep]\n", walkedAt: walkedText})
	rows := walkRows(server.SweepTools(), walkedURI)
	if len(rows) != 1 || rows[0].Severity != drawnError || rows[0].Source != "tree" {
		t.Fatalf("the closed file draws %+v, and wants one walk-around at error under the source tree", rows)
	}
}

func TestAWalkAroundADoorAtReportDrawsAHintAsItIsTyped(t *testing.T) {
	t.Parallel()
	server, pushed := doorsServer(t, map[string]string{"src/modules/clock/owns.yaml": "clock:\n  go: [time.Sleep]\n  report: true\n", walkedAt: "package engine\n"})
	if rows := walkRows(server.SweepTools(), walkedURI); len(rows) != 0 {
		t.Fatalf("the closed file draws %+v, and wants nothing over a door at report", rows)
	}
	open, _ := json.Marshal(map[string]any{"jsonrpc": "2.0", "method": "textDocument/didOpen", "params": map[string]any{"textDocument": map[string]any{"uri": walkedURI, "version": 1, "text": walkedText}}})
	server.Handle(open)
	server.Settle()
	rows := walkRows(pushed(), walkedURI)
	if len(rows) != 1 || rows[0].Severity != drawnHint {
		t.Fatalf("the typed buffer draws %+v, and wants one walk-around as a hint", rows)
	}
}
