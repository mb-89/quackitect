// The start verb over a fake root, input, environment and disk.
// [[spec/tickets/the-coordinator-runs-under-level0]]
package main

import (
	"encoding/json"
	"path/filepath"
	"strings"
	"testing"
)

func startFake(input string, env map[string]string, manifest bool) startOutside {
	return startOutside{
		root:   func() (string, error) { return "/home/one/tree", nil },
		input:  strings.NewReader(input),
		env:    func(key string) string { return env[key] },
		exists: func(path string) bool { return manifest && path == filepath.Join("/home/one/tree", startManifest) },
	}
}

func TestStartReadsItsInputEnvironmentAndDiskOffTheBox(t *testing.T) {
	t.Parallel()
	for _, one := range []struct {
		name  string
		env   map[string]string
		stops bool
	}{
		{"a desk box in default mode with no plugin", nil, true},
		{"a cloud box", map[string]string{"CLAUDE_CODE_REMOTE": "true"}, false},
	} {
		box, _, _, _ := fakeBoxDoors(t)
		box = withEnv(box, one.env)
		box.input = strings.NewReader(`{"permission_mode":"default"}`)
		var out strings.Builder
		startVerb(startOutsideOf(box))([]string{"start"}, false, &out, &out)
		if stops := strings.Contains(out.String(), `"continue":false`); stops != one.stops {
			t.Errorf("%s: prints %q, and the stop reads %v, want %v", one.name, out.String(), stops, one.stops)
		}
	}
}

func TestStartRegistersUnderItsWord(t *testing.T) {
	t.Parallel()
	if registry["start"] == nil {
		t.Fatal("the registry holds no start")
	}
}

func TestStartStopsADeskSessionWritingWithNoPlugin(t *testing.T) {
	t.Parallel()
	hooked := map[string]string{"CLAUDE_CODE_ENABLE_FUNCTION_HOOKS": "1"}
	cases := []struct {
		name   string
		input  string
		env    map[string]string
		plugin bool
		stops  bool
	}{
		{"a desk session in default mode with no manifest", `{"permission_mode":"default"}`, hooked, false, true},
		{"a desk session naming no mode with no flag", `{}`, nil, true, true},
		{"a desk session sending no input", ``, nil, false, true},
		{"a desk session in plan mode", `{"permission_mode":"plan"}`, nil, false, false},
		{"a desk session where the plugin stands", `{"permission_mode":"default"}`, hooked, true, false},
		{"a cloud box with no plugin", `{}`, map[string]string{"CLAUDE_CODE_REMOTE": "true"}, false, false},
	}
	for _, one := range cases {
		var out, errs strings.Builder
		code := startVerb(startFake(one.input, one.env, one.plugin))([]string{"start"}, false, &out, &errs)
		if code != 0 {
			t.Errorf("%s: exits %d, want 0", one.name, code)
		}
		if !one.stops {
			if out.String() != "" {
				t.Errorf("%s: prints %q, want nothing", one.name, out.String())
			}
			continue
		}
		var said map[string]any
		if err := json.Unmarshal([]byte(out.String()), &said); err != nil {
			t.Fatalf("%s: prints %q, which reads as no JSON: %v", one.name, out.String(), err)
		}
		reason, _ := said["stopReason"].(string)
		if said["continue"] != false || !strings.Contains(reason, "/home/one/tree") || !strings.Contains(reason, "./RUNME.sh") {
			t.Errorf("%s: prints %v, want continue false and a reason naming the folder and ./RUNME.sh", one.name, said)
		}
	}
}
