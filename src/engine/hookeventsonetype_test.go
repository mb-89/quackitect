package main

import (
	"go/ast"
	"go/parser"
	"go/token"
	"os"
	"sort"
	"strconv"
	"strings"
	"testing"
)

// THE EVENT NAME IS A SET, SO IT IS A TYPE.
//
// The harness names its event in one field, and the engine read it as a bare
// string: thirteen cases in one switch, a second switch, seven comparisons,
// and three places where the name is written back out. A typo in any of them
// is silent. The case never fires, the compiler says nothing, and the event
// falls through to the default.
//
// writing-go rule four says a set of known strings is a named type with
// constants. A named string type does not make the compiler refuse a literal,
// because an untyped constant converts to it, so the rule is held here by
// reading the source rather than by the build.
//
// THE DECODE IS THE ONE EDGE WHERE AN UNCHECKED STRING ARRIVES. json.Unmarshal
// and the event named on the command line are that edge, and everything after
// it names a constant.
func TestHookEventsAreOneType(t *testing.T) {
	t.Parallel()
	fset := token.NewFileSet()
	hook, err := parser.ParseFile(fset, "hook.go", nil, 0)
	if err != nil {
		t.Fatalf("parsing hook.go: %v", err)
	}

	named := theEventFieldType(hook)
	switch named {
	case "":
		t.Fatal("hookIn has no Event field of a plain named type, so nothing holds the set")
	case "string":
		t.Fatal("hookIn.Event is declared string, so every event name in the engine is a bare literal")
	}
	if !declaresAStringType(hook, named) {
		t.Fatalf("hookIn.Event is declared %s, and hook.go declares no string type of that name", named)
	}

	events := theEventConstants(hook, named)
	if len(events) == 0 {
		t.Fatalf("%s carries no constants, so no case can name one", named)
	}

	// EVERY CASE OF THE SWITCH ON THE EVENT NAMES A CONSTANT OF THE TYPE.
	var bare []string
	cases := theEventSwitchCases(hook)
	if len(cases) == 0 {
		t.Fatal("no switch in hook.go reads the event, so this guard would pass for free")
	}
	for _, one := range cases {
		if lit, ok := one.(*ast.BasicLit); ok {
			bare = append(bare, "hook.go: case "+lit.Value)
			continue
		}
		id, ok := one.(*ast.Ident)
		if !ok {
			bare = append(bare, "hook.go: a case that is no constant of "+named)
			continue
		}
		if _, is := events[id.Name]; !is {
			bare = append(bare, "hook.go: case "+id.Name+" is no constant of "+named)
		}
	}

	// AND NO LITERAL IN THE PACKAGE SAYS AN EVENT NAME AGAIN.
	//
	// EVERY FILE OF IT, rather than a list of two written out here. The
	// property is about src/engine, and two names held it over two files: a
	// bare event name added anywhere else in the package is the exact thing
	// this guard is for, and it went unseen.
	known := map[string]bool{}
	for _, value := range events {
		known[value] = true
	}
	for _, name := range packageFilesHere(t) {
		file, err := parser.ParseFile(fset, name, nil, 0)
		if err != nil {
			t.Fatalf("parsing %s: %v", name, err)
		}
		for _, said := range stringsOutsideConstants(file) {
			if known[said] {
				bare = append(bare, name+": "+strconv.Quote(said))
			}
		}
	}

	sort.Strings(bare)
	if len(bare) > 0 {
		t.Fatalf("%d event names are bare strings rather than constants of %s: %s",
			len(bare), named, strings.Join(bare, ", "))
	}
}

// packageFilesHere answers the package's own source files, and refuses to
// report on too few, because a walk that finds nothing passes the guard above
// for free.
func packageFilesHere(t *testing.T) []string {
	t.Helper()
	entries, err := os.ReadDir(".")
	if err != nil {
		t.Fatal(err)
	}
	var names []string
	for _, e := range entries {
		name := e.Name()
		if e.IsDir() || !strings.HasSuffix(name, ".go") || strings.HasSuffix(name, "_test.go") {
			continue
		}
		names = append(names, name)
	}
	if len(names) < 50 {
		t.Fatalf("the walk found %d source files, so it is not reading the package", len(names))
	}
	return names
}

// theEventFieldType answers the type hookIn.Event is declared with, and the
// empty string where the field is missing or is no plain named type.
func theEventFieldType(file *ast.File) string {
	var got string
	ast.Inspect(file, func(n ast.Node) bool {
		spec, ok := n.(*ast.TypeSpec)
		if !ok || spec.Name.Name != "hookIn" {
			return true
		}
		st, ok := spec.Type.(*ast.StructType)
		if !ok {
			return false
		}
		for _, field := range st.Fields.List {
			for _, name := range field.Names {
				if name.Name != "Event" {
					continue
				}
				if id, ok := field.Type.(*ast.Ident); ok {
					got = id.Name
				}
			}
		}
		return false
	})
	return got
}

// declaresAStringType says whether the file declares that name as a string.
func declaresAStringType(file *ast.File, named string) bool {
	found := false
	ast.Inspect(file, func(n ast.Node) bool {
		spec, ok := n.(*ast.TypeSpec)
		if !ok || spec.Name.Name != named {
			return true
		}
		if id, ok := spec.Type.(*ast.Ident); ok && id.Name == "string" {
			found = true
		}
		return false
	})
	return found
}

// theEventConstants answers the constants declared of that type, by their name
// and the string each one stands for.
func theEventConstants(file *ast.File, named string) map[string]string {
	out := map[string]string{}
	for _, decl := range file.Decls {
		gen, ok := decl.(*ast.GenDecl)
		if !ok || gen.Tok != token.CONST {
			continue
		}
		for _, s := range gen.Specs {
			spec, ok := s.(*ast.ValueSpec)
			if !ok {
				continue
			}
			id, ok := spec.Type.(*ast.Ident)
			if !ok || id.Name != named {
				continue
			}
			for i, name := range spec.Names {
				if i >= len(spec.Values) {
					continue
				}
				lit, ok := spec.Values[i].(*ast.BasicLit)
				if !ok || lit.Kind != token.STRING {
					continue
				}
				if value, err := strconv.Unquote(lit.Value); err == nil {
					out[name.Name] = value
				}
			}
		}
	}
	return out
}

// theEventSwitchCases answers every case expression of every switch whose tag
// is the event field.
func theEventSwitchCases(file *ast.File) []ast.Expr {
	var out []ast.Expr
	ast.Inspect(file, func(n ast.Node) bool {
		sw, ok := n.(*ast.SwitchStmt)
		if !ok {
			return true
		}
		sel, ok := sw.Tag.(*ast.SelectorExpr)
		if !ok || sel.Sel.Name != "Event" {
			return true
		}
		for _, s := range sw.Body.List {
			if clause, ok := s.(*ast.CaseClause); ok {
				out = append(out, clause.List...)
			}
		}
		return true
	})
	return out
}

// stringsOutsideConstants answers every string literal in the file that is not
// part of a constant declaration, which is the one place the names are written
// out.
func stringsOutsideConstants(file *ast.File) []string {
	var out []string
	for _, decl := range file.Decls {
		if gen, ok := decl.(*ast.GenDecl); ok && gen.Tok == token.CONST {
			continue
		}
		ast.Inspect(decl, func(n ast.Node) bool {
			lit, ok := n.(*ast.BasicLit)
			if !ok || lit.Kind != token.STRING {
				return true
			}
			if value, err := strconv.Unquote(lit.Value); err == nil {
				out = append(out, value)
			}
			return true
		})
	}
	return out
}
