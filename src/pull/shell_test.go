// The pull's shell over the process door's fake runner.
// [[spec/design_output/doors#the-process-door]]
package pull

import (
	"reflect"
	"testing"

	"quackitect/src/proc"
)

func TestTheShellRunsALineThroughShInTheRootAndReadsAProgramThatNeverStartsAsAFault(t *testing.T) {
	t.Parallel()
	var ran []proc.Command
	sh := &proc.FakeRunner{Programs: map[string]proc.Program{"sh": func(one proc.Command) proc.Said {
		ran = append(ran, one)
		return proc.Said{Out: "said\n", Err: "warned\n", Code: 3}
	}}}
	out, exit, err := ShellOver(sh.Run, "the/root")("echo said; exit 3")
	if out != "said\n" || exit != 3 || err != nil {
		t.Errorf("the shell answers %q, %d, %v", out, exit, err)
	}
	want := []proc.Command{{Argv: []string{"sh", "-c", "echo said; exit 3"}, Dir: "the/root"}}
	if !reflect.DeepEqual(ran, want) {
		t.Errorf("the shell runs %+v, and wants %+v", ran, want)
	}
	nobody := &proc.FakeRunner{}
	if _, _, err := ShellOver(nobody.Run, "the/root")("echo said"); err == nil {
		t.Error("the shell reads a program that never starts as no fault")
	}
}
