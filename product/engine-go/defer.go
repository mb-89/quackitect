package main

// defer.go — the minimal defer/retire port (i0020 cold-run fixes). The documented reaches
// (`engage` names them: "defer (push a check to a later iteration), retire (drop one)")
// existed in the docs but not in the Go engine. This port stamps the fact ON the check's
// own frontmatter — `deferred: <reason>` / `retired: <reason>` — and the boards honor it:
// a stamped check is never ready, never DONE, and never holds its dependents or its
// version hostage (stateSatisfies). The full move-a-check-across-iterations semantics
// stays future work (i0021 candidate); the stamp is the honest, self-contained slice.

import (
	"fmt"
	"os"
	"strings"
)

// design: go-defer-retire  implements: req-go-port
// Stamp lane: read the task file, insert the key into its frontmatter ahead of the closing
// delimiter, write back byte-safe. A reason is REQUIRED - an unexplained defer is how scope
// leaks silently; the stamp is greppable and the board renders [>] DEFER / [-] RETIRED.
func stampCheck(id, key, reason string) error {
	nodes := LoadAll()
	n, ok := nodes[id]
	if !ok {
		return fmt.Errorf("%s: no such check '%s'", key, id)
	}
	if n.Type != "" && n.Path != "" && strings.Contains(n.Path, "tasks") == false && n.Class == "" {
		return fmt.Errorf("%s: '%s' is trace content, not a check", key, id)
	}
	raw, err := os.ReadFile(n.Path)
	if err != nil {
		return err
	}
	text := strings.ReplaceAll(string(raw), "\r\n", "\n")
	if strings.Contains(text, "\n"+key+":") {
		return fmt.Errorf("%s: '%s' already stamped", key, id)
	}
	i := strings.Index(text, "\n---")
	if !strings.HasPrefix(text, "---") || i < 0 {
		return fmt.Errorf("%s: '%s' has no frontmatter", key, id)
	}
	stamped := text[:i] + "\n" + key + ": " + reason + text[i:]
	return os.WriteFile(n.Path, []byte(stamped), 0o644)
}

func cmdDeferCheck(args []string) {
	runStamp("deferred", "defer", args)
}

func cmdRetireCheck(args []string) {
	runStamp("retired", "retire", args)
}

func runStamp(key, verb string, args []string) {
	if len(args) < 2 {
		fmt.Println("usage: " + brand() + " " + verb + " <id> <reason...>   (the reason is required)")
		return
	}
	id, reason := args[0], strings.Join(args[1:], " ")
	if err := stampCheck(id, key, reason); err != nil {
		fmt.Println(brand() + ": " + err.Error())
		return
	}
	fmt.Println(verb + "ed " + id + " - " + reason)
}

func init() {
	registerCmd("defer", cmdDeferCheck)
	registerCmd("retire", cmdRetireCheck)
}

// enddesign

// design: go-vehicle-misuse-guard  implements: req-engine-vehicle-overlay.3
// The cheap lint that catches a driven project composed inside a vehicle's own spec: the
// workspace IS a vehicle (its engine layer resolves through tools/vendor/), its spec holds
// iterations, and its product/ is effectively empty (nothing beyond the seeded brand and
// method-overlay README). Exactly the observed field failure; one warning line names the fix.
func vehicleMisuseFinding() string {
	if !strings.Contains(EngineDir(), "vendor") {
		return "" // dogfood or stub - not a vehicle
	}
	iters, err := os.ReadDir(SPEC + "/iterations")
	if err != nil || len(iters) == 0 {
		return ""
	}
	proj := ""
	if ents, err := os.ReadDir(ROOT + "/product"); err == nil {
		for _, e := range ents {
			if e.Name() != "brand" && !strings.HasPrefix(e.Name(), ".") {
				if e.IsDir() {
					if sub, err := os.ReadDir(ROOT + "/product/" + e.Name()); err == nil && len(sub) > 1 {
						proj = e.Name()
						break
					}
				} else {
					proj = e.Name()
					break
				}
			}
		}
	}
	if proj != "" {
		return ""
	}
	return "spec/ holds iterations but product/ is empty - a driven project belongs in its own workspace (`" + brand() + " start stubs <folder>`); the vehicle's spec is for the vehicle's OWN tool"
}
