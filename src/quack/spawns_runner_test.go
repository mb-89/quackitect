// The quack spawns past the node module, each over a FakeRunner
// taught the program its command names, so no case starts a process.
// [[spec/tickets/quack-spawns-all-take-the-runner]]
package main // level0: InPackageTest - the cases swap the package's spawns through its unexported seams, over the in-package helpers fakeQuack and fakeSelf

import (
	"path/filepath"
	"slices"
	"strings"
	"testing"

	"quackitect/src/proc"
	"quackitect/src/pull"
)

// A fake runner taught one program, which records each command it meets and answers the same. [[spec/tickets/quack-spawns-all-take-the-runner]]
func teaches(program string, said proc.Said) (*proc.FakeRunner, *[]proc.Command) {
	ran := &[]proc.Command{}
	return &proc.FakeRunner{Programs: map[string]proc.Program{program: func(one proc.Command) proc.Said {
		*ran = append(*ran, one)
		return said
	}}}, ran
}

// The one command a case's fake met. [[spec/tickets/quack-spawns-all-take-the-runner]]
func ranOnce(t *testing.T, ran []proc.Command) proc.Command {
	t.Helper()
	if len(ran) != 1 {
		t.Fatalf("the fake meets %d commands, and wants one", len(ran))
	}
	return ran[0]
}

func TestToolRunsHandsTheStreamsThrough(t *testing.T) {
	t.Parallel()
	fake, ran := teaches("/fake/tool", proc.Said{Out: "out", Err: "err", Code: 3})
	var out, errs strings.Builder
	dir := sharedFolder()
	if code := toolRunsOver(fake.Run, strings.NewReader("keys"))(dir, &out, &errs, "/fake/tool", "--fix"); code != 3 || out.String() != "out" || errs.String() != "err" {
		t.Fatalf("a tool run answers %d and writes %q, %q, and wants 3 and the tool's streams", code, out.String(), errs.String())
	}
	if one := ranOnce(t, *ran); !slices.Equal(one.Argv, []string{"/fake/tool", "--fix"}) || one.Dir != dir || one.Stdin != "keys" {
		t.Fatalf("the tool runs %q in %s reading %q, and wants the argv in %s reading the input", one.Argv, one.Dir, one.Stdin, dir)
	}
	errs.Reset()
	if code := toolRunsOver((&proc.FakeRunner{}).Run, strings.NewReader(""))(dir, &out, &errs, "/fake/none"); code != exitFailed || errs.Len() == 0 {
		t.Fatalf("a tool that never starts answers %d and writes %q, and wants exitFailed and its fault", code, errs.String())
	}
}

func TestARoadVerbAnswersItsStreamsAsOneText(t *testing.T) {
	t.Parallel()
	fake, ran := teaches(fakeQuack, proc.Said{Out: "said\n", Err: "warned\n", Code: 3})
	root := sharedFolder()
	code, said := roadVerbOver(fake.Run, fakeSelf, root)("ticket", "pull")
	if code != 3 || said != "said\nwarned" {
		t.Fatalf("the road answers %d, %q, and wants 3 and both streams as one text", code, said)
	}
	want := []string{fakeQuack, "verb", filepath.Join(root, "src", "scripts"), "ticket", "pull"}
	if one := ranOnce(t, *ran); !slices.Equal(one.Argv, want) || one.Dir != root {
		t.Fatalf("the road runs %q in %s, and wants %q in %s", one.Argv, one.Dir, want, root)
	}
}

func TestTheBranchTakeRunsTheRoadOnTheCallersStreams(t *testing.T) {
	t.Parallel()
	fake, ran := teaches(fakeQuack, proc.Said{Out: "taken\n", Err: "note\n", Code: 2})
	var out, errs strings.Builder
	root := sharedFolder()
	it := &pull.It{Root: root, Out: &out, Err: &errs}
	if code := takesBranchOver(fake.Run, fakeSelf)("/scripts", "a-group", it); code != 2 || out.String() != "taken\n" || errs.String() != "note\n" {
		t.Fatalf("the take answers %d and writes %q, %q, and wants 2 and the road's streams", code, out.String(), errs.String())
	}
	want := []string{fakeQuack, "verb", "/scripts", "branch", "take", "a-group"}
	if one := ranOnce(t, *ran); !slices.Equal(one.Argv, want) || one.Dir != root {
		t.Fatalf("the take runs %q in %s, and wants %q in %s", one.Argv, one.Dir, want, root)
	}
}

func TestARetroMintRunReadsRunmeUnderTheRootAndItsEnv(t *testing.T) {
	t.Parallel()
	dir := sharedFolder()
	runme := filepath.Join(dir, "RUNME.sh")
	fake, ran := teaches(runme, proc.Said{Out: "out", Err: "err", Code: 4})
	got := retroMintRunmeOver(fake.Run)(dir, []string{retroMintRunmeAt, "ticket", "pull"}, map[string]string{"B": "2", "A": "1"})
	if got != (retroMintRan{out: "out", errs: "err", code: 4}) {
		t.Fatalf("the run answers %+v, and wants the program's streams and code", got)
	}
	if one := ranOnce(t, *ran); !slices.Equal(one.Argv, []string{runme, "ticket", "pull"}) || one.Dir != dir || !slices.Equal(one.Env, []string{"A=1", "B=2"}) {
		t.Fatalf("the run takes %q in %s under %q, and wants the root's RUNME.sh under the sorted pairs", one.Argv, one.Dir, one.Env)
	}
	if got := retroMintRunmeOver((&proc.FakeRunner{}).Run)(dir, []string{"/fake/none"}, nil); got.code != exitFailed || got.errs == "" {
		t.Fatalf("a program that never starts answers %+v, and wants exitFailed and its fault", got)
	}
}

func TestAReviewGathersOffTheBranchVerbUnderTheWorkRoot(t *testing.T) {
	t.Parallel()
	fake, ran := teaches(fakeQuack, proc.Said{Out: "working\n{\"branch\":\"work/a\"}\n"})
	method, root := filepath.Join(sharedFolder(), "method"), filepath.Join(sharedFolder(), "work")
	material, why := reviewRunOver(fake.Run, fakeSelf, method)(root, "work/a")
	if material.Branch != "work/a" || why != "" {
		t.Fatalf("the review gathers %+v, %q, and wants the branch's material", material, why)
	}
	want := []string{fakeQuack, "verb", filepath.Join(method, "src", "scripts"), "branch", "review", "work/a", "--json"}
	one := ranOnce(t, *ran)
	if !slices.Equal(one.Argv, want) || one.Dir != root || one.Wait != reviewGathering {
		t.Fatalf("the review runs %q in %s under %v, and wants %q in %s under %v", one.Argv, one.Dir, one.Wait, want, root, reviewGathering)
	}
	if env := []string{"QUACKITECT_ROOT=" + method, workRootVar + "=" + root}; !slices.Equal(one.Env, env) {
		t.Fatalf("the review adds %q, and wants %q", one.Env, env)
	}
}

func TestServeRunsReadsASignalAsOne(t *testing.T) {
	t.Parallel()
	for _, row := range []struct {
		name  string
		said  proc.Said
		code  int
		fault bool
	}{
		{"an exit answers its code and its errors", proc.Said{Err: "broke", Code: 3}, 3, false},
		{"a signal's end reads as 1", proc.Said{Err: "broke", Code: proc.Signalled}, 1, false},
		{"a program that never starts answers its fault", proc.Said{Err: "broke", Code: proc.NotStarted}, 0, true},
	} {
		fake, ran := teaches("/fake/serve", row.said)
		dir := sharedFolder()
		code, errs, err := serveRunsOver(fake.Run)([]string{"/fake/serve", "up"}, dir)
		if code != row.code || errs != "broke" || (err != nil) != row.fault {
			t.Fatalf("%s: the run answers %d, %q, %v", row.name, code, errs, err)
		}
		if one := ranOnce(t, *ran); !slices.Equal(one.Argv, []string{"/fake/serve", "up"}) || one.Dir != dir {
			t.Fatalf("%s: the run takes %q in %s", row.name, one.Argv, one.Dir)
		}
	}
}

func TestTheViewerLaunchHandsTheTerminalThrough(t *testing.T) {
	t.Parallel()
	fake, ran := teaches("/fake/viewer", proc.Said{Out: "frame", Err: "warn", Code: proc.Signalled})
	var out, errs strings.Builder
	dir := sharedFolder()
	code, err := tuiLaunchOver(fake.Run, strings.NewReader("keys"))([]string{"/fake/viewer"}, dir, &out, &errs)
	if code != 1 || err != nil || out.String() != "frame" || errs.String() != "warn" {
		t.Fatalf("the launch answers %d, %v and writes %q, %q, and wants a signal's end as 1 and the viewer's streams", code, err, out.String(), errs.String())
	}
	if one := ranOnce(t, *ran); one.Dir != dir || one.Stdin != "keys" {
		t.Fatalf("the viewer runs in %s reading %q, and wants %s and the terminal's input", one.Dir, one.Stdin, dir)
	}
	if _, err := tuiLaunchOver((&proc.FakeRunner{}).Run, strings.NewReader(""))([]string{"/fake/none"}, dir, &out, &errs); err == nil {
		t.Fatal("a viewer that never starts answers no fault")
	}
}
