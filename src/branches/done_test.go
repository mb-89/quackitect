// The leave: done refuses short of a green stamp, and the retro comes first.
// [[spec/tickets/work-verbs-port-to-go]]
package branches // level0: InPackageTest - it drives the unexported retroOpen and saysGreen through the tree fixture

import (
	"errors"
	"strings"
	"testing"
)

// Each verb meets a commit the hook refuses, stops red, names git's refusal, and moves no branch on origin. [[spec/tickets/done-refuses-on-refused-commit]]
func TestARefusedCommitStopsTheVerbBeforeThePush(t *testing.T) {
	t.Parallel()
	for verb, setup := range map[string]func(t *testing.T) (*tree, []string, string){
		"done": func(t *testing.T) (*tree, []string, string) {
			one, hub := pcDoneOnHub(t, nil)
			t.Cleanup(func() {
				if len(hub.sent) > 0 {
					t.Errorf("done sends %d requests after a refused commit", len(hub.sent))
				}
			})
			return one, []string{"done"}, workBranch + pcGroup
		},
		"release": func(t *testing.T) (*tree, []string, string) {
			one := newTree(t, nil)
			one.branch("g", map[string]string{ticketAt("g"): groupNote, ticketAt("kid"): childNote})
			if code := one.branchSays("take"); code != codeOK {
				t.Fatalf("the take answers %d: %s", code, one.errs.String())
			}
			return one, []string{"release"}, "work/g"
		},
		"open": func(t *testing.T) (*tree, []string, string) {
			return newTree(t, map[string]string{ticketAt("g"): groupNote}).desk(), []string{"open", "g"}, trunk
		},
		"close": func(t *testing.T) (*tree, []string, string) {
			one := newTree(t, map[string]string{ticketAt("landed"): withField(groupNote, cloudMark, "true")})
			paLanded(one, "work/landed")
			return one, []string{"close", "landed"}, "work/landed"
		},
	} {
		t.Run(verb, func(t *testing.T) {
			t.Parallel()
			one, argv, branch := setup(t)
			one.repo.Hook("pre-commit", func(string, string) error { return errors.New("the hook says no") })
			before, main := one.originAt(branch), one.originAt(trunk)
			if code := one.branchSays(argv...); code == codeOK {
				t.Fatalf("%s answers green over a refused commit: %s", verb, one.pcSaid())
			}
			holds(t, one.pcSaid(), "the hook says no")
			if one.originAt(branch) != before || one.originAt(trunk) != main {
				t.Fatalf("%s moves origin after a refused commit: %s", verb, one.pcSaid())
			}
			if strings.Contains(one.pcSaid(), "is closed") {
				t.Fatalf("%s says it closed: %s", verb, one.pcSaid())
			}
		})
	}
}

// A branch with no check stamp claims nothing. [[spec/design_output/work#the-battery-answers-first]]
func TestDoneWantsTheCheckOnHead(t *testing.T) {
	t.Parallel()
	one := newTree(t, nil)
	one.branch("g", map[string]string{ticketAt("g"): groupNote})
	one.cut("work/g", "origin/work/g")
	if code := one.branchSays("done"); code != codeRed {
		t.Fatalf("done answers %d", code)
	}
	holds(t, one.errs.String(), "work/g claims nothing yet: no check has run here.")
}

// The stamp reads green on its own commit alone, clean and with no warning. [[spec/design_output/work#the-battery-answers-first]]
func TestTheStampReadsGreenOnItsCommit(t *testing.T) {
	t.Parallel()
	if ok, _ := saysGreen(`{"sha":"abc","ok":true,"clean":true,"warnings":0}`, "abc"); !ok {
		t.Fatal("a green stamp reads red")
	}
	if _, says := saysGreen(`{"sha":"abc","ok":true,"clean":true}`, "def"); says != "the check ran against abc" {
		t.Fatalf("another commit reads %q", says)
	}
	if _, says := saysGreen(`{"sha":"abc","ok":true,"clean":true,"warnings":2,"files":["a"]}`, "abc"); says != "2 warning(s) stand in 1 file(s), which ./RUNME.sh lint names" {
		t.Fatalf("a warned stamp reads %q", says)
	}
}

// The retro's first unwritten leaf stops the leave, and a cloud leaf waits on a desk. [[spec/design_output/work#a-box-leaves]]
func TestTheRetroComesBeforeTheBoxLeaves(t *testing.T) {
	t.Parallel()
	one := newTree(t, nil)
	if open := one.d.retroOpen(groupNote); open != "retro/write" {
		t.Fatalf("the open retro reads %q", open)
	}
	written := withEntry(groupNote, entryRow("retro/write", "a", "b"))
	if open := one.d.retroOpen(written); open != "" {
		t.Fatalf("a written retro reads %q", open)
	}
}
