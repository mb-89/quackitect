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
	// The tools the checker runs beside its own rules, or none where a case hands in none. [[spec/design_output/lsp#the-server-runs-the-tools]]
	outside *Outside
}

// The checker over the index. A fresh one walks the index again first, which the check asks for and the editor does not. [[spec/design_output/lsp#the-server-reads-the-index]]
func checkerAt(root string, fresh bool) (*Checker, error) {
	tree, err := treeAt(root, fresh)
	if err != nil {
		return nil, err
	}
	tree.Words = wordsHere(root)
	tree.Node = nodeHere()
	tree.Survey = surveyHere(root)
	tree.Box = boxHere(root)
	pointer, rule := restatedHere(root)
	return &Checker{tree: tree, pointer: pointer, rule: rule, outside: outsideAt(root)}, nil
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
	if isDraft(where) || isHistory(one.tree, where) {
		return nil
	}

	out := []Finding{}
	if strings.HasSuffix(where, ".md") {
		out = append(out, noteFaults(one.tree, schemasIn(one.tree), where, one.tree.Read(where))...)
		// An open buffer writing a field the verbs own warns, and a file no editor holds draws nothing here. [[spec/design_output/lsp#an-engine-field-warns]]
		out = append(out, engineFaults(one.tree, where)...)
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
	// And the anchor it names stands as a heading of the note it points at. [[spec/design_output/lsp#a-pointer-reaches-a-heading]]
	out = append(out, anchorFaults(one.tree, where)...)
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

// Every rule over the whole tree, which the sweep runs. [[spec/design_output/tree#what-a-rule-answers]]
var Rules = []func(*Tree) []Finding{
	settingsNameBinaries,
	editorDrawsWriteRules,
	biomeOnWindows,
	extensionsOnOffer,
	noLogDeleted,
	nameHoldsTheWords,
	nothingPrivateTravels,
	surveyNamesInstalls,
	surveyFindsNode,
	everyPointerResolves,
	groupAsksNobody,
}

// [[spec/design_output/tree#what-a-rule-answers]]
func treeFaults(tree *Tree) []Finding {
	out := []Finding{}
	for _, rule := range Rules {
		out = append(out, rule(tree)...)
	}
	return out
}

// [[spec/design_output/lsp#one-checker-every-front-asks]]
func (one *Checker) Sweep() []Finding {
	one.tree.Forgets()
	out := append(treeFaults(one.tree), schemaFaults(one.tree)...)
	out = append(out, syntaxSweep(one.tree)...)
	out = append(out, anchorSweep(one.tree)...)
	out = append(out, one.restatedAll()...)
	return sorted(pastHistory(one.tree, out))
}

func (one *Checker) Tree() *Tree { return one.tree }

// The whole list every front reads: this server's own rules, and the tools beside them. [[spec/design_output/lsp#one-checker-every-front-asks]]
func (one *Checker) Whole() []Finding {
	return sorted(append(one.Sweep(), one.OutsideSweep()...))
}

// The list over the paths named, each a file or a folder: this server's rules over every file, and the tools over the paths. [[spec/design_output/lsp#one-checker-every-front-asks]]
func (one *Checker) Reads(where []string) []Finding {
	found := []Finding{}
	for _, path := range pathsUnder(one.tree, where) {
		found = append(found, one.Over(path)...)
	}
	return sorted(append(found, one.OutsideOver(where)...))
}

// The tools over the whole tree, or nothing where the checker holds none. [[spec/design_output/lsp#the-server-runs-the-tools]]
func (one *Checker) OutsideSweep() []Finding {
	if one.outside == nil {
		return nil
	}
	return pastHistory(one.tree, one.outside.Sweep(one.tree))
}

// The tools over the paths named, or nothing where the checker holds none. [[spec/design_output/lsp#the-server-runs-the-tools]]
func (one *Checker) OutsideOver(where []string) []Finding {
	if one.outside == nil || len(where) == 0 {
		return nil
	}
	return pastHistory(one.tree, one.outside.Over(one.tree, where))
}
