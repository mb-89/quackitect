package main

import (
	"strings"
	"testing"
)

// THE BAR IS DRIVEN BOTH WAYS. A door that refused every write would pass a
// planted case for the wrong reason, so everything planted here has a clean case
// beside it that differs only in the thing the rule is about. The pair that
// matters most is the one about slashes: four numbers printed side by side is
// the bar doing its job, and the same four with a minus between them is the
// defect.
//
// A BACKTICK CANNOT BE WRITTEN INSIDE A RAW GO STRING, so a fixture writes a
// tilde where the TypeScript wants one and this puts it back last, once the
// pieces are in. The bar draws from inside a template literal, so a fixture
// without one would not be the shape under test.

const aBurnDownEditorShape = `export interface Burndown {
  day: string;
  minted: number;
  done: number;
  open: number;
  rate: number;
  window: string;
  says: string;
  detail: string;
}

export function editorHtml(burndown?: Burndown): string {
  return ~<div class="bar">${burnDown(burndown)}</div>~;
}

function burnDown(SIGNATURE): string {
BODY
}
`

func aBurnDownEditor(sig, drawn string) string {
	text := strings.Replace(aBurnDownEditorShape, "SIGNATURE", sig, 1)
	text = strings.Replace(text, "BODY", drawn, 1)
	return strings.ReplaceAll(text, "~", "`")
}

func TestABurnDownBarThatFormsANumberIsRefused(t *testing.T) {
	for _, c := range []struct {
		said string
		sig  string
		body string
		name string
		door string
	}{
		{"a number made out of two others",
			"b?: Burndown",
			`  return ~<span class="bd">${b.minted - b.done}</span>~;`,
			"b.minted", "src/engine/burndown.go"},
		{"a loose comparison, which the check this replaces could not see",
			"b?: Burndown",
			`  return ~<span class="bd">${b.open == b.done ? "up" : "down"}</span>~;`,
			"b.open", "src/engine/burndown.go"},
		{"a number rounded on the way to the page",
			"b?: Burndown",
			`  return ~<span class="bd">${Math.round(b.rate)}</span>~;`,
			"b.rate", "src/engine/burndown.go"},
		{"a number taken off the answer by name and then added to",
			"{minted, done}: Burndown",
			`  return ~<span class="bd">${minted + done}</span>~;`,
			"minted", "src/engine/burndown.go"},
		{"a bar drawing nothing, which says what it was handed only in a comment",
			"b?: Burndown",
			"  // says what it was handed, and b.says is drawn by the caller now.\n" +
				`  return ~<span class="bd"></span>~;`,
			"never reads it", "comments are blanked"},
	} {
		err := theBurnDownBarDrawsWhatItWasHanded(Roots{}, false,
			"src/extension/editor.ts", aBurnDownEditor(c.sig, c.body))
		if err == nil {
			t.Fatalf("%s went in", c.said)
		}
		if !strings.Contains(err.Error(), c.name) {
			t.Fatalf("%s: the refusal never names %q: %v", c.said, c.name, err)
		}
		if !strings.Contains(err.Error(), c.door) {
			t.Fatalf("%s: the refusal offers no way through, it never says %q: %v", c.said, c.door, err)
		}
		if !strings.Contains(err.Error(), "src/extension/editor.ts") {
			t.Fatalf("%s: the refusal never names the file: %v", c.said, err)
		}
	}
}

func TestABurnDownBarDrawingWhatItWasHandedGoesIn(t *testing.T) {
	for _, c := range []struct {
		said string
		sig  string
		body string
	}{
		{"the sentence the engine built, with the detail on hover",
			"b?: Burndown",
			`  return ~<span class="bd" title="${esc(b?.detail ?? "")}">${esc(b?.says ?? "")}</span>~;`},
		{"the four numbers printed side by side, separated by slashes",
			"b?: Burndown",
			`  return ~<span class="bd">${b.minted}/${b.done}/${b.open}/${b.rate}</span>~;`},
		{"numbers taken off the answer by name and printed as they arrived",
			"{minted, done}: Burndown",
			`  return ~<span class="bd">${minted}/${done}</span>~;`},
		{"a number read into a name before it is drawn",
			"b?: Burndown",
			"  const n = b?.minted;\n" + `  return ~<span class="bd">${n}</span>~;`},
	} {
		if err := theBurnDownBarDrawsWhatItWasHanded(Roots{}, false,
			"src/extension/editor.ts", aBurnDownEditor(c.sig, c.body)); err != nil {
			t.Fatalf("%s was refused: %v", c.said, err)
		}
	}
}

// THE RULE FOLLOWS THE TYPE AND NOT THE KEYWORD. A bar written as an arrow is
// the same bar, and the check this replaces went looking for the word function.
func TestABurnDownDrawnByAnArrowIsJudgedToo(t *testing.T) {
	shape := strings.ReplaceAll(`export interface Burndown {
  minted: number;
  done: number;
  says: string;
}

const burnDown = (b?: Burndown): string => ~<span class="bd">DRAWN</span>~;
`, "~", "`")
	clean := strings.Replace(shape, "DRAWN", `${esc(b?.says ?? "")}`, 1)
	if err := theBurnDownBarDrawsWhatItWasHanded(Roots{}, false,
		"src/extension/editor.ts", clean); err != nil {
		t.Fatalf("an arrow drawing the sentence the engine built was refused: %v", err)
	}
	planted := strings.Replace(shape, "DRAWN", "${b.minted - b.done}", 1)
	err := theBurnDownBarDrawsWhatItWasHanded(Roots{}, false, "src/extension/editor.ts", planted)
	if err == nil {
		t.Fatal("an arrow forming a number out of two others went in")
	}
	if !strings.Contains(err.Error(), "b.minted") {
		t.Fatalf("the refusal never names the number being made: %v", err)
	}
}

func TestABurnDownAnswerThatDropsAFieldIsStillJudged(t *testing.T) {
	// THE SET OF NUMBERS IS WHATEVER THE FILE DECLARES. The engine dropped the
	// rate along with the review flow that measured it, and the check this
	// replaces demanded all four names by hand, so bringing the editor's type
	// back in line with the answer would have failed it.
	three := strings.ReplaceAll(`export interface Burndown {
  day: string;
  minted: number;
  done: number;
  open: number;
  says: string;
}

function burnDown(b?: Burndown): string {
  return ~<span class="bd">${b.minted}/${b.done}/${b.open}</span>~;
}
`, "~", "`")
	if err := theBurnDownBarDrawsWhatItWasHanded(Roots{}, false,
		"src/extension/editor.ts", three); err != nil {
		t.Fatalf("an answer declaring the numbers it actually carries was refused: %v", err)
	}
	broken := strings.Replace(three, "${b.minted}/", "${b.minted - b.done}/", 1)
	err := theBurnDownBarDrawsWhatItWasHanded(Roots{}, false, "src/extension/editor.ts", broken)
	if err == nil {
		t.Fatal("a number formed out of two of the three that are left went in")
	}
	if !strings.Contains(err.Error(), "b.minted") {
		t.Fatalf("the refusal never names the number being made: %v", err)
	}
}

func TestAFileCarryingNoBurnDownAnswerIsNotJudged(t *testing.T) {
	formed := aBurnDownEditor("b?: Burndown", `  return ~<span class="bd">${b.minted - b.done}</span>~;`)
	for _, c := range []struct {
		said string
		rel  string
		text string
	}{
		{"a drawing file that never sees the answer", "src/extension/panel.ts",
			strings.ReplaceAll("export function draw(n: number): string { return ~${n - 1}~; }\n", "~", "`")},
		{"the same offending text where the bar does not live", "doc/work/note.md", formed},
		{"a file naming the type and declaring none of it", "src/extension/kind.ts",
			"import { Burndown } from \"./editor\";\nexport let held: Burndown | undefined;\n"},
	} {
		if err := theBurnDownBarDrawsWhatItWasHanded(Roots{}, false, c.rel, c.text); err != nil {
			t.Fatalf("%s was refused: %v", c.said, err)
		}
	}
}
