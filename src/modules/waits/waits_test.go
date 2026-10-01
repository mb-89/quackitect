// A wait returns on the first signal it hears, a quiet span counts from the
// last change seen, and a wait with no signal returns at its cap. Each case
// runs over a fake clock whose pause moves it on.
// [[spec/tickets/find-and-wait-in-go]]
package waits

import (
	"fmt"
	"go/ast"
	"go/parser"
	"go/token"
	"os"
	"path/filepath"
	"testing"
	"time"

	"quackitect/src/q"
)

// The most pauses a case takes before it calls the wait an endless loop. [[spec/tickets/find-and-wait-in-go]]
const mostPauses = 600

// A clock standing still until a pause moves it on, and a hook each pause runs first. [[spec/tickets/find-and-wait-in-go]]
type fakeClock struct {
	t      *testing.T
	start  time.Time
	now    time.Time
	pauses int
	each   func(pauses int)
}

func (c *fakeClock) Now() time.Time { return c.now }

func (c *fakeClock) Pause(span time.Duration) {
	c.pauses++
	if c.pauses > mostPauses {
		c.t.Fatalf("the wait pauses %d times, and never returns", c.pauses)
	}
	if c.each != nil {
		c.each(c.pauses)
	}
	c.now = c.now.Add(span)
}

func (c *fakeClock) gone() time.Duration { return c.now.Sub(c.start) }

// An outside over a temp root, the fake clock, a cap and a quiet span, with no report and every process alive. [[spec/tickets/find-and-wait-in-go]]
func outsideOf(t *testing.T, most, quiet time.Duration) (Outside, *fakeClock) {
	t.Helper()
	start := time.Unix(1000, 0)
	clock := &fakeClock{t: t, start: start, now: start}
	return Outside{
		Root: t.TempDir(), Now: clock.Now, Pause: clock.Pause, Most: most, Quiet: quiet,
		Reported: func(string) bool { return false },
		Alive:    func(int) bool { return true },
	}, clock
}

// What the wait answers, as the caller reads it. [[spec/tickets/find-and-wait-in-go]]
func waited(t *testing.T, from Outside, in Wait) string {
	t.Helper()
	said, err := Accept(from)(q.Request{Module: Module, Verb: "wait", Args: in})
	if err != nil {
		return err.Error()
	}
	return fmt.Sprint(said)
}

// [[spec/tickets/find-and-wait-in-go]]
func seed(t *testing.T, root, path, text string) {
	t.Helper()
	if err := os.WriteFile(filepath.Join(root, path), []byte(text), 0o644); err != nil {
		t.Fatal(err)
	}
}

// [[spec/tickets/find-and-wait-in-go]]
func TestAWaitReturnsOnTheFirstSignal(t *testing.T) {
	from, clock := outsideOf(t, time.Minute, 5*time.Second)
	seed(t, from.Root, "a.txt", "one\n")
	from.Reported = func(agent string) bool { return agent == "a1" && clock.gone() >= 2*time.Second }
	said := waited(t, from, Wait{Agent: "a1", Files: []string{"a.txt"}})
	if want := "The helper a1 reports."; said != want {
		t.Errorf("the wait answers %q, and wants the report it hears first: %q", said, want)
	}
	if clock.gone() != 2*time.Second {
		t.Errorf("the wait returns after %s, and wants 2s, the second the report lands", clock.gone())
	}
}

// [[spec/tickets/find-and-wait-in-go]]
func TestQuietCountsFromTheLastChange(t *testing.T) {
	from, clock := outsideOf(t, time.Minute, 3*time.Second)
	seed(t, from.Root, "a.txt", "one\n")
	clock.each = func(pauses int) {
		if pauses == 2 {
			seed(t, from.Root, "a.txt", "one\ntwo\n")
		}
	}
	said := waited(t, from, Wait{Files: []string{"a.txt"}})
	if want := "The files a.txt stand quiet for 3s."; said != want {
		t.Errorf("the wait answers %q, and wants %q", said, want)
	}
	if clock.gone() != 5*time.Second {
		t.Errorf("the wait returns after %s, and wants 5s: the change at 2s, then 3s of quiet", clock.gone())
	}
}

// [[spec/tickets/find-and-wait-in-go]]
func TestAWaitReturnsAtItsCap(t *testing.T) {
	from, clock := outsideOf(t, 4*time.Second, time.Second)
	said := waited(t, from, Wait{Agent: "a1"})
	if want := "The wait reaches its cap of 4s, and no signal comes."; said != want {
		t.Errorf("the wait answers %q, and wants %q", said, want)
	}
	if clock.gone() != 4*time.Second {
		t.Errorf("the wait returns after %s, and wants its cap of 4s", clock.gone())
	}
}

// [[spec/tickets/find-and-wait-in-go]]
func TestAnOutputEndsWithItsProcess(t *testing.T) {
	from, clock := outsideOf(t, time.Minute, 30*time.Second)
	seed(t, from.Root, "out.log", "working\n")
	pid := float64(42)
	var asked []int
	from.Alive = func(one int) bool {
		asked = append(asked, one)
		return clock.gone() < time.Second
	}
	said := waited(t, from, Wait{Output: "out.log", Pid: &pid})
	if want := "The output out.log ends, because its process exits."; said != want {
		t.Errorf("the wait answers %q, and wants %q", said, want)
	}
	if len(asked) == 0 || asked[0] != 42 {
		t.Errorf("the wait asks after the processes %v, and wants 42", asked)
	}
}

// [[spec/tickets/find-and-wait-in-go]]
func TestAWaitWithNoSignalSaysWhatItTakes(t *testing.T) {
	from, clock := outsideOf(t, time.Minute, time.Second)
	said := waited(t, from, Wait{Files: []string{""}})
	if want := "wait takes an agent, an output or files to wait on."; said != want {
		t.Errorf("the wait answers %q, and wants %q", said, want)
	}
	if clock.pauses != 0 {
		t.Errorf("the wait pauses %d times with no signal, and wants none", clock.pauses)
	}
}

// The module reads the disk, so its source calls q.IO(), the flag the import rules read. [[spec/design_output/model#io-modules-are-modules]]
func TestTheModuleCarriesTheIOFlag(t *testing.T) {
	file, err := parser.ParseFile(token.NewFileSet(), "waits.go", nil, 0)
	if err != nil {
		t.Fatal(err)
	}
	found := false
	ast.Inspect(file, func(node ast.Node) bool {
		call, ok := node.(*ast.CallExpr)
		if !ok {
			return true
		}
		if pick, ok := call.Fun.(*ast.SelectorExpr); ok && pick.Sel.Name == "IO" {
			if named, ok := pick.X.(*ast.Ident); ok && named.Name == "q" {
				found = true
			}
		}
		return true
	})
	if !found {
		t.Error("waits.go calls no q.IO(), and the module reads the disk")
	}
}
