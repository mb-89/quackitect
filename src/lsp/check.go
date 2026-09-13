// The one checker every front asks. The command line, the port and the editor
// each hand it a path or nothing, and each reads back the same findings.
// [[spec/design_output/lsp#one-checker-every-front-asks]]
package main

import (
	"os/exec"
	"strings"
)

type Checker struct {
	tree *Tree
}

func checkerAt(root string) *Checker {
	tree := treeAt(root)
	tree.Words = wordsHere(root)
	tree.Node = nodeHere()
	tree.Box = boxHere(root)
	return &Checker{tree: tree}
}

// [[spec/design_output/tree#the-rules-over-two-files]]
var readers = map[string][]func(*Tree) []Finding{
	Settings: {settingsNameBinaries, editorDrawsWriteRules, biomeOnWindows, extensionsOnOffer},
	Install:  {settingsNameBinaries, surveyNamesInstalls},
	ValeIni:  {editorDrawsWriteRules},
	Offered:  {extensionsOnOffer},
	ToolsAt:  {surveyFindsNode},
}

// [[spec/design_output/lsp#one-checker-every-front-asks]]
func (one *Checker) Over(path string) []Finding {
	where := relativeTo(one.tree.Root, path)
	if isDraft(where) {
		return nil
	}

	out := []Finding{}
	if strings.HasSuffix(where, ".md") {
		out = append(out, noteFaults(schemasIn(one.tree), where, one.tree.Read(where))...)
	}
	if part := overLong(where, one.tree.Words); part != "" {
		out = append(out, fault("NameHoldsTheWords", where, 1,
			part+" holds more than "+itoa(one.tree.Words)+" words. Rename it shorter."))
	}
	for _, rule := range readers[where] {
		out = append(out, rule(one.tree)...)
	}
	return sorted(out)
}

// [[spec/design_output/lsp#one-checker-every-front-asks]]
func (one *Checker) Sweep() []Finding {
	one.tree.Forgets()
	out := append(treeFaults(one.tree), schemaFaults(one.tree)...)
	return sorted(out)
}

func (one *Checker) Tree() *Tree { return one.tree }

func runs(name string, argv ...string) (string, error) {
	said, err := exec.Command(name, argv...).Output()
	return string(said), err
}
