package main

import (
	"os"
	"path/filepath"
	"strings"
	"testing"
)

// THE DOOR IS DRIVEN OVER A TREE THIS TEST PLANTS, and never over the folder
// the repository happens to hold. A rule read off the live tree is green
// because nobody has broken it yet, which is evidence about the tree and no
// evidence at all about the rule.
//
// THE CLEAN CASES ARE WHAT MAKE THE REFUSALS EVIDENCE. A door refusing every
// verb it is handed would pass the planted cases for the wrong reason.
//
// THE VAR FORMS ARE PLANTED ON PURPOSE. The reader this door replaces matched
// fs.String, fs.Bool, fs.Int and fs.Duration and nothing else, so the very same
// gap declared with fs.StringVar, fs.BoolVar or fs.Var walked past it green.
func TestEveryFlagAVerbDeclaresHasALaneField(t *testing.T) {
	dir := t.TempDir()
	if err := os.MkdirAll(filepath.Join(dir, "src", "cage"), 0o755); err != nil {
		t.Fatal(err)
	}
	advertised := `{"tools":[
	  {"name":"se_work","inputSchema":{"properties":{
	    "title":{"type":"string"},"tracked":{"type":"boolean"},
	    "actor":{"type":"string"},"on":{"type":"string"},
	    "done_when":{"type":"array"}}}},
	  {"name":"se_status","inputSchema":{"properties":{"actor":{"type":"string"}}}},
	  {"name":"se_said","inputSchema":{"properties":{
	    "said":{"type":"string"},"actor":{"type":"string"}}}}
	]}`
	if err := os.WriteFile(filepath.Join(dir, "src", "cage", "tools.json"), []byte(advertised), 0o644); err != nil {
		t.Fatal(err)
	}
	roots := Roots{Work: dir, Method: dir}

	const aPlainGap = `	fs := flag.NewFlagSet("work", flag.ContinueOnError)
	fs.String("title", "", "what the work is, in four words at most")
	fs.String("bucket", "", "the bucket's name")
`

	refused := []struct {
		why  string
		rel  string
		text string
		says []string
	}{
		{
			why:  "the verb declares a flag the tool has no field for",
			rel:  "src/engine/work.go",
			text: aPlainGap,
			says: []string{"bucket", "se_work", "src/mcp/lane.go"},
		},
		{
			why: "the same gap is declared with the Var form the last reader could not see",
			rel: "src/engine/work.go",
			text: `	fs := flag.NewFlagSet("work", flag.ContinueOnError)
	fs.StringVar(&bucket, "bucket", "", "the bucket's name")
`,
			says: []string{"bucket", "se_work"},
		},
		{
			why: "a bool declared with BoolVar carries a dash the field writes as an underscore",
			rel: "src/engine/work.go",
			text: `	fs := flag.NewFlagSet("work", flag.ContinueOnError)
	fs.BoolVar(&needsHuman, "needs-human", false, "a person reads it first")
`,
			says: []string{"needs_human"},
		},
		{
			why: "a flag declared with fs.Var is a flag",
			rel: "src/engine/work.go",
			text: `	fs := flag.NewFlagSet("work", flag.ContinueOnError)
	fs.Var(&notes, "note", "one note. Repeat the flag for more")
`,
			says: []string{"note"},
		},
		{
			why: "a float is a flag, and no reader listing four methods saw one",
			rel: "src/engine/work.go",
			text: `	fs := flag.NewFlagSet("work", flag.ContinueOnError)
	fs.Float64("ratio", 0, "how much of the budget this takes")
`,
			says: []string{"ratio"},
		},
		{
			why: "the tool wraps its verb under another name, so name alone would hold it to nothing",
			rel: "src/engine/lane.go",
			text: `	fs := flag.NewFlagSet("state", flag.ContinueOnError)
	fs.Duration("since", 0, "how far back to read")
`,
			says: []string{"since", "state", "se_status"},
		},
		{
			why: "the second flag set in the file is read as its own verb",
			rel: "src/engine/lane.go",
			text: `	fs := flag.NewFlagSet("hold", flag.ContinueOnError)
	fs.String("id", "", "which token")
	fs = flag.NewFlagSet("state", flag.ContinueOnError)
	fs.Int("depth", 0, "how deep to read")
`,
			says: []string{"depth", "state"},
		},
	}
	for _, one := range refused {
		err := everyFlagAVerbDeclaresHasALaneField(roots, true, one.rel, one.text)
		if err == nil {
			t.Fatalf("the door passed a write where %s", one.why)
		}
		for _, word := range one.says {
			if !strings.Contains(err.Error(), word) {
				t.Fatalf("the refusal for the case where %s does not name %q: %s", one.why, word, err)
			}
		}
	}

	clean := []struct{ why, rel, text string }{
		{
			why: "every flag the verb declares has its field, whatever form declared it",
			rel: "src/engine/work.go",
			text: `	fs := flag.NewFlagSet("work", flag.ContinueOnError)
	fs.String("title", "", "what the work is, in four words at most")
	fs.BoolVar(&tracked, "tracked", false, "born where git carries it")
	fs.Var(&doneWhen, "done-when", "one done-when criterion. Repeat the flag for more")
`,
		},
		{
			why: "the shell's own flags say where the shell stands rather than what the verb does",
			rel: "src/engine/work.go",
			text: `	fs := flag.NewFlagSet("work", flag.ContinueOnError)
	fs.String("work", "", "the folder being worked on (default: this one)")
	fs.Bool("stdin", false, "read the token as JSON on standard input")
`,
		},
		{
			why: "a flag opening a door of its own, and the flag that travels with that door",
			rel: "src/engine/work.go",
			text: `	fs := flag.NewFlagSet("work", flag.ContinueOnError)
	fs.String("rename", "", "instead of minting: rename a bucket")
	fs.String("to", "", "with rename: what to write in it")
`,
		},
		{
			why: "the lane says by under its own name",
			rel: "src/engine/work.go",
			text: `	fs := flag.NewFlagSet("work", flag.ContinueOnError)
	fs.String("by", "", "who is minting it")
`,
		},
		{
			why: "the lane speaks as itself on a record verb, and says its text under another name",
			rel: "src/engine/recordverbs.go",
			text: `	fs := flag.NewFlagSet("said", flag.ContinueOnError)
	fs.String("text", "", "their sentence, whole")
	fs.String("actor", "", "who was told")
`,
		},
		{
			why: "the lane is answered the structure whatever the caller says",
			rel: "src/engine/lane.go",
			text: `	fs := flag.NewFlagSet("state", flag.ContinueOnError)
	fs.Bool("json", false, "answer as the structure rather than as a screen")
`,
		},
		{
			why: "a verb the lane does not wrap is not the lane's business",
			rel: "src/engine/lsp.go",
			text: `	fs := flag.NewFlagSet("lsp", flag.ExitOnError)
	fs.Int("port", 0, "the port to listen on")
`,
		},
		{
			why:  "a test file declares flag sets of its own that no tool wraps",
			rel:  "src/engine/work_test.go",
			text: aPlainGap,
		},
		{
			why:  "the write is not engine source at all",
			rel:  "src/mcp/lane.go",
			text: aPlainGap,
		},
		{
			why:  "the file opens no flag set",
			rel:  "src/engine/roots.go",
			text: "package main\n\nfunc nothing() {}\n",
		},
	}
	for _, one := range clean {
		if err := everyFlagAVerbDeclaresHasALaneField(roots, true, one.rel, one.text); err != nil {
			t.Fatalf("the door refused a write where %s: %s", one.why, err)
		}
	}

	// A TREE CARRYING NO GENERATED LIST IS ASKED NOTHING, because there is no
	// record of what the tools take to hold the verbs to.
	bare := t.TempDir()
	if err := everyFlagAVerbDeclaresHasALaneField(Roots{Work: bare, Method: bare}, true, "src/engine/work.go", aPlainGap); err != nil {
		t.Fatalf("the door refused a write over a tree that advertises no tools: %s", err)
	}
}
