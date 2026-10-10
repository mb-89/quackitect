// The marks the server draws over the fields a person's hold still wants,
// their hover, and the cursor a new take moves, each over the fake port.
// [[spec/tickets/lsp-marks-the-held-fields]]
package lsp // level0: InPackageTest - reaches the package's helpers lensesOver, heard, opened and answered

import (
	"encoding/json"
	"reflect"
	"strings"
	"testing"
)

// The line the draft leaf's first unfilled field stands at, and its last. [[spec/tickets/lsp-marks-the-held-fields]]
const (
	approachLine = 12
	sizeLine     = 18
)

// The draft leaf wants an approach and a size, and its tests stand filled. [[spec/tickets/lsp-marks-the-held-fields]]
func drawing() map[string]Drawing {
	return map[string]Drawing{lensPath: {Leaves: map[string]DrawnLeaf{
		"design/draft": {Does: "writes the approach the ask calls for", Fields: []DrawnField{
			{Name: "approach", Form: "text", Says: "the approach here", Line: approachLine},
			{Name: "tests", Form: "list", Line: approachLine + 1, Filled: true},
			{Name: "size", Form: "list", Says: "every file the approach touches", Items: []string{"a file a line"}, Line: sizeLine},
		}},
	}}}
}

func personHold() []Hold {
	return []Hold{{Ticket: "one", Path: lensPath, Step: "design/draft", Hand: "person a-desk", Person: true}}
}

// A ticket at its draft leaf, long enough to hold every mark, with a term on a line no mark stands at. [[spec/tickets/lsp-marks-the-held-fields]]
func markedText() string {
	return ticketAt("open", "design/draft") + "\nThe doors hold.\n" + strings.Repeat("\n", sizeLine)
}

// The rows a publish carries with the code HeldField, as their zero-based lines. [[spec/tickets/lsp-marks-the-held-fields]]
func markRows(replies [][]byte) []int {
	out := []int{}
	for _, body := range replies {
		var one struct {
			Params struct {
				Diagnostics []struct {
					Range struct {
						Start position `json:"start"`
					} `json:"range"`
					Severity int    `json:"severity"`
					Code     string `json:"code"`
				} `json:"diagnostics"`
			} `json:"params"`
		}
		json.Unmarshal(body, &one)
		for _, row := range one.Params.Diagnostics {
			if row.Code == "HeldField" && row.Severity == levelHint {
				out = append(out, row.Range.Start.Line)
			}
		}
	}
	return out
}

func TestAHeldLeafMarksItsUnfilledFields(t *testing.T) {
	server := lensesOver(t, nil, &heard{holds: personHold(), drawn: drawing()})
	if got := markRows(server.Handle(opened(lensURI, markedText()))); !reflect.DeepEqual(got, []int{approachLine - 1, sizeLine - 1}) {
		t.Fatalf("the held leaf marks the lines %v, and wants the approach and the size", got)
	}
}

func TestATicketHeldByNoPersonCarriesNoMark(t *testing.T) {
	for _, holds := range [][]Hold{nil, {{Ticket: "one", Path: lensPath, Step: "design/draft", Hand: "box a1 · claude-code"}}} {
		server := lensesOver(t, nil, &heard{holds: holds, drawn: drawing()})
		if got := markRows(server.Handle(opened(lensURI, markedText()))); len(got) != 0 {
			t.Errorf("the holds %v mark the lines %v, and want none", holds, got)
		}
	}
}

// The markdown a hover answers at a line of the ticket. [[spec/tickets/lsp-marks-the-held-fields]]
func hovered(t *testing.T, server *Server, line, character int) string {
	t.Helper()
	var said struct {
		Contents struct {
			Value string `json:"value"`
		} `json:"contents"`
	}
	answered(t, server, "textDocument/hover", at(lensURI, line, character), &said)
	return said.Contents.Value
}

func TestAMarkedLineHoversWhatTheFieldAsks(t *testing.T) {
	server := lensesOver(t, hoverFiles, &heard{holds: personHold(), drawn: drawing()})
	server.Handle(opened(lensURI, markedText()))
	for line, want := range map[int]string{
		approachLine - 1: "**design/draft**: writes the approach the ask calls for\n\n`approach` · text: the approach here",
		sizeLine - 1:     "**design/draft**: writes the approach the ask calls for\n\n`size` · list: every file the approach touches\n\n- a file a line",
	} {
		if got := hovered(t, server, line, 0); got != want {
			t.Errorf("the hover at line %d reads %q, and wants %q", line, got, want)
		}
	}
}

func TestAnUnmarkedLineHoversTheTerm(t *testing.T) {
	server := lensesOver(t, hoverFiles, &heard{holds: personHold(), drawn: drawing()})
	text := markedText()
	server.Handle(opened(lensURI, text))
	line := strings.Count(text[:strings.Index(text, "The doors")], "\n")
	if got := hovered(t, server, line, len("The d")); got != "**door**: the one place the tree guards an outside thing" {
		t.Fatalf("the term line hovers %q, and wants the term", got)
	}
}

// The uri and the line each window/showDocument among the bodies names. [[spec/tickets/lsp-marks-the-held-fields]]
func shown(bodies [][]byte) []string {
	out := []string{}
	for _, body := range bodies {
		var one struct {
			Method string `json:"method"`
			Params struct {
				URI       string `json:"uri"`
				TakeFocus bool   `json:"takeFocus"`
				Selection struct {
					Start position `json:"start"`
				} `json:"selection"`
			} `json:"params"`
		}
		if json.Unmarshal(body, &one) == nil && one.Method == "window/showDocument" && one.Params.TakeFocus {
			out = append(out, one.Params.URI+":"+strings.Repeat("|", one.Params.Selection.Start.Line))
		}
	}
	return out
}

func TestANewTakeShowsTheFirstMark(t *testing.T) {
	fake := &heard{drawn: drawing()}
	server := lensesOver(t, nil, fake)
	sent(t, server, "initialize", map[string]any{})
	fake.holds = personHold()
	if got := shown(server.Takes(map[string]any{"files/spec/notes/one.md": ""})); len(got) != 0 {
		t.Errorf("a commit naming no hold shows %v", got)
	}
	want := []string{"file:///tree/spec/tickets/one.md:" + strings.Repeat("|", approachLine-1)}
	if got := shown(server.Takes(map[string]any{"holds/standing": []any{}})); !reflect.DeepEqual(got, want) {
		t.Fatalf("a new take shows %v, and wants the first mark", got)
	}
	if got := shown(server.Takes(map[string]any{"holds/standing": []any{}})); len(got) != 0 {
		t.Errorf("the take, once known, shows %v again", got)
	}
}

func TestAHoldStandingAtTheStartShowsNothing(t *testing.T) {
	server := lensesOver(t, nil, &heard{holds: personHold(), drawn: drawing()})
	sent(t, server, "initialize", map[string]any{})
	if got := shown(server.Takes(map[string]any{"holds/standing": []any{}})); len(got) != 0 {
		t.Fatalf("a hold standing at the start shows %v", got)
	}
}
