// A verb registered from its own file runs in Go, and a verb nothing
// registers reaches node, on the road and through the node module alike.
// [[spec/tickets/quack-registers-each-verb]]
package main

import (
	"fmt"
	"io"
	"os"
	"strings"
	"testing"

	"quackitect/src/q"
)

// Registers a twin under the words for one test, and drops it after. [[spec/tickets/quack-registers-each-verb]]
func registersFor(t *testing.T, words string, one twin) {
	t.Helper()
	register(words, one)
	t.Cleanup(func() { delete(registry, words) })
}

func TestVerbRegistry(t *testing.T) {
	t.Run("a registered verb runs in Go", func(t *testing.T) {
		registersFor(t, "registry probe", twinSaying("go\n", &[]bool{}))
		reached := false
		doors, out, _ := roadOver(modeNew, "node\n", registry)
		doors.old = func(io.Writer) int { reached = true; return 0 }
		if code := verbs(doors, []string{"registry", "probe"}); code != 0 || out.String() != "go\n" || reached {
			t.Fatalf("the road answers %d, %q, node reached %v, and wants the Go answer alone", code, out.String(), reached)
		}
	})
	t.Run("an unregistered verb reaches node", func(t *testing.T) {
		doors, out, _ := roadOver(modeNew, "node\n", registry)
		if code := verbs(doors, []string{"registry", "unclaimed"}); code != 0 || out.String() != "node\n" {
			t.Fatalf("the road answers %d, %q, and wants the node answer", code, out.String())
		}
	})
	t.Run("the node module runs a registered verb in Go", func(t *testing.T) {
		registersFor(t, "registry probe", func(argv []string, dry bool, out, _ io.Writer) int {
			fmt.Fprintf(out, "go %s dry=%v\n", strings.Join(argv, " "), dry)
			return 0
		})
		said, err := nodeAccept(t.TempDir())(q.Request{Args: []any{"registry", "probe", "--all"}})
		if err != nil || said != "go registry probe --all dry=false" {
			t.Fatalf("the node module answers %q, %v, and wants the Go answer", said, err)
		}
	})
	t.Run("a registered verb failing answers an error through the node module", func(t *testing.T) {
		registersFor(t, "registry probe", func(_ []string, _ bool, _, errs io.Writer) int {
			fmt.Fprint(errs, "it breaks")
			return exitFailed
		})
		_, err := nodeAccept(t.TempDir())(q.Request{Args: []any{"registry", "probe"}})
		if err == nil || !strings.Contains(err.Error(), "it breaks") {
			t.Fatalf("the node module answers %v, and wants the verb's error", err)
		}
	})
	t.Run("the twins register through the registry", func(t *testing.T) {
		for _, words := range []string{"ticket yours", "retro notes", "branch list --queue"} {
			if registry[words] == nil {
				t.Fatalf("the registry holds no %s", words)
			}
		}
	})
	t.Run("the shared files name no registered verb", func(t *testing.T) {
		for _, shared := range []string{"verbs.go", "registry.go"} {
			text, err := os.ReadFile(shared)
			if err != nil {
				t.Fatal(err)
			}
			if strings.Contains(string(text), "register(\"") {
				t.Fatalf("%s registers a verb, and a verb registers from its own file", shared)
			}
			for words := range registry {
				if strings.Contains(string(text), `"`+words+`"`) {
					t.Fatalf("%s names the verb %s, and a port edits no shared line", shared, words)
				}
			}
		}
	})
	t.Run("the config group registers each of its verbs", func(t *testing.T) {
		for _, words := range []string{"config", "fix", "project", "rules", "standing", "doors"} {
			if registry[words] == nil {
				t.Fatalf("the registry holds no %s", words)
			}
		}
	})
	t.Run("a second registration of the same words panics", func(t *testing.T) {
		registersFor(t, "registry probe", twinSaying("", &[]bool{}))
		defer func() {
			if recover() == nil {
				t.Fatal("a second registration of registry probe stands, and wants a panic")
			}
		}()
		register("registry probe", twinSaying("", &[]bool{}))
	})
}
