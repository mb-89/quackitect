package main

import (
	"bytes"
	"encoding/json"
	"os"
	"path/filepath"
	"strings"
	"testing"
)

// TWO VERBS, AND THE AGENT NAMES NO PROGRAM.
//
// The Go guidance told the agent to run four programs by name, and the
// engine's own rule is that you use the door the engine gives you. So there is
// a door: format puts the tree in the shape the tools agree on, and lint names
// what breaks a rule, over the tokens, the guidance and the Go alike.
//
// A PROGRAM THAT IS NOT THERE IS THE ENGINE'S ANSWER TO GIVE. An agent that
// names the program gets a tool error it cannot act on, and a box without the
// program answers differently from one that has it with nothing saying so.

// aGoModule writes a one-file module and answers its folder, because both
// verbs are run over the folders a go.mod names.
func aGoModule(t *testing.T, root, name, source string) string {
	t.Helper()
	dir := filepath.Join(root, name)
	if err := os.MkdirAll(dir, 0o755); err != nil {
		t.Fatal(err)
	}
	write := func(file, text string) {
		if err := os.WriteFile(filepath.Join(dir, file), []byte(text), 0o644); err != nil {
			t.Fatal(err)
		}
	}
	write("go.mod", "module "+name+"\n\ngo 1.24\n")
	write("main.go", source)
	return dir
}

func TestTheFormatVerbFormatsGo(t *testing.T) {
	root := t.TempDir()
	r := Roots{Method: root, Work: root}
	// A FILE gofmt WOULD CHANGE: the indentation is spaces where the tool
	// writes a tab, and the source is otherwise ordinary.
	crooked := "package main\n\nfunc main() {\n        println(\"hello\")\n}\n"
	dir := aGoModule(t, root, "crooked", crooked)

	format, there := run["format"]
	if !there {
		t.Fatal("the engine has no format verb, so nothing formats the tree on demand")
	}
	var out, errs bytes.Buffer
	code := format(&call{ctx: t.Context(), roots: r,
		args: []string{}, in: strings.NewReader(""), out: &out, err: &errs})
	said := out.String() + errs.String()
	if code != 0 {
		t.Fatalf("se format answered %d: %s", code, said)
	}

	after, err := os.ReadFile(filepath.Join(dir, "main.go"))
	if err != nil {
		t.Fatal(err)
	}
	if string(after) == crooked {
		t.Fatalf("the file is as it was, so nothing formatted it:\n%s", said)
	}
	if !strings.Contains(string(after), "\tprintln") {
		t.Errorf("the file was written and not by the formatter:\n%s", string(after))
	}
	if !strings.Contains(said, "main.go") {
		t.Errorf("the answer does not name the file it changed: %s", said)
	}
}

// AND THE LINT REACHES GO, not only the tokens and the guidance.
func TestTheLintVerbReachesGo(t *testing.T) {
	r := aTreeWithTheProcesses(t)
	// A PLANTED VET FINDING. Printf with a verb and no argument for it is
	// what vet exists to catch and what the compiler accepts.
	aGoModule(t, r.Method, "planted",
		"package main\n\nimport \"fmt\"\n\nfunc main() {\n\tfmt.Printf(\"%s\\n\")\n}\n")

	var out, errs bytes.Buffer
	run["lint"](&call{ctx: t.Context(), roots: r,
		args: []string{}, in: strings.NewReader(""), out: &out, err: &errs})
	var said struct {
		Findings []Finding `json:"findings"`
		Refused  []string  `json:"refused"`
	}
	if err := json.Unmarshal(out.Bytes(), &said); err != nil {
		t.Fatalf("the lint did not answer JSON: %v: %s", err, out.String()+errs.String())
	}
	vet := ""
	for _, f := range said.Findings {
		if strings.Contains(f.Says, "Printf") {
			vet = f.Says
		}
	}
	if vet == "" {
		t.Fatalf("the lint read the tokens and the guidance and no Go: %+v", said)
	}
}

// AND A BOX WITHOUT THE PROGRAM IS TOLD SO, rather than handed a tool error.
func TestAMissingProgramIsARefusal(t *testing.T) {
	r := aTreeWithTheProcesses(t)
	aGoModule(t, r.Method, "plain", "package main\n\nfunc main() {}\n")

	// THE PROGRAM IS HIDDEN, by handing the process a path with nothing on
	// it. This is what a box that never installed it looks like.
	t.Setenv("PATH", t.TempDir())

	var out, errs bytes.Buffer
	run["lint"](&call{ctx: t.Context(), roots: r,
		args: []string{}, in: strings.NewReader(""), out: &out, err: &errs})
	var said struct {
		Findings []Finding `json:"findings"`
		Refused  []string  `json:"refused"`
	}
	if err := json.Unmarshal(out.Bytes(), &said); err != nil {
		t.Fatalf("the lint did not answer JSON: %v: %s", err, out.String()+errs.String())
	}
	refusal := strings.Join(said.Refused, " | ")
	if !strings.Contains(refusal, "golangci-lint") {
		t.Fatalf("nothing says golangci-lint did not run: %+v", said)
	}
	// A REFUSAL SAYS WHAT TO DO ABOUT IT. A tool error names a path and a
	// syscall, and the reader is left to guess which of the two it is.
	if strings.Contains(refusal, "executable file not found") {
		t.Errorf("the answer is the operating system's error and not the engine's: %s", refusal)
	}
	for _, word := range []string{"not on this box", "install"} {
		if !strings.Contains(refusal, word) {
			t.Errorf("the refusal does not say %q, so it names no next move: %s", word, refusal)
		}
	}
}

// AND THE GUIDANCE NAMES THE VERBS AND NO PROGRAM.
func TestWritingGoNamesNoProgram(t *testing.T) {
	t.Parallel()
	b, err := os.ReadFile(filepath.Join("..", "..", "doc", "guidance",
		"software-development", "writing-go.md"))
	if err != nil {
		t.Fatal(err)
	}
	said := string(b)
	for _, program := range []string{"gofmt", "go vet", "go fix", "golangci-lint"} {
		if strings.Contains(said, program) {
			t.Errorf("writing-go names %q, and an agent that reads it runs a program "+
				"the engine is meant to name", program)
		}
	}
	for _, verb := range []string{"se format", "se lint"} {
		if !strings.Contains(said, verb) {
			t.Errorf("writing-go does not name %q, so nothing tells the agent which door to use", verb)
		}
	}
}
