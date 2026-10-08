//go:build contract

// Every prose rule through the real Vale: a probe the rule refuses and a twin
// it leaves alone, each under the path its section reads, off one run over a
// temp root holding the tree's config and styles.
// [[spec/design_output/doors#one-contract-test-per-door]]
package lsp

import (
	"encoding/json"
	"fmt"
	"io/fs"
	"os"
	"path/filepath"
	"strings"
	"testing"

	"quackitect/src/modules/check"
)

// A rule name standing for any finding, and for any finding at a severity that refuses. [[spec/tickets/test-lines-stay-under-code]]
const (
	anyRule      = "*"
	refusingRule = "*refusing"
)

// One probe: the path Vale reads it under, the text, the rule, and whether the rule fires. [[spec/tickets/test-lines-stay-under-code]]
type ruleProbe struct {
	path, text, rule string
	fires            bool
}

// The paths the probes stand under, since the path picks the section. [[spec/tickets/test-lines-stay-under-code]]
const (
	noteAt     = "notes.md"
	answerAt   = "answer.md"
	inputAt    = "spec/design_input/one.md"
	designAt   = "spec/design_output/probe.md"
	guidanceAt = "spec/guidance/probe.md"
	stopAt     = "spec/config/stop/probe.yml"
	shellAt    = "src/scripts/probe.sh"
	powerAt    = "src/scripts/probe.ps1"
	wordsAt    = "spec/vocabulary/probe.yml"
	ticketAt   = "spec/tickets/a-name.md"
	moduleAt   = "src/bridge/findings.js"
	headerAt   = "src/bridge/probe.js"
)

func sentencesOf(n int) string {
	out := []string{}
	for i := range n {
		out = append(out, fmt.Sprintf("Sentence number %d stands here.", i))
	}
	return strings.Join(out, " ")
}

func paragraphsOf(n int) string {
	out := []string{}
	for i := range n {
		out = append(out, fmt.Sprintf("Paragraph number %d stands here.", i))
	}
	return strings.Join(out, "\n\n")
}

func wordsOf(tag string, n int) string {
	out := []string{}
	for i := range n {
		out = append(out, fmt.Sprintf("%sw%d", tag, i))
	}
	return strings.Join(out, " ")
}

// A long table beside a long paragraph, which the restated table rule reads inside its budget. [[spec/tickets/restated-table-runs-in-time]]
func longTable() string {
	lines := []string{}
	for i := range 40 {
		lines = append(lines, wordsOf(fmt.Sprintf("p%d", i), 12))
	}
	rows := []string{}
	for r := range 200 {
		rows = append(rows, fmt.Sprintf("| %s | %s |", wordsOf(fmt.Sprintf("a%d", r), 30), wordsOf(fmt.Sprintf("b%d", r), 30)))
	}
	return strings.Join(lines, "\n") + "\n\n| one | two |\n|---|---|\n" + strings.Join(rows, "\n") + "\n"
}

func guidanceFront(rows string) string { return "---\nkind: [[guidance]]\n" + rows + "---\n\n" }

func chapterOf(n int) string {
	out := []string{}
	for i := range n {
		out = append(out, fmt.Sprintf("%d. Do the thing. *", i+1))
	}
	return "# Actionables\n\n" + strings.Join(out, "\n") + "\n"
}

func markedOf(rules ...string) string {
	return guidanceFront("") + "# Actionables\n\n" + strings.Join(rules, "\n") + "\n"
}

// A record field the verbs write, or one a person writes, under a ticket's front matter. [[spec/tickets/voice-rules-skip-the-record]]
func notedRecord(key string) string {
	return "---\nkind: ticket\nrecord:\n  - step: do\n    " + key + ": It reads `a`, `b`, `c`, `d`, `e`, `f` and `g` here.\n---\n\nA body.\n"
}

func ticketRecord(key string) string {
	return "---\nkind: [[ticket]]\nrecord:\n  - step: implement/change\n    " + key + ": The hand reads `one.js`, `two.js`, `three.js`, `four.js` and `five.js`.\n---\n\n# Ask\n\nA line of prose.\n"
}

func restatedOf(lead, left, right string) string {
	return lead + "\n\n| what stands | what it does |\n|---|---|\n| " + left + " | " + right + " |\n"
}

// The probes off the rule cases the JavaScript contract suite held, each probe and its twin once. [[spec/tickets/test-lines-stay-under-code]]
func proseProbes() []ruleProbe {
	const (
		binds    = "- The door shall refuse the write, and it should name the rule.\n"
		bare     = "The verb exits 0 on survives.\n"
		table    = "| question | answer |\n|---|---|\n| where | here |\n"
		twoUnder = "- The bottom line.\n\n# One\n\nA paragraph.\n\nA second paragraph.\n"
		cells    = "a door refuses a write breaking a rule"
		pastText = "---\nkind: [[guidance]]\n---\n\n# Nothing\n\nThe tree was installed here.\n"
		reads    = "const here = process.env.HOME;\n"
		spawn    = "import \"os/exec\"\n"
		osImport = "import (\n\t\"fmt\"\n\t\"os\"\n)\n"
		entry    = "VoiceShape.VocabularyEntry"
		script   = "VoiceScript.NoPathInScript"
		marked   = "VoiceShape.MarkedRuleNamesFailure"
	)
	// The fixture carries no shape the private rule reads in this file. [[spec/design_output/private#a-fixture-carries-no-shape]]
	secrets := strings.Join([]string{"/home", "fnordwick", "secrets"}, "/")
	called := strings.Join([]string{"+49 30", "1234 5678"}, " ")
	nodeImport := "import { readFileSync } from \"node" + ":fs\";\n"
	opened := func(n int) string { return "- The bottom line stands here.\n\n" + paragraphsOf(n) + "\n" }
	design := strings.Join([]string{
		"Measured against client 2.1.267, a poll every 250 ms stands, and x86 ships.", "",
		"| what | count |", "|---|---|", "| events | 186 |", "", "1. The verb exits `0` on survives.", "",
	}, "\n")
	return []ruleProbe{
		{noteAt, "THIS IS THE SHOUTED PART, and it follows.", "ShoutedLead", true},
		{noteAt, "The engine reads SQLite and answers JSON.", "ShoutedLead", false},
		{noteAt, "It is a door rather than a window.", "Antithesis", true},
		{noteAt, "The door used to read the config.", "History", true},
		{noteAt, "The door previously names the file.", "History", true},
		{noteAt, "The door reads the config.", "History", false},
		{noteAt, "The file was written by the engine.", "Passive", true},
		{noteAt, "The engine writes the file.", "Passive", false},
		{noteAt, "| a | b |\n| - | - |\n", anyRule, false},
		{noteAt, "- one\n- two\n", anyRule, false},
		{noteAt, "```\nTHIS IS SHOUTED CODE, and it is left alone.\n```\n", anyRule, false},
		{inputAt, binds, anyRule, false},
		{noteAt, binds, "Modal", true},
		{"spec/design_output/one.md", binds, "Modal", true},
		{inputAt, "- The door may refuse the write, and it would say why.\n", "ModalRequirement", true},
		{inputAt, "- The door may refuse the write, and it would say why.\n", "Modal", false},
		{noteAt, "Reach the owner at somebody@example.com when the box stalls.", "Private", true},
		{noteAt, "Call " + called + " about it, and say what stalls.", "Private", true},
		{noteAt, "Measured on 2026-09-10 against client 2.1.267, on a cloud box.", "Private", true},
		{noteAt, "The probe writes under " + secrets + " and reads it back.", "Private", true},
		{noteAt, "A box answers C:\\Users\\fnordwick\\Desktop as the home folder there.", "Private", true},
		{noteAt, "A cloud box writes under /home/user, and a fixture writes /Users/one.", "Private", false},
		{noteAt, "A runner writes under /home/runner, and an agent under /home/claude.", "Private", false},
		{noteAt, "Client 2.1.267 stands the same way, and the number 1024 passes.", "Private", false},
		{noteAt, "    the indented example: 2026-09-08 and " + secrets + "\n", "Private", false},
		{noteAt, "The door refuses a flibbertigibbet.", "Vocabulary", true},
		{noteAt, "The door utilize the list.", "Vocabulary", true},
		{noteAt, "The door refuses a write, and the writer reads the refusal.", "Vocabulary", false},
		{noteAt, "A run of doors reads the rules, and the rules stand in one folder.", "Vocabulary", false},
		{noteAt, "The tree writes `flibbertigibbet` in a code span, so the rule reads past it.", "Vocabulary", false},
		{noteAt, "A path like spec/vocabulary/words.yml stands outside the layer.", "Vocabulary", false},
		{noteAt, "The owner reads [[spec/funnel/a-paragraph-has-a-schema]] first.", "Vocabulary", false},
		{noteAt, "A capital past the first word names Flibbertigibbet, so it stands.", "Vocabulary", false},
		{noteAt, "The door reads 2048 bytes and the rule passes over a digit.", "Vocabulary", false},
		{noteAt, "The door refuses a write, and the doors refused it.", "Vocabulary", false},
		{noteAt, "The door is refusing a write, and the writer stands waiting.", "Vocabulary", false},
		{noteAt, "The rules carry the tries a session tried.", "Vocabulary", false},
		{designAt, bare, "DigitInProse", true},
		{designAt, design, "DigitInProse", false},
		{noteAt, bare, "DigitInProse", false},
		{designAt, "Three verbs answer what their asks name, and the list has four rows.\n", "DigitInProse", true},
		{designAt, "The verbs answer what their asks name, and two of them read the queue.\n", "DigitInProse", false},
		{noteAt, "The three steps below run in order:\n\n- one\n- two\n- three\n", "CountedList", true},
		{noteAt, "The steps below run in order:\n\n- one\n- two\n- three\n", "CountedList", false},
		{headerAt, "// alpha\n// beta\n// gamma\n// delta\n// epsilon\n// zeta\n\nexport const one = 1;\n", "CodeHeader", true},
		{headerAt, "// The four doors this module reads.\n\nexport const one = 1;\n", "CodeHeader", true},
		{headerAt, "// The doors this module reads.\n\nexport const one = 1;\n", "CodeHeader", false},
		{"src/scripts/ephemeral.js", "// The tickets the engine mints at a pull. Each stands in the hold alone,\n// carries no file, and dies at its hand-back. The clear runs as three of them,\n// and the context door marks the session due so the pull hands the first.\n\nexport const one = 1;\n", "CodeHeader", true},
		{"src/scripts/ephemeral.js", "// The tickets the engine mints at a pull. The clear runs as a run of them.\n\nexport const one = 1;\n", "CodeHeader", false},
		// A comment line past the code passes where it points, suppresses or directs. [[spec/tickets/comment-rules-meet-the-lint]]
		{headerAt, "export const one = 1;\n// The one the door reads. [[spec/tickets/a-thing]]\nexport const two = 2;\n", "CodeComment", false},
		{headerAt, "export const one = 1;\n// level0: CodeComment - a fixture\n// nolint: a fixture\nexport const two = 2;\n", "CodeComment", false},
		{headerAt, "export const one = 1;\n// The one the door reads.\nexport const two = 2;\n", "CodeComment", true},
		{noteAt, "# Scope\n\nThe notes.\n\n## The three steps\n\n- one\n- two\n- three\n", "CountedList", true},
		{noteAt, "# Scope\n\nThe notes.\n\n## Four rows\n\n| a | b |\n|---|---|\n| x | y |\n", "CountedList", true},
		{noteAt, "# Scope\n\nThe notes.\n\n## The steps\n\n- one\n- two\n- three\n", "CountedList", false},
		{noteAt, "The engine reads it, and the reader waits; so it goes.\n", "Characters", true},
		{noteAt, "The engine reads it, and the reader waits.\n", "Characters", false},
		{noteAt, "The engine reads `a; b` and the reader waits.\n", "Characters", false},
		{noteAt, "```\nThe engine; the reader.\n```\n", "Characters", false},
		{noteAt, "The TL;DR list opens the answer.\n", "Characters", false},
		{noteAt, "The door reads spec/config/styles and answers.\n", "Characters", false},
		{noteAt, "# This heading holds far too many words here\n", "Markup", true},
		{noteAt, "# A heading: two things\n", "Markup", true},
		{noteAt, "- **A strong lead running far too long** the rest.\n", "Markup", true},
		{noteAt, "# A short heading\n", "Markup", false},
		{noteAt, "# One thing\n", "Markup", false},
		{noteAt, "- **A short lead** the rest.\n", "Markup", false},
		{noteAt, paragraphsOf(4) + "\n", "Shape", true},
		{noteAt, paragraphsOf(3) + "\n", "Shape", false},
		{answerAt, opened(3), "ShapeAnswer", true},
		{answerAt, opened(2), "ShapeAnswer", false},
		{noteAt, paragraphsOf(3) + "\n", "ShapeAnswer", false},
		{answerAt, "# One thing\n\n- The bottom line.\n", "ShapeAnswer", true},
		{answerAt, "The bottom line stands here.\n", "ShapeAnswer", true},
		{answerAt, table + "\n# One thing\n", "ShapeAnswer", true},
		{answerAt, "- The bottom line stands here.\n", "ShapeAnswer", false},
		{answerAt, "1. The bottom line stands here.\n", "ShapeAnswer", false},
		{answerAt, table + "\n- The bottom line.\n", "ShapeAnswer", false},
		{noteAt, "# One thing\n\nThe line stands here.\n", "ShapeAnswer", false},
		{answerAt, twoUnder, "ShapeAnswer", false},
		{answerAt, twoUnder + "\n# Two\n\nA paragraph.\n\nA second paragraph.\n", "ShapeAnswer", false},
		{answerAt, twoUnder + "\nA third paragraph.\n", "ShapeAnswer", true},
		{noteAt, sentencesOf(7) + "\n", "Paragraph", true},
		{noteAt, sentencesOf(6) + "\n", "Paragraph", false},
		{answerAt, sentencesOf(4) + "\n", "ParagraphAnswer", true},
		{answerAt, sentencesOf(3) + "\n", "ParagraphAnswer", false},
		{noteAt, "The engine " + strings.Repeat("and the reader ", 12) + "meet here.\n", "Sentence", true},
		{noteAt, "The engine and the reader meet here.\n", "Sentence", false},
		{noteAt, "- The engine " + strings.Repeat("and the reader ", 7) + "meet here.\n", "ListItem", true},
		{noteAt, "- The engine and the reader meet here.\n", "ListItem", false},
		{noteAt, "It reads `a`, `b`, `c`, `d` and `e` here.\n", "CodeSpans", true},
		{noteAt, "It reads `a`, `b`, `c` and `d` here.\n", "CodeSpans", false},
		{noteAt, "| `a` | `b` | `c` | `d` | `e` |\n| - | - | - | - | - |\n", "CodeSpans", false},
		{noteAt, notedRecord("why"), "CodeSpans", false},
		{noteAt, notedRecord("asks"), "CodeSpans", false},
		{noteAt, notedRecord("says"), "CodeSpans", true},
		{noteAt, notedRecord("does"), "CodeSpans", true},
		{noteAt, "---\nkind: ticket\n---\n\nIt reads `a`, `b`, `c`, `d`, `e`, `f` and `g` here.\n", "CodeSpans", true},
		{noteAt, "The engine has written the file.\n", "Auxiliary", true},
		{noteAt, "The engine writes the file.\n", "Auxiliary", false},
		{noteAt, "The session is holding the branch.\n", "Progressive", true},
		{noteAt, "The session holds the branch.\n", "Progressive", false},
		{noteAt, "The engine adds the one that is missing.\n", "Progressive", false},
		{noteAt, "What matters is standing outside a work branch.\n", "Progressive", false},
		{noteAt, "A person should read the note.\n", "Modal", true},
		{noteAt, "The engine would read the note.\n", "Modal", true},
		{noteAt, "A person can read the note.\n", "Modal", false},
		{noteAt, "The engine must read the note, and it will.\n", "Modal", false},
		{noteAt, "The engine doesn't stop here.\n", "Contraction", true},
		{noteAt, "The engine does not stop here.\n", "Contraction", false},
		{noteAt, "A duck, e.g. a mallard, stands here.\n", "Latin", true},
		{noteAt, "A duck, for example a mallard, stands here.\n", "Latin", false},
		{noteAt, "Ducks, geese, etc. We saw them.\n", "EtCetera", true},
		{noteAt, "Ducks, geese and so on. We saw them.\n", "EtCetera", false},
		{ticketAt, ticketRecord("why"), "CodeSpans", false},
		{ticketAt, ticketRecord("asks"), "Characters", false},
		{ticketAt, ticketRecord("does"), "CodeSpans", true},
		{noteAt, restatedOf("A door refuses a write breaking a rule, and the table says so.", cells, "it names the line"), "RestatedTable", true},
		{noteAt, restatedOf("The door names what it reads.", cells, "it names the line"), "RestatedTable", false},
		{noteAt, restatedOf("Somewhere a box keeps every open ticket warm.", "each box keeps every open ticket warm today", "it names the line"), "RestatedTable", true},
		{noteAt, restatedOf("Somewhere the index keeps every open ticket warm.", "each box keeps every open ticket warm today", "it names the line"), "RestatedTable", false},
		{noteAt, restatedOf("Each box keeps every open ticket warm.", "each box keeps", "every open ticket warm"), "RestatedTable", false},
		{noteAt, longTable(), "RestatedTable", false},
		{noteAt, "Somebody wrote the note and finished the work.\n", "PastTense", true},
		{noteAt, "Somebody writes the note and finishes the work.\n", "PastTense", false},
		{noteAt, "The gate answers red where a test skips a case.", "PastTense", false},
		{noteAt, "The verb buys one place, and a reader read what he held.", "PastTense", false},
		{noteAt, "The rule holds its bound, and a numbered note stands.", "PastTense", false},
		{noteAt, "A settled question waits, and a complicated one waits longer.", "PastTense", false},
		{noteAt, "A rule the table switched off leaves a refused write behind.", "PastTense", false},
		{guidanceAt, guidanceFront("") + "# Nothing here\n\nA note carrying no chapter.\n", "VoiceShape.GuidanceChapter", true},
		{guidanceAt, guidanceFront("") + chapterOf(2), "VoiceShape.GuidanceChapter", false},
		{guidanceAt, guidanceFront("") + chapterOf(16), "VoiceShape.GuidanceCap", true},
		{guidanceAt, guidanceFront("") + chapterOf(15), "VoiceShape.GuidanceCap", false},
		{guidanceAt, guidanceFront("env:\n  - lower_name\n") + chapterOf(1), "VoiceShape.GuidanceEnv", true},
		{guidanceAt, guidanceFront("env:\n  - SE_CLOUD\n") + chapterOf(1), "VoiceShape.GuidanceEnv", false},
		{stopAt, "- id: a-rule\n  side: stop\n  priority: 5\n", "VoiceShape.StopRule", true},
		{stopAt, "- id: a-rule\n  side: sideways\n  priority: 5\n  decides: claimed\n  says: A thing.\n", "VoiceShape.StopRule", true},
		{stopAt, "- id: a-rule\n  side: stop\n  priority: 5\n  decides: claimed\n  says: A thing.\n", "VoiceShape.StopRule", false},
		{shellAt, "#!/usr/bin/env sh\nnode -e \"require('$root/lib.js')\"\n", script, true},
		{shellAt, "#!/usr/bin/env sh\ncd \"$root\" && node -e \"require('./lib.js')\"\n", script, false},
		{powerAt, "node --input-type=module -e \"import '$root/lib.js'\"\n", script, true},
		{powerAt, "node --input-type=module -e \"import './lib.js'\"\n", script, false},
		{shellAt, "# node -e \"require('$root/lib.js')\"\n", script, false},
		{shellAt, "cp \"$tmp/$name\" \"$bin/$name\"\n", script, false},
		{shellAt, "#!/usr/bin/env sh\n# The tree was installed here.\n", anyRule, false},
		{guidanceAt, markedOf("1. Run the check before you hand the branch back. *"), marked, true},
		{guidanceAt, markedOf("1. Read `spec/guidance/voice.md` first, because it holds the register. *"), marked, true},
		{guidanceAt, markedOf("1. Run the check before you hand the branch back. A red branch costs the reader a round. *"), marked, false},
		{guidanceAt, markedOf("1. Run the check before you hand the branch back."), marked, false},
		{wordsAt, "words:\n  - {word: door, from: ste}\nterms:\n  - {word: shim, means: \"a small script that finds the tool\"}\n  - {word: vale, means: \"a prose linter\", source: \"https://vale.sh\"}\nswaps:\n  - {word: utilize, write: use}\n", entry, false},
		{wordsAt, "words:\n  - {word: Door, from: ste}\n", entry, true},
		{wordsAt, "words:\n  - {word: door, from: nowhere}\n", entry, true},
		{wordsAt, "terms:\n  - {word: shim, defines: somewhere, means: \"a script\"}\n", entry, true},
		{wordsAt, "terms:\n  - {word: shim, means: \"a script\", see: \"[[spec/guidance/voice]]\"}\n", entry, true},
		{wordsAt, "words:\n  - {word: door, from: ste\n", entry, true},
		{wordsAt, "words:\n  - {from: ste}\n", entry, true},
		{wordsAt, "swaps:\n  - {word: utilize}\n", entry, true},
		{wordsAt, "  - {word: door, from: ste}\n", entry, true},
		{wordsAt, "terms:\n  - {word: shim}\n", entry, true},
		{wordsAt, "terms:\n  - {word: shim, means: \"a script, and more\"}\n", entry, true},
		{wordsAt, "terms:\n  - {word: shim, means: \"a script\", source: \"https://a.org/x,y\"}\n", entry, true},
		{wordsAt, "terms:\n  - {word: shim, means: \"a script\", source: somewhere}\n", entry, true},
		{noteAt, "# Notes\n\nDON'T STOP AT ALL HERE, and then calm.\n", "ShoutedLead", true},
		{noteAt, "# Notes\n\n```\nIt's a duck, e.g. a mallard.\n```\n", "Contraction", false},
		{noteAt, "# Notes\n\n<!-- because: the fixer leaves this alone -->\n<!-- vale VoiceParagraph.Contraction = NO -->\nIt's here.\n", "Contraction", false},
		{moduleAt, reads, "OutsideInDoors", true},
		{moduleAt, "const said = process.argv.slice(2);\n", "OutsideInDoors", true},
		{moduleAt, "const win = process.platform === \"win32\";\n", "OutsideInDoors", true},
		{"src/index/answers.go", spawn, "OutsideInDoors", true},
		{"src/extension/extension.js", nodeImport, "DoorsOnly", true},
		{"src/front/mint.go", osImport, "OutsideInDoors", true},
		{"src/index/main.go", "import \"os/signal\"\n", "OutsideInDoors", true},
		{"src/engine/swap/swap.go", osImport, "OutsideInDoors", true},
		{"src/scripts/vehicle.js", "const owner = String(process.pid);\n", "OutsideInDoors", true},
		{"src/bridge/review.js", "const node = process.version.replace(/^v/, \"\");\n", "OutsideInDoors", true},
		{"src/bridge/review.js", "const argv = [process.execPath, script];\n", "OutsideInDoors", true},
		{"src/extension/extension.js", reads, "OutsideInDoors", false},
		{"src/extension/sidebar.js", reads, "OutsideInDoors", false},
		{".claude/skills/level0/hooks/level0.js", reads, "OutsideInDoors", false},
		{"src/stub/.claude/skills/level0/hooks/bridgehead.js", reads, "OutsideInDoors", false},
		{"src/doors/proc.js", reads, "OutsideInDoors", false},
		{"src/doors/fake/proc.js", reads, "OutsideInDoors", false},
		{"test/level0/work.test.js", reads, "OutsideInDoors", false},
		{"test/contract/proc.test.js", reads, "OutsideInDoors", false},
		{noteAt, reads, "OutsideInDoors", false},
		{"src/index/door.go", spawn, "OutsideInDoors", false},
		{"src/engine/swap/door.go", osImport, "OutsideInDoors", false},
		{"src/front/front_test.go", osImport, "OutsideInDoors", false},
		{"spec/guidance/_probe.md", pastText, anyRule, false},
		{guidanceAt, pastText, anyRule, true},
	}
}

// Every route's minted ticket off the golden the Go mint holds, which the voice passes. [[spec/design_output/pull#the-voice-reads-the-evidence]]
func mintedProbes(t *testing.T, tree string) []ruleProbe {
	t.Helper()
	body, err := os.ReadFile(filepath.Join(tree, "src", "quack", "testdata", "minted.golden.json"))
	if err != nil {
		t.Fatal(err)
	}
	var minted []struct{ Route, Text string }
	if err := json.Unmarshal(body, &minted); err != nil {
		t.Fatal(err)
	}
	if len(minted) < 2 {
		t.Fatalf("the golden holds %d routes", len(minted))
	}
	out := []ruleProbe{}
	for _, one := range minted {
		out = append(out, ruleProbe{"spec/tickets/" + one.Route + "-rendered.md", one.Text, refusingRule, false})
	}
	return out
}

// The files a root copies off the tree: the config and every style. [[spec/tickets/test-lines-stay-under-code]]
func copiesTree(t *testing.T, tree, root string) {
	t.Helper()
	copies := func(rel string) {
		body, err := os.ReadFile(filepath.Join(tree, rel))
		if err != nil {
			t.Fatal(err)
		}
		at := filepath.Join(root, rel)
		if err := os.MkdirAll(filepath.Dir(at), 0o755); err != nil {
			t.Fatal(err)
		}
		if err := os.WriteFile(at, body, 0o644); err != nil {
			t.Fatal(err)
		}
	}
	copies(check.ValeIni)
	styles := filepath.Join("spec", "config", "styles")
	err := filepath.WalkDir(filepath.Join(tree, styles), func(path string, entry fs.DirEntry, err error) error {
		if err != nil || entry.IsDir() {
			return err
		}
		rel, err := filepath.Rel(tree, path)
		if err == nil {
			copies(rel)
		}
		return err
	})
	if err != nil {
		t.Fatal(err)
	}
	if _, err := os.Stat(filepath.Join(tree, filepath.FromSlash(check.ToolsAt))); err == nil {
		copies(filepath.FromSlash(check.ToolsAt))
	}
}

// Whether the rows on one file hold the rule the probe names. [[spec/tickets/test-lines-stay-under-code]]
func firesOn(rows []Finding, rule string) bool {
	for _, row := range rows {
		switch rule {
		case anyRule:
			return true
		case refusingRule:
			if row.Severity == severe || row.Severity == "warning" {
				return true
			}
		default:
			if row.Rule == rule {
				return true
			}
		}
	}
	return false
}

func TestEachProseRuleFiresOnItsProbeAndStaysQuietOnItsTwin(t *testing.T) {
	tree, err := filepath.Abs(filepath.Join("..", "..", ".."))
	if err != nil {
		t.Fatal(err)
	}
	root := t.TempDir()
	copiesTree(t, tree, root)
	rules := fakeCheck
	rules.Faults = func(Tree, string, int, int, string) []Finding { return nil }
	rules.Draft, rules.Relative = check.IsDraft, check.RelativeTo
	rules.ValeIni, rules.Survey, rules.Bin = check.ValeIni, check.ToolsAt, check.Bin
	tools := ToolsAt(root, rules)
	defer tools.Halt()
	if tools.Vale == "" {
		t.Skip("no vale stands on this box")
	}
	probes := append(proseProbes(), mintedProbes(t, tree)...)
	// Each probe in a folder of its own, so two probes under one path stand apart. [[spec/design_output/doors#one-contract-test-per-door]]
	texts, paths := map[string]string{}, []string{}
	for i, one := range probes {
		at := fmt.Sprintf("p%d/%s", i, one.path)
		full := filepath.Join(root, filepath.FromSlash(at))
		if err := os.MkdirAll(filepath.Dir(full), 0o755); err != nil {
			t.Fatal(err)
		}
		if err := os.WriteFile(full, []byte(one.text), 0o644); err != nil {
			t.Fatal(err)
		}
		texts[at] = one.text
		paths = append(paths, at)
	}
	found := tools.Over(&fakeTree{texts: texts, held: map[string]string{}}, paths)
	byPath := map[string][]Finding{}
	for _, row := range found {
		if row.Rule == ValeRuns {
			t.Fatalf("vale reads nothing: %s", row.Message)
		}
		byPath[row.File] = append(byPath[row.File], row)
	}
	for i, one := range probes {
		at := paths[i]
		if got := firesOn(byPath[at], one.rule); got != one.fires {
			named := []string{}
			for _, row := range byPath[at] {
				named = append(named, row.Rule+"@"+row.Severity)
			}
			t.Errorf("%s under %s fires %v, and wants %v, over %q: %v", one.rule, at, got, one.fires, one.text, named)
		}
	}
}
