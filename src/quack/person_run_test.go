// The node module runs a request a person marks with the harness variables
// taken out, so the verb reads a person's hand.
// [[spec/tickets/the-lens-calls-actions]]
package main

import (
	"os"
	"path/filepath"
	"testing"

	"quackitect/src/q"
)

func TestAPersonRunCarriesNoHarness(t *testing.T) {
	root := t.TempDir()
	verbs := filepath.Join(root, "src", "scripts", "verbs")
	if err := os.MkdirAll(verbs, 0o755); err != nil {
		t.Fatal(err)
	}
	program := "console.log(process.env.CLAUDECODE ?? \"none\");\n"
	if err := os.WriteFile(filepath.Join(verbs, "env.js"), []byte(program), 0o644); err != nil {
		t.Fatal(err)
	}
	t.Setenv("CLAUDECODE", "1")
	said, err := nodeAccept(root)(q.Request{Module: "node", Verb: "run", Args: map[string]any{"words": []any{"env"}, "person": true}})
	if err != nil || said != "none" {
		t.Fatalf("a person's run answers %v, %v, and wants none", said, err)
	}
}
