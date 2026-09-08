package main

import (
	"fmt"
	"os"
	"path/filepath"
	"regexp"
	"strings"
	"testing"
)

// A COUNT THE PANEL DRAWS FOLLOWS THE ENGINE AND IS NOT WRITTEN IN ONCE.
//
// MEASURED. The queue depth was rendered into the page out of whatever answer
// the panel held at the moment it was built. A fresh panel holds nothing, so it
// read zero while the engine answered two hundred and fourteen, and it stayed
// at zero for as long as the panel was open.
//
// A NUMBER THAT IS WRONG AND STILL IS WORSE THAN ONE THAT IS MISSING. A person
// watching a bucket empty acts on what they read, and a stuck zero says the
// bucket is done. So a source nobody answers has to draw nothing at all, and
// zero stays a fact about an empty queue.
//
// THE CHECK THIS REPLACES BUNDLED THE PANEL WITH ESBUILD AND CALLED IT. That
// wanted a built engine to answer for the tree and a node module folder beside
// the extension, and it read the live tree, so it could only ever say whether
// the files on this disk happened to be right today. This reads the source of a
// panel instead, and plants both a panel that breaks the rule and one that
// keeps it.

// countFollowsPanel is where the panel is read from, under the work root.
const countFollowsPanel = "src/extension/panel.ts"

// countFollowsTheEngine asks the three things the panel got wrong. Whether the
// count is drawn into a node a later number can land in, whether it rides the
// beat message at all, and whether the number is read off the engine's answer
// rather than padded out of a zero or worked out from something else.
//
// It returns nil for a panel that draws no count, because there is nothing
// there to keep.
func countFollowsTheEngine(r Roots) error {
	raw, err := os.ReadFile(filepath.Join(r.Work, filepath.FromSlash(countFollowsPanel)))
	if err != nil {
		return fmt.Errorf("the panel could not be read, so no count in it can be judged: %v", err)
	}
	text := countFollowsWithoutComments(string(raw))
	if !strings.Contains(text, "\"count\"") {
		return nil
	}
	if !strings.Contains(text, "data-count=") {
		return fmt.Errorf("%s draws a count into no node of its own, so a number arriving on the "+
			"beat has nowhere to land and whatever was written into the page when it was built "+
			"stays there. The queue read zero while the engine answered two hundred and fourteen "+
			"exactly this way. Draw the span with data-count set to the source the count names, "+
			"the way the live tables carry data-table.", countFollowsPanel)
	}
	live, ok := countFollowsBody(text, "livePieces")
	if !ok {
		return fmt.Errorf("%s declares no livePieces function, so nothing carries a fresh number "+
			"to a panel that is already open and every count on it is written once. Send the "+
			"counts from livePieces beside the live tables.", countFollowsPanel)
	}
	if !strings.Contains(live, "counts[") || !countFollowsReturns(live) {
		return fmt.Errorf("%s builds no counts in livePieces, so a count is only ever in the html "+
			"and never in the message. That is the shape the queue was stuck at zero in for the "+
			"life of the page. Fill counts keyed by what the count counts, its source rather than "+
			"where it is drawn, and return it with the tables.", countFollowsPanel)
	}
	number, ok := countFollowsNumber(text, live)
	if !ok {
		return fmt.Errorf("%s fills counts in a shape this cannot read, so whether the number "+
			"follows the engine cannot be told at all. Assign the count from a named function of "+
			"the engine's answer, the way theCount does.", countFollowsPanel)
	}
	for _, padded := range []string{"?? 0", "|| 0", "?? \"0\"", "|| \"0\"", ": 0", ": \"0\""} {
		if strings.Contains(number, padded) {
			return fmt.Errorf("%s falls back to %s when the engine answered nothing, so a source "+
				"nobody answers draws a zero. Zero is a fact about an empty queue and a person "+
				"acts on it, so a missing answer must not look like one. Draw an empty string "+
				"when the answer is not a number.", countFollowsPanel, padded)
		}
	}
	if strings.Contains(number, ".length") {
		return fmt.Errorf("%s works the count out of the length of something else in the answer "+
			"rather than reading the number the engine sent. A number the panel forms is a "+
			"number nothing checks, and the panel sees only the rows it was handed rather than "+
			"the whole bucket. Read the field off the answer, and add it to what the engine "+
			"sends when nobody sends it yet.", countFollowsPanel)
	}
	return nil
}

// countFollowsAssign is one count being filled into the beat message.
var countFollowsAssign = regexp.MustCompile(`counts\[[^\]]*\]\s*=\s*([^\r\n]*)`)

// countFollowsCall is a right hand side that is a call, so the number is made
// somewhere else and that is where to look.
var countFollowsCall = regexp.MustCompile(`^([A-Za-z_$][A-Za-z0-9_$]*)\s*\(`)

// countFollowsNumber is the text that makes the number, which is either the
// body of the function the count is assigned from or the expression itself.
func countFollowsNumber(text, live string) (string, bool) {
	m := countFollowsAssign.FindStringSubmatch(live)
	if m == nil {
		return "", false
	}
	rhs := strings.TrimSpace(m[1])
	if c := countFollowsCall.FindStringSubmatch(rhs); c != nil {
		if body, ok := countFollowsBody(text, c[1]); ok {
			return body, true
		}
	}
	if rhs == "" {
		return "", false
	}
	return rhs, true
}

// countFollowsReturns says whether the beat message carries the counts out.
func countFollowsReturns(body string) bool {
	for at := 0; ; {
		i := strings.Index(body[at:], "return")
		if i < 0 {
			return false
		}
		at = i + at + len("return")
		end := at + 200
		if end > len(body) {
			end = len(body)
		}
		if strings.Contains(body[at:end], "counts") {
			return true
		}
	}
}

// countFollowsBody is what a declared function does.
//
// A RETURN TYPE IS WRITTEN IN BRACES TOO, and livePieces has one, so the first
// balanced group after the parameter list is the body only when a brace does
// not follow it. Braces are counted plainly, which is enough for the panels
// planted here.
func countFollowsBody(text, name string) (string, bool) {
	at := strings.Index(text, "function "+name)
	if at < 0 {
		return "", false
	}
	i := countFollowsAfterParams(text, at)
	if i < 0 {
		return "", false
	}
	for i < len(text) {
		for i < len(text) && text[i] != '{' {
			i++
		}
		group, end, ok := countFollowsBraced(text, i)
		if !ok {
			return "", false
		}
		j := end
		for j < len(text) && countFollowsSpace(text[j]) {
			j++
		}
		if j < len(text) && text[j] == '{' {
			i = j
			continue
		}
		return group, true
	}
	return "", false
}

// countFollowsAfterParams is the byte just past the parameter list.
func countFollowsAfterParams(text string, at int) int {
	open := strings.IndexByte(text[at:], '(')
	if open < 0 {
		return -1
	}
	depth := 0
	for i := open + at; i < len(text); i++ {
		switch text[i] {
		case '(':
			depth++
		case ')':
			depth--
			if depth == 0 {
				return i + 1
			}
		}
	}
	return -1
}

// countFollowsBraced takes the balanced group that opens at open, and says
// where it ended.
func countFollowsBraced(text string, open int) (string, int, bool) {
	if open >= len(text) || text[open] != '{' {
		return "", 0, false
	}
	depth := 0
	for i := open; i < len(text); i++ {
		switch text[i] {
		case '{':
			depth++
		case '}':
			depth--
			if depth == 0 {
				return text[open : i+1], i + 1, true
			}
		}
	}
	return "", 0, false
}

func countFollowsSpace(c byte) bool {
	return c == ' ' || c == '\t' || c == '\r' || c == '\n'
}

// countFollowsWithoutComments blanks the comments before anything is looked
// for. A rule about what the panel draws must not be met by a sentence about
// drawing it, and a comment naming data-count is not a node a number lands in.
func countFollowsWithoutComments(src string) string {
	out := []byte(src)
	for i := 0; i < len(out); {
		if out[i] == '/' && i+1 < len(out) && out[i+1] == '/' {
			for i < len(out) && out[i] != '\n' {
				out[i] = ' '
				i++
			}
			continue
		}
		if out[i] == '/' && i+1 < len(out) && out[i+1] == '*' {
			for i < len(out) {
				closing := out[i] == '*' && i+1 < len(out) && out[i+1] == '/'
				if out[i] != '\n' {
					out[i] = ' '
				}
				i++
				if closing {
					if i < len(out) {
						out[i] = ' '
						i++
					}
					break
				}
			}
			continue
		}
		i++
	}
	return string(out)
}

// THE PIECES A PLANTED PANEL IS BUILT FROM. Each case swaps exactly one of the
// three, so what is being judged is the one difference and nothing else.

const countFollowsDraws = `
export function panelPiece(n: Node, doing: Happening): string {
  if (n.type === "count") {
    return "<span class='count' data-count='" + esc(n.source ?? n.name) + "'>" +
      esc(theCount(n, doing)) + "</span>"
  }
  return ""
}
`

const countFollowsDrawsNoNode = `
export function panelPiece(n: Node, doing: Happening): string {
  if (n.type === "count") {
    return "<span class='count'>" + esc(theCount(n, doing)) + "</span>"
  }
  return ""
}
`

const countFollowsSends = `
export function livePieces(root: Node, shown: string[], doing: Happening):
    { tables: Record<string, string>; counts: Record<string, string> } {
  const tables: Record<string, string> = {}
  const counts: Record<string, string> = {}
  for (const k of everyCount(root, shown)) {
    counts[k.source ?? k.name] = theCount(k, doing)
  }
  return { tables, counts }
}
`

const countFollowsSendsNoCount = `
export function livePieces(root: Node, shown: string[], doing: Happening):
    { tables: Record<string, string> } {
  const tables: Record<string, string> = {}
  return { tables }
}
`

const countFollowsNumberFromEngine = `
function theCount(n: Node, doing: Happening): string {
  const got = n.source === "queue" ? doing.queue : undefined
  return typeof got === "number" ? String(got).padStart(3, "0") : ""
}
`

const countFollowsNumberPaddedZero = `
function theCount(n: Node, doing: Happening): string {
  const got = n.source === "queue" ? doing.queue ?? 0 : 0
  return String(got).padStart(3, "0")
}
`

const countFollowsNumberDerived = `
function theCount(n: Node, doing: Happening): string {
  const got = doing.present.length
  return String(got).padStart(3, "0")
}
`

const countFollowsNoCountAtAll = `
export function panelPiece(n: Node, doing: Happening): string {
  return "<span class='plain'>" + esc(n.name) + "</span>"
}
`

// TestACountFollowsTheEngine drives a panel that keeps the rule and four that
// break it, one broken thing each. A door that refused every panel would pass
// the planted cases for the wrong reason, so the clean panel is the case that
// matters most here.
func TestACountFollowsTheEngine(t *testing.T) {
	t.Parallel()
	cases := []struct {
		said    string
		panel   string
		refused bool
	}{
		{
			said:  "drawn into a node, sent on the beat, read off the answer",
			panel: countFollowsDraws + countFollowsSends + countFollowsNumberFromEngine,
		},
		{
			said:    "drawn with no node for a later number to land in",
			panel:   countFollowsDrawsNoNode + countFollowsSends + countFollowsNumberFromEngine,
			refused: true,
		},
		{
			said:    "in the html and never in the beat message",
			panel:   countFollowsDraws + countFollowsSendsNoCount + countFollowsNumberFromEngine,
			refused: true,
		},
		{
			said:    "padding a zero when the engine answered nothing",
			panel:   countFollowsDraws + countFollowsSends + countFollowsNumberPaddedZero,
			refused: true,
		},
		{
			said:    "worked out from another piece of the answer",
			panel:   countFollowsDraws + countFollowsSends + countFollowsNumberDerived,
			refused: true,
		},
		{
			said:  "a panel that draws no count at all",
			panel: countFollowsNoCountAtAll,
		},
	}
	for _, c := range cases {
		c := c
		t.Run(c.said, func(t *testing.T) {
			t.Parallel()
			dir := t.TempDir()
			countFollowsPlant(t, dir, c.panel)
			err := countFollowsTheEngine(Roots{Work: dir, Method: dir})
			if c.refused && err == nil {
				t.Fatal("the panel was let through, and a number that is wrong and still is what " +
					"a person acts on")
			}
			if !c.refused && err != nil {
				t.Fatalf("a panel that keeps the rule was refused: %v", err)
			}
		})
	}
}

// TestACountFollowsTheEngineReadsNoLiveTree makes the point that this plants
// what it judges. A work root with no panel in it is a plain refusal rather
// than a reach into the tree this repository happens to hold.
func TestACountFollowsTheEngineReadsNoLiveTree(t *testing.T) {
	t.Parallel()
	if err := countFollowsTheEngine(Roots{Work: t.TempDir(), Method: t.TempDir()}); err == nil {
		t.Fatal("an empty work root was read as a panel that keeps the rule")
	}
}

// countFollowsPlant writes one panel into a temporary work root.
func countFollowsPlant(t *testing.T, dir, panel string) {
	t.Helper()
	at := filepath.Join(dir, filepath.FromSlash(countFollowsPanel))
	if err := os.MkdirAll(filepath.Dir(at), 0o755); err != nil {
		t.Fatalf("the planted extension folder was not made: %v", err)
	}
	if err := os.WriteFile(at, []byte(panel), 0o644); err != nil {
		t.Fatalf("the planted panel was not written: %v", err)
	}
}
