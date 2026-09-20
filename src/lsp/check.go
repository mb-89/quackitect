// The one checker every front asks. The command line, the port and the editor
// each hand it a path or nothing, and each reads back the same findings.
// [[spec/design_output/lsp#one-checker-every-front-asks]]
package main

import (
	"strings"
)

type Checker struct {
	tree *Tree
	// The runs the restated rules refuse, off the config. [[spec/design_output/lsp#a-second-copy-draws]]
	pointer int
	rule    int
}

func checkerAt(root string) *Checker {
	tree := treeAt(root)
	tree.Words = wordsHere(root)
	tree.Node = nodeHere()
	tree.Box = boxHere(root)
	pointer, rule := restatedHere(root)
	return &Checker{tree: tree, pointer: pointer, rule: rule}
}

// [[spec/design_output/tree#the-rules-over-two-files]]
var readers = map[string][]func(*Tree) []Finding{
	Settings:  {settingsNameBinaries, editorDrawsWriteRules, biomeOnWindows, extensionsOnOffer},
	Install:   {settingsNameBinaries, surveyNamesInstalls},
	ValeIni:   {editorDrawsWriteRules},
	EditorIni: {editorDrawsWriteRules},
	Offered:   {extensionsOnOffer},
	ToolsAt:   {surveyFindsNode},
}

// [[spec/design_output/lsp#one-checker-every-front-asks]]
func (one *Checker) Over(path string) []Finding {
	where := relativeTo(one.tree.Root, path)
	if isDraft(where) {
		return nil
	}

	out := []Finding{}
	if strings.HasSuffix(where, ".md") {
		out = append(out, noteFaults(one.tree, schemasIn(one.tree), where, one.tree.Read(where))...)
	}
	if part := overLong(where, one.tree.Words); part != "" {
		out = append(out, fault("NameHoldsTheWords", where, 1,
			part+" holds more than "+itoa(one.tree.Words)+" words. Rename it shorter."))
	}
	for _, rule := range readers[where] {
		out = append(out, rule(one.tree)...)
	}
	out = append(out, syntaxFaults(one.tree, where)...)
	// A pointer this file writes lands where it says, so the editor draws a dead one under the line. [[spec/design_output/lsp#every-pointer-resolves]]
	out = append(out, pointerFaultsIn(one.tree, placesIn(one.tree), where)...)
	// A note says again what another holds, so the rule reads the pair. [[spec/design_output/lsp#a-second-copy-draws]]
	if strings.HasSuffix(where, ".md") {
		out = append(out, restatedOver(one, where)...)
	}
	return sorted(out)
}

// [[spec/design_output/lsp#a-second-copy-draws]]
func restatedOver(one *Checker, where string) []Finding {
	out := []Finding{}
	for _, said := range one.restatedAll() {
		if said.File == where {
			out = append(out, said)
		}
	}
	return out
}

// [[spec/design_output/lsp#a-second-copy-draws]]
func (one *Checker) restatedAll() []Finding {
	return one.tree.Restated(func() []Finding {
		return restatedFaults(one.tree, one.pointer, one.rule)
	})
}

// [[spec/design_output/lsp#one-checker-every-front-asks]]
func (one *Checker) Sweep() []Finding {
	one.tree.Forgets()
	out := append(treeFaults(one.tree), schemaFaults(one.tree)...)
	out = append(out, syntaxSweep(one.tree)...)
	out = append(out, one.restatedAll()...)
	return sorted(out)
}

func (one *Checker) Tree() *Tree { return one.tree }
