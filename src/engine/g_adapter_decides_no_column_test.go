package main

import (
	"encoding/json"
	"fmt"
	"os"
	"path/filepath"
	"regexp"
	"strings"
	"testing"
)

// THE ADAPTER DECIDES NO COLUMN. THE DECLARATION AND THE ENGINE DO.
//
// Everything about a column comes from the declaration or from the engine: which
// columns there are, their headings, their widths, which one opens the note. Two
// decisions were once left in src/extension. editor.ts kept a list of property
// names that copied the engine's refusals, so a property the engine renamed left
// the copy offering an edit the engine refuses. panel.ts wrote one column width
// into its own stylesheet by the column's name, so a width was decided in a place
// src/config/parameters.json does not say.
//
// THE SETS ARE ASKED FOR, NOT LISTED. The property names are handed in off the
// engine's own pane answer and the columns are read out of the declaration, so a
// name added tomorrow is asked the same question. An empty set is refused rather
// than passed, because a set with no member passes by having nothing to fail.
//
// WHAT THIS DOES NOT CARRY. The rule this replaces had two further halves that
// render two editor pages and two panel pages and hold each renderer to the
// answer it was handed. Those need the bundled TypeScript, which no Go process
// runs, so they are not here.
func theAdapterDecidesNoColumn(r Roots, props []string) error {
	if len(props) == 0 {
		return fmt.Errorf("no property name was handed in, so this rule guards nothing: every name " +
			"it looks for comes off the engine's own pane answer, and a set with no member passes " +
			"by having nothing to fail. Ask the engine for the left pane of the work view and hand " +
			"in the names it answers.")
	}
	read := func(rel string) (string, error) {
		body, err := os.ReadFile(filepath.Join(r.Work, filepath.FromSlash(rel)))
		return string(body), err
	}
	for _, rel := range []string{"src/extension/editor.ts", "src/extension/extension.ts"} {
		source, err := read(rel)
		if err != nil {
			return err
		}
		if named := theOwnedNamesWrittenIn(props, source); len(named) > 0 {
			return fmt.Errorf("%s writes a property name the engine owns: %s. A list of names copied "+
				"into the adapter goes stale the moment the engine renames one, and the copy then "+
				"offers an edit the engine refuses. Read the locked map off the pane answer and draw "+
				"each cell the way that answer says, rather than naming a property here.",
				rel, strings.Join(named, ", "))
		}
	}
	declared, err := read("src/config/parameters.json")
	if err != nil {
		return err
	}
	fields, err := theColumnFieldsDeclaredIn(declared)
	if err != nil {
		return err
	}
	if len(fields) == 0 {
		return fmt.Errorf("src/config/parameters.json declares no table column, so this rule guards " +
			"nothing: the columns it looks for are read out of the declaration, and a set with no " +
			"member passes by having nothing to fail. Declare the table and the columns it draws " +
			"there.")
	}
	panelSource, err := read("src/extension/panel.ts")
	if err != nil {
		return err
	}
	if ruled := theDeclaredColumnsRuledIn(fields, panelSource); len(ruled) > 0 {
		return fmt.Errorf("src/extension/panel.ts rules a declared column by its own name: %s. A width "+
			"written into the stylesheet is decided in a place src/config/parameters.json does not "+
			"say, so the declaration stops being where a column's width lives. Put the width on the "+
			"declared column and draw it on the tag as a style, and leave the stylesheet to rules no "+
			"column name reaches.", strings.Join(ruled, ", "))
	}
	return nil
}

// aColumnDeclaration is as much of the declared tree as this rule reads: a node
// may be a table, and a table names the columns it draws.
type aColumnDeclaration struct {
	Type    string `json:"type"`
	Columns []struct {
		Field string `json:"field"`
	} `json:"columns"`
	Children []aColumnDeclaration `json:"children"`
}

// theColumnFieldsDeclaredIn answers the field of every column of every declared
// table, walking the tree the way the panel walks it.
func theColumnFieldsDeclaredIn(text string) ([]string, error) {
	var top aColumnDeclaration
	if err := json.Unmarshal([]byte(text), &top); err != nil {
		return nil, err
	}
	out := []string{}
	var walk func(aColumnDeclaration)
	walk = func(node aColumnDeclaration) {
		if node.Type == "table" {
			for _, one := range node.Columns {
				if one.Field != "" {
					out = append(out, one.Field)
				}
			}
		}
		for _, kid := range node.Children {
			walk(kid)
		}
	}
	walk(top)
	return out, nil
}

// A COMMENT IS PROSE ABOUT THE CODE AND NOT A DECISION, so both spellings of a
// comment come out before the names are looked for.
var aProseBlock = regexp.MustCompile(`(?s)/\*.*?\*/`)
var aProseLine = regexp.MustCompile(`(?m)//.*$`)

// A MESSAGE KIND IS THE ADAPTER'S OWN WORD. The messages between the two halves
// of the extension carry a type, and one of the kinds is called file, which is
// also a property. The discriminator names a message rather than a column, so it
// comes out too. RE2 carries no back reference, so each quote is spelled out
// rather than matched against the one that opened.
var aMessageKind = regexp.MustCompile("\\btype\\s*(?:===?|:)\\s*(?:'[^']*'|\"[^\"]*\"|`[^`]*`)")

// theAdapterSourceWithoutProse answers the source with everything that is talk
// rather than a decision taken out.
func theAdapterSourceWithoutProse(source string) string {
	out := aProseBlock.ReplaceAllString(source, "")
	out = aProseLine.ReplaceAllString(out, "")
	return aMessageKind.ReplaceAllString(out, "")
}

// theOwnedNamesWrittenIn answers every handed-in name the source writes as a
// string, whole, or as the head of a dotted one such as "file.", which is how a
// rule about a family of columns is written.
//
// EVERY QUOTE THIS SOURCE USES, AND IT USES ALL THREE. The rule this replaces
// read a double-quoted string alone, so 'status' and `status` walked past a door
// whose first line says no property name is written here, and src/extension
// carries hundreds of single quotes.
func theOwnedNamesWrittenIn(names []string, source string) []string {
	code := theAdapterSourceWithoutProse(source)
	out := []string{}
	for _, name := range names {
		at := regexp.MustCompile("['\"`]" + regexp.QuoteMeta(name) + "[.'\"`]")
		if at.MatchString(code) {
			out = append(out, name)
		}
	}
	return out
}

// theDeclaredColumnsRuledIn answers every declared column the stylesheet rules by
// its own name. THE NAME HAS TO END WHERE THE COLUMN DOES: a rule for td.actorish
// is a rule about something else, and RE2 carries no lookahead, so the character
// after the name is read rather than looked past.
func theDeclaredColumnsRuledIn(fields []string, source string) []string {
	out := []string{}
	for _, field := range fields {
		at := regexp.MustCompile(`\b(?:th|td)\.` + regexp.QuoteMeta(field) + `(?:[^\w-]|$)`)
		if at.MatchString(source) {
			out = append(out, field)
		}
	}
	return out
}

// THE SOURCES BELOW ARE PLANTED, AND THE LIVE TREE IS NEVER READ. A rule read
// off the folder this repository happens to hold is green because nobody has
// broken it yet, which is evidence about the tree and no evidence at all about
// the rule. THE CLEAN CASES ARE WHAT MAKE THE REFUSALS EVIDENCE: a rule that
// refused every tree would pass a planted case for the wrong reason.
const theDeclaredTables = `{"name":"quackitect","type":"group","children":[{"name":"control","type":"group","children":[{"name":"agents","type":"table","source":"present","columns":[{"field":"actor","title":"agent","width":"34%"},{"field":"title","title":"working on"}]}]}]}
`

const theCleanEditor = `// THE LOCKED MAP IS THE ENGINE'S ANSWER, and which cell may be edited is a
// question this file puts to that answer rather than a list it keeps.
export function editorHtml(panes, views, view) {
  const out = [];
  for (const col of panes[0].table.columns) {
    const why = panes[0].table.locked[col];
    out.push(why ? '<td class="locked" data-col="' + col + '">' : '<td data-col="' + col + '">');
  }
  return out.join("");
}
`

const theCleanExtension = `/* THE MESSAGE KIND IS THIS FILE'S OWN WORD. One of the kinds is called file,
   which is also a property, and a discriminator names a message rather than a
   column. */
export function activate(context) {
  panel.onDidReceiveMessage((message) => {
    if (message.type === "file") { openTheNote(message.at); }
    if (message.type === 'edit') { sendTheEdit(message.at, message.col, message.value); }
  });
}
`

const theCleanPanel = `th.locked { opacity: 0.6; }
.lamp { border-radius: 50%; }
export function panelHtml(node, open, heads, present) {
  const cells = node.columns.map((c) => '<th class="' + c.field + '"' + (c.width ? ' style="width:' + c.width + '"' : '') + '>');
  return cells.join("");
}
`

func TestTheAdapterDecidesNoColumn(t *testing.T) {
	props := []string{"status", "actor", "title", "file"}
	clean := map[string]string{
		"src/config/parameters.json": theDeclaredTables,
		"src/extension/editor.ts":    theCleanEditor,
		"src/extension/extension.ts": theCleanExtension,
		"src/extension/panel.ts":     theCleanPanel,
	}
	plant := func(files map[string]string) Roots {
		t.Helper()
		dir := t.TempDir()
		for rel, body := range files {
			at := filepath.Join(dir, filepath.FromSlash(rel))
			if err := os.MkdirAll(filepath.Dir(at), 0o755); err != nil {
				t.Fatal(err)
			}
			if err := os.WriteFile(at, []byte(body), 0o644); err != nil {
				t.Fatal(err)
			}
		}
		return Roots{Work: dir, Method: dir}
	}
	with := func(rel, body string) map[string]string {
		files := map[string]string{}
		for at, was := range clean {
			files[at] = was
		}
		files[rel] = body
		return files
	}

	refused := []struct {
		why   string
		files map[string]string
		props []string
		says  []string
	}{
		{
			why:   "the editor keeps a list of the names the engine refuses, in single quotes",
			files: with("src/extension/editor.ts", "const locked = ['status', 'actor'];\n"),
			props: props,
			says:  []string{"editor.ts", "status", "actor"},
		},
		{
			why:   "the adapter names a property in the third quote this source uses",
			files: with("src/extension/extension.ts", "if (col === `title`) { return false; }\n"),
			props: props,
			says:  []string{"extension.ts", "title"},
		},
		{
			why:   "the editor rules a family of columns by the head of a dotted name",
			files: with("src/extension/editor.ts", "if (key.startsWith(\"file.\")) { return false; }\n"),
			props: props,
			says:  []string{"editor.ts", "file"},
		},
		{
			why:   "the panel writes a declared column's width into its own stylesheet",
			files: with("src/extension/panel.ts", theCleanPanel+"th.actor { width: 34%; }\n"),
			props: props,
			says:  []string{"panel.ts", "actor", "parameters.json"},
		},
		{
			why:   "no property name was handed in, so the first half would guard nothing",
			files: clean,
			props: []string{},
			says:  []string{"guards nothing", "pane answer"},
		},
		{
			why:   "the declaration names no table column, so the second half would guard nothing",
			files: with("src/config/parameters.json", "{\"name\":\"quackitect\",\"type\":\"group\",\"children\":[]}\n"),
			props: props,
			says:  []string{"guards nothing", "parameters.json"},
		},
	}
	for _, one := range refused {
		err := theAdapterDecidesNoColumn(plant(one.files), one.props)
		if err == nil {
			t.Fatalf("the rule passed a tree where %s", one.why)
		}
		for _, word := range one.says {
			if !strings.Contains(err.Error(), word) {
				t.Fatalf("the refusal for the case where %s does not name %q: %s", one.why, word, err)
			}
		}
	}

	held := []struct {
		why   string
		files map[string]string
	}{
		{
			why:   "every column comes off the pane answer and every width off the declaration",
			files: clean,
		},
		{
			why: "the names are prose in a comment rather than a decision in the code",
			files: with("src/extension/editor.ts", theCleanEditor+
				"// The engine may refuse 'status' or \"actor\" or a family such as \"file.\", and\n"+
				"// this file never asks which.\n"),
		},
		{
			why:   "the stylesheet rules a class no declared column is named by",
			files: with("src/extension/panel.ts", theCleanPanel+"td.actorish { color: crimson; }\n"),
		},
	}
	for _, one := range held {
		if err := theAdapterDecidesNoColumn(plant(one.files), props); err != nil {
			t.Fatalf("the rule refused a tree where %s: %s", one.why, err)
		}
	}
}
