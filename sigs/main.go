// Command sigs prints the top-level declarations of the Go package in a folder as JSON:
// name -> its declaration without bodies. Methods read as Type.Method. Test files are skipped.
// The benchmark uses it to name the interface a hidden test calls, for an ask that does not.
package main

import (
	"bytes"
	"encoding/json"
	"go/ast"
	"go/parser"
	"go/printer"
	"go/token"
	"os"
	"path/filepath"
	"strings"
)

func main() {
	dir := os.Args[1]
	fset := token.NewFileSet()
	out := map[string]string{}
	files, _ := filepath.Glob(filepath.Join(dir, "*.go"))
	for _, path := range files {
		if strings.HasSuffix(path, "_test.go") {
			continue
		}
		f, err := parser.ParseFile(fset, path, nil, parser.ParseComments)
		if err != nil {
			continue
		}
		for _, d := range f.Decls {
			switch decl := d.(type) {
			case *ast.FuncDecl:
				name := decl.Name.Name
				if decl.Recv != nil && len(decl.Recv.List) > 0 {
					name = recvName(decl.Recv.List[0].Type) + "." + name
				}
				body := decl.Body
				decl.Body = nil
				doc := decl.Doc
				decl.Doc = nil
				out[name] = render(fset, decl)
				decl.Body, decl.Doc = body, doc
			case *ast.GenDecl:
				for _, spec := range decl.Specs {
					switch s := spec.(type) {
					case *ast.TypeSpec:
						out[s.Name.Name] = "type " + render(fset, s)
					case *ast.ValueSpec:
						for i, n := range s.Names {
							kw := "var "
							if decl.Tok == token.CONST {
								kw = "const "
							}
							line := kw + n.Name
							if s.Type != nil {
								line += " " + render(fset, s.Type)
							}
							// A constant's value is part of its interface: a test may read the text it holds.
							if decl.Tok == token.CONST && i < len(s.Values) {
								if v := render(fset, s.Values[i]); len(v) <= 200 {
									line += " = " + v
								}
							}
							out[n.Name] = line
						}
					}
				}
			}
		}
	}
	enc := json.NewEncoder(os.Stdout)
	enc.SetIndent("", " ")
	_ = enc.Encode(out)
}

func recvName(e ast.Expr) string {
	switch t := e.(type) {
	case *ast.StarExpr:
		return recvName(t.X)
	case *ast.IndexExpr:
		return recvName(t.X)
	case *ast.IndexListExpr:
		return recvName(t.X)
	case *ast.Ident:
		return t.Name
	}
	return "?"
}

func render(fset *token.FileSet, n any) string {
	var b bytes.Buffer
	_ = printer.Fprint(&b, fset, n)
	return b.String()
}
