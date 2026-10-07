// The route verb writes the steps past the pointer and answers JSON on both
// roads, each case read off what src/scripts/ticket.js answers over the same
// tree, kept in testdata/ticket_route.json.
// [[spec/design_input/the-editor-draws-the-ticket#the-drawing-takes-an-edit]]
package main

import (
	"encoding/json"
	"os" // level0: OutsideInDoors - the case reads the JS answers the tree keeps under testdata, as a build check reads source
	"strings"
	"testing"

	"quackitect/src/modules/files"
	"quackitect/src/modules/git"
)

// A tree the JS ran over, the words it ran, and what it answered: its exit code, what it printed on each stream, and each file it changed. [[spec/tickets/ticket-verbs-port-to-go]]
type jsCase struct {
	Name    string             `json:"name"`
	Argv    []string           `json:"argv"`
	Files   map[string]*string `json:"files"`
	History *jsHistory         `json:"history"`
	Bare    bool               `json:"bare"`
	Want    struct {
		Code  int                `json:"code"`
		Out   string             `json:"out"`
		Errs  string             `json:"errs"`
		Files map[string]*string `json:"files"`
	} `json:"want"`
}

// The versions of one file a case commits in order, before the tree's files land. [[spec/tickets/ticket-verbs-port-to-go]]
type jsHistory struct {
	Path  string   `json:"path"`
	Texts []string `json:"texts"`
}

// The history and the files every case of a verb shares, and the cases. A case naming its own history takes that, and a bare case takes no git at all. [[spec/tickets/ticket-verbs-port-to-go]]
type jsCases struct {
	History *jsHistory         `json:"history"`
	Shared  map[string]*string `json:"shared"`
	Cases   []jsCase           `json:"cases"`
}

// Reads a file of JS cases. [[spec/tickets/ticket-verbs-port-to-go]]
func jsCasesAt(t *testing.T, at string) jsCases {
	t.Helper()
	said, err := os.ReadFile(at)
	if err != nil {
		t.Fatal(err)
	}
	var held jsCases
	if err := json.Unmarshal(said, &held); err != nil {
		t.Fatal(err)
	}
	return held
}

// Runs every case of the file through the registry under ticket, over the files each base file shares and then its own, and holds the Go answer to the JS answer byte for byte. [[spec/tickets/ticket-verbs-port-to-go]]
func runsJSCases(t *testing.T, at string, bases ...string) {
	t.Helper()
	shared := map[string]*string{}
	for _, base := range append(bases, at) {
		for path, text := range jsCasesAt(t, base).Shared {
			shared[path] = text
		}
	}
	held := jsCasesAt(t, at)
	held.Shared = shared
	for _, one := range held.Cases {
		t.Run(one.Name, func(t *testing.T) {
			root := t.TempDir()
			repo := standsInRepo(t, root)
			history := one.History
			if history == nil {
				history = held.History
			}
			if history != nil && !one.Bare {
				for _, text := range history.Texts {
					seedsFile(t, root, history.Path, text)
					commitsAll(t, repo, "a version")
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

// A FakeRepo over the case's folder, holding no commit yet, which every registered verb reaches over the case's run. The case runs alone, since it swaps a package value. [[spec/tickets/route-cases-hand-their-repo]]
func standsInRepo(t *testing.T, root string) *git.FakeRepo {
	t.Helper()
	repo := git.NewFakeRepo(files.NewDisk(root), caseNow)
	repo.Set("user.name", "case")
	repo.Set("user.email", "case@case")
	was := standingRepo
	standingRepo = func(string) git.Repo { return repo }
	t.Cleanup(func() { standingRepo = was })
	return repo
}

// Stages every path of the folder and commits it, and stops the case where the repository refuses. [[spec/tickets/quack-repos-meet-fake-git]]
func commitsAll(t *testing.T, repo *git.FakeRepo, message string) {
	t.Helper()
	if err := repo.AddAll(); err != nil {
		t.Fatal(err)
	}
	if _, err := repo.Commit(message, nil); err != nil {
		t.Fatal(err)
	}
}

func TestTicketRouteVerb(t *testing.T) { runsJSCases(t, "testdata/ticket_route.json") }
