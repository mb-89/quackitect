package main

import (
	"os"
	"path/filepath"
	"strings"
	"testing"

	"quackitect/engine/internal/keyword"
)

// EVERY COMMAND UNDER .claude/commands IS THE ENGINE'S ANSWER, UNCHANGED.
//
// The files are generated from the declared tree and they are in version
// control, so a clone carries them and a cloud box has the menu without
// starting anything. That is only true while what is committed is what the tree
// answers. A hand edited command would send a message that reaches no control,
// and the menu would offer it as though it worked.
//
// NOTHING HERE DERIVES A WORD. A second spelling of the keyword would be the
// very drift this exists to catch. The rows ask the writer to project into a
// planted tree, and then read what landed there.
//
// THE CHECK THAT SAID THIS JUDGED WHATEVER FOLDER IT WAS LAUNCHED FROM. It took
// the current directory as the tree, ran the engine over that directory, and
// asked git whether anything had moved. So it wrote to the very tree it was
// judging, and started from anywhere else it judged a tree nobody meant.
// Everything below is planted in a temporary folder, and the live tree is
// neither read nor written.

// theProjectedCommands answers what landed in the folder: the message each file
// sends, by file name.
func theProjectedCommands(t *testing.T, roots Roots) map[string]string {
	t.Helper()
	dir := filepath.Join(roots.Work, filepath.FromSlash(commandsFolder))
	entries, err := os.ReadDir(dir)
	if err != nil {
		t.Fatalf("no commands folder was written, so no console has a menu: %v", err)
	}
	out := map[string]string{}
	for _, e := range entries {
		b, err := os.ReadFile(filepath.Join(dir, e.Name()))
		if err != nil {
			t.Fatalf("%s cannot be read: %v", e.Name(), err)
		}
		out[e.Name()] = string(b)
	}
	if len(out) == 0 {
		t.Fatal("the folder is empty, so this test is judging nothing and is not doing its job")
	}
	return out
}

// A CLEAN TREE PROJECTS THE DECLARED KEYWORDS AND MOVES NOTHING TWICE. The
// lines are spelled out here rather than derived, because a test that asks the
// writer what it wrote would agree with any answer at all.
func TestAProjectedCommandMirrorsTheDeclaredKeyword(t *testing.T) {
	roots := aPlantedMethodRoot(t)
	if _, err := WriteCommands(roots); err != nil {
		t.Fatalf("the commands could not be written: %v", err)
	}
	files := theProjectedCommands(t, roots)
	want := map[string]string{
		"se-ctrl-control-ideation-on.md":     "KEYWORD:IDEATION=ON",
		"se-ctrl-control-ideation-off.md":    "KEYWORD:IDEATION=OFF",
		"se-ctrl-control-parallel-agents.md": "KEYWORD:PARALLEL_AGENTS=" + arguments,
	}
	for name, line := range want {
		text, ok := files[name]
		if !ok {
			t.Fatalf("no command named %s was written, and the tree answers its line", name)
		}
		if body := theBodyUnder(text); body != line {
			t.Errorf("%s sends %q, and the declaration answers %q", name, body, line)
		}
		if _, taken := keyword.Parse(theBodyUnder(text)); !taken {
			t.Errorf("%s sends a message the matcher does not take: %q", name, theBodyUnder(text))
		}
		head, _, cut := strings.Cut(strings.TrimPrefix(text, "---\n"), "---\n")
		if !cut {
			t.Errorf("%s carries no frontmatter: %q", name, text)
			continue
		}
		if !strings.Contains(head, generatedMark) {
			t.Errorf("%s warns no reader that an edit here is written over: %q", name, head)
		}
	}
	for name := range files {
		if _, wanted := want[name]; !wanted {
			t.Errorf("%s was written, and the declaration answers it no line", name)
		}
	}
	// AND WHAT IS ON DISK IS WHAT THE TREE ANSWERS, so projecting again moves
	// nothing. This is what the check asked git for, asked of a planted tree.
	moved, err := WriteCommands(roots)
	if err != nil {
		t.Fatalf("the commands could not be written again: %v", err)
	}
	if len(moved) != 0 {
		t.Errorf("projecting an untouched tree changed %v, so the writer does not settle", moved)
	}
}

// A HAND EDITED COMMAND IS FOUND AND PUT BACK. This is the planted case: the
// body is replaced with prose, which is what a person who meant to be helpful
// leaves behind, and the menu would then offer a command that moves nothing.
func TestAHandEditedCommandIsWrittenBackFromTheDeclaration(t *testing.T) {
	roots := aPlantedMethodRoot(t)
	if _, err := WriteCommands(roots); err != nil {
		t.Fatalf("the commands could not be written: %v", err)
	}
	dir := filepath.Join(roots.Work, filepath.FromSlash(commandsFolder))
	edited := filepath.Join(dir, "se-ctrl-control-ideation-off.md")
	handwritten := "---\ndescription: \"turn ideation off\"\n---\n\nplease turn ideation off\n"
	if err := os.WriteFile(edited, []byte(handwritten), 0o644); err != nil {
		t.Fatalf("the hand edit could not be planted: %v", err)
	}
	if _, taken := keyword.Parse(theBodyUnder(handwritten)); taken {
		t.Fatal("the planted body is already a keyword, so this test proves nothing")
	}
	moved, err := WriteCommands(roots)
	if err != nil {
		t.Fatalf("the commands could not be written again: %v", err)
	}
	if len(moved) != 1 || moved[0] != edited {
		t.Errorf("projecting over one hand edit changed %v, and only %s was edited", moved, edited)
	}
	b, err := os.ReadFile(edited)
	if err != nil {
		t.Fatalf("%s cannot be read: %v", edited, err)
	}
	if body := theBodyUnder(string(b)); body != "KEYWORD:IDEATION=OFF" {
		t.Errorf("%s still sends %q, and the declaration answers KEYWORD:IDEATION=OFF", edited, body)
	}
}
