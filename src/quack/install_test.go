// The install rebuilds a binary whose source moves ahead: the here case of
// each binary the stamp verb knows asks that verb fresh, and the install's
// stamp function hands to the verb. The stamp's own answer stands under
// stamp_verb_test.go, over fake doors.
// [[spec/tickets/plugin-libs-leave]] [[spec/design_output/lsp#the-build-beside-the-index]]
package main

import (
	"os"
	"path/filepath"
	"regexp"
	"strings"
	"testing"
)

// The body of each sh function the install names, under its name. [[spec/tickets/plugin-libs-leave]]
func installFunctions(t *testing.T) map[string]string {
	t.Helper()
	said, err := os.ReadFile(filepath.Join(treeRoot, "install.sh"))
	if err != nil {
		t.Fatal(err)
	}
	out := map[string]string{}
	for _, found := range regexp.MustCompile(`(?ms)^(\w+)\(\)\s*\{(.*?)^\}`).FindAllStringSubmatch(string(said), -1) {
		out[found[1]] = found[2]
	}
	return out
}

func TestEveryBuiltBinaryRebuildsWhenItsSourceMovesAhead(t *testing.T) {
	t.Parallel()
	bodies := installFunctions(t)
	if !regexp.MustCompile(`verb \S+ stamp "\$@"`).MatchString(bodies["stamp"]) {
		t.Errorf("the install's stamp function reads\n%s\nand wants a hand-off to the stamp verb", bodies["stamp"])
	}
	for binary := range stampPackages {
		here := strings.TrimPrefix(binary, "se-") + "_here"
		body, ok := bodies[here]
		if !ok {
			t.Errorf("the install names no %s, so %s never rebuilds when its source moves", here, binary)
			continue
		}
		if !strings.Contains(body, "stamp fresh "+binary) {
			t.Errorf("%s reads\n%s\nand never asks stamp fresh %s, so the binary never rebuilds when its source moves", here, body, binary)
		}
	}
}
