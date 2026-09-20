// The work tab's door. A verb of the tree runs under the root and answers what
// it prints, and the index binary's own standing verb puts a door up where
// none stands.
// [[spec/design_output/tui#the-work-tab]]

package work

import (
	"bytes"
	"context"
	"fmt"
	"os"
	"os/exec"
	"path/filepath"
	"time"
)

// A verb of the tree runs under the root, and answers what it prints. A run past the wait dies, and answers the deadline. [[spec/design_output/tui#the-work-tab]]
func runVerb(root, program string, argv []string, wait time.Duration) ([]byte, error) {
	ctx, stop := context.WithTimeout(context.Background(), wait)
	defer stop()
	one := exec.CommandContext(ctx, program, argv...)
	one.Dir = root
	return one.Output()
}

// The binary's own standing verb puts a door up where none stands, and drops a stale one. [[spec/design_output/index#a-door-comes-back]]
func startIndex(root string) error {
	binary := filepath.Join(root, filepath.FromSlash(indexBinAt))
	if _, err := os.Stat(binary); err != nil {
		return fmt.Errorf("no index stands here: %s is unbuilt, and ./RUNME.sh builds it", indexBinAt)
	}
	one := exec.Command(binary, "standing")
	one.Dir = root
	if out, err := one.CombinedOutput(); err != nil {
		return fmt.Errorf("the index door did not stand: %s", bytes.TrimSpace(out))
	}
	return nil
}
