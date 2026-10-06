// Each shape the projection writes, over a small tree of texts: the files it
// names, the text it writes, and the targets it reads as standing. The verb
// test under src/quack holds the byte-for-byte case over the real tree.
// [[spec/tickets/config-verbs-port-to-go]]
package projection

import (
	"math"
	"slices"
	"strings"
	"testing"
)

// The entries one or more entry texts name. [[spec/tickets/config-verbs-port-to-go]]
func entries(t *testing.T, text string) []Entry {
	t.Helper()
	out := EntriesIn(`{"projections": [` + text + `]}`)
	if len(out) == 0 {
		t.Fatalf("no entry reads off %s", text)
	}
	return out
}

// One entry read over a tree of texts, as sources and targets both. [[spec/tickets/config-verbs-port-to-go]]
func readOver(t *testing.T, entry string, texts Texts) Result {
	t.Helper()
	return ReadAll(entries(t, entry), texts, texts)
}

func TestEntriesInKeepsAnEntryNamingATarget(t *testing.T) {
	said := EntriesIn(`{"projections": [{"target": "a"}, {"shape": "x"}, 3, null, {"target": ""}]}`)
	if len(said) != 1 || said[0].folder() != "a" {
		t.Errorf("entries read %d, and one names a target", len(said))
	}
	if len(EntriesIn("not json")) != 0 || len(EntriesIn("")) != 0 {
		t.Error("a broken or empty text names an entry")
	}
}

func TestRetroWritesOneCommand(t *testing.T) {
	said := readOver(t, `{"shape": "retro command", "target": "c/", "from": "r.yaml", "wrap": "none"}`, Texts{})
	want := "!`./RUNME.sh retro new`\n\n" +
		"The line above runs before this turn opens, so a retro stands open at its first\n" +
		"leaf, and the answer above holds that leaf. Run `./RUNME.sh branch pull <name>` to\n" +
		"read it again.\n"
	if got := said.Wanted["c/se-retro.md"]; got != want {
		t.Errorf("the retro command reads\n%s\nand wants\n%s", got, want)
	}
}

func TestRetroWrapsAFrontmatter(t *testing.T) {
	said := readOver(t, `{"shape": "retro command", "target": "c", "from": "r.yaml", "wrap": "frontmatter"}`, Texts{})
	got := said.Wanted["c/se-retro.md"]
	for _, line := range []string{"---", hidden, "allowed-tools: Bash(./RUNME.sh retro:*)", "generated: " + quoted(saysGenerated("r.yaml"))} {
		if !strings.Contains(got, line+"\n") {
			t.Errorf("the retro command carries no line %q", line)
		}
	}
}

const commandsEntry = `{"shape": "config commands", "target": "c", "writes": ["se-config-*.md", "se-my-group-*.md"], "from": "c.json", "schema": "s.json", "wrap": "frontmatter"}`

const commandsSchema = `{"properties": {"a": {"type": "object", "properties": {
	"flag": {"type": "boolean", "default": true, "help": "Flag help."},
	"mode": {"type": "string", "enum": ["x", "y"], "widget": "toggle", "group": "My Group"},
	"free": {"type": "string"}}}}}`

func TestCommandsWriteOneFileAValue(t *testing.T) {
	said := readOver(t, commandsEntry, Texts{"c.json": `{"a": {"free": "v"}}`, "s.json": commandsSchema})
	want := []string{
		"c/se-config-a-flag-false.md", "c/se-config-a-flag-true.md", "c/se-config-a-free.md",
		"c/se-my-group-mode-x.md", "c/se-my-group-mode-y.md",
	}
	if got := Paths(said.Wanted); !slices.Equal(got, want) {
		t.Errorf("the commands are %v, and want %v", got, want)
	}
}

func TestACommandTakingAValueReadsAsNodeWritesIt(t *testing.T) {
	said := readOver(t, commandsEntry, Texts{"c.json": `{"a": {"free": "v"}}`, "s.json": commandsSchema})
	want := strings.Join([]string{
		"---",
		`description: "config / a / free: sets a.free to what you type."`,
		`argument-hint: "<value>"`,
		"allowed-tools: Bash(./RUNME.sh config:*)",
		hidden,
		"generated: " + quoted(saysGenerated("c.json")),
		"---",
		"",
		"!`./RUNME.sh config a.free $ARGUMENTS`",
		"",
		"The line above runs before this turn opens, so `a.free` reads what you type after",
		"the name. Run `./RUNME.sh config` to read which layer answers a key:",
		"`.se/.runtime/config.json` beats the environment, and the environment beats",
		"`spec/config/level0.json`.",
		"",
	}, "\n")
	if got := said.Wanted["c/se-config-a-free.md"]; got != want {
		t.Errorf("the command reads\n%s\nand wants\n%s", got, want)
	}
}

func TestTheLocalLayerStandsInTheRuntimeFolder(t *testing.T) {
	if !strings.HasPrefix(localConfig, ".se/.runtime/") || !strings.HasSuffix(localConfig, "/config.json") {
		t.Errorf("the local layer reads %s, and wants config.json in the runtime folder", localConfig)
	}
}

func TestAStaleCommandStandsAndTheOwnersFileStaysUnowned(t *testing.T) {
	said := readOver(t, commandsEntry, Texts{
		"c.json": `{}`, "s.json": commandsSchema,
		"c/se-config-gone.md": "old", "c/mine.md": "mine", "c/se-config-x.txt": "other ending",
	})
	if _, held := said.Standing["c/se-config-gone.md"]; !held {
		t.Error("a stale command reads as no standing target")
	}
	if _, held := said.Standing["c/mine.md"]; held {
		t.Error("the owner's file beside the targets reads as a target")
	}
	if _, held := said.Standing["c/se-config-x.txt"]; held {
		t.Error("a file of another ending reads as a target")
	}
}

func TestWidgetsSharingALeafTakeTheirSection(t *testing.T) {
	schema := `{"properties": {
		"a": {"properties": {"mode": {"enum": ["x"], "widget": "toggle", "group": "G"}}},
		"b": {"properties": {"mode": {"enum": ["x"], "widget": "toggle", "group": "G"}}}}}`
	got := []string{}
	for _, one := range widgetsIn(parsed(schema)) {
		got = append(got, strings.Join(one.path.stem, "-"))
	}
	if want := []string{"g-a-mode", "g-b-mode"}; !slices.Equal(got, want) {
		t.Errorf("the widget stems are %v, and want %v", got, want)
	}
}

const styleEntry = `{"shape": "output style", "target": "o", "from": "g", "wrap": "frontmatter"}`

func TestStyleNumbersEachNotesRulesAndItsExamples(t *testing.T) {
	said := readOver(t, styleEntry, Texts{
		"g/b_x-y.md":  "---\nname: b\n---\n# Actionables\n\n1. First\n   wraps. `*`\n- Second *\n\n# Examples\n\n| a | b |\n",
		"g/a.md":      "# Actionables\n\nno item\n",
		"g/deep/c.md": "# Actionables\n1. deep\n",
	})
	got := said.Wanted["o/level0.md"]
	for _, want := range []string{
		`description: "The b_x-y rules of this tree, sent with every request."`,
		"## b x y\n\n1. First wraps.\n2. Second\n\n| a | b |\n",
	} {
		if !strings.Contains(got, want) {
			t.Errorf("the style carries no %q:\n%s", want, got)
		}
	}
	if strings.Contains(got, "deep") || strings.Contains(got, "## a") {
		t.Errorf("the style carries a note it leaves out:\n%s", got)
	}
}

func TestStyleWritesNothingWhereNoNoteCarriesARule(t *testing.T) {
	if said := readOver(t, styleEntry, Texts{"g/a.md": "# Motivation\n\n1. not a rule\n"}); len(said.Wanted) != 0 {
		t.Errorf("the style writes %v", Paths(said.Wanted))
	}
}

const paragraphEntry = `{"shape": "paragraph rules", "target": "r", "from": "p.yaml", "schema": "p.json"}`

const paragraphSchema = "rules:\n  Sentence: warning\n  Markup: other\n" +
	"layers:\n  characters:\n    punctuation: [comma, parentheses, comma]\n" +
	"  sentence:\n    words:\n      max: 25\n" +
	"  grammar:\n    modals: [can, must, will]\n    contractions: refused\n" +
	"  vocabulary:\n    core: c.yml\n" +
	"registers:\n  requirement:\n    grammar:\n      modals: [can, could, may, might, must, ought, shall, should, will, would]\n"

func TestParagraphWritesTheRulesItsLayersName(t *testing.T) {
	said := readOver(t, paragraphEntry, Texts{"p.yaml": paragraphSchema, "c.yml": "words:\n  - {word: alpha}\n"})
	for _, name := range []string{"Characters", "Sentence", "Modal", "Contraction", "Vocabulary"} {
		if _, held := said.Wanted["r/"+name+".yml"]; !held {
			t.Errorf("no %s.yml stands among %v", name, Paths(said.Wanted))
		}
	}
	for _, name := range []string{"ModalRequirement", "Latin", "PastTense", "Hedge", "Auxiliary"} {
		if _, held := said.Wanted["r/"+name+".yml"]; held {
			t.Errorf("%s.yml stands, and the schema asks for none", name)
		}
	}
}

func TestParagraphRulesTakeTheirSideAndTheBanner(t *testing.T) {
	said := readOver(t, paragraphEntry, Texts{"p.yaml": paragraphSchema})
	sentence := said.Wanted["r/Sentence.yml"]
	if !strings.HasPrefix(sentence, "# GENERATED.") || !strings.Contains(sentence, "\nlevel: warning\n") {
		t.Errorf("the sentence rule reads\n%s", sentence)
	}
	if !strings.Contains(sentence, "max: 25\n") {
		t.Errorf("the sentence rule carries no cap:\n%s", sentence)
	}
	if markup := said.Wanted["r/Markup.yml"]; !strings.Contains(markup, "\nlevel: error\n") {
		t.Error("a side outside error and warning reads as other than error")
	}
	if chars := said.Wanted["r/Characters.yml"]; !strings.Contains(chars, "`[^\\pL\\pN\\s\\,\\(\\)]`") {
		t.Errorf("the character rule's class reads wrong:\n%s", chars)
	}
	if _, held := said.Wanted["r/Vocabulary.yml"]; held {
		t.Error("the vocabulary rule stands, and no list names a word")
	}
}

func TestRestatedTableLooksUpRunsOfTheLengthItsLayerNames(t *testing.T) {
	schema := "rules:\n  RestatedTable: warning\nlayers:\n  restated:\n    table: 4\n"
	rule := readOver(t, paragraphEntry, Texts{"p.yaml": schema}).Wanted["r/RestatedTable.yml"]
	for _, want := range []string{"runsOf(wordsOf(one), 4)", "shares(mine, cell, 4)"} {
		if !strings.Contains(rule, want) {
			t.Errorf("the table rule carries no %s:\n%s", want, rule)
		}
	}
}

func TestParagraphFaultsNameAFieldOutsideTheShape(t *testing.T) {
	said := readOver(t, paragraphEntry, Texts{
		"p.yaml": "rules:\n  Markup: nonsense\n",
		"p.json": `{"type": "object", "required": ["kind"], "properties": {"rules": {"type": "object", "properties": {"Markup": {"enum": ["error", "warning"]}}}}}`,
	})
	want := []string{"p.yaml: kind is missing", `p.yaml: rules.Markup reads "nonsense", and the shape admits error, warning`}
	if !slices.Equal(said.Faults, want) {
		t.Errorf("the faults read %v, and want %v", said.Faults, want)
	}
}

func TestVocabularySwapsWinOverTheLists(t *testing.T) {
	lists := wordLists{
		core:  readYaml("words:\n  - {word: Beta-alpha}\n  - {word: utilize}\n  - {word: 9x}\n"),
		swaps: readYaml("swaps:\n  - {word: utilize, write: use}\n"),
	}
	if got := wordsOf(lists); !slices.Equal(got, []string{"alpha", "beta"}) {
		t.Errorf("the words read %v", got)
	}
}

func TestYamlReadsAFlowMapAndAQuotedItem(t *testing.T) {
	said := readYaml("list:\n  - {word: a, n: 3}\n  - 'x: y'\n  - k: v\n    m: [p, 'q, r']\nempty:\n")
	items := listOf(dig(said, "list"))
	if len(items) != 3 || dig(items[0], "n") != float64(3) || items[1] != "x: y" {
		t.Errorf("the list reads %v", items)
	}
	if got := listOf(dig(items[2], "m")); len(got) != 2 || got[1] != "q, r" {
		t.Errorf("the flow list reads %v", got)
	}
	if _, null := dig(said, "empty").(Null); !null {
		t.Error("a key with nothing under it reads as other than null")
	}
}

func TestNumbersPrintAsJavaScriptPrintsThem(t *testing.T) {
	for said, want := range map[float64]string{
		3: "3", -2.5: "-2.5", 1.5e-7: "1.5e-7", 1e21: "1e+21", math.NaN(): "NaN", math.Inf(1): "Infinity",
	} {
		if got := numberString(said); got != want {
			t.Errorf("%v prints %q, and node prints %q", said, got, want)
		}
	}
	for said, want := range map[string]string{"7": "7", " 0x1F ": "31", "": "0", "x": "NaN"} {
		if got := numberOf(said); got != want {
			t.Errorf("Number(%q) prints %q, and node prints %q", said, got, want)
		}
	}
}

func TestInheritsJoinsAJSONFileKeyByKey(t *testing.T) {
	method := Texts{"a.json": `{"x": {"p": 1, "q": 2}, "y": 1}`, "b.md": "method", "f/one.md": "1"}
	work := Texts{"a.json": `{"x": {"q": 3}}`, "b.md": "work", "f/two.md": "2"}
	tree := Inherits(method, work)
	if got := tree.Read("a.json"); got != "{\n  \"x\": {\n    \"p\": 1,\n    \"q\": 3\n  },\n  \"y\": 1\n}" {
		t.Errorf("the joined JSON reads\n%s", got)
	}
	if tree.Read("b.md") != "work" {
		t.Error("the method file wins over the work file")
	}
	if got := tree.List("f"); len(got) != 2 {
		t.Errorf("the folder lists %v, and the union holds two", got)
	}
}

// The Null mark, a zero and NaN read false in a condition, and a word reads true. [[spec/tickets/shared-helpers-stand-once]]
func TestAConditionReadsAsJavaScriptReadsIt(t *testing.T) {
	if holdsTrue(Null{}) || holdsTrue(nil) || holdsTrue(0.0) || holdsTrue(math.NaN()) || holdsTrue("") || !holdsTrue("x") || !holdsTrue(1.0) {
		t.Fatal("a condition reads otherwise than JavaScript reads it")
	}
}
