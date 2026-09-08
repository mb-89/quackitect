package main

import (
	"encoding/json"
	"errors"
	"fmt"
	"os"
	"path/filepath"
	"regexp"
	"strings"
	"testing"
)

// THE PANEL DRAWS THE REGISTER IT WAS HANDED, AND DERIVES NONE OF IT.
//
// The panel is where a person looks to see who is here. A table that made up
// its own rows, or kept the last ones, would look right in a screenshot and lie
// every other minute.
//
// THE STRIP USED TO DRAW THE REGISTER TOO. It put a line beside the gear for
// every working actor, so each agent was on the panel twice and the strip ran
// into the view's own title: a person opening the editor read an actor and a
// token where the name of the view belongs. An actor is drawn in the table and
// nowhere else now, and everything being on hold is the one thing the strip
// still carries, because that is a fact about the whole panel and names nobody.
//
// A TABLE THAT DRAWS NO ROW SAYS WHY. An empty hand draws no row, because a row
// saying only that somebody once pulled is a row a person cannot act on, so a
// register of idle workers empties the table. A table with no rows and no word
// reads as a panel that failed to load. Nobody here is a fact and the usual
// one, and a source nothing answers is a fault in the declaration, so the two
// have their own words and neither is drawn as silence.
//
// AND THE DECLARATION IS WHAT CHOOSES THE COLUMNS. A widget with the columns
// written into it is a second place the panel is decided, and the declaration
// would no longer say what the panel shows.
//
// WHAT THIS DOES NOT CARRY. The rule this replaces rendered the panel twice
// from two different answers and held each page to the one it was given, so
// that a page keeping its last rows failed. That needs the bundled TypeScript,
// which no Go process runs. What survives is the half that can be read off the
// two files: the strip reaches for no register, the table keeps both of its
// words, and every declared table names a list the panel answers and columns to
// draw it with.
func thePanelDrawsTheRegister(r Roots) error {
	panel, err := registerRead(r, registerThePanel)
	if err != nil {
		return err
	}
	answers := registerTheListsAnsweredIn(panel)
	if len(answers) == 0 {
		return errors.New(registerThePanel + " answers no register list, so this rule guards " +
			"nothing: the lists it holds the declaration to are read off the map the table draws " +
			"from, and a set with no member passes by having nothing to fail. Keep that map, " +
			"naming each list beside the answer it is read out of.")
	}
	strip, found := registerTheBlockIn(panel, registerTheStripIsCalled)
	if !found {
		return errors.New(registerThePanel + " has no " + registerTheStripIsCalled + ", so this " +
			"rule guards nothing: the half that holds the strip to naming nobody has no strip to " +
			"read. Keep the strip under that name, or teach this rule the name it goes by now.")
	}
	if named := registerTheListsReachedIn(strip, answers); len(named) > 0 {
		return fmt.Errorf("%s draws the register inside %s: it reaches for %s, which is the list "+
			"the table already draws. The strip used to put a line beside the gear for every "+
			"working actor, so each agent was on the panel twice and the strip ran into the "+
			"view's own title, where a person read an actor and a token in place of the name of "+
			"the view. Draw an actor in the table and nowhere else, and leave the strip the one "+
			"fact about the whole panel that names nobody, which is whether everything is on hold.",
			registerThePanel, registerTheStripIsCalled, strings.Join(named, ", "))
	}
	body, found := registerTheBlockIn(panel, registerTheTableIsCalled)
	if !found {
		return errors.New(registerThePanel + " has no " + registerTheTableIsCalled + ", so this " +
			"rule guards nothing: the half that holds the table to saying why it drew no row has " +
			"no table to read. Keep the table under that name, or teach this rule the name it " +
			"goes by now.")
	}
	if !strings.Contains(body, registerSaysNobodyIsHere) {
		return fmt.Errorf("%s draws its rows in %s and no longer says %q when it has none. An "+
			"empty hand draws no row, so a register of workers that have pulled nothing empties "+
			"the table, and a table with no rows and no word reads as a panel that failed to "+
			"load. Nobody here is a fact rather than a fault, so draw that word beside the empty "+
			"table and let a person read it.",
			registerThePanel, registerTheTableIsCalled, registerSaysNobodyIsHere)
	}
	if !strings.Contains(body, registerSaysNoList) {
		return fmt.Errorf("%s draws its rows in %s and no longer says %q when the declaration "+
			"names a source nothing answers. An empty table there would read as nobody here, "+
			"which is a fact, where this is a fault in the declaration and wants fixing. Draw "+
			"that word and the name of the source that was asked for.",
			registerThePanel, registerTheTableIsCalled, registerSaysNoList)
	}
	declared, err := registerRead(r, registerTheDeclaration)
	if err != nil {
		return err
	}
	tables, err := registerTablesDeclaredIn(declared)
	if err != nil {
		return err
	}
	if len(tables) == 0 {
		return errors.New(registerTheDeclaration + " declares no table, so this rule guards " +
			"nothing: the tables it holds to the panel's lists are read out of the declaration, " +
			"and a set with no member passes by having nothing to fail. Declare the table the " +
			"register is drawn in, with the list it draws and the columns it draws it with.")
	}
	for _, one := range tables {
		if !registerIsOneOf(one.Source, answers) {
			return fmt.Errorf("%s declares the table %s over the list %q, and %s answers no such "+
				"list: it answers %s. The panel draws the words %q and the name it was asked for "+
				"where the register belongs, and nobody finds that out until they open the "+
				"sidebar. Declare the table over one of the lists the engine answers, or answer "+
				"the named list in the panel's map first.",
				registerTheDeclaration, one.Name, one.Source, registerThePanel,
				strings.Join(answers, ", "), registerSaysNoList)
		}
		if len(one.Columns) == 0 {
			return fmt.Errorf("%s declares the table %s with no column, so the panel draws a "+
				"heading row with nothing in it and a cell for nobody over a register that has "+
				"agents in it. The declaration is what chooses the columns, and a widget with "+
				"them written into it is a second place the panel is decided. Declare the "+
				"columns here, each with the field it draws and the title it draws over it.",
				registerTheDeclaration, one.Name)
		}
		for at, col := range one.Columns {
			if strings.TrimSpace(col.Field) == "" || strings.TrimSpace(col.Title) == "" {
				return fmt.Errorf("%s declares column %d of the table %s without both a field "+
					"and a title. The panel reads the cell off the field and draws the title "+
					"over it, so a column missing either is a blank heading or a blank column, "+
					"and the declaration stops saying what the panel shows. Give the column the "+
					"field it draws and the title a person reads.",
					registerTheDeclaration, at+1, one.Name)
			}
		}
	}
	return nil
}

// WHERE THE TWO FILES LIVE, and what the two halves of the panel are called.
// The names are read rather than guessed, and a name that is gone is refused out
// loud, because a rule that quietly found nothing would pass every tree.
const registerThePanel = "src/extension/panel.ts"

const registerTheDeclaration = "src/config/parameters.json"

const registerTheStripIsCalled = "doingRows"

const registerTheTableIsCalled = "tableBody"

// THE TWO WORDS AN EMPTY TABLE HAS TO SAY. One of them is a fact and the other
// is a fault, and drawing neither is the failure this rule is about.
const registerSaysNobodyIsHere = "nobody is here"

const registerSaysNoList = "no list called"

// registerRead answers one file under the work root.
func registerRead(r Roots, rel string) (string, error) {
	body, err := os.ReadFile(filepath.Join(r.Work, filepath.FromSlash(rel)))
	return string(body), err
}

// THE LISTS THE PANEL ANSWERS ARE THE ONES ITS MAP NAMES. The table looks its
// source up in that map, so the map is the whole of what a declaration may ask
// for, and it is read here rather than written down a second time.
var registerAListInTheMap = regexp.MustCompile(`(\w+)\s*:\s*doing\.\w+`)

func registerTheListsAnsweredIn(panel string) []string {
	for _, line := range strings.Split(panel, "\n") {
		if !strings.Contains(line, "const lists") {
			continue
		}
		out := []string{}
		for _, hit := range registerAListInTheMap.FindAllStringSubmatch(line, -1) {
			out = append(out, hit[1])
		}
		return out
	}
	return nil
}

// registerTheListsReachedIn answers every register list the given block of the
// panel reaches for off the engine's answer.
func registerTheListsReachedIn(block string, answers []string) []string {
	out := []string{}
	for _, name := range answers {
		if strings.Contains(block, "doing."+name) {
			out = append(out, name)
		}
	}
	return out
}

// registerTheBlockIn answers one named function of the panel, from its first
// line to the brace that closes it in the first column. A body that runs to the
// end of the file is answered whole, because a file that never closes the
// function is broken in a way this rule does not own.
func registerTheBlockIn(panel, name string) (string, bool) {
	at := strings.Index(panel, "function "+name+"(")
	if at < 0 {
		return "", false
	}
	rest := panel[at:]
	end := strings.Index(rest, "\n}")
	if end < 0 {
		return rest, true
	}
	return rest[:end], true
}

// registerIsOneOf says whether a name is one of those given.
func registerIsOneOf(name string, named []string) bool {
	for _, one := range named {
		if name == one {
			return true
		}
	}
	return false
}

// registerDeclaredNode is as much of the declared tree as this rule reads: a
// node may be a table, and a table names the list it draws and the columns it
// draws it with.
type registerDeclaredNode struct {
	Name    string `json:"name"`
	Type    string `json:"type"`
	Source  string `json:"source"`
	Columns []struct {
		Field string `json:"field"`
		Title string `json:"title"`
	} `json:"columns"`
	Children []registerDeclaredNode `json:"children"`
}

// registerTablesDeclaredIn answers every declared table, walking the tree the
// way the panel walks it.
func registerTablesDeclaredIn(text string) ([]registerDeclaredNode, error) {
	var top registerDeclaredNode
	if err := json.Unmarshal([]byte(text), &top); err != nil {
		return nil, err
	}
	out := []registerDeclaredNode{}
	var walk func(registerDeclaredNode)
	walk = func(node registerDeclaredNode) {
		if node.Type == "table" {
			out = append(out, node)
		}
		for _, kid := range node.Children {
			walk(kid)
		}
	}
	walk(top)
	return out, nil
}

// THE FILES BELOW ARE PLANTED, AND THE LIVE TREE IS NEVER READ. A rule read off
// the folder this repository happens to hold is green because nobody has broken
// it yet, which is evidence about the tree and no evidence at all about the
// rule. THE CLEAN CASES ARE WHAT MAKE THE REFUSALS EVIDENCE: a rule that refused
// every tree would pass a planted case for the wrong reason.
const theRegisterCleanTable = `// A LIVE TABLE DRAWS A LIST THE ENGINE ANSWERED, AND DERIVES NOTHING.
function tableBody(n: Node, doing: Happening): string {
  const lists: Record<string, Doing[] | undefined> = { present: doing.present, actors: doing.actors };
  const all = lists[n.source ?? ""];
  // AN EMPTY HAND DRAWS NO ROW, and the drop is here and not in the list, so
  // the staffing count still sees the worker the table hides.
  const rows = all?.filter((r) => r.id || r.state !== "waiting");
  if (!rows) {
    return '<div class="empty">no list called ' + esc(n.source ?? "") + '</div>';
  }
  const empty = rows.length ? "" : '<div class="empty">nobody is here</div>';
  return "<table>" + heads(n) + cells(rows) + "</table>" + empty;
}
`

const theRegisterCleanStrip = `
// A HOLD IS NOT AN ACTOR. It is one fact about the whole panel, so the strip
// carries it and names nobody.
function doingRows(doing: Happening): string {
  return doing.hold?.on ? '<div class="onhold">everything is on hold</div>' : "";
}
`

const theRegisterStripDrawingActors = `
function doingRows(doing: Happening): string {
  const lines = (doing.present ?? []).map((r) => '<div class="doing">' + esc(r.actor) + '</div>');
  return lines.join("");
}
`

const theRegisterCleanDeclaration = `{"name":"quackitect","type":"group","children":[
  {"name":"control","type":"group","children":[
    {"name":"agents","type":"table","source":"present","columns":[
      {"field":"actor","title":"agent"},
      {"field":"title","title":"working on","link":"id","empty":"holding"}]}]}]}
`

func TestThePanelDrawsTheRegister(t *testing.T) {
	clean := map[string]string{
		registerThePanel:       theRegisterCleanTable + theRegisterCleanStrip,
		registerTheDeclaration: theRegisterCleanDeclaration,
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
		says  []string
	}{
		{
			why:   "the strip draws a line for every working actor again",
			files: with(registerThePanel, theRegisterCleanTable+theRegisterStripDrawingActors),
			says:  []string{"doingRows", "present", "twice"},
		},
		{
			why: "the table no longer says nobody is here when it drew no row",
			files: with(registerThePanel, strings.Replace(theRegisterCleanTable,
				"nobody is here", "", 1)+theRegisterCleanStrip),
			says: []string{"nobody is here", "failed to load"},
		},
		{
			why: "the table no longer says which source nothing answered",
			files: with(registerThePanel, strings.Replace(theRegisterCleanTable,
				"no list called ", "", 1)+theRegisterCleanStrip),
			says: []string{"no list called", "declaration"},
		},
		{
			why: "the declaration draws the table over a list nothing answers",
			files: with(registerTheDeclaration, strings.Replace(theRegisterCleanDeclaration,
				`"source":"present"`, `"source":"nowhere"`, 1)),
			says: []string{"nowhere", "no list called", "present, actors"},
		},
		{
			why: "the declared table draws no column, so the widget would have to choose",
			files: with(registerTheDeclaration,
				`{"name":"quackitect","type":"group","children":[`+
					`{"name":"agents","type":"table","source":"present","columns":[]}]}`),
			says: []string{"no column", "agents"},
		},
		{
			why: "a declared column carries a field and no title to draw over it",
			files: with(registerTheDeclaration, strings.Replace(theRegisterCleanDeclaration,
				`{"field":"actor","title":"agent"}`, `{"field":"actor"}`, 1)),
			says: []string{"column 1", "title"},
		},
		{
			why: "the panel keeps no map, so there is no list to hold the declaration to",
			files: with(registerThePanel, strings.Replace(theRegisterCleanTable,
				"const lists", "const written", 1)+theRegisterCleanStrip),
			says: []string{"guards nothing", "panel.ts"},
		},
		{
			why:   "the panel has no strip, so the half about the strip would read nothing",
			files: with(registerThePanel, theRegisterCleanTable),
			says:  []string{"guards nothing", "doingRows"},
		},
		{
			why: "the panel has no table body, so the half about the two words would read nothing",
			files: with(registerThePanel, strings.Replace(
				theRegisterCleanTable+theRegisterCleanStrip,
				"function tableBody(", "function drawnRows(", 1)),
			says: []string{"guards nothing", "tableBody"},
		},
		{
			why: "the declaration declares no table at all",
			files: with(registerTheDeclaration,
				`{"name":"quackitect","type":"group","children":[]}`),
			says: []string{"guards nothing", "parameters.json"},
		},
	}
	for _, one := range refused {
		err := thePanelDrawsTheRegister(plant(one.files))
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
			why:   "the strip carries the hold, the table keeps both words, and the table drawn is over a list the panel answers",
			files: clean,
		},
		{
			why: "the strip names who put the panel on hold, which is a fact about the panel and not a row about an agent",
			files: with(registerThePanel, theRegisterCleanTable+`
function doingRows(doing: Happening): string {
  const by = doing.hold?.by ? ", by " + esc(doing.hold.by) : "";
  return doing.hold?.on ? '<div class="onhold">everything is on hold' + by + '</div>' : "";
}
`),
		},
		{
			why: "a second declared table draws the other list the panel answers",
			files: with(registerTheDeclaration, strings.Replace(theRegisterCleanDeclaration,
				`"empty":"holding"}]}]}]}`,
				`"empty":"holding"}]},`+
					`{"name":"everyone","type":"table","source":"actors","columns":[`+
					`{"field":"actor","title":"agent"}]}]}]}`, 1)),
		},
	}
	for _, one := range held {
		if err := thePanelDrawsTheRegister(plant(one.files)); err != nil {
			t.Fatalf("the rule refused a tree where %s: %s", one.why, err)
		}
	}
}
