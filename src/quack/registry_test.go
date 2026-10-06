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
	t.Parallel()
	t.Run("a registered verb runs in Go", func(t *testing.T) {
		registersFor(t, "registry probe", twinSaying("go\n", &[]bool{}))
		reached := false
		doors, out, _ := roadOver(modeNew, "node\n", registry)
		doors.old = func(io.Writer) int { reached = true; return 0 }
		if code := verbs(doors, []string{"registry", "probe"}); code != 0 || out.String() != "go\n" || reached {
			t.Fatalf("the road answers %d, %q, node reached %v, and wants the Go answer alone", code, out.String(), reached)
		}
	})
	t.Run("an unregistered verb reaches the usage door", func(t *testing.T) {
		doors, out, _ := roadOver(modeNew, "usage\n", registry)
		if code := verbs(doors, []string{"registry", "unclaimed"}); code != 0 || out.String() != "usage\n" {
			t.Fatalf("the road answers %d, %q, and wants the usage door's answer", code, out.String())
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
	t.Run("a person's call to a registered verb runs the road in a child, under the person's environment", func(t *testing.T) {
		ran := false
		registersFor(t, "registry probe", func([]string, bool, io.Writer, io.Writer) int { ran = true; return 0 })
		was := selfPath
		selfPath = func() (string, error) { return "/no/such/quack", nil }
		t.Cleanup(func() { selfPath = was })
		_, err := nodeAccept(t.TempDir())(q.Request{Args: map[string]any{"words": []any{"registry", "probe"}, "person": true}})
		if ran {
			t.Fatal("a person's call runs the twin in the index's own process")
		}
		if err == nil {
			t.Fatal("the child road answers no fault, and the test binary takes no verb")
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
