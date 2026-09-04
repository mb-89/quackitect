package main

import (
	"encoding/json"
	"os"
	"path/filepath"
	"strings"
	"testing"
)

// WHAT A PARAMETER SAYS ABOUT ITSELF IS PROSE, AND IT IS HELD TO THE PROSE
// RULES.
//
// THE OWNER, READING THE PANEL: what the fuck does that mean. Who wrote this.
// This did not go through the voice.
//
// It had not. The voice checker runs on the files a writer writes, and
// util/parameters.json is data, so every tooltip in the panel was written by
// whoever added the control and read by nobody. They came out in the engine's
// own nouns — a pull, a hold, a clamp — for a reader who has none of them, and
// the panel is the one surface a person meets before they know any of it.
//
// SO THE CHECKER IS POINTED AT THEM, and it is the SAME checker: the rules are
// data in util/voice-rules.json and this reads that file, rather than a second
// copy of the rules written in whatever language the panel is drawn in.
func TestEveryParameterSaysItselfInProse(t *testing.T) {
	t.Parallel()
	root := filepath.Join("..", "..")
	rules, err := LoadVoiceRules(root)
	if err != nil {
		t.Fatalf("the voice rules will not read: %v", err)
	}
	raw, err := os.ReadFile(filepath.Join(root, "util", "parameters.json"))
	if err != nil {
		t.Fatal(err)
	}
	var tree Node
	if err := json.Unmarshal(raw, &tree); err != nil {
		t.Fatal(err)
	}

	said := 0
	var walk func(n Node, path string)
	walk = func(n Node, path string) {
		where := strings.TrimPrefix(path+"."+n.Name, ".")
		for what, text := range map[string]string{"help": n.Help, "title": n.Title} {
			if strings.TrimSpace(text) == "" {
				continue
			}
			said++
			for _, breach := range rules.Check(text) {
				t.Errorf("%s %s: %s\n    %s", where, what, breach.String(), text)
			}
			// AND IT SAYS WHAT THE READER GETS FOR MOVING IT. A tooltip that
			// names the mechanism and stops leaves them no better off.
			if what == "help" && len(strings.Fields(text)) < 6 && !strings.HasSuffix(where, ".shown") {
				t.Errorf("%s help is %d words, which cannot say what moving it does: %q",
					where, len(strings.Fields(text)), text)
			}
		}
		for _, c := range n.Children {
			walk(c, where)
		}
	}
	walk(tree, "")
	if said < 15 {
		t.Fatalf("only %d strings were read, so this check is not covering the panel", said)
	}
}
