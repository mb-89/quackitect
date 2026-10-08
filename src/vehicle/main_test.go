// The fixture home of the vehicle cases: the stub holding the real shim, and
// the run of that shim under sh, which the contract cases share.
// [[spec/guidance/code/testing]]
package vehicle // level0: InPackageTest - the case files beside it stand in the package and share its helpers

import (
	"os"      // level0: OutsideInDoors - the home reads the real shim off disk and seeds a stub of its own, as the shim reads it
	"os/exec" // level0: OutsideInDoors - the home runs the real shim under sh, the road the contract proves
	"path/filepath"
	"strings"
	"testing"
)

// The stub the shim cases run: its name, its vehicle id, its upstream, and the script its vehicle holds. [[spec/design_output/vehicle#the-record-names-the-vehicle]]
const (
	shimName     = "acme"
	shimID       = "abc123"
	shimUpstream = "https://host/a/b.git"
	shimSays     = "#!/usr/bin/env sh\nprintf \"argv=%s\\n\" \"$*\"\nprintf \"work=%s\\n\" \"$SE_WORK_ROOT\"\n"
)

// A stub holding the real shim and its record, and a home with no vehicle in it. [[spec/design_output/vehicle#the-record-names-the-vehicle]]
func shimStub(t *testing.T) (where, stub string) {
	t.Helper()
	where, err := filepath.EvalSymlinks(t.TempDir())
	if err != nil {
		t.Fatal(err)
	}
	shim, err := os.ReadFile(filepath.Join("..", "stub", "RUNME.sh"))
	if err != nil {
		t.Fatal(err)
	}
	stub = filepath.Join(where, "stub")
	seed(t, stub, map[string]string{
		"RUNME.sh":     string(shim),
		"vehicle.json": `{"vehicle": "` + shimID + `", "name": "` + shimName + `", "upstream": "` + shimUpstream + `"}`,
	})
	return where, stub
}

// Runs the shim in the stub with the variables named over the box's own, and answers its exit code, stdout and stderr. [[spec/design_output/vehicle#two-roads-to-the-vehicle]]
func runShim(t *testing.T, stub string, env map[string]string, argv ...string) (int, string, string) {
	t.Helper()
	cmd := exec.Command("sh", append([]string{"RUNME.sh"}, argv...)...)
	cmd.Dir = stub
	cmd.Env = os.Environ()
	for key, value := range env {
		cmd.Env = append(cmd.Env, key+"="+value)
	}
	var out, errs strings.Builder
	cmd.Stdout, cmd.Stderr = &out, &errs
	code := 0
	if err := cmd.Run(); err != nil {
		failed, ok := err.(*exec.ExitError)
		if !ok {
			t.Fatal(err)
		}
		code = failed.ExitCode()
	}
	return code, out.String(), errs.String()
}
