package main

import (
	"os"
	"path/filepath"
	"regexp"
	"strings"
	"testing"

	"quackitect/engine/internal/keyword"
)

// A CONTROL REACHABLE FROM A CHAT SAYS SO WHERE A PERSON READS ABOUT IT.
//
// The cloud has no panel, so a person on a box they are not sitting at reaches a
// control by writing its message into the chat. The tooltip is where they read
// what that message is, and a message nobody can find is a message nobody sends.
//
// THE LINE IS COPIED, NEVER COMPOSED. The engine derives it from the control's
// own name and puts it on the node. The panel draws what it was handed. Writing
// it into each title by hand would put one fact in two places, and the tooltip
// would drift from the message that works.
//
// SO THIS READS THE DERIVED LINE BACK THROUGH THE MATCHER. Every line a node
// carries is parsed the way a typed message is parsed, and the word it yields is
// looked for among the controls a console can reach. A drawn line that names
// nothing is the defect this exists to catch.
//
// Measured on 2026-09-06: the lines were derived and drawn in a test while the
// window a person was looking at had none of them, because the panel was fed the
// declaration off disk instead of the engine's tree. That half lives in the
// extension. This half holds the engine to answering a line that is a whole,
// sendable message.

// aTooltipTree plants a declaration and answers the tree the engine derives from
// it. Nothing here reads the live tree, so the mechanism is what is under test
// and not the product's list of controls.
func aTooltipTree(t *testing.T, declaration string) Node {
	t.Helper()
	dir := t.TempDir()
	config := filepath.Join(dir, "src", "config")
	if err := os.MkdirAll(config, 0o755); err != nil {
		t.Fatal(err)
	}
	write := func(name, body string) {
		if err := os.WriteFile(filepath.Join(config, name), []byte(body), 0o644); err != nil {
			t.Fatal(err)
		}
	}
	// The fixture carries its own icon table for the same reason it carries its
	// own tree.
	write("icons.json", `{"power":{"glyph":"P"},"hand":{"glyph":"H"}}`)
	write("parameters.json", declaration)
	root, err := LoadTree(dir)
	if err != nil {
		t.Fatal(err)
	}
	return root
}

// theDeclaredShape is what every line is. A line that is not KEYWORD:NAME or
// KEYWORD:NAME=VALUE is a second syntax nobody was told about.
var theDeclaredShape = regexp.MustCompile(`^KEYWORD:[A-Z0-9_]+(=.+)?$`)

// whatTheDrawnLinesGetWrong answers every complaint against the lines a tree
// hands the panel. An empty answer is a tree whose tooltips name messages the
// engine matches.
//
// A MEMBER THAT FINDS NOTHING TO READ COMPLAINS, rather than passing by having
// no line to fail.
func whatTheDrawnLinesGetWrong(root Node) []string {
	var said []string
	reachable := theReachable(root)
	claimed := map[string]string{}
	drawn := 0
	Walk(root, "", func(path string, n Node) {
		if len(n.Keywords) == 0 {
			return
		}
		// A CONTROL THAT CARRIES NO FLAG DRAWS NO LINE. Opening a window does
		// nothing for a person with only a chat, and a line written into the
		// declaration by hand is a second place one fact is kept.
		if !n.Console {
			said = append(said, path+" is reachable from no console and draws "+
				strings.Join(n.Keywords, " and "))
			return
		}
		for _, line := range n.Keywords {
			drawn++
			if !theDeclaredShape.MatchString(line) {
				said = append(said, path+" draws "+line+", which is not the declared shape")
			}
			m, ok := keyword.Parse(line)
			if !ok {
				said = append(said, path+" draws "+line+", and the matcher reads no word in it")
				continue
			}
			if _, ok := reachable[m.Word]; !ok {
				said = append(said, path+" draws "+line+", and "+m.Word+" reaches no control")
			}
			// AND NO TWO CONTROLS ANSWER TO ONE NAME. The engine keeps whichever
			// it walked last, in silence, and a person would move a control they
			// were not naming.
			if was, ok := claimed[m.Word]; ok && was != path {
				said = append(said, m.Word+" is claimed by "+was+" and by "+path+
					", and the later one wins in silence")
			} else {
				claimed[m.Word] = path
			}
		}
	})
	if drawn == 0 {
		said = append(said, "no control in this tree draws a line, so nothing was read")
	}
	return said
}

// theCleanTooltipTree is a tree whose every drawn line is a message the engine
// matches: a value, a number with its range, a rung, a gesture on that rung, a
// control reachable from no console, and an action that opens a window.
const theCleanTooltipTree = `{"name":"quackitect","type":"group","children":[
  {"name":"guards","type":"group","shown":true,"children":[
    {"name":"search_via_index","type":"bool","default":true,"console":true},
    {"name":"stop_needs_claim","type":"bool","default":true}]},
  {"name":"limits","type":"group","shown":true,"children":[
    {"name":"parallel_agents","type":"int","default":4,"min":0,"max":20,"console":true}]},
  {"name":"control","type":"group","shown":true,"children":[
    {"name":"unbind","type":"toggle","command":"quackitect.unbind","console":true,
     "gestureCommand":"quackitect.god",
     "titles":{"bound":"press to unbind","unbound":"press to bind"}},
    {"name":"work","type":"action","command":"quackitect.openWork"}]}]}`

// EVERY LINE THE PANEL IS HANDED IS A MESSAGE THE ENGINE MATCHES.
func TestEveryDrawnKeywordLineIsTheMessageTheEngineMatches(t *testing.T) {
	t.Parallel()
	if wrong := whatTheDrawnLinesGetWrong(aTooltipTree(t, theCleanTooltipTree)); len(wrong) != 0 {
		t.Fatalf("a clean tree was refused: %s", strings.Join(wrong, "; "))
	}
}

// A CONTROL NAMED WITH A SPACE DRAWS A LINE THE MATCHER CANNOT READ. The word is
// the control's own name in capitals, and the name half of a message carries no
// space, so the tooltip would invite a person to send a line that moves nothing.
func TestAKeywordLineTheMatcherCannotReadIsRefused(t *testing.T) {
	t.Parallel()
	planted := `{"name":"quackitect","type":"group","children":[
	  {"name":"control","type":"group","shown":true,"children":[
	    {"name":"stop everything","type":"bool","default":false,"console":true}]}]}`
	wrong := whatTheDrawnLinesGetWrong(aTooltipTree(t, planted))
	if len(wrong) == 0 {
		t.Fatal("a control named with a space drew a line nobody can send and nothing was said")
	}
	if !strings.Contains(strings.Join(wrong, "; "), "the matcher reads no word in it") {
		t.Fatalf("the complaint does not say the matcher cannot read the line: %s",
			strings.Join(wrong, "; "))
	}
}

// TWO CONTROLS CANNOT ANSWER TO ONE NAME. The word is derived from the node's
// own name, so two nodes named alike in different groups both claim it.
func TestTwoControlsClaimingOneKeywordAreRefused(t *testing.T) {
	t.Parallel()
	planted := `{"name":"quackitect","type":"group","children":[
	  {"name":"guards","type":"group","shown":true,"children":[
	    {"name":"god","type":"bool","default":false,"console":true}]},
	  {"name":"control","type":"group","shown":true,"children":[
	    {"name":"god","type":"toggle","command":"quackitect.god","console":true,
	     "titles":{"bound":"press for god","god":"press to come back"}}]}]}`
	wrong := whatTheDrawnLinesGetWrong(aTooltipTree(t, planted))
	if len(wrong) == 0 {
		t.Fatal("two controls claimed one word and nothing was said")
	}
	if !strings.Contains(strings.Join(wrong, "; "), "wins in silence") {
		t.Fatalf("the complaint does not name the clash: %s", strings.Join(wrong, "; "))
	}
}

// NOBODY WRITES A LINE INTO THE DECLARATION. The engine fills the lines on a
// control that says it is reachable and leaves a hand written list alone, so a
// line typed onto a control with no flag survives to the panel and draws a
// message that moves nothing.
func TestAHandWrittenKeywordLineIsRefused(t *testing.T) {
	t.Parallel()
	planted := `{"name":"quackitect","type":"group","children":[
	  {"name":"guards","type":"group","shown":true,"children":[
	    {"name":"search_via_index","type":"bool","default":true,"console":true},
	    {"name":"stop_needs_claim","type":"bool","default":true,
	     "keywords":["KEYWORD:STOP_NEEDS_CLAIM=OFF"]}]}]}`
	wrong := whatTheDrawnLinesGetWrong(aTooltipTree(t, planted))
	if len(wrong) == 0 {
		t.Fatal("a line was written into the declaration by hand and nothing was said")
	}
	if !strings.Contains(strings.Join(wrong, "; "), "is reachable from no console") {
		t.Fatalf("the complaint does not name the control that carries no flag: %s",
			strings.Join(wrong, "; "))
	}
}
