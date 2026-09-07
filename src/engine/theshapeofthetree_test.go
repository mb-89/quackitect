package main

import (
	"os"
	"path/filepath"
	"strings"
	"testing"
)

// THE SIX RULES THAT WERE SWEEPS, DRIVEN AT THE DOOR THEY NOW LIVE ON.
//
// Each rule was a check that walked the tree. A green run said nobody had
// broken it yet, which is not the same as the rule being held, and none of them
// could show its own instrument working. So each one is driven here twice: once
// on a case planted to break it, which must be refused, and once on the same
// file written properly, which must go through.
//
// THE PAIR IS THE POINT. A planted case alone proves the door says no to
// something. The clean case beside it proves the door is not simply shut, which
// is the failure a scan cannot tell apart from success.
//
// AND THE REFUSAL IS NOT THE WHOLE ASSERTION. A door that refuses and writes
// anyway is worse than one that never refused, so every planted case also reads
// the disk and finds nothing there.

// theIdOfARealToken is built rather than written, because a literal one in this
// file is the very thing aTestWithoutATokenId refuses, and a test that has to
// weaken its rule to run is not testing it.
var theIdOfARealToken = "wk-" + "0f3c19a7b2"

// aPatternWithALoneEscape is assembled for the same reason: written out, the
// line would match the rule it is here to plant.
var aPatternWithALoneEscape = "const p = new RegExp(" + `"` + `\` + "d+" + `"` + ");\n"

func TestTheShapeOfTheTreeIsDecidedAtTheDoor(t *testing.T) {
	t.Parallel()

	for _, c := range []struct {
		rule    string
		file    string
		planted string
		clean   string
		says    string
		standing func(t *testing.T, r Roots)
	}{
		{
			rule:    "a script carries no carriage return",
			file:    "src/scripts/door.sh",
			planted: "#!/bin/sh\r\nset -e\r\n",
			clean:   "#!/bin/sh\nset -e\n",
			says:    "carriage return",
		},
		{
			rule:    "a pattern is not built from a lone escape",
			file:    "src/extension/find.mjs",
			planted: aPatternWithALoneEscape,
			clean:   "const p = new RegExp(" + `"` + `\\` + "d+" + `"` + ");\n",
			says:    "lone backslash",
		},
		{
			rule:    "a test names no token in the record",
			file:    "src/engine/thing_test.go",
			planted: "package main\n\n// written for " + theIdOfARealToken + "\n",
			clean:   "package main\n\n// a fixture id is wk-1111111111\n",
			says:    "in the record",
		},
		{
			rule:    "a name stands once",
			file:    "src/engine/twice_test.go",
			planted: "package main\n",
			clean:   "",
			says:    "stand twice",
			standing: func(t *testing.T, r Roots) {
				writeUnder(t, r, "src/engine/internal/hold/twice_test.go", "package hold\n")
			},
		},
		{
			rule:    "a name stands once, the other way about",
			file:    "src/engine/internal/hold/back_test.go",
			planted: "package hold\n",
			clean:   "",
			says:    "stand twice",
			standing: func(t *testing.T, r Roots) {
				writeUnder(t, r, "src/engine/back_test.go", "package main\n")
			},
		},
		{
			rule:    "a file that draws carries no loose glyph",
			file:    "src/extension/panel.ts",
			planted: "const tick = \"✓\";\n",
			clean:   "const tick = \"✓\"; // " + theGlyphIsData + "\n",
			says:    "this file draws",
		},
		{
			// THE VIEWER PRINTS TOO, and the rule is about drawing rather than
			// about the two files it was first written for.
			rule:    "a file that draws carries no loose glyph, written as a reference",
			file:    "src/viewer/page.go",
			planted: "package main\n\nvar tick = \"&#10003;\"\n",
			clean:   "package main\n\nvar tick = theIcon(\"done\")\n",
			says:    "this file draws",
		},
		{
			rule: "a note says each heading once",
			file: "spec/work/wk-2222222222.md",
			planted: aNoteSaying("## approach\n\nfirst\n\n## approach\n\nsecond\n"),
			// THE CLEAN CASE CARRIES THE SAME HEADING TWICE, once for real and
			// once inside a fence, because a note quoting a sample is the case
			// that turns this rule into a wall.
			clean: aNoteSaying("## approach\n\nfirst\n\n```md\n## approach\n```\n"),
			says:  "approach",
		},
		{
			rule:    "a tracked note links only what a clone carries",
			file:    "spec/work/wk-2222222222.md",
			planted: aNoteSaying("## approach\n\nsee [[wk-3333333333]]\n"),
			clean:   aNoteSaying("## approach\n\nsee [[wk-4444444444]]\n"),
			says:    "shut door",
			standing: func(t *testing.T, r Roots) {
				writeUnder(t, r, "spec/work/wk-4444444444.md", aNoteSaying("## approach\n\nhere\n"))
				writeUnder(t, r, ".se/work/wk-3333333333.md", aNoteSaying("## approach\n\nprivate\n"))
			},
		},
		{
			rule: "a parallel test swaps no seam",
			file: "src/engine/seam_test.go",
			planted: "package main\n\nfunc TestX(t *testing.T) {\n\tt.Parallel()\n\ttheClock = fake\n}\n",
			clean:   "package main\n\nfunc TestX(t *testing.T) {\n\tt.Parallel()\n\tlocal := fake\n\t_ = local\n}\n",
			says:    "theClock",
			standing: func(t *testing.T, r Roots) {
				writeUnder(t, r, "src/engine/clock.go", "package main\n\nvar theClock = real\n")
			},
		},
		{
			rule:    "the extension reaches for child_process once",
			file:    "src/extension/deep/probe.ts",
			planted: "import { execFile } from \"node:child_process\";\n\nexecFile(x, { windowsHide: true });\n",
			clean:   "import { runEngine } from \"../door\";\n",
			says:    "already does",
			standing: func(t *testing.T, r Roots) {
				writeUnder(t, r, "src/extension/door.ts",
					"import { spawn } from \"node:child_process\";\n\nspawn(e, a, { windowsHide: true });\n")
			},
		},
		{
			// THE DOOR HIDES THE WINDOW. Being the only place that reaches the
			// module is what makes one place enough to remember this.
			rule:    "the one door hides its window",
			file:    "src/extension/only.ts",
			planted: "import { spawn } from \"node:child_process\";\n\nspawn(e, a, {});\n",
			clean:   "import { spawn } from \"node:child_process\";\n\nspawn(e, a, { windowsHide: true });\n",
			says:    "windowsHide",
		},
	} {
		t.Run(c.rule, func(t *testing.T) {
			t.Parallel()

			// THE PLANTED CASE. It is refused, the refusal says which rule, and
			// the file it named is not on the disk.
			r := aTreeToWriteIn(t)
			if c.standing != nil {
				c.standing(t, r)
			}
			_, err := Apply(r, []Edit{{File: c.file, Op: "create", New: c.planted}}, false, "wk-1111111111", "a-test")
			if err == nil {
				t.Fatalf("%s: the planted case went through, so the rule is not held at this door", c.rule)
			}
			if !strings.Contains(err.Error(), c.says) {
				t.Fatalf("%s: refused, but the refusal does not say %q, so it is another rule answering: %v",
					c.rule, c.says, err)
			}
			if _, err := os.Stat(filepath.Join(r.Work, filepath.FromSlash(c.file))); err == nil {
				t.Fatalf("%s: refused and written anyway", c.rule)
			}

			// THE CLEAN CASE BESIDE IT. Written properly, the same file goes
			// through, which is what says the door is a rule and not a wall.
			file, body := c.file, c.clean
			if body == "" {
				file, body = theCleanPlaceFor(c.file), c.planted
			}
			q := aTreeToWriteIn(t)
			if c.standing != nil {
				c.standing(t, q)
			}
			if _, err := Apply(q, []Edit{{File: file, Op: "create", New: body}}, false, "wk-1111111111", "a-test"); err != nil {
				t.Fatalf("%s: the clean case was refused, so this is a wall and not a rule: %v", c.rule, err)
			}
			got, err := os.ReadFile(filepath.Join(q.Work, filepath.FromSlash(file)))
			if err != nil {
				t.Fatalf("%s: the clean case was taken and not written: %v", c.rule, err)
			}
			if string(got) != body {
				t.Fatalf("%s: the clean case was written changed", c.rule)
			}
		})
	}
}

// theCleanPlaceFor answers where the same bytes are allowed to live, for the
// rules that are about a place rather than about content.
func theCleanPlaceFor(file string) string {
	// A TWIN IS UNDONE BY A NAME AND NOT BY A FOLDER. Moving the second copy to
	// another package leaves both names standing, which is the whole defect.
	if strings.HasPrefix(file, "src/engine/internal/") {
		return strings.Replace(file, "back_test.go", "forward_test.go", 1)
	}
	return strings.Replace(file, "src/engine/", "src/engine/internal/thing/", 1)
}


// aNoteSaying is a token note with a body, so the record reads it as a token
// rather than as any other markdown file.
func aNoteSaying(body string) string {
	return "---\nkind: work-token\ntitle: a note\nstatus: open\nprocess: standard\n---\n\n" + body
}

// writeUnder puts a file in the tree behind the door, which is how a case says
// what was already standing when the write arrived.
func writeUnder(t *testing.T, r Roots, rel, body string) {
	t.Helper()
	at := filepath.Join(r.Work, filepath.FromSlash(rel))
	if err := os.MkdirAll(filepath.Dir(at), 0o755); err != nil {
		t.Fatal(err)
	}
	if err := os.WriteFile(at, []byte(body), 0o644); err != nil {
		t.Fatal(err)
	}
}

// AND THE INSTRUMENT IS SHOWN WORKING BEFORE IT IS BELIEVED.
//
// The table above would pass in full against a door that refused every create,
// so this drives an ordinary write of an ordinary file through the same call.
// It is the case that tells a shut door from a held rule.
func TestAnOrdinaryWriteIsNotRefused(t *testing.T) {
	t.Parallel()
	r := aTreeToWriteIn(t)
	if _, err := Apply(r, []Edit{{File: "src/engine/internal/thing/plain.go",
		Op: "create", New: "package thing\n"}}, false, "wk-1111111111", "a-test"); err != nil {
		t.Fatalf("an ordinary file was refused, so the table above proves nothing: %v", err)
	}
}
