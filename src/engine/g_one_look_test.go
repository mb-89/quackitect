package main

import (
	"strings"
	"testing"
)

// THE DOOR IS DRIVEN OVER SHEETS THIS TEST PLANTS, and never over the pages the
// repository happens to hold. A rule read off the live tree is green because
// nobody has broken it yet, which is evidence about the tree and no evidence at
// all about the rule.
//
// EVERY PLANTED CASE HAS A CLEAN ONE BESIDE IT. A door that refused every sheet
// would pass a planted case for the wrong reason, so the pairs here differ only
// in the thing the rule is about: the same declaration with the colour inside a
// var fallback rather than said out loud, and the same variable with a fallback
// rather than without one.

func aControlSheet(rules string) string {
	return strings.ReplaceAll("export function controlCss(): string {\n  return ~\n"+
		rules+"\n~;\n}\n", "~", "`")
}

func TestADrawingFileSayingAColourOutLoudIsRefused(t *testing.T) {
	dir := t.TempDir()
	roots := Roots{Work: dir, Method: dir}
	for _, one := range []struct {
		why  string
		rel  string
		text string
		says []string
	}{
		{
			why:  "the shared sheet paints a button with a hex of its own",
			rel:  "src/extension/controls.ts",
			text: aControlSheet("  button { background: #ffffff; color: var(--vscode-foreground, inherit); }"),
			says: []string{"#ffffff", "background", "var("},
		},
		{
			why:  "the sidebar names a colour by its word",
			rel:  "src/extension/panel.ts",
			text: "const css = `\n  .gear { color: white; }\n`;\n",
			says: []string{"white", "color", "theme"},
		},
		{
			why:  "the editor mixes its own border colour",
			rel:  "src/extension/editor.ts",
			text: "const css = `\n  .bs-sift { border-color: rgba(0, 0, 0, 0.35); }\n`;\n",
			says: []string{"rgba(", "border-color"},
		},
		{
			why:  "the shared sheet takes a colour from a variable with no fallback",
			rel:  "src/extension/controls.ts",
			text: aControlSheet("  input { background: var(--vscode-input-background); }"),
			says: []string{"--vscode-input-background", "invalid at computed value time", "transparent"},
		},
		{
			why: "the words that excuse a colour sit in a CSS string rather than in a comment, " +
				"which is the hole the check this replaces left open",
			rel:  "src/extension/panel.ts",
			text: "const css = `\n  .pill::after { content: \"not a theme colour\"; background: red; }\n`;\n",
			says: []string{"red", "background"},
		},
		{
			why:  "a nested var call is closed properly and the literal sits outside it",
			rel:  "src/extension/editor.ts",
			text: "const css = `\n  tr { color: var(--a, var(--b, inherit)) #c0ffee; }\n`;\n",
			says: []string{"#c0ffee"},
		},
	} {
		err := aDrawingFileSaysNoColourOutLoud(roots, false, one.rel, one.text)
		if err == nil {
			t.Fatalf("the door passed a page where %s", one.why)
		}
		if !strings.Contains(err.Error(), one.rel) {
			t.Fatalf("the refusal for the case where %s never names the file: %s", one.why, err)
		}
		for _, word := range one.says {
			if !strings.Contains(err.Error(), word) {
				t.Fatalf("the refusal for the case where %s does not say %q: %s", one.why, word, err)
			}
		}
	}
}

func TestADrawingFileTakingItsColourFromTheThemeGoesIn(t *testing.T) {
	dir := t.TempDir()
	roots := Roots{Work: dir, Method: dir}
	for _, one := range []struct{ why, rel, text string }{
		{
			why: "every colour in the shared sheet is a variable that falls back",
			rel: "src/extension/controls.ts",
			text: aControlSheet("  button { background: var(--vscode-button-background, " +
				"var(--vscode-editor-background, transparent));\n" +
				"           color: var(--vscode-button-foreground, inherit); }"),
		},
		{
			why:  "the same hex sits inside the fallback, which is the shape the rule asks for",
			rel:  "src/extension/editor.ts",
			text: "const css = `\n  .bs-sift.bad { border-color: var(--vscode-errorBorder, #f48771); }\n`;\n",
		},
		{
			why:  "a page takes its own furniture from a bare variable, which the pages do everywhere",
			rel:  "src/extension/panel.ts",
			text: "const css = `\n  .row { color: var(--vscode-descriptionForeground); }\n`;\n",
		},
		{
			why:  "a shadow is a black at low opacity and reads the same in every theme",
			rel:  "src/extension/panel.ts",
			text: "const css = `\n  .led { box-shadow: 0 0 0 1px rgba(0, 0, 0, 0.35) inset; }\n`;\n",
		},
		{
			why: "a shorthand carries a width and a style beside its variable, so it is not a " +
				"bare colour the fallback rule can rewrite",
			rel:  "src/extension/controls.ts",
			text: aControlSheet("  button:disabled { border: 1px dashed var(--vscode-panel-border); }"),
		},
		{
			why:  "the colour really is the same in every theme and the line says so in a comment",
			rel:  "src/extension/panel.ts",
			text: "const css = `\n  .rec { background: red; /* not a theme colour, a recording dot is red everywhere */ }\n`;\n",
		},
		{
			why:  "a comment naming the defect names the colour the defect drew",
			rel:  "src/extension/controls.ts",
			text: "// the fallback is what keeps this from drawing a white box on a dark page\n" +
				aControlSheet("  input { background: var(--vscode-input-background, transparent); }"),
		},
		{
			why:  "the value taken from the host stands for something the host decides",
			rel:  "src/extension/controls.ts",
			text: aControlSheet("  input { background: transparent; color: currentColor; border: 0; }"),
		},
		{
			why:  "a property whose name merely ends in one of the words is not that word",
			rel:  "src/extension/editor.ts",
			text: "const css = `\n  td { border-radius: 2px; white-space: nowrap; align-items: center; }\n`;\n",
		},
		{
			why:  "the file draws nothing and holds no stylesheet at all",
			rel:  "src/extension/keys.ts",
			text: "export const keys = [\"red\", \"white\"];\n",
		},
		{
			why:  "the same offending text sits where no page is drawn",
			rel:  "doc/work/a-note.md",
			text: "  .gear { color: white; background: #fff; }\n",
		},
	} {
		if err := aDrawingFileSaysNoColourOutLoud(roots, false, one.rel, one.text); err != nil {
			t.Fatalf("the door refused a page where %s: %s", one.why, err)
		}
	}
}

// A LINE THAT ENDS INSIDE A VAR CALL IS NOT JUDGED ON WHAT IT CANNOT SEE. The
// fallback is on the next line, and reading the half in front of the break as
// the whole value would refuse a wrapped declaration for a reason that is not
// there.
func TestAVarCallWrappedOverTwoLinesIsLeftAlone(t *testing.T) {
	wrapped := aControlSheet("  input { background: var(--vscode-input-background,\n" +
		"                                     transparent); }")
	if err := aDrawingFileSaysNoColourOutLoud(Roots{}, false, "src/extension/controls.ts", wrapped); err != nil {
		t.Fatalf("a declaration wrapped over two lines was refused: %s", err)
	}
}

// THE DOOR READS A FILE THE WORK ROOT HAS NOT SEEN YET THE SAME WAY. A new page
// is written whole, so there is nothing on disk to compare against and the rule
// holds on the text alone.
func TestANewDrawingFileIsJudgedOnItsTextAlone(t *testing.T) {
	planted := aControlSheet("  select { background: #123456; }")
	if err := aDrawingFileSaysNoColourOutLoud(Roots{}, true, "src/extension/controls.ts", planted); err == nil {
		t.Fatal("a new sheet painting a select with a hex of its own went in")
	}
	clean := aControlSheet("  select { background: var(--vscode-input-background, transparent); }")
	if err := aDrawingFileSaysNoColourOutLoud(Roots{}, true, "src/extension/controls.ts", clean); err != nil {
		t.Fatalf("a new sheet taking its colour from the theme was refused: %s", err)
	}
}
