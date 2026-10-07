// A verb registered from its own file runs in Go, and a verb nothing
// registers reaches node, on the road and through the node module alike.
// [[spec/tickets/quack-registers-each-verb]]
package main // level0: InPackageTest - a main package admits no outside test package

import (
	"fmt"
	"io"
	"os"
	"path/filepath"
	"regexp"
	"slices"
	"strings"
	"testing"

	verbsmodule "quackitect/src/modules/verbs"
	"quackitect/src/proc"
	"quackitect/src/q"
)

// Registers a twin under the words for one test, and drops it after. Its caller runs without t.Parallel, so the write and the drop end before a parallel case reads the registry. [[spec/tickets/quack-registers-each-verb]]
func registersFor(t *testing.T, words string, one twin) {
	t.Helper()
	register(words, one)
	t.Cleanup(func() { delete(registry, words) })
}

func TestVerbRegistry(t *testing.T) {
	t.Run("a person's run drops the harness and names its root", aPersonRunDropsTheHarnessAndNamesItsRoot)
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
		var roads [][]string
		fake := &proc.FakeRunner{Programs: map[string]proc.Program{fakeQuack: func(one proc.Command) proc.Said {
			roads = append(roads, one.Argv)
			return proc.Said{Out: "child\n"}
		}}}
		said, err := nodeAcceptOver(fake.Run, fakeSelf, t.TempDir())(q.Request{Args: map[string]any{"words": []any{"registry", "probe"}, "person": true}})
		if ran {
			t.Fatal("a person's call runs the twin in the index's own process")
		}
		if err != nil || said != "child" || len(roads) != 1 || !slices.Equal(roads[0][len(roads[0])-2:], []string{"registry", "probe"}) {
			t.Fatalf("a person's call answers %v, %v over the roads %q, and wants one child road answering child", said, err, roads)
		}
	})
	t.Run("a person's call whose road never starts answers its fault", func(t *testing.T) {
		registersFor(t, "registry probe", func([]string, bool, io.Writer, io.Writer) int { return 0 })
		fake := &proc.FakeRunner{}
		want := fake.Run(proc.Command{Argv: []string{fakeQuack}}).Err
		_, err := nodeAcceptOver(fake.Run, fakeSelf, t.TempDir())(q.Request{Args: map[string]any{"words": []any{"registry", "probe"}, "person": true}})
		if err == nil || !strings.Contains(err.Error(), want) {
			t.Fatalf("a road that never starts answers %v, and wants the fault %q", err, want)
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

// The topics whose every verb registers a twin under its two words, where the other topics register whole. [[spec/tickets/quack-registers-each-verb]]
var ownTwins = map[string]bool{"ticket": true, "retro": true}

// A verb's words, and the key of the twin they reach. [[spec/tickets/quack-registers-each-verb]]
type spelled struct {
	argv []string
	key  string
}

// Every verb the lists name, each topic's verbs among them, and the spellings no list names, by the twin each reaches. [[spec/tickets/quack-registers-each-verb]]
func everyVerb() []spelled {
	var out []spelled
	for _, one := range verbsmodule.Commands {
		out = append(out, spelled{[]string{one.Name}, one.Name})
	}
	for topic, list := range topics {
		for _, one := range list {
			key := topic
			if ownTwins[topic] {
				key = topic + " " + one.Name
			}
			out = append(out, spelled{[]string{topic, one.Name}, key})
		}
	}
	return append(out,
		spelled{[]string{"ticket", "new"}, "ticket new"},
		spelled{[]string{"branch", "list", "--queue"}, "branch list --queue"},
		spelled{[]string{"voice", "measure"}, "voice"},
		spelled{[]string{"start"}, "start"},
	)
}

func TestEveryVerbResolvesToARegisteredAnswer(t *testing.T) {
	t.Parallel()
	for _, one := range everyVerb() {
		argv := append(one.argv, "a-word")
		if key, found := twinOf(argv, registry); found == nil || key != one.key {
			t.Errorf("%v reaches the twin %q, and wants %q", one.argv, key, one.key)
		}
		if road := roadOf(modeNew, argv, registry); road != toQuack {
			t.Errorf("%v takes the road %v under new, and wants quack", one.argv, road)
		}
	}
}

var registers = regexp.MustCompile(`register(?:Box)?\("([^"]+)"`)

// Every twin registers from one file, and twins.go alone holds more than one. [[spec/tickets/quack-registers-each-verb]]
func TestEveryVerbRegistersFromAFileOfItsOwn(t *testing.T) {
	t.Parallel()
	files, err := filepath.Glob("*.go")
	if err != nil {
		t.Fatal(err)
	}
	holders := map[string][]string{}
	for _, file := range files {
		if strings.HasSuffix(file, "_test.go") {
			continue
		}
		text, err := os.ReadFile(file)
		if err != nil {
			t.Fatal(err)
		}
		found := registers.FindAllStringSubmatch(string(text), -1)
		if len(found) > 1 && file != "twins.go" {
			t.Errorf("%s registers %d twins, and a verb registers from a file of its own", file, len(found))
		}
		for _, hit := range found {
			holders[hit[1]] = append(holders[hit[1]], file)
		}
	}
	for _, one := range everyVerb() {
		if said := holders[one.key]; len(said) != 1 {
			t.Errorf("%s registers from %v, and wants one file", one.key, said)
		}
	}
}
