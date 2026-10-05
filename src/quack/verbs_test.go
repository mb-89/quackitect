// The road hands each verb by the verbs slice's mode, and a twin in shadow
// writes a shadow row where it answers apart from the verb's program.
// [[spec/tickets/runme-hands-verbs-to-quack]]
package main

import (
	"fmt"
	"io"
	"os"
	"os/exec"
	"path/filepath"
	"strings"
	"testing"
)

// A twin answering the words it holds, and recording whether it ran dry. [[spec/tickets/runme-hands-verbs-to-quack]]
func twinSaying(said string, dry *[]bool) twin {
	return func(_ []string, isDry bool, out, _ io.Writer) int {
		*dry = append(*dry, isDry)
		fmt.Fprint(out, said)
		return 0
	}
}

func TestTheRoadHandsEachVerbByItsMode(t *testing.T) {
	twins := map[string]twin{"ticket yours": twinSaying("", &[]bool{})}
	cases := []struct {
		mode string
		argv []string
		want road
	}{
		{"old", []string{"get", "t/n"}, toQuack},
		{"old", []string{"run", "t/add"}, toQuack},
		{"old", []string{"ticket", "yours"}, toNode},
		{"old", []string{"config"}, toNode},
		{"", []string{"ticket", "yours"}, toNode},
		{"shadow", []string{"get", "t/n"}, toQuack},
		{"shadow", []string{"run", "t/add"}, toQuack},
		{"shadow", []string{"ticket", "yours", "--all"}, toBoth},
		{"shadow", []string{"ticket", "pull"}, toNode},
		{"shadow", []string{"config"}, toNode},
		{"new", []string{"get", "t/n"}, toQuack},
		{"new", []string{"ticket", "yours"}, toQuack},
		{"new", []string{"config"}, toNode},
	}
	for _, one := range cases {
		if said := roadOf(one.mode, one.argv, twins); said != one.want {
			t.Fatalf("under %q the road hands %v to %d, and wants %d", one.mode, one.argv, said, one.want)
		}
	}
}

// The doors of a road whose the verb's program answers old, and whose log gathers its rows. [[spec/tickets/runme-hands-verbs-to-quack]]
func roadOver(mode, old string, twins map[string]twin) (verbDoors, *strings.Builder, *[]map[string]any) {
	out, rows := &strings.Builder{}, &[]map[string]any{}
	return verbDoors{
		mode: mode,
		old: func(into io.Writer) int {
			fmt.Fprint(into, old)
			return 0
		},
		twins: twins,
		log: func(row map[string]any) error {
			*rows = append(*rows, row)
			return nil
		},
		out:  out,
		errs: io.Discard,
	}, out, rows
}

func TestATwinAnsweringApartWritesAShadowRow(t *testing.T) {
	dry := []bool{}
	doors, out, rows := roadOver("shadow", "old\n", map[string]twin{"ticket yours": twinSaying("new\n", &dry)})
	if code := verbs(doors, []string{"ticket", "yours"}); code != 0 || out.String() != "old\n" {
		t.Fatalf("the caller reads %d, %q, and wants the old answer alone", code, out.String())
	}
	if len(dry) != 1 || !dry[0] {
		t.Fatalf("the twin runs %v, and wants one dry run", dry)
	}
	if len(*rows) != 1 {
		t.Fatalf("the log holds %v, and wants one shadow row", *rows)
	}
	row := (*rows)[0]
	if row["kind"] != "shadow" || row["slice"] != "verbs" || row["verb"] != "ticket yours" || row["old"] != "old\n" || row["new"] != "new\n" {
		t.Fatalf("the shadow row reads %v", row)
	}
}

func TestATwinAgreeingWritesNoRow(t *testing.T) {
	dry := []bool{}
	doors, out, rows := roadOver("shadow", "same\n", map[string]twin{"ticket yours": twinSaying("same\n", &dry)})
	if code := verbs(doors, []string{"ticket", "yours"}); code != 0 || out.String() != "same\n" || len(*rows) != 0 || len(dry) != 1 {
		t.Fatalf("an agreeing twin answers %d, %q, rows %v, runs %v", code, out.String(), *rows, dry)
	}
}

func TestTheNewRoadRunsTheTwinForReal(t *testing.T) {
	dry := []bool{}
	doors, out, rows := roadOver("new", "old\n", map[string]twin{"ticket yours": twinSaying("new\n", &dry)})
	if code := verbs(doors, []string{"ticket", "yours"}); code != 0 || out.String() != "new\n" || len(*rows) != 0 || len(dry) != 1 || dry[0] {
		t.Fatalf("the new road answers %d, %q, rows %v, runs %v", code, out.String(), *rows, dry)
	}
}

// A box with no runtime hears which one to install, in one line. [[spec/tickets/bare-desk-names-missing-node]]
func TestAStartFaultNamesAMissingRuntime(t *testing.T) {
	_, err := exec.LookPath("no-such-runtime")
	said := startFault("no-such-runtime", err)
	if strings.Contains(said, "\n") || said != "No no-such-runtime stands on the PATH. Install no-such-runtime, and run this again." {
		t.Fatalf("the fault reads %q", said)
	}
}

// The mode reads the verbs key off the tracked file under the root, and none where the file sets none. [[spec/tickets/runme-hands-verbs-to-quack]]
func TestTheModeReadsTheVerbsKeyOffTheTrackedFile(t *testing.T) {
	root := t.TempDir()
	if said := modeOf(root); said != "" {
		t.Fatalf("a bare root reads %q", said)
	}
	at := filepath.Join(root, "spec", "config")
	if err := os.MkdirAll(at, 0o755); err != nil {
		t.Fatal(err)
	}
	if err := os.WriteFile(filepath.Join(at, "level0.json"), []byte(`{"migration": {"verbs": "new"}}`), 0o644); err != nil {
		t.Fatal(err)
	}
	if said := modeOf(root); said != "new" {
		t.Fatalf("the root reads %q, and wants new", said)
	}
}

// A verb the registry leaves out runs the verb's program alone in shadow, and the log holds no row for it. A port registers every verb in time, so the case names words no file registers. [[spec/tickets/vehicle-verbs-become-actions]] [[spec/tickets/window-verbs-port-to-go]]
func TestAVerbWithNoTwinWritesNoShadowRow(t *testing.T) {
	doors, out, rows := roadOver("shadow", "old\n", registry)
	for _, argv := range [][]string{{"unregistered", "here"}, {"unregistered", "into", "elsewhere"}} {
		out.Reset()
		if code := verbs(doors, argv); code != 0 || out.String() != "old\n" || len(*rows) != 0 {
			t.Fatalf("%v answers %d, %q, rows %v", argv, code, out.String(), *rows)
		}
	}
}

// The road holds retro notes among its twins, and Go registers retro whole, so every mode runs it in quack alone. [[spec/tickets/retro-notes-twin-joins-road]] [[spec/tickets/retro-verbs-run-in-go]]
func TestTheRoadHoldsRetroNotesAmongItsTwins(t *testing.T) {
	if registry["retro notes"] == nil {
		t.Fatal("the registry holds no retro notes twin")
	}
	for _, mode := range []string{modeShadow, modeNew, "old"} {
		if roadOf(mode, []string{"retro", "notes"}, registry) != toQuack {
			t.Fatalf("retro notes takes another road than quack in %s", mode)
		}
	}
}

// A verb the verb's program answers too takes the verb's program, even where quack's verb table holds it. [[spec/tickets/quack-tools-spares-runme-tools]]
func TestAVerbCliJsAnswersRunsNeverAlone(t *testing.T) {
	table := map[string]bool{"run": true, "act": true}
	if aloneOf([]string{"act"}, table) {
		t.Fatal("act runs in quack alone, and the verb's program stops answering it")
	}
	if !aloneOf([]string{"run"}, table) {
		t.Fatal("run, which the verb's program lacks, runs in the verb's program")
	}
}

// A verb Go registers whole takes quack under old, shadow and new, since no program stands beside it, and a twin of a verb's words keeps its shadow. [[spec/tickets/registered-verb-skips-the-mode]]
func TestAWholeVerbTakesQuackUnderEveryMode(t *testing.T) {
	answers := func(argv []string, _ bool, out, _ io.Writer) int {
		fmt.Fprint(out, "go\n")
		return 0
	}
	twins := map[string]twin{"whole": answers, "part words": answers}
	for _, mode := range []string{"old", modeShadow, modeNew} {
		doors, out, rows := roadOver(mode, "old\n", twins)
		if code := verbs(doors, []string{"whole", "into"}); code != 0 || out.String() != "go\n" || len(*rows) != 0 {
			t.Fatalf("under %s the whole verb answers %d, %q, rows %v", mode, code, out.String(), *rows)
		}
	}
	if roadOf(modeShadow, []string{"part", "words"}, twins) != toBoth || roadOf("old", []string{"part", "words"}, twins) != toNode {
		t.Fatal("a twin of a verb's words leaves its shadow road")
	}
}

// A registered verb takes its Go answer ahead of quack's own verb of the same word, so ./RUNME.sh tools keeps writing tools.json, and takes it under old too, since tools.js left the tree. [[spec/tickets/box-verbs-port-to-go]] [[spec/tickets/registered-verb-skips-the-mode]]
func TestARegisteredVerbRunsAheadOfQuacksOwn(t *testing.T) {
	twins := map[string]twin{"tools": twinSaying("", &[]bool{})}
	if got := roadOf(modeNew, []string{"tools"}, twins); got != toQuack {
		t.Fatalf("tools takes road %d under new, and wants its twin", got)
	}
	if got := roadOf("", []string{"tools"}, twins); got != toQuack {
		t.Fatalf("tools takes road %d under old, and wants its twin, since no program stands", got)
	}
	ran := false
	doors, _, _ := roadOver(modeNew, "", twins)
	doors.alone = func([]string) int { ran = true; return 0 }
	verbs(doors, []string{"tools"})
	if ran {
		t.Fatal("quack's own tools answers, and the registered verb waits")
	}
}
