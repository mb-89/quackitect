package main

import (
	"encoding/json"
	"errors"
	"os"
	"path/filepath"
	"strings"
)

// THE PANEL DRAWS MARKS, NOT NAMES.
//
// A control in the parameter tree carries no glyph of its own. It carries the
// name of one, and the panel resolves that name against the icon table before
// it draws. The panel reads both files itself rather than asking the engine, so
// it needs the table as much as it needs the tree, and a name with no entry
// behind it is not something it reports: it falls back to drawing the name, and
// the sidebar shows the word power where the power mark belongs. Nobody learns
// that until they open the sidebar and read it.
//
// THE CHECK THAT STOOD HERE COULD NOT FAIL. It resolved every label to its
// glyph in its own copy of the tree and only then handed that copy to the
// panel, so the panel was given glyphs and asked whether it had drawn glyphs,
// which is the helper agreeing with itself. What survives of it is the half
// that can still be wrong, and it is the half the panel cannot answer: every
// name a label uses has an entry with a glyph behind it.
//
// IT IS DECIDED PER WRITE, OFF THE BYTES GOING IN, AND FROM EITHER SIDE. A name
// added to the declaration and a glyph dropped from the table leave the sidebar
// in the same state, so each of the two files is read against the other as it
// is written.
func everyLabelNamesADeclaredIcon(r Roots, _ bool, rel, text string) error {
	at := strings.TrimPrefix(filepath.ToSlash(rel), "./")
	if panelIconsIsOneOf(at, panelIconsTheDeclarations) {
		table, held := panelIconsTheTableOnDisk(r)
		if !held {
			// NO TABLE ON THIS CLONE IS NOT A BROKEN NAME. There is nothing
			// to hold the names against, and a door that refuses when it
			// cannot read is a wall.
			return nil
		}
		miss, found := panelIconsFirstUndeclared(text, table)
		if !found {
			return nil
		}
		return errors.New(at + " labels " + miss.on + " with the icon named " + miss.icon +
			", and the icon table declares no glyph under that name. The panel resolves a label " +
			"to its glyph before it draws and falls back to drawing the name itself when the " +
			"lookup misses, so this one turns into the word " + miss.icon + " sitting in the " +
			"sidebar where a mark belongs, and nobody finds out until they open it. Declare " +
			miss.icon + " in " + panelIconsTheTables[0] + ", with a glyph and the code point it " +
			"is at, or label that control with a name the table already carries.")
	}
	if panelIconsIsOneOf(at, panelIconsTheTables) {
		table, readable := panelIconsTableOf(text)
		if !readable {
			// A TABLE NOTHING CAN READ DECLARES NOTHING EITHER WAY, and what
			// is wrong with it is not this rule.
			return nil
		}
		declared, held := panelIconsTheDeclarationOnDisk(r)
		if !held {
			return nil
		}
		miss, found := panelIconsFirstUndeclared(declared, table)
		if !found {
			return nil
		}
		return errors.New(at + " declares no glyph under " + miss.icon + ", and " +
			panelIconsTheDeclarations[0] + " still labels " + miss.on + " with that name. The " +
			"panel resolves a label to its glyph before it draws and falls back to drawing the " +
			"name itself when the lookup misses, so taking the entry out turns that control into " +
			"the word " + miss.icon + " sitting in the sidebar where a mark belongs, and nobody " +
			"finds out until they open it. Keep the entry, with a glyph and the code point it is " +
			"at, or relabel every control that names it first and drop the entry after that.")
	}
	return nil
}

// WHERE THE TWO FILES LIVE. The folder has moved once already, so the older
// spelling stays and a tree that has not moved yet is held to the same rule.
// The first entry is the spelling a refusal tells the writer to use.
var panelIconsTheDeclarations = []string{"spec/config/parameters.json", "src/config/parameters.json"}

var panelIconsTheTables = []string{"spec/config/icons.json", "src/config/icons.json"}

// panelIconsIsOneOf says whether a written path is one of the files named.
func panelIconsIsOneOf(at string, named []string) bool {
	for _, one := range named {
		if at == one {
			return true
		}
	}
	return false
}

// panelIconsUse is one name a control asks the panel to draw, with the control
// that asked, so a refusal says where to go and not only what is missing.
type panelIconsUse struct {
	icon string
	on   string
}

// panelIconsNode is as much of the declaration as this rule reads. A node names
// one icon in label, or one per state in labels, and holds children.
type panelIconsNode struct {
	Name     string            `json:"name"`
	Label    string            `json:"label"`
	Labels   map[string]string `json:"labels"`
	Children []panelIconsNode  `json:"children"`
}

// panelIconsFirstUndeclared answers the first name in the declaration that the
// table has no glyph for, in the order the tree reads.
func panelIconsFirstUndeclared(declaration string, table map[string]json.RawMessage) (panelIconsUse, bool) {
	for _, use := range panelIconsNamesUsed(declaration) {
		if !panelIconsHasAGlyph(table, use.icon) {
			return use, true
		}
	}
	return panelIconsUse{}, false
}

// panelIconsNamesUsed walks the declaration for every icon a label asks for. A
// tree nothing can read asks for none, which leaves this rule quiet and the
// unreadable JSON to whatever door owns that.
func panelIconsNamesUsed(declaration string) []panelIconsUse {
	var tree panelIconsNode
	if err := json.Unmarshal([]byte(declaration), &tree); err != nil {
		return nil
	}
	var out []panelIconsUse
	var walk func(node panelIconsNode, at string)
	walk = func(node panelIconsNode, at string) {
		if node.Label != "" {
			out = append(out, panelIconsUse{icon: node.Label, on: at})
		}
		// THE STATES ARE READ IN A SETTLED ORDER. Ranging a map hands them
		// back in a different order every run, and a refusal that names a
		// different state each time is a refusal nobody can reproduce.
		states := make([]string, 0, len(node.Labels))
		for state := range node.Labels {
			states = append(states, state)
		}
		panelIconsSorted(states)
		for _, state := range states {
			if node.Labels[state] == "" {
				continue
			}
			out = append(out, panelIconsUse{icon: node.Labels[state], on: at + "." + state})
		}
		for _, child := range node.Children {
			walk(child, strings.TrimPrefix(at+"."+child.Name, "."))
		}
	}
	walk(tree, tree.Name)
	return out
}

// panelIconsSorted puts a short list of names in order, in place.
func panelIconsSorted(names []string) {
	for i := 1; i < len(names); i++ {
		for at := i; at > 0 && names[at] < names[at-1]; at-- {
			names[at], names[at-1] = names[at-1], names[at]
		}
	}
}

// panelIconsTableOf reads the icon table. Every entry is held unread, because
// the table also carries a comment at the top whose value is a sentence rather
// than an entry, and a reader that insisted on entries throughout would fail on
// the file as it stands.
func panelIconsTableOf(text string) (map[string]json.RawMessage, bool) {
	var table map[string]json.RawMessage
	if err := json.Unmarshal([]byte(text), &table); err != nil {
		return nil, false
	}
	return table, true
}

// panelIconsHasAGlyph says whether the table draws something for this name. An
// entry with no glyph in it is the same miss as no entry at all, because the
// panel reads the glyph off the entry and falls back to the name when it finds
// nothing there.
func panelIconsHasAGlyph(table map[string]json.RawMessage, name string) bool {
	raw, held := table[name]
	if !held {
		return false
	}
	var entry struct {
		Glyph string `json:"glyph"`
	}
	if err := json.Unmarshal(raw, &entry); err != nil {
		return false // the comment at the top of the table is a sentence, not an entry
	}
	return strings.TrimSpace(entry.Glyph) != ""
}

// panelIconsTheTableOnDisk reads the table this tree carries, in either of the
// places the folder has been.
func panelIconsTheTableOnDisk(r Roots) (map[string]json.RawMessage, bool) {
	text, held := panelIconsRead(r, panelIconsTheTables)
	if !held {
		return nil, false
	}
	return panelIconsTableOf(text)
}

// panelIconsTheDeclarationOnDisk reads the parameter tree this tree carries.
func panelIconsTheDeclarationOnDisk(r Roots) (string, bool) {
	return panelIconsRead(r, panelIconsTheDeclarations)
}

// panelIconsRead answers the first of the named files the work root holds.
func panelIconsRead(r Roots, named []string) (string, bool) {
	for _, one := range named {
		said, err := os.ReadFile(filepath.Join(r.Work, filepath.FromSlash(one)))
		if err != nil {
			continue
		}
		return string(said), true
	}
	return "", false
}
