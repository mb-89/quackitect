// The cage verb: the event and its input on stdin, answered with a deny where
// the call stays guarded while the hooks door stands down.
// [[spec/tickets/level0-hooks-hold-no-rule]]
package main

import (
	"encoding/json"
	"strings"
	"testing"
)

// Runs the cage verb over the input, and answers what it prints. [[spec/tickets/level0-hooks-hold-no-rule]]
func cageSays(t *testing.T, input string) (string, int) {
	t.Helper()
	one := cageVerb(strings.NewReader(input))
	if one == nil {
		t.Fatalf("the cage verb stands nowhere")
	}
	var out, errs strings.Builder
	code := one([]string{"cage"}, false, &out, &errs)
	return out.String(), code
}

func TestCageVerb(t *testing.T) {
	t.Parallel()
	if _, one := twinOf([]string{"cage"}, registry); one == nil {
		t.Errorf("the registry holds no cage verb")
	}
	said, code := cageSays(t, `{"event":"tool.call","e":{"tool":"Write"}}`)
	if code != 0 {
		t.Errorf("a guarded write exits %d, want 0", code)
	}
	var deny map[string]any
	if err := json.Unmarshal([]byte(strings.TrimSpace(said)), &deny); err != nil {
		t.Fatalf("a guarded write prints %q, which reads as no JSON: %v", said, err)
	}
	if text, _ := deny["deny"].(string); !strings.Contains(text, "Write") || !strings.Contains(text, "./RUNME.sh serve") {
		t.Errorf("a guarded write prints %v, and wants a deny naming Write and ./RUNME.sh serve", deny)
	}
	if !strings.HasSuffix(said, "\n") || strings.Count(said, "\n") != 1 {
		t.Errorf("a guarded write prints %q, and wants one line", said)
	}
	said, code = cageSays(t, `{"event":"tool.call","e":{"tool":"Bash","command":"./RUNME.sh serve"}}`)
	if code != 0 || said != "" {
		t.Errorf("the serve prints %q and exits %d, and wants nothing and 0", said, code)
	}
}
