// The tools read the way the lint reads them: Vale's rows and its fault, Biome's
// rows, the tense reader's veto, and the rules ported beside them. A last case
// runs the real binaries where the box holds them.
// [[spec/design_output/lsp#the-server-runs-the-tools]]
package main

import (
	"os"
	"path/filepath"
	"strings"
	"testing"
)

// An exemption marker, built in two halves so this file carries none of its own. [[spec/design_output/level0#where-a-rule-lives]]
const markerOpens = "<!-- " + "vale VoiceVale.Tense = "

// [[spec/design_output/lsp#the-server-runs-the-tools]]
func TestValeRowsReadAsTheLintReadsThem(t *testing.T) {
	stdout := `{"spec\\one.md":[{"Check":"VoiceParagraph.Sentence","Line":3,"Span":[7,9],"Match":"so","Message":"Cut it.","Severity":"warning"},{"Check":"VoiceShape.GuidanceCap","Line":1,"Span":[1,2],"Match":"","Message":"Cap.","Severity":""}]}`
	rows, fault := valeRowsOf("/tree", stdout)
	if fault != "" || len(rows) != 2 {
		t.Fatalf("Vale's answer reads as %v, fault %q", rows, fault)
	}
	first, second := rows[0].Finding, rows[1].Finding
	if first.File != "spec/one.md" || first.Rule != "VoiceShape.GuidanceCap" || first.Severity != SeverityError {
		t.Fatalf("a style past the prose pair keeps its name, and a row naming no level refuses: %+v", first)
	}
	if second.Rule != "Sentence" || second.Line != 3 || second.Column != 7 || rows[1].said != "so" || second.Source != fromVale {
		t.Fatalf("the prose pair's name drops, and the column reads the span: %+v", second)
	}

	if _, fault := valeRowsOf("/tree", `{"Code":"E100","Text":"a rule breaks\nand more"}`); fault != "E100 a rule breaks" {
		t.Fatalf("Vale's fault reads %q", fault)
	}
	if _, fault := valeRowsOf("/tree", "not json"); fault == "" {
		t.Fatal("an answer past JSON reads as no fault")
	}
}

// [[spec/design_output/lsp#the-server-runs-the-tools]]
func TestBiomeRowsReadAsTheLintReadsThem(t *testing.T) {
	stdout := `{"diagnostics":[
		{"severity":"warning","category":"lint/style/useConst","location":{"path":"src\\a.js","start":{"line":4}},"message":"Use const."},
		{"severity":"error","category":"lint/suspicious/noDebugger","location":{"path":{"file":"src/b.js"},"span":[6,9],"sourceCode":"a\nb\nc;debugger"},"description":[{"content":"No "},{"text":"debugger."}]},
		{"severity":"information","category":"lint/x","location":{"path":"src/c.js"}}
	]}`
	rows := biomeRowsOf("/tree", stdout, ".")
	if len(rows) != 2 {
		t.Fatalf("Biome's answer reads as %v", rows)
	}
	if rows[0].File != "src/a.js" || rows[0].Rule != "style/useConst" || rows[0].Line != 4 || rows[0].Severity != SeverityWarning || rows[0].Source != fromBiome {
		t.Fatalf("the first row reads %+v", rows[0])
	}
	if rows[1].File != "src/b.js" || rows[1].Line != 3 || rows[1].Message != "No debugger." || rows[1].Severity != SeverityError {
		t.Fatalf("a row naming a span reads its line off the source: %+v", rows[1])
	}
}

// A past tense row stands where the reader reads the word as the past, and goes where it reads the present. [[spec/design_output/level0#the-tense-reader]]
func TestTheTenseReaderVetoesARowItReadsAsPresent(t *testing.T) {
	tree := fixture(t, map[string]string{"spec/one.md": "# One\n\nIt " + pastWord + " away.\n\nThe " + vetoed + " line " + pastWord + ".\n"})
	tools := toolsFor(tree.Root)
	found := tools.outside().Over(tree, []string{"spec/one.md"})
	if said := onlyOne(t, found, "PastTense"); said.Line != 3 {
		t.Fatalf("the row the reader keeps stands on line %d", said.Line)
	}

	blind := tools.outside()
	blind.Tense = ""
	if said := names(blind.Over(tree, []string{"spec/one.md"}), "PastTense"); said != 2 {
		t.Fatalf("a box carrying no tense reader keeps %d past tense row(s), and it keeps both", said)
	}
}

// A Vale that breaks draws one row naming the break, and a box carrying no Vale draws one too. [[spec/design_output/lsp#the-server-runs-the-tools]]
func TestABrokenValeStandsInThePanel(t *testing.T) {
	tree := fixture(t, map[string]string{"spec/one.md": "# One\n\n" + breaks + "\n"})
	tools := toolsFor(tree.Root)
	said := onlyOne(t, tools.outside().Sweep(tree), ValeRuns)
	if said.File != valeOwn || !strings.Contains(said.Message, "E100 a rule breaks") {
		t.Fatalf("the break reads %+v", said)
	}

	none := tools.outside()
	none.Vale = ""
	onlyOne(t, none.Over(tree, []string{"spec/one.md"}), ValeRuns)
}

// A row on a draft or on a file the tree holds nowhere goes, and the walk passes the folders the lint's walk passes. [[spec/design_output/lsp#the-server-runs-the-tools]]
func TestTheToolsDrawWhatTheTreeHolds(t *testing.T) {
	marker := markerOpens + "NO -->\n"
	tree := fixture(t, map[string]string{
		"spec/one.md":           "# One\n\n" + spooky + "\n\n" + marker,
		"spec/_draft.md":        spooky + "\n" + marker,
		".claude/skills/one.md": spooky + "\n" + marker,
		"src/one.js":            "debugger;\n",
	})
	found := toolsFor(tree.Root).outside().Sweep(tree)
	for _, said := range found {
		if isDraft(said.File) {
			t.Fatalf("a draft draws %+v", said)
		}
	}
	if said := names(found, "Spooky"); said != 2 {
		t.Fatalf("Vale draws %d Spooky row(s), one a file past the draft", said)
	}
	if said := onlyOne(t, found, Unreasoned); said.File != "spec/one.md" || said.Source != fromTree {
		t.Fatalf("the marker reads %+v, and the walk passes .claude", said)
	}
	if said := onlyOne(t, found, "suspicious/noDebugger"); said.File != "src/one.js" {
		t.Fatalf("Biome's row reads %+v", said)
	}
}

// [[spec/design_output/level0#where-a-rule-lives]]
func TestAnExemptionNamingNoReasonDraws(t *testing.T) {
	text := strings.Join([]string{
		markerOpens + "NO -->",
		"<!-- because: the quote -->",
		markerOpens + "off -->",
		"```",
		markerOpens + "NO -->",
		"```",
		"A span `" + markerOpens + "NO -->` passes.",
		markerOpens + "NO --> <!-- because: here -->",
	}, "\n")
	found := unreasoned("one.md", text)
	if len(found) != 1 || found[0].Line != 1 || found[0].Severity != SeverityError {
		t.Fatalf("the markers read %v", found)
	}
}

// [[spec/design_output/level0#the-size-ceiling]]
func TestTheCeilingsReadAsTheLintReadsThem(t *testing.T) {
	text := strings.Join([]string{
		"export function long(a) {",
		"  if (a) {",
		"    return \"}\";",
		"  }",
		"  return a;",
		"}",
		"const short = (a) => {",
		"  return a;",
		"};",
		"function () {",
		"}",
	}, "\n")
	found := sizeFaults("src/one.js", text, 3, 10)
	if said := onlyOne(t, found, FileCeiling); said.Message != "A file holds 10 lines, and the file holds 11. Split it by topic." {
		t.Fatalf("the file row reads %q", said.Message)
	}
	said := onlyOne(t, found, FunctionCeiling)
	if said.Line != 1 || said.Message != "A function holds 3 lines, and long holds 6. Split it into what it does." || said.Severity != SeverityWarning {
		t.Fatalf("the function row reads %+v", said)
	}
	if found := sizeFaults("src/one.js", text, 0, 0); len(found) != 0 {
		t.Fatalf("a ceiling of nothing holds its rule off, and draws %v", found)
	}
	if named := functionNamed("if (a) {"); named != "" {
		t.Fatalf("a keyword opens a function called %q", named)
	}
	if named := functionNamed("function () {"); named != someFunction {
		t.Fatalf("a nameless function reads as %q", named)
	}
}

// [[spec/design_output/config#the-magic-numbers-take-names]]
func TestTheMagicNumbersReadAsTheLintReadsThem(t *testing.T) {
	text := strings.Join([]string{
		"package one",
		"const (",
		"\tspan = 30",
		")",
		"const wait = 40",
		"// a comment naming 50",
		"func one() {",
		"\ttake(7, 0, 1.5, 10.5x, \"60\", a[70], x80, 3.14)",
		"}",
	}, "\n")
	found := magicIn("src/one.go", text)
	said := []string{}
	for _, one := range found {
		said = append(said, strings.Fields(one.Message)[0]+"@"+itoa(one.Line)+":"+itoa(one.Column))
	}
	if strings.Join(said, " ") != "7@8:7 1.5@8:13 10@8:18 3.14@8:43" {
		t.Fatalf("the magic numbers read %v", said)
	}
	if found := magicIn("src/one_test.go", text); len(found) != 0 {
		t.Fatalf("a test draws %v", found)
	}
}

// The real binaries, where the box holds them: Vale over a style the case writes, and Biome over a debugger line. A mend takes both rows away. [[spec/design_output/lsp#the-server-runs-the-tools]]
func TestTheRealToolsDrawAndAMendClears(t *testing.T) {
	home, err := filepath.Abs(filepath.Join("..", ".."))
	if err != nil {
		t.Fatal(err)
	}
	known := toolsIn(surveyHere(home))
	vale, biome := toolAt(home, known, "vale"), toolAt(home, known, "biome")
	if vale == "" || biome == "" {
		t.Skip("the box holds no Vale or no Biome")
	}
	tree := fixture(t, map[string]string{
		valeOwn:                        "StylesPath = styles\nMinAlertLevel = suggestion\n\n[*.md]\nBasedOnStyles = Probe\n",
		"styles/Probe/Spooky.yml":      "extends: existence\nmessage: \"'%s' stands here.\"\nlevel: warning\ntokens:\n  - Spooky\n",
		"spec/config/biome.json":       `{"files":{"includes":["src/**/*.js","!spec/**"]},"linter":{"enabled":true,"rules":{"recommended":true}}}`,
		"spec/one.md":                  "# One\n\nA Spooky line.\n",
		"src/one.js":                   "debugger;\n",
		".se/.runtime/unread/three.md": "A Spooky line.\n",
	})
	outside := &Outside{Root: tree.Root, Vale: vale, Biome: biome, Config: valeOwn, run: runsIn}

	found := outside.Sweep(tree)
	if said := onlyOne(t, found, "Probe.Spooky"); said.File != "spec/one.md" || said.Line != 3 || said.Column != 3 || said.Severity != SeverityWarning {
		t.Fatalf("Vale's row reads %+v", said)
	}
	if said := onlyOne(t, found, "suspicious/noDebugger"); said.File != "src/one.js" || said.Line != 1 {
		t.Fatalf("Biome's row reads %+v", said)
	}

	for path, text := range map[string]string{"spec/one.md": "# One\n\nA line.\n", "src/one.js": "export const one = 1;\n"} {
		if err := os.WriteFile(filepath.Join(tree.Root, filepath.FromSlash(path)), []byte(text), 0o644); err != nil {
			t.Fatal(err)
		}
	}
	if found := outside.Over(tree, []string{"spec/one.md", "src/one.js"}); len(found) != 0 {
		t.Fatalf("the mended files still draw %v", found)
	}

	tree.Holds("spec/one.md", "# One\n\nA Spooky buffer.\n")
	if said := onlyOne(t, outside.Over(tree, []string{"spec/one.md"}), "Probe.Spooky"); said.File != "spec/one.md" {
		t.Fatalf("the buffer's row reads %+v", said)
	}
}
