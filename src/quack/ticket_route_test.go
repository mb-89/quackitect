// The route verb writes the steps past the pointer and answers JSON on both
// roads, each case read off what src/scripts/ticket.js answers over the same
// tree, kept in testdata/ticket_route.json.
// [[spec/design_input/the-editor-draws-the-ticket#the-drawing-takes-an-edit]]
package main

import (
	"encoding/json"
	"os"
	"os/exec"
	"strings"
	"testing"
)

// A tree the JS ran over, the words it ran, and what it answered: its exit code, what it printed on each stream, and each file it changed. [[spec/tickets/ticket-verbs-port-to-go]]
type jsCase struct {
	Name    string             `json:"name"`
	Argv    []string           `json:"argv"`
	Files   map[string]*string `json:"files"`
	History *struct {
		Path  string   `json:"path"`
		Texts []string `json:"texts"`
	} `json:"history"`
	Want struct {
		Code  int                `json:"code"`
		Out   string             `json:"out"`
		Errs  string             `json:"errs"`
		Files map[string]*string `json:"files"`
	} `json:"want"`
}

// The files every case of a verb shares, and the cases. [[spec/tickets/ticket-verbs-port-to-go]]
type jsCases struct {
	Shared map[string]*string `json:"shared"`
	Cases  []jsCase           `json:"cases"`
}

// Runs every case of the file through the registry under ticket, and holds the Go answer to the JS answer byte for byte. [[spec/tickets/ticket-verbs-port-to-go]]
func runsJSCases(t *testing.T, at string) {
	t.Helper()
	said, err := os.ReadFile(at)
	if err != nil {
		t.Fatal(err)
	}
	var held jsCases
	if err := json.Unmarshal(said, &held); err != nil {
		t.Fatal(err)
	}
	for _, one := range held.Cases {
		t.Run(one.Name, func(t *testing.T) {
			root := t.TempDir()
			if one.History != nil {
				gitsIn(t, root, "init", "-q")
				for _, text := range one.History.Texts {
					seedsFile(t, root, one.History.Path, text)
					gitsIn(t, root, "add", "-A")
					gitsIn(t, root, "commit", "-q", "-m", "a version")
				}
			}
			files := map[string]*string{}
			for path, text := range held.Shared {
				files[path] = text
			}
			for path, text := range one.Files {
				files[path] = text
			}
			for path, text := range files {
				if text != nil {
					seedsFile(t, root, path, *text)
				}
			}
			t.Setenv("QUACKITECT_ROOT", root)
			t.Setenv(workRootVar, "")
			words := append([]string{"ticket"}, one.Argv...)
			_, verb := twinOf(words, registry)
			if verb == nil {
				t.Fatalf("the registry holds no Go answer for %s", strings.Join(words, " "))
			}
			var out, errs strings.Builder
			if code := verb(words, false, &out, &errs); code != one.Want.Code {
				t.Errorf("the verb answers %d, and the JS answers %d", code, one.Want.Code)
			}
			if out.String() != one.Want.Out {
				t.Errorf("the verb prints\n%q\nand the JS prints\n%q", out.String(), one.Want.Out)
			}
			if errs.String() != one.Want.Errs {
				t.Errorf("the verb says\n%q\nand the JS says\n%q", errs.String(), one.Want.Errs)
			}
			for path, was := range files {
				want, changed := one.Want.Files[path]
				if !changed {
					want = was
				}
				got, stands := readsBack(t, root, path)
				switch {
				case want == nil && stands:
					t.Errorf("%s stands, and the JS leaves none", path)
				case want != nil && got != *want:
					t.Errorf("%s holds\n%s\nand the JS writes\n%s", path, got, *want)
				}
			}
		})
	}
}

// One git call in the case's tree, as a person with no config of their own. [[spec/tickets/ticket-verbs-port-to-go]]
func gitsIn(t *testing.T, root string, args ...string) {
	t.Helper()
	run := exec.Command("git", append([]string{"-c", "user.name=case", "-c", "user.email=case@case", "-c", "commit.gpgsign=false"}, args...)...)
	run.Dir = root
	if said, err := run.CombinedOutput(); err != nil {
		t.Fatalf("git %s: %v: %s", strings.Join(args, " "), err, said)
	}
}

func TestTicketRouteVerb(t *testing.T) { runsJSCases(t, "testdata/ticket_route.json") }
