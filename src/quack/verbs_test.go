// The road hands each verb by the verbs slice's mode, and a twin in shadow
// writes a shadow row where it answers apart from cli.js.
// [[spec/tickets/runme-hands-verbs-to-quack]]
package main

import (
	"fmt"
	"io"
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

// The doors of a road whose cli.js answers old, and whose log gathers its rows. [[spec/tickets/runme-hands-verbs-to-quack]]
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
