//go:build contract

// The real shim, run by sh against a vehicle of one script that says what
// reaches it, so each case proves the hand-over and runs no install.
// [[spec/design_output/vehicle#two-roads-to-the-vehicle]]
package vehicle

import (
	"os"
	"os/exec"
	"path/filepath"
	"strings"
	"testing"
)

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

// A vehicle of one script at the folder named. [[spec/design_output/vehicle#a-vehicle-stands-alone]]
func shimVehicle(t *testing.T, at string) string {
	t.Helper()
	seed(t, at, map[string]string{"RUNME.sh": shimSays})
	return at
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

// A path as sh prints it, in either slash, read without case, since pwd -W answers a drive letter on Windows. [[spec/design_output/vehicle#two-roads-to-the-vehicle]]
func samePath(said, want string) bool {
	flat := func(path string) string { return strings.ToLower(filepath.ToSlash(path)) }
	return flat(said) == flat(want)
}

// The vehicle answers every argument, and the stub stands as the work root. [[spec/design_output/vehicle#two-roads-to-the-vehicle]]
func handsOver(t *testing.T, stdout, stub, argv string) {
	t.Helper()
	lines := strings.Split(strings.TrimSpace(stdout), "\n")
	if len(lines) != 2 || lines[0] != "argv="+argv || !samePath(strings.TrimPrefix(lines[1], "work="), stub) {
		t.Fatalf("the vehicle reads %q, and wants argv=%s and work=%s", stdout, argv, stub)
	}
}

func TestTheShimHandsEveryArgumentToTheVehicleSEVehicleNames(t *testing.T) {
	where, stub := shimStub(t)
	vehicle := shimVehicle(t, filepath.Join(where, "vehicle"))
	code, out, errs := runShim(t, stub, map[string]string{"SE_VEHICLE": vehicle, "SE_REGISTRY": filepath.Join(where, "empty"), "HOME": where}, "check", "one")
	if code != 0 {
		t.Fatalf("the shim exits %d: %s", code, errs)
	}
	handsOver(t, out, stub, "check one")
}

func TestTheShimFindsTheVehicleThroughTheRegisterWhereSEVehicleStandsEmpty(t *testing.T) {
	where, stub := shimStub(t)
	vehicle := shimVehicle(t, filepath.Join(where, "vehicle"))
	register := filepath.Join(where, "register")
	seed(t, register, map[string]string{
		"registry.json": `[{"id": "other", "method_root": "` + filepath.ToSlash(filepath.Join(where, "nowhere")) + `"}, {"id": "` + shimID + `", "method_root": "` + filepath.ToSlash(vehicle) + `"}]`,
	})
	code, out, errs := runShim(t, stub, map[string]string{"SE_VEHICLE": "", "SE_REGISTRY": register, "HOME": where}, "vehicle")
	if code != 0 {
		t.Fatalf("the shim exits %d: %s", code, errs)
	}
	handsOver(t, out, stub, "vehicle")
}

func TestTheShimFindsTheCloneUnderHomeWhereNeitherRoadAnswers(t *testing.T) {
	where, stub := shimStub(t)
	shimVehicle(t, filepath.Join(where, ".se", "vehicles", shimName))
	code, out, errs := runShim(t, stub, map[string]string{"SE_VEHICLE": "", "SE_REGISTRY": filepath.Join(where, "empty"), "HOME": where}, "vehicle")
	if code != 0 {
		t.Fatalf("the shim exits %d: %s", code, errs)
	}
	handsOver(t, out, stub, "vehicle")
}

func TestAShimFindingNoVehicleExitsOneOnALineNamingTheUpstreamAndTheCloneFolder(t *testing.T) {
	where, stub := shimStub(t)
	code, out, errs := runShim(t, stub, map[string]string{"SE_VEHICLE": filepath.Join(where, "nowhere"), "SE_REGISTRY": filepath.Join(where, "empty"), "HOME": where}, "vehicle")
	line := strings.TrimSpace(errs)
	if code != 1 || out != "" || strings.Contains(line, "\n") {
		t.Fatalf("the shim exits %d with %q and %q, and wants one, nothing and one line", code, out, errs)
	}
	if !strings.Contains(line, shimUpstream) || !strings.Contains(filepath.ToSlash(line), ".se/vehicles/"+shimName) {
		t.Fatalf("the line %q names no upstream or clone folder", line)
	}
}
