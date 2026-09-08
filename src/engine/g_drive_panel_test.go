package main

import (
	"encoding/json"
	"fmt"
	"os"
	"path/filepath"
	"regexp"
	"sort"
	"strings"
	"testing"
)

// A TOGGLE DRAWN AT A POSITION IT NEVER DECLARED.
//
// The sidebar draws each toggle out of the parameter tree. The tree names the
// positions the control has and the label to draw at each one, and the panel
// picks a resting position while it builds the page. It picked the word off,
// which a control with three positions does not have, and with no label filed
// under that name it fell back to drawing the node's own name. The owner opened
// the sidebar and read the word unbind sitting where a mark belongs, on a
// button already resting at a position the tree had never described.
//
// THE CHECK THAT STOOD HERE DROVE THE PAGE IN A HEADLESS WINDOW. Most of it
// decided behaviour a person can see. Two of its cases read the extension
// source instead: one counted the statements that answer undefined and one
// looked for the word showAsked. Neither of those asks what the sidebar shows,
// so neither is carried over. What is carried over is the half the drawn page
// can answer on its own, held against the tree it was drawn from.
//
// THE TREE AND THE PAGE ARE BOTH PLANTED HERE, and this test never reads the
// live tree. A page read out of the repository is green because nobody has
// broken it yet, which is evidence about the tree and no evidence at all about
// the rule.

var drivePanelAButton = regexp.MustCompile(`(?is)<button\b([^>]*)>(.*?)</button>`)
var drivePanelAnID = regexp.MustCompile(`(?i)\bid="([^"]*)"`)
var drivePanelAState = regexp.MustCompile(`(?i)\bdata-state="([^"]*)"`)
var drivePanelATag = regexp.MustCompile(`(?is)<[^>]*>`)

// drivePanelToggle is one control the tree declares, with the label it asks for
// at each position it has.
type drivePanelToggle struct {
	name   string
	labels map[string]string
}

// drivePanelButton is one button the page drew, with the position it opened at
// and the words it put on itself.
type drivePanelButton struct {
	state string
	text  string
}

// drivePanelNode is as much of the parameter tree as this rule reads.
type drivePanelNode struct {
	Name     string            `json:"name"`
	Type     string            `json:"type"`
	Labels   map[string]string `json:"labels"`
	Children []drivePanelNode  `json:"children"`
}

// everyDrawnToggleRestsAtALabelItDeclares reads a drawn panel page the way a
// person reads the sidebar, and holds it against the tree it was drawn from.
// The position a button opens at has to be one the tree gave it, and the words
// on the button have to be the label filed under that position.
//
// A READER THAT FINDS NOTHING TO READ REFUSES. Both sides come out of what was
// planted rather than out of a list written here, so either can arrive empty,
// and an empty set passes every question below by having no member to fail one.
func everyDrawnToggleRestsAtALabelItDeclares(declaration, page string) error {
	declared, readable := drivePanelTogglesDeclared(declaration)
	if !readable {
		return fmt.Errorf("the parameter tree handed to the panel is not readable as JSON, so the " +
			"panel has no positions to draw a toggle at and falls back to whatever it invents, " +
			"which is how a button came to rest at a position nobody declared: write the tree as " +
			"JSON the panel can parse")
	}
	if len(declared) == 0 {
		return fmt.Errorf("the parameter tree declares no toggle at all, so this reader guards " +
			"nothing and would go green over any page whatsoever: declare the controls the sidebar " +
			"is meant to draw, each with the positions it has and a label at every one")
	}
	drawn := drivePanelButtonsDrawn(page)
	for _, one := range declared {
		button, found := drawn[one.name]
		if !found {
			return fmt.Errorf("the tree declares the toggle %s and the drawn page carries no button "+
				"under that name, so the one control the person reaches for is simply absent from "+
				"the sidebar and there is nothing to press: draw a button for %s, or take the "+
				"control out of the tree",
				one.name, one.name)
		}
		label, held := one.labels[button.state]
		if !held {
			return fmt.Errorf("the toggle %s opens at the position %q and the tree declares only the "+
				"positions %s, so the panel is resting the control somewhere it was never described "+
				"and has no label to draw there. That is how the word unbind came to sit in the "+
				"sidebar where a mark belongs: open the control at the first position it declares "+
				"rather than at a name assumed here, or declare %q in its labels",
				one.name, button.state, drivePanelNamed(one.labels), button.state)
		}
		if strings.TrimSpace(button.text) != label {
			return fmt.Errorf("the toggle %s rests at %q and draws %q, and the tree files the label "+
				"%q under that position, so the button is showing something other than what it was "+
				"given. Drawing the node's own name is what the panel does when the lookup misses, "+
				"and the person reads that name in the sidebar and cannot tell it from a label: "+
				"draw the label the tree declares for the position the button is at",
				one.name, button.state, strings.TrimSpace(button.text), label)
		}
	}
	return nil
}

// drivePanelTogglesDeclared walks the tree for every toggle in it, in the order
// the tree reads.
func drivePanelTogglesDeclared(declaration string) ([]drivePanelToggle, bool) {
	var tree drivePanelNode
	if err := json.Unmarshal([]byte(declaration), &tree); err != nil {
		return nil, false
	}
	var out []drivePanelToggle
	var walk func(node drivePanelNode)
	walk = func(node drivePanelNode) {
		if node.Type == "toggle" {
			out = append(out, drivePanelToggle{name: node.Name, labels: node.Labels})
		}
		for _, child := range node.Children {
			walk(child)
		}
	}
	walk(tree)
	return out, true
}

// drivePanelButtonsDrawn reads the buttons off the page by the name they carry.
// A button with no name on it is not one the tree asked for, so it is passed
// over rather than held to a rule it was never given.
func drivePanelButtonsDrawn(page string) map[string]drivePanelButton {
	out := map[string]drivePanelButton{}
	for _, one := range drivePanelAButton.FindAllStringSubmatch(page, -1) {
		id := drivePanelAnID.FindStringSubmatch(one[1])
		if id == nil {
			continue
		}
		state := ""
		if at := drivePanelAState.FindStringSubmatch(one[1]); at != nil {
			state = at[1]
		}
		out[id[1]] = drivePanelButton{state: state, text: drivePanelATag.ReplaceAllString(one[2], "")}
	}
	return out
}

// drivePanelNamed writes the declared positions in a settled order, so that a
// refusal names them the same way on every run and a person can reproduce it.
func drivePanelNamed(labels map[string]string) string {
	if len(labels) == 0 {
		return "none at all"
	}
	names := make([]string, 0, len(labels))
	for name := range labels {
		names = append(names, name)
	}
	sort.Strings(names)
	return strings.Join(names, ", ")
}

// drivePanelPlant writes a tree and a page into the folder the test owns and
// reads both back, so what the reader is handed came off a disk this test
// filled rather than out of a string beside it.
func drivePanelPlant(t *testing.T, dir, name, declaration, page string) (string, string) {
	t.Helper()
	said := func(what, body string) string {
		at := filepath.Join(dir, name+"-"+what)
		if err := os.WriteFile(at, []byte(body), 0o644); err != nil {
			t.Fatalf("planting %s: %v", at, err)
		}
		back, err := os.ReadFile(at)
		if err != nil {
			t.Fatalf("reading %s back: %v", at, err)
		}
		return string(back)
	}
	return said("tree.json", declaration), said("page.html", page)
}

// drivePanelATreeWith wraps controls in the two groups the sidebar tree always
// carries, so every planted case has the depth the real declaration has.
func drivePanelATreeWith(controls string) string {
	return `{"name":"quackitect","type":"group","children":[` +
		`{"name":"control","type":"group","shown":true,"children":[` + controls + `]}]}`
}

// drivePanelTheUnbindToggle is the control the incident happened on: three
// positions, one mark drawn at each.
const drivePanelTheUnbindToggle = `{"name":"unbind","type":"toggle","command":"quackitect.unbind",` +
	`"gesture":5,"gestureCommand":"quackitect.god",` +
	`"labels":{"bound":"U","unbound":"U","god":"U"}}`

// drivePanelTheAskToggle is the ordinary two position control beside it.
const drivePanelTheAskToggle = `{"name":"ask","type":"toggle","command":"quackitect.ask",` +
	`"labels":{"off":"asked","on":"asked"}}`

// drivePanelAPageWith is a drawn sidebar in the shape the panel emits.
func drivePanelAPageWith(body string) string {
	return "<html><body><div class=\"group\">\n" + body + "\n</div></body></html>\n"
}

func TestADrawnToggleRestingWhereTheTreeNeverPutItIsRefused(t *testing.T) {
	t.Parallel()
	dir := t.TempDir()
	for i, one := range []struct {
		why         string
		declaration string
		page        string
		says        []string
	}{
		{
			why: "the three position control opens at off, which it does not have, " +
				"and draws its own name, which is the incident this reader carries",
			declaration: drivePanelATreeWith(drivePanelTheUnbindToggle),
			page:        drivePanelAPageWith(`<button id="unbind" data-state="off">unbind</button>`),
			says:        []string{"unbind", "\"off\"", "bound, god, unbound"},
		},
		{
			why:         "the button rests at a declared position and still draws the node's own name",
			declaration: drivePanelATreeWith(drivePanelTheUnbindToggle),
			page:        drivePanelAPageWith(`<button id="unbind" data-state="bound">unbind</button>`),
			says:        []string{"unbind", "\"U\""},
		},
		{
			why:         "the two position control is left at a name the tree does not carry",
			declaration: drivePanelATreeWith(drivePanelTheAskToggle),
			page:        drivePanelAPageWith(`<button id="ask" data-state="good">asked</button>`),
			says:        []string{"ask", "\"good\"", "off, on"},
		},
		{
			why:         "the page carries no button at all for a declared toggle",
			declaration: drivePanelATreeWith(drivePanelTheUnbindToggle),
			page:        drivePanelAPageWith(`<span id="unbind">U</span>`),
			says:        []string{"unbind", "no button"},
		},
		{
			why:         "the button carries no position, so it rests at the empty name",
			declaration: drivePanelATreeWith(drivePanelTheAskToggle),
			page:        drivePanelAPageWith(`<button id="ask">asked</button>`),
			says:        []string{"ask", "off, on"},
		},
		{
			why:         "the second of two toggles is the one drawn wrong",
			declaration: drivePanelATreeWith(drivePanelTheAskToggle + "," + drivePanelTheUnbindToggle),
			page: drivePanelAPageWith(`<button id="ask" data-state="off">asked</button>` +
				`<button id="unbind" data-state="off">unbind</button>`),
			says: []string{"unbind", "\"off\""},
		},
		{
			why:         "the tree declares no toggle, so the reader would go green over any page",
			declaration: drivePanelATreeWith(`{"name":"mint","type":"text","command":"quackitect.mintWork"}`),
			page:        drivePanelAPageWith(`<button id="unbind" data-state="off">unbind</button>`),
			says:        []string{"no toggle at all"},
		},
		{
			why:         "the tree is not readable, so the panel had no positions to draw from",
			declaration: "{\"name\":\"quackitect\",\"type\":\"group\",",
			page:        drivePanelAPageWith(`<button id="unbind" data-state="bound">U</button>`),
			says:        []string{"not readable as JSON"},
		},
	} {
		tree, page := drivePanelPlant(t, dir, fmt.Sprintf("refused-%d", i), one.declaration, one.page)
		err := everyDrawnToggleRestsAtALabelItDeclares(tree, page)
		if err == nil {
			t.Fatalf("the reader passed a page where %s", one.why)
		}
		for _, word := range one.says {
			if !strings.Contains(err.Error(), word) {
				t.Fatalf("the refusal for the case where %s does not say %s: %s", one.why, word, err)
			}
		}
	}
}

// AND A PAGE THAT RESTS EVERY TOGGLE WHERE THE TREE PUT IT GOES THROUGH. A
// reader that refused every page would pass the planted cases above for the
// wrong reason, so each of these is a sidebar a person would want shipped.
func TestADrawnToggleRestingWhereTheTreePutItGoesThrough(t *testing.T) {
	t.Parallel()
	dir := t.TempDir()
	for i, one := range []struct{ why, declaration, page string }{
		{
			why:         "the three position control opens at a position it declares and draws its mark",
			declaration: drivePanelATreeWith(drivePanelTheUnbindToggle),
			page:        drivePanelAPageWith(`<button id="unbind" data-state="bound">U</button>`),
		},
		{
			why:         "the two position control opens down at off and draws the label filed there",
			declaration: drivePanelATreeWith(drivePanelTheAskToggle),
			page:        drivePanelAPageWith(`<button id="ask" data-state="off">asked</button>`),
		},
		{
			why:         "the same control has been pressed and now rests at the other position",
			declaration: drivePanelATreeWith(drivePanelTheAskToggle),
			page:        drivePanelAPageWith(`<button id="ask" data-state="on">asked</button>`),
		},
		{
			why:         "both toggles are drawn, each at a position of its own",
			declaration: drivePanelATreeWith(drivePanelTheAskToggle + "," + drivePanelTheUnbindToggle),
			page: drivePanelAPageWith(`<button id="ask" data-state="on">asked</button>` +
				`<button id="unbind" data-state="god">U</button>`),
		},
		{
			why:         "the button carries a title and a class beside its position",
			declaration: drivePanelATreeWith(drivePanelTheUnbindToggle),
			page: drivePanelAPageWith(
				`<button class="toggle" id="unbind" title="unbind" data-state="unbound">U</button>`),
		},
		{
			why:         "the label sits on its own line inside the button, the way the page emits it",
			declaration: drivePanelATreeWith(drivePanelTheUnbindToggle),
			page:        drivePanelAPageWith("<button id=\"unbind\" data-state=\"bound\">\n  U\n</button>"),
		},
		{
			why:         "a button the tree never declared is drawn beside the toggle and asks nothing",
			declaration: drivePanelATreeWith(drivePanelTheAskToggle),
			page: drivePanelAPageWith(`<button id="ask" data-state="off">asked</button>` +
				`<button id="refresh">go</button>`),
		},
	} {
		tree, page := drivePanelPlant(t, dir, fmt.Sprintf("clean-%d", i), one.declaration, one.page)
		if err := everyDrawnToggleRestsAtALabelItDeclares(tree, page); err != nil {
			t.Fatalf("the reader refused a page where %s: %s", one.why, err)
		}
	}
}
