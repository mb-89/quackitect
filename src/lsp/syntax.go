// A file that reads as no Go or no JSON, drawn in the problems panel before a
// build or a test finds it. Biome draws the same for JavaScript, so this stands
// beside it for the two kinds nothing else in the editor parses.
// [[spec/design_output/lsp]]
package main

import (
	"encoding/json"
	"go/parser"
	"go/scanner"
	"go/token"
	"strings"
)

const syntaxRule = "Syntax"

// [[spec/design_output/lsp]]
func syntaxFaults(tree *Tree, path string) []Finding {
	switch {
	case strings.HasSuffix(path, ".go"):
		return goFaults(path, tree.Read(path))
	case strings.HasSuffix(path, ".json"):
		return jsonFaults(path, tree.Read(path))
	}
	return nil
}

func goFaults(path, text string) []Finding {
	_, err := parser.ParseFile(token.NewFileSet(), path, text, parser.AllErrors)
	list, ok := err.(scanner.ErrorList)
	if !ok {
		return nil
	}
	out := []Finding{}
	for _, one := range list {
		said := fault(syntaxRule, path, one.Pos.Line, one.Msg+". The file reads as no Go.")
		said.Column = one.Pos.Column
		out = append(out, said)
	}
	return out
}

func jsonFaults(path, text string) []Finding {
	var held any
	err := json.Unmarshal([]byte(text), &held)
	if err == nil {
		return nil
	}
	line := 1
	if bad, ok := err.(*json.SyntaxError); ok {
		line = 1 + strings.Count(text[:min(int(bad.Offset), len(text))], "\n")
	}
	return []Finding{fault(syntaxRule, path, line, err.Error()+". The file reads as no JSON.")}
}

// [[spec/design_output/lsp]]
func syntaxSweep(tree *Tree) []Finding {
	out := []Finding{}
	for _, path := range tree.Paths() {
		if isDraft(path) {
			continue
		}
		out = append(out, syntaxFaults(tree, path)...)
	}
	return out
}
