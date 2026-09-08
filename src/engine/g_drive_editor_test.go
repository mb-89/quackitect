package main

import (
	"fmt"
	"os"
	"path/filepath"
	"regexp"
	"strings"
	"testing"
)

// A PRESS REACHES WHAT IT WAS AIMED AT AND NOTHING ELSE.
//
// Rendering says what is drawn and says nothing at all about what happens when
// somebody presses a button, so every editor defect the owner reported was
// invisible to the check that reads markup. Three of them were one defect
// wearing three coats: a press reaching past the control it was made on.
//
// THE DOOR. The title text opens a note and it sits inside a row that ticks on
// a press. With the press left to bubble, opening a note also ticked the row
// behind it, and both markup assertions stayed green while that shipped.
//
// THE INSTANCE. The two panes are two instances of one editor. What counted
// the ticked rows read tr.ticked out of the whole document, so a row ticked on
// the left lit the right pane's Group button, and pressing that button filed
// the left pane's row.
//
// THE BUCKET. The toolbar button and every group in the filter builder
// answered to the same class, and a filter group is an ancestor of everything
// inside it, so every press inside the Filter popover filed the ticked rows
// into a bucket the person never asked for.
//
// THE CHECK THIS REPLACES BUNDLED THE PAGE WITH ESBUILD AND DROVE IT IN A DOM.
// That wanted a built engine, a node module folder beside the extension, and
// the live tree, so it could only ever say whether this disk happened to be
// right today. This reads the source of an editor instead, and plants both an
// editor that keeps the rule and one that breaks each part of it.
//
// WHAT IS DELIBERATELY NOT CARRIED OVER. The old file also matched the
// stylesheet with text regexes, which was a second copy of rules that live in
// the one-look check. A rule with two homes goes stale in one of them, so those
// stay where they are written.

// driveEditorFile is where the editor is read from, under the work root.
const driveEditorFile = "src/extension/editor.ts"

// editorPressesReachOnlyWhatTheyOwn asks the three things the handlers got
// wrong. Whether the door stops the press it answered, whether the ticked rows
// are counted off the instance rather than off the page, and whether the
// message that files rows into a bucket is sent from the one control that owns
// it.
//
// An editor that wires no handler at all keeps the rule, because there is no
// press in it to reach anywhere.
func editorPressesReachOnlyWhatTheyOwn(r Roots) error {
	raw, err := os.ReadFile(filepath.Join(r.Work, filepath.FromSlash(driveEditorFile)))
	if err != nil {
		return fmt.Errorf("the editor could not be read, so no press in it can be judged: %v", err)
	}
	text := driveEditorWithoutComments(string(raw))

	if at, sends := driveEditorAt(driveEditorOpenSend, text); sends {
		if !strings.Contains(driveEditorBranchAt(text, at), "stopPropagation") {
			return fmt.Errorf("%s hands the press that opens a note straight back to the page. The "+
				"title is a door inside a row and a row ticks on a press, so a press nothing stops "+
				"opens the note and ticks the row underneath it in the same gesture. That shipped "+
				"with every markup assertion green, because markup cannot see a press. Stop the "+
				"press in the branch that sends open, before the message goes.", driveEditorFile)
		}
	}

	if from, reads := driveEditorReadsTickedFrom(text); reads {
		return fmt.Errorf("%s counts the ticked rows off %s rather than off the instance it was "+
			"wired for. The two panes are two instances of one editor, so a reader that takes the "+
			"whole page lets a row ticked on the left light the right pane's Group button, and "+
			"pressing that button files the left pane's row. Query the ticked rows from the root "+
			"the instance was handed, so an editor owns its own state.", driveEditorFile, from)
	}

	if at, sends := driveEditorAt(driveEditorGroupSend, text); sends {
		if !strings.Contains(driveEditorBranchAt(text, at), driveEditorTheOneControl) {
			return fmt.Errorf("%s files the ticked rows into a bucket from a branch that never "+
				"names the toolbar button. The button and every group in the filter builder once "+
				"answered to one class, and a filter group is an ancestor of everything inside it, "+
				"so every press in the Filter popover filed the ticked rows into a bucket nobody "+
				"asked for. Enter that branch on %s, which the toolbar button alone carries.",
				driveEditorFile, driveEditorTheOneControl)
		}
	}
	return nil
}

// driveEditorTheOneControl is the class the button that makes a bucket carries
// and nothing else does.
const driveEditorTheOneControl = "bs-make-bucket"

// A MESSAGE IS SENT BY NAME. The page talks to the extension through one call
// carrying an object that says what kind of message it is, so a send is found
// by the call rather than by the word, and the position answered is the call
// and not the brace after it.
var driveEditorOpenSend = regexp.MustCompile(`[A-Za-z_$][A-Za-z0-9_$.]*\(\s*\{[^{}]*type:\s*["']open["']`)

var driveEditorGroupSend = regexp.MustCompile(`[A-Za-z_$][A-Za-z0-9_$.]*\(\s*\{[^{}]*type:\s*["']group["']`)

// driveEditorTickedRead is a query for the ticked rows, with whatever it was
// asked of held so a refusal can name it.
var driveEditorTickedRead = regexp.MustCompile("([A-Za-z_$][A-Za-z0-9_$.]*)\\s*\\.querySelectorAll?\\(\\s*[\"'`][^\"'`]*\\.ticked")

// driveEditorAt says where a message of one kind is sent, if it is sent.
func driveEditorAt(send *regexp.Regexp, text string) (int, bool) {
	where := send.FindStringIndex(text)
	if where == nil {
		return 0, false
	}
	return where[0], true
}

// driveEditorReadsTickedFrom answers the first reader of the ticked rows that
// takes them off the document rather than off an instance.
func driveEditorReadsTickedFrom(text string) (string, bool) {
	for _, m := range driveEditorTickedRead.FindAllStringSubmatch(text, -1) {
		asked := m[1]
		if asked[strings.LastIndex(asked, ".")+1:] == "document" {
			return asked, true
		}
	}
	return "", false
}

// driveEditorLeadIn is how much of what came before a block is read with it.
const driveEditorLeadIn = 160

// driveEditorBranchAt is the branch a press is answered in: the innermost run
// of braces holding the position, together with the line or so ahead of it,
// because the test that entered a branch is written outside its braces.
//
// BRACES ARE COUNTED PLAINLY. A brace inside a string would be miscounted, and
// neither the editor nor the cases planted below writes one.
func driveEditorBranchAt(text string, at int) string {
	var open []int
	for i := 0; i < at && i < len(text); i++ {
		switch text[i] {
		case '{':
			open = append(open, i)
		case '}':
			if len(open) > 0 {
				open = open[:len(open)-1]
			}
		}
	}
	if len(open) == 0 {
		return text
	}
	start := open[len(open)-1]
	end := len(text)
	depth := 0
	for i := start; i < len(text); i++ {
		switch text[i] {
		case '{':
			depth++
		case '}':
			depth--
			if depth == 0 {
				end = i + 1
			}
		}
		if depth == 0 {
			break
		}
	}
	from := start - driveEditorLeadIn
	if from < 0 {
		from = 0
	}
	return text[from:end]
}

// driveEditorWithoutComments blanks every comment before anything is looked
// for. A rule about what a handler does must not be met by a sentence about
// doing it, and the file this replaces was written mostly in sentences.
func driveEditorWithoutComments(src string) string {
	out := []byte(src)
	for i := 0; i+1 < len(out); {
		if out[i] == '/' && out[i+1] == '/' {
			for i < len(out) && out[i] != '\n' {
				out[i] = ' '
				i++
			}
			continue
		}
		if out[i] == '/' && out[i+1] == '*' {
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

// THE PIECES A PLANTED EDITOR IS BUILT FROM. Each case swaps exactly one of
// them, so what is judged is the one difference and nothing beside it.

const driveEditorWireClean = `
export function wireEditor(root: HTMLElement, post: (m: unknown) => void) {
  root.addEventListener("click", (e) => {
    const el = e.target as HTMLElement
    const door = el.closest(".door")
    if (door) {
      e.stopPropagation()
      post({ type: "open", id: rowOf(door) })
      return
    }
    if (el.closest(".bs-make-bucket")) {
      post({ type: "group", ids: ticked(root) })
      return
    }
    const row = el.closest("tr[data-id]")
    if (row) row.classList.toggle("ticked")
  })
}
`

const driveEditorWireDoorLetsItThrough = `
export function wireEditor(root: HTMLElement, post: (m: unknown) => void) {
  root.addEventListener("click", (e) => {
    const el = e.target as HTMLElement
    const door = el.closest(".door")
    if (door) {
      post({ type: "open", id: rowOf(door) })
      return
    }
    if (el.closest(".bs-make-bucket")) {
      post({ type: "group", ids: ticked(root) })
      return
    }
    const row = el.closest("tr[data-id]")
    if (row) row.classList.toggle("ticked")
  })
}
`

const driveEditorWireSharedClass = `
export function wireEditor(root: HTMLElement, post: (m: unknown) => void) {
  root.addEventListener("click", (e) => {
    const el = e.target as HTMLElement
    const door = el.closest(".door")
    if (door) {
      e.stopPropagation()
      post({ type: "open", id: rowOf(door) })
      return
    }
    if (el.closest(".group")) {
      post({ type: "group", ids: ticked(root) })
      return
    }
    const row = el.closest("tr[data-id]")
    if (row) row.classList.toggle("ticked")
  })
}
`

const driveEditorTickedFromItsOwn = `
function ticked(root: HTMLElement): string[] {
  return [...root.querySelectorAll("tr.ticked")].map((r) => idOf(r))
}
`

const driveEditorTickedFromThePage = `
function ticked(root: HTMLElement): string[] {
  return [...document.querySelectorAll("tr.ticked")].map((r) => idOf(r))
}
`

const driveEditorPressesNothing = `
export function editorHtml(panes: Pane[], views: string[], view: string): string {
  return "<div class='pane-wrap'>" + panes.map((p) => table(p)).join("") + "</div>"
}
`

// TestEditorPressesReachOnlyWhatTheyOwn drives two editors that keep the rule
// and three that break one part of it each. A reader that refused every editor
// would pass the planted cases for the wrong reason, so the clean editor is the
// case that carries the most weight here.
func TestEditorPressesReachOnlyWhatTheyOwn(t *testing.T) {
	t.Parallel()
	cases := []struct {
		said    string
		editor  string
		refused bool
	}{
		{
			said:   "the door stops the press and the instance reads its own rows",
			editor: driveEditorWireClean + driveEditorTickedFromItsOwn,
		},
		{
			said:    "the door hands the press back and opening a note ticks the row",
			editor:  driveEditorWireDoorLetsItThrough + driveEditorTickedFromItsOwn,
			refused: true,
		},
		{
			said:    "the ticked rows are counted off the whole page",
			editor:  driveEditorWireClean + driveEditorTickedFromThePage,
			refused: true,
		},
		{
			said:    "a bucket is made from a class the filter builder shares",
			editor:  driveEditorWireSharedClass + driveEditorTickedFromItsOwn,
			refused: true,
		},
		{
			said:   "an editor that wires no press at all",
			editor: driveEditorPressesNothing,
		},
	}
	for _, c := range cases {
		c := c
		t.Run(c.said, func(t *testing.T) {
			t.Parallel()
			dir := t.TempDir()
			driveEditorPlant(t, dir, c.editor)
			err := editorPressesReachOnlyWhatTheyOwn(Roots{Work: dir, Method: dir})
			if c.refused && err == nil {
				t.Fatal("the editor was let through, and a press in it reaches a control the " +
					"person never touched")
			}
			if !c.refused && err != nil {
				t.Fatalf("an editor that keeps the rule was refused: %v", err)
			}
		})
	}
}

// TestEditorPressesReachOnlyWhatTheyOwnSaysWhichPressWentWrong holds the
// refusals to naming the defect. A sentence that only says no leaves the reader
// to work out which of the three handlers it meant.
func TestEditorPressesReachOnlyWhatTheyOwnSaysWhichPressWentWrong(t *testing.T) {
	t.Parallel()
	cases := []struct {
		editor string
		names  string
	}{
		{editor: driveEditorWireDoorLetsItThrough + driveEditorTickedFromItsOwn, names: "Stop the press"},
		{editor: driveEditorWireClean + driveEditorTickedFromThePage, names: "document"},
		{editor: driveEditorWireSharedClass + driveEditorTickedFromItsOwn, names: driveEditorTheOneControl},
	}
	for _, c := range cases {
		c := c
		t.Run(c.names, func(t *testing.T) {
			t.Parallel()
			dir := t.TempDir()
			driveEditorPlant(t, dir, c.editor)
			err := editorPressesReachOnlyWhatTheyOwn(Roots{Work: dir, Method: dir})
			if err == nil {
				t.Fatal("the planted editor was let through")
			}
			if !strings.Contains(err.Error(), c.names) {
				t.Errorf("the refusal does not name %s. said: %v", c.names, err)
			}
		})
	}
}

// TestEditorPressesReachOnlyWhatTheyOwnReadsNoLiveTree makes the point that
// this plants what it judges. A work root with no editor in it is a plain
// refusal rather than a reach into whatever this repository holds today.
func TestEditorPressesReachOnlyWhatTheyOwnReadsNoLiveTree(t *testing.T) {
	t.Parallel()
	if err := editorPressesReachOnlyWhatTheyOwn(Roots{Work: t.TempDir(), Method: t.TempDir()}); err == nil {
		t.Fatal("an empty work root was read as an editor that keeps the rule")
	}
}

// driveEditorPlant writes one editor into a temporary work root.
func driveEditorPlant(t *testing.T, dir, editor string) {
	t.Helper()
	at := filepath.Join(dir, filepath.FromSlash(driveEditorFile))
	if err := os.MkdirAll(filepath.Dir(at), 0o755); err != nil {
		t.Fatalf("the planted extension folder was not made: %v", err)
	}
	if err := os.WriteFile(at, []byte(editor), 0o644); err != nil {
		t.Fatalf("the planted editor was not written: %v", err)
	}
}
