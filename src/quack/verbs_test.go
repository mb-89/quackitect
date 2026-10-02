// The road hands each verb by the verbs slice's mode, and a twin in shadow
// writes a shadow row where it answers apart from the verb's program.
// [[spec/tickets/runme-hands-verbs-to-quack]]
package main

import (
	"fmt"
	"io"
	"os"
	"path/filepath"
	"runtime"
	"strings"
	"syscall"
	"testing"
	"time"
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

// The old door hands the child the caller's stdin, and answers the child's exit code. [[spec/tickets/verb-road-keeps-the-terminal]]
func TestTheOldDoorHandsStdinAndAnswersTheExitCode(t *testing.T) {
	var out, errs strings.Builder
	old := oldDoor([]string{"sh", "-c", "cat; exit 3"}, strings.NewReader("typed\n"), &errs, nil)
	if code := old(&out); code != 3 || out.String() != "typed\n" {
		t.Fatalf("the old door answers %d, %q, %q", code, out.String(), errs.String())
	}
}

// A box with no runtime for the verb's program hears which one to install, in one line. [[spec/tickets/bare-desk-names-missing-node]]
func TestTheOldDoorNamesAMissingRuntime(t *testing.T) {
	var out, errs strings.Builder
	old := oldDoor([]string{"no-such-runtime", "verbs/help.js"}, strings.NewReader(""), &errs, nil)
	code := old(&out)
	said := errs.String()
	if code != exitFailed || strings.Count(said, "\n") != 1 || !strings.Contains(said, "No no-such-runtime stands on the PATH") {
		t.Fatalf("the old door answers %d, %q", code, said)
	}
}

// A signal the road takes reaches the child, which ends on it as under exec. [[spec/tickets/verb-road-keeps-the-terminal]]
func TestTheOldDoorForwardsASignalToTheChild(t *testing.T) {
	if runtime.GOOS == "windows" {
		t.Skip("a Windows process takes no SIGTERM")
	}
	signals := make(chan os.Signal, 1)
	var out strings.Builder
	old := oldDoor([]string{"sh", "-c", "trap 'echo caught; exit 7' TERM; echo ready; while :; do sleep 0.05; done"}, strings.NewReader(""), io.Discard, signals)
	go func() {
		time.Sleep(300 * time.Millisecond)
		signals <- syscall.SIGTERM
	}()
	if code := old(&out); code != 7 || !strings.Contains(out.String(), "caught") {
		t.Fatalf("the child ends %d with %q, and wants 7 after the trap", code, out.String())
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

// A verb the twin table leaves out runs the verb's program alone in shadow, and the log holds no row for it. [[spec/tickets/vehicle-verbs-become-actions]]
func TestAVerbWithNoTwinWritesNoShadowRow(t *testing.T) {
	doors, out, rows := roadOver("shadow", "old\n", twinVerbs)
	for _, argv := range [][]string{{"vehicle", "here"}, {"stub", "into", "elsewhere"}} {
		out.Reset()
		if code := verbs(doors, argv); code != 0 || out.String() != "old\n" || len(*rows) != 0 {
			t.Fatalf("%v answers %d, %q, rows %v", argv, code, out.String(), *rows)
		}
	}
}

// The road holds retro notes among its twins, so the shadow runs it beside the verb's program. [[spec/tickets/retro-notes-twin-joins-road]]
func TestTheRoadHoldsRetroNotesAmongItsTwins(t *testing.T) {
	if twinVerbs["retro notes"] == nil || roadOf(modeShadow, []string{"retro", "notes"}, twinVerbs) != toBoth {
		t.Fatal("the road holds no retro notes twin in shadow")
	}
}

// A verb the verb's program answers too takes the verb's program, even where quack's verb table holds it, so ./RUNME.sh tools keeps writing tools.json. [[spec/tickets/quack-tools-spares-runme-tools]]
func TestAVerbCliJsAnswersRunsNeverAlone(t *testing.T) {
	table := map[string]bool{"run": true, "tools": true, "act": true}
	for _, verb := range []string{"tools", "act"} {
		if aloneOf([]string{verb}, table) {
			t.Fatalf("%s runs in quack alone, and the verb's program stops answering it", verb)
		}
	}
	if !aloneOf([]string{"run"}, table) {
		t.Fatal("run, which the verb's program lacks, runs in the verb's program")
	}
}
