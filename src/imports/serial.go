// The tests that run alone: a top-level test calling no t.Parallel and
// reaching no t.Setenv, t.Chdir or RunsAlone marker, which bar it from running beside the others.
// [[spec/guidance/code/testing]]
package imports

import (
	"go/ast"
	"slices"
	"strings"
)

// The calls that bar a test from running beside the others, each a write to state the whole process shares, and the call that runs it there. registersFor writes the verb registry quack's parallel cases read. [[spec/guidance/code/testing]]
var (
	barsParallel = []string{"Setenv", "Chdir", "registersFor"}
	parallelCall = "Parallel"
	testPrefix   = "Test"
	runsAlone    = "level0: RunsAlone - "
)

// The top-level tests of the files that run alone, though nothing bars them from running beside the others. [[spec/guidance/code/testing]]
func SerialTests(files []*ast.File) []string {
	bodies := map[string]*ast.BlockStmt{}
	tests := map[string]*ast.FuncDecl{}
	for _, file := range files {
		for _, decl := range file.Decls {
			fn, ok := decl.(*ast.FuncDecl)
			if !ok || fn.Body == nil {
				continue
			}
			bodies[fn.Name.Name] = fn.Body
			if fn.Recv == nil && strings.HasPrefix(fn.Name.Name, testPrefix) && takesT(fn) {
				tests[fn.Name.Name] = fn
			}
		}
	}
	barred := map[string]bool{}
	for _, file := range files {
		for _, decl := range file.Decls {
			if fn, ok := decl.(*ast.FuncDecl); ok && fn.Doc != nil && strings.Contains(fn.Doc.Text(), runsAlone) {
				barred[fn.Name.Name] = true
			}
		}
	}
	for grew := true; grew; {
		grew = false
		for name, body := range bodies {
			if !barred[name] && callsAny(body, func(called string) bool { return barred[called] || slices.Contains(barsParallel, called) }) {
				barred[name] = true
				grew = true
			}
		}
	}
	alone := []string{}
	for name, fn := range tests {
		if !barred[name] && !opensParallel(fn.Body) {
			alone = append(alone, name)
		}
	}
	slices.Sort(alone)
	return alone
}

// Whether a function takes a *testing.T alone, as a top-level test does. [[spec/guidance/code/testing]]
func takesT(fn *ast.FuncDecl) bool {
	params := fn.Type.Params.List
	if len(params) != 1 {
		return false
	}
	star, ok := params[0].Type.(*ast.StarExpr)
	if !ok {
		return false
	}
	named, ok := star.X.(*ast.SelectorExpr)
	return ok && named.Sel.Name == "T"
}

// Whether a statement of the body itself, and no subtest's, calls Parallel. [[spec/guidance/code/testing]]
func opensParallel(body *ast.BlockStmt) bool {
	for _, stmt := range body.List {
		if expr, ok := stmt.(*ast.ExprStmt); ok && callNamed(expr.X) == parallelCall {
			return true
		}
	}
	return false
}

// Whether the node calls a function or method the test names. [[spec/guidance/code/testing]]
func callsAny(node ast.Node, named func(string) bool) bool {
	found := false
	ast.Inspect(node, func(one ast.Node) bool {
		if found {
			return false
		}
		if called := callNamed(one); called != "" && named(called) {
			found = true
		}
		return !found
	})
	return found
}

// The name a call reaches, a function or a method, or nothing where the node calls nothing. [[spec/guidance/code/testing]]
func callNamed(node ast.Node) string {
	call, ok := node.(*ast.CallExpr)
	if !ok {
		return ""
	}
	switch fun := call.Fun.(type) {
	case *ast.Ident:
		return fun.Name
	case *ast.SelectorExpr:
		return fun.Sel.Name
	}
	return ""
}
