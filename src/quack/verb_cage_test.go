// The cage verb: the event and its input on stdin, answered with a deny where
// the call stays guarded while the hooks door stands down.
// [[spec/tickets/level0-hooks-hold-no-rule]]
package main

import (
	"encoding/json"
	"os"
	"strings"
	"testing"
)

// Runs the registered cage verb with the input on stdin, and answers what it prints. The verb reads os.Stdin when it runs, so this test runs alone. [[spec/tickets/level0-hooks-hold-no-rule]]
func cageSays(t *testing.T, one twin, input string) (string, int) {
	t.Helper()
	read, write, err := os.Pipe()
	if err != nil {
		t.Fatal(err)
	}
	if _, err := write.WriteString(input); err != nil {
		t.Fatal(err)
	}
	write.Close()
	was := os.Stdin
	os.Stdin = read
	defer func() {
		os.Stdin = was
		read.Close()
	}()
	var out, errs strings.Builder
	code := one([]string{"cage"}, false, &out, &errs)
	return out.String(), code
}

func TestCageVerb(t *testing.T) {
	_, one := twinOf([]string{"cage"}, registry)
	if one == nil {
		t.Fatalf("the registry holds no cage verb")
	}
	said, code := cageSays(t, one, `{"event":"tool.call","e":{"tool":"Write"}}`)
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
	said, code = cageSays(t, one, `{"event":"tool.call","e":{"tool":"Bash","command":"./RUNME.sh serve"}}`)
	if code != 0 || said != "" {
		t.Errorf("the serve prints %q and exits %d, and wants nothing and 0", said, code)
	}
}
