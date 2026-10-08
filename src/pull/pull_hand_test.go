// The hand a step stands in: the box file under the work root, the identity
// under the method root where none stands, the owner's word, and the cloud
// variables.
// [[spec/tickets/pull-scripts-leave]]
package pull

import (
	"os"
	"path/filepath"
	"testing"
)

// A method root on this box holding the identity. [[spec/tickets/pull-scripts-leave]]
func methodHolding(t *testing.T, id string) string {
	t.Helper()
	root := t.TempDir()
	at := filepath.Join(root, filepath.FromSlash(identity))
	must(t, os.MkdirAll(filepath.Dir(at), 0o755))
	must(t, os.WriteFile(at, []byte(`{"id":"`+id+`"}`), 0o644))
	return root
}

func TestAWorkRootWithNoBoxFileTakesTheIdentityUnderTheMethodRoot(t *testing.T) {
	t.Parallel()
	it := &It{
		Disk:   FakeDisk{sessionFile: `{"id":"s7","harness":"claude-code"}`},
		Root:   workRoot,
		Method: methodHolding(t, "d462e994b4cef"),
		Env:    map[string]string{"CLAUDECODE": "1"},
	}
	if got := it.HandOf(); got != "box d462e994b4cef · session s7 · claude-code" {
		t.Fatalf("the hand reads %q, and wants the identity's box, the session and the harness", got)
	}
}

func TestTheBoxIDReadsTheBoxFileThenTheIdentityAndWritesNothing(t *testing.T) {
	t.Parallel()
	if got := (&It{Disk: FakeDisk{boxFile: `{"id":"b0x"}`}, Root: workRoot, Method: methodHolding(t, "1d")}).BoxIDHere(); got != "b0x" {
		t.Fatalf("the box id reads %q, and wants the box file first", got)
	}
	if got := (&It{Disk: FakeDisk{}, Root: workRoot, Method: methodHolding(t, "1d")}).BoxIDHere(); got != "1d" {
		t.Fatalf("the box id reads %q, and wants the identity where no box file stands", got)
	}
	bare := FakeDisk{}
	if got := (&It{Disk: bare, Root: workRoot, Method: t.TempDir()}).BoxIDHere(); got != "" || bare.Exists(boxFile) {
		t.Fatalf("the box id reads %q, and wants nothing read and no box file written", got)
	}
}

func TestTheOwnersWordSendsAnAgentsHandIntoAPersonStep(t *testing.T) {
	t.Parallel()
	agent := "box d462e994b4cef · claude-code"
	for _, one := range []struct {
		hand   string
		says   bool
		person bool
	}{
		{Person, false, true},
		{Person + " somebody", false, true},
		{agent, true, true},
		{agent, false, false},
	} {
		if got := (&It{OwnerSays: one.says}).byPerson(one.hand); got != one.person {
			t.Errorf("%q with the owner's word %v passes as a person: %v, and wants %v", one.hand, one.says, got, one.person)
		}
	}
}

func TestEveryCloudVariableNamesAHarness(t *testing.T) {
	t.Parallel()
	for _, name := range cloudVars {
		if AgentOf(map[string]string{name: "1"}) == "" {
			t.Errorf("%s says the box runs on the cloud, and names no harness the hand reads", name)
		}
	}
}
