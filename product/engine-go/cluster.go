package main

// cluster.go — the requirement-clustering migration
// (adr-cluster-numbered-statements). The TOOL is mechanical; the GROUPING is
// judgment, authored per call. One invocation merges named requirement nodes
// into one cluster node with numbered singular statements; every inbound edge
// and code marker rewrites to the sub-address; the members' files delete.

import (
	"fmt"
	"os"
	"path/filepath"
	"regexp"
	"sort"
	"strings"
)

// design: go-cluster  implements: req-trace-clustered
// `cluster --into <id> --statement "<umbrella>" <req-id>...` — the merge:
//   - the cluster node lands beside the FIRST member (same iteration), statement
//     = the umbrella, body = numbered singular statements (1. <original>), each
//     line naming its origin id for the archaeology;
//   - refines edges: the union of the members' upward edges, deduplicated;
//   - inbound verifies/addresses lane edges rewrite member -> <into>.N (the
//     sub-address; resolution folds to the base at load, go-sub-addressing);
//   - code design markers rewrite `implements: ...<member>...` -> `<into>.N`;
//   - member files delete; the caller owes ONE re-baseline and ONE wave bless.
func cmdCluster(args []string) {
	if hasFlag(args, "--tests") {
		cmdClusterTests(args)
		return
	}
	into := flagVal(args, "--into")
	umbrella := flagVal(args, "--statement")
	var members []string
	skip := map[string]bool{}
	for i := 0; i < len(args); i++ {
		if args[i] == "--into" || args[i] == "--statement" {
			skip[args[i]] = true
			i++
			continue
		}
		if strings.HasPrefix(args[i], "req-") {
			members = append(members, args[i])
		}
	}
	if into == "" || umbrella == "" || len(members) < 2 {
		fmt.Println("usage: cluster --into <req-id> --statement \"<umbrella>\" <req-id> <req-id> ...")
		quackExit(2)
		return
	}
	nodes := LoadAll()
	var paths []string
	var stmts []string
	upward := map[string]bool{}
	for _, m := range members {
		n, ok := nodes[m]
		if !ok || n.Type != "requirement" {
			fmt.Println("cluster: not a requirement:", m)
			quackExit(2)
			return
		}
		paths = append(paths, n.Path)
		stmts = append(stmts, fmt.Sprintf("%d. %s *(was %s)*", len(stmts)+1, n.Statement, m))
		for _, up := range n.Refines {
			upward[up] = true
		}
	}
	ups := make([]string, 0, len(upward))
	for u := range upward {
		ups = append(ups, u)
	}
	sort.Strings(ups)
	// the cluster node, beside the first member
	dir := filepath.Dir(paths[0])
	var b strings.Builder
	b.WriteString("---\nid: " + into + "\ntype: requirement\nstatement: " + umbrella + "\nclass: review\nkiller: false\n---\n## Statements\n")
	b.WriteString(strings.Join(stmts, "\n") + "\n")
	if err := os.WriteFile(filepath.Join(dir, into+".md"), []byte(b.String()), 0o644); err != nil {
		fmt.Println("cluster:", err)
		quackExit(1)
		return
	}
	// lane edges: outbound refines of the cluster; inbound rewrites to sub-addresses
	subOf := map[string]string{}
	for i, m := range members {
		subOf[m] = fmt.Sprintf("%s.%d", into, i+1)
	}
	for _, u := range ups {
		appendLaneEdge("refines", into, u)
	}
	rewriteLaneTargets(subOf)
	// code markers: implements: <member> -> <into>.N
	rewriteCodeImplements(subOf)
	// the members' own outbound lane edges and files retire
	dropLaneSrcs(members)
	for _, p := range paths {
		os.Remove(p)
	}
	fmt.Printf("clustered %d -> %s (%s)\n", len(members), into, dir)
	fmt.Println("owed now: quack build (one re-baseline), then the wave bless")
}

// cmdClusterTests merges test nodes: one node,
// several selftest runners (verify: selftest:a b c - ALL must pass), verifies
// edges fold to the target requirement, and merged SHIPPED tests carry the
// birth-red exemption citing the clustering ADR - their red records stand in
// the ledger under the origin ids.
func cmdClusterTests(args []string) {
	into := flagVal(args, "--into")
	umbrella := flagVal(args, "--statement")
	verifiesTarget := flagVal(args, "--verifies")
	var members []string
	for i := 0; i < len(args); i++ {
		if args[i] == "--into" || args[i] == "--statement" || args[i] == "--verifies" {
			i++
			continue
		}
		if strings.HasPrefix(args[i], "test-") {
			members = append(members, args[i])
		}
	}
	if into == "" || umbrella == "" || verifiesTarget == "" || len(members) < 2 {
		fmt.Println("usage: cluster --tests --into <test-id> --statement \"<umbrella>\" --verifies <req-id> <test-id> <test-id> ...")
		quackExit(2)
		return
	}
	nodes := LoadAll()
	var paths, stmts, runners []string
	for _, m := range members {
		n, ok := nodes[m]
		if !ok || n.Type != "test" {
			fmt.Println("cluster --tests: not a test:", m)
			quackExit(2)
			return
		}
		paths = append(paths, n.Path)
		stmts = append(stmts, fmt.Sprintf("%d. %s *(was %s)*", len(stmts)+1, n.Statement, m))
		if strings.HasPrefix(n.Verify, "selftest:") {
			runners = append(runners, strings.Fields(strings.TrimSpace(n.Verify[len("selftest:"):]))...)
		}
	}
	dir := filepath.Dir(paths[0])
	var b strings.Builder
	b.WriteString("---\nid: " + into + "\ntype: test\nstatement: " + umbrella + "\nclass: executed\n")
	b.WriteString("verify: selftest:" + strings.Join(runners, " ") + "\n")
	b.WriteString("tests_red: exempt - clustered at i17; the birth reds stand in the ledger under the origin ids (adr-cluster-numbered-statements)\n")
	b.WriteString("killer: false\n---\n## Statements\n" + strings.Join(stmts, "\n") + "\n")
	if err := os.WriteFile(filepath.Join(dir, into+".md"), []byte(b.String()), 0o644); err != nil {
		fmt.Println("cluster --tests:", err)
		quackExit(1)
		return
	}
	appendLaneEdge("verifies", into, verifiesTarget)
	dropLaneSrcs(members)
	for _, p := range paths {
		os.Remove(p)
	}
	fmt.Printf("clustered %d tests -> %s (runs %d selftests)\n", len(members), into, len(runners))
}

// appendLaneEdge adds one edge line to a connections lane.
func appendLaneEdge(lane, src, dst string) {
	p := filepath.Join(SPEC, "connections", lane, "edges.jsonl")
	f, err := os.OpenFile(p, os.O_APPEND|os.O_CREATE|os.O_WRONLY, 0o644)
	if err != nil {
		return
	}
	defer f.Close()
	fmt.Fprintf(f, "{\"src\":\"%s\",\"dst\":\"%s\"}\n", src, dst)
}

// rewriteLaneTargets rewrites every lane line whose src or dst is a clustered
// member to its sub-address; a member's OWN outbound refines lines drop later.
func rewriteLaneTargets(subOf map[string]string) {
	lanes, _ := os.ReadDir(filepath.Join(SPEC, "connections"))
	for _, l := range lanes {
		if !l.IsDir() {
			continue
		}
		p := filepath.Join(SPEC, "connections", l.Name(), "edges.jsonl")
		raw, err := os.ReadFile(p)
		if err != nil {
			continue
		}
		lines := strings.Split(strings.TrimRight(string(raw), "\n"), "\n")
		changed := false
		for i, ln := range lines {
			for m, sub := range subOf {
				q := "\"" + m + "\""
				if strings.Contains(ln, "\"dst\":"+q) {
					lines[i] = strings.Replace(lines[i], "\"dst\":"+q, "\"dst\":\""+sub+"\"", 1)
					changed = true
				}
			}
		}
		if changed {
			os.WriteFile(p, []byte(strings.Join(lines, "\n")+"\n"), 0o644)
		}
	}
}

// dropLaneSrcs removes lane lines whose src is a retired member (their outbound
// refines now live on the cluster).
func dropLaneSrcs(members []string) {
	drop := map[string]bool{}
	for _, m := range members {
		drop[m] = true
	}
	lanes, _ := os.ReadDir(filepath.Join(SPEC, "connections"))
	for _, l := range lanes {
		if !l.IsDir() {
			continue
		}
		p := filepath.Join(SPEC, "connections", l.Name(), "edges.jsonl")
		raw, err := os.ReadFile(p)
		if err != nil {
			continue
		}
		var keep []string
		changed := false
		for _, ln := range strings.Split(strings.TrimRight(string(raw), "\n"), "\n") {
			dropped := false
			for m := range drop {
				if strings.Contains(ln, "\"src\":\""+m+"\"") {
					dropped = true
					break
				}
			}
			if dropped {
				changed = true
				continue
			}
			keep = append(keep, ln)
		}
		if changed {
			os.WriteFile(p, []byte(strings.Join(keep, "\n")+"\n"), 0o644)
		}
	}
}

// rewriteCodeImplements rewrites design-marker implements references in the
// engine sources and method files to the members' sub-addresses.
func rewriteCodeImplements(subOf map[string]string) {
	roots := []string{filepath.Join(ROOT, "product"), SPEC}
	for _, root := range roots {
		filepath.Walk(root, func(path string, fi os.FileInfo, err error) error {
			if err != nil || fi.IsDir() {
				return nil
			}
			if !strings.HasSuffix(path, ".go") && !strings.HasSuffix(path, ".md") {
				return nil
			}
			raw, rerr := os.ReadFile(path)
			if rerr != nil {
				return nil
			}
			s := string(raw)
			if !strings.Contains(s, "implements:") && !strings.Contains(s, "verifies:") && !strings.Contains(s, "addresses:") {
				return nil
			}
			out := s
			for m, sub := range subOf {
				// boundary-safe: req-attest must never rewrite inside req-attest-gate
				re := regexp.MustCompile(regexp.QuoteMeta(m) + `([^a-z0-9-]|$)`)
				out = re.ReplaceAllString(out, sub+"$1")
			}
			if out != s {
				os.WriteFile(path, []byte(out), 0o644)
			}
			return nil
		})
	}
}

// enddesign
