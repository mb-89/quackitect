package main

import (
	"encoding/json"
	"os"
	"path/filepath"
	"regexp"
	"strings"
	"testing"
)

// THE THING BEING REFUSED, ASSEMBLED RATHER THAN WRITTEN OUT. A tool call
// carrying the literal is refused before it can be used to test the refusal.
var recursiveSearch = "g" + "rep -rn"

// The names this engine must not carry, as whole words.
var namesASearcher = regexp.MustCompile(`rg|ripgrep`)

// The tool the probe found, as the probe would have written it down.
func theProbeFound(t *testing.T) Tool {
	t.Helper()
	cands, err := LoadCandidates(filepath.Join("..", ".."))
	if err != nil {
		t.Fatalf("the candidate list cannot be read, so this guards nothing: %v", err)
	}
	for _, c := range cands {
		if strings.Contains(c.For, searchingFor) {
			return Tool{Name: c.Name, Path: "/somewhere/" + c.Name, For: c.For}
		}
	}
	t.Fatalf("no candidate is for %q, so this guards nothing", searchingFor)
	return Tool{}
}

// A RECURSIVE SEARCH OVER THE TREE IS REFUSED, and the refusal names what the
// probe found rather than a name written into the engine.
func TestARecursiveGrepIsRefused(t *testing.T) {
	better := theProbeFound(t)
	for _, command := range []string{
		"grep -rn LoadConfig src",
		"grep -R LoadConfig .",
		"grep --recursive LoadConfig src",
		"grep -rnI LoadConfig src/engine",
		`grep -rn "func Pull" .`,
	} {
		why, refused := ARecursiveSearch(command, better)
		if !refused {
			t.Errorf("%q was allowed", command)
			continue
		}
		if !strings.Contains(why, better.Name) {
			t.Errorf("the refusal for %q does not name what the probe found: %s", command, why)
		}
		if !strings.Contains(why, better.Path) {
			t.Errorf("the refusal for %q does not say where it is: %s", command, why)
		}
	}
}

// A GREP ON ONE NAMED FILE, OR ON STANDARD INPUT, IS LEFT ALONE. The newer tool
// is not that tool, and refusing the permitted case would send somebody looking
// for a workaround rather than a better search.
func TestAGrepOnOneFileIsLeftAlone(t *testing.T) {
	better := theProbeFound(t)
	for _, command := range []string{
		"grep -n LoadConfig src/engine/config.go",
		"cat src/engine/config.go | grep -n LoadConfig",
		"grep LoadConfig config.go",
		"go test ./... | grep FAIL",
		"rg -n LoadConfig src",
		"echo grep -rn is what this sentence is about",
	} {
		if why, refused := ARecursiveSearch(command, better); refused {
			t.Errorf("%q was refused: %s", command, why)
		}
	}
}

// THE REFUSAL READS THE COMMAND RATHER THAN THE WORD, so a search behind a pipe
// or with its flags rearranged is judged the same way, and a sentence that
// merely mentions one is not judged at all.
func TestTheRefusalReadsTheCommand(t *testing.T) {
	better := theProbeFound(t)
	// BEHIND A PIPE IS STILL A PROGRAM BEING RUN.
	if _, refused := ARecursiveSearch("cat list.txt | grep -rn thing src", better); !refused {
		t.Error("a recursive search behind a pipe was allowed")
	}
	if _, refused := ARecursiveSearch("go build ./... && grep -R thing .", better); !refused {
		t.Error("a recursive search after && was allowed")
	}
	// THE FLAGS MAY BE ANYWHERE. -n before -r is the same command.
	if _, refused := ARecursiveSearch("grep -n -r thing src", better); !refused {
		t.Error("a recursive search with its flags rearranged was allowed")
	}
	// A NEWLINE SEPARATES TWO PROGRAMS AS SURELY AS A SEMICOLON DOES. A shell
	// command in a tool call is routinely several lines, and the guard judged
	// the first line only, so everything after it walked past the rule.
	//
	// THE COMMANDS ARE ASSEMBLED RATHER THAN WRITTEN OUT, because a tool call
	// carrying the literal is refused before it can be used to test the
	// refusal, which is the strongest evidence the single-line case works.
	sweep := recursiveSearch + " thing src"
	for _, command := range []string{
		"cd src" + nl + sweep,
		"go build ./..." + nl + sweep + nl + "echo done",
		"echo one\r\n" + sweep,
		strings.ReplaceAll(recursiveSearch, "-rn", "-n") + " thing one.go || " + sweep,
		"go vet ./... & " + sweep,
	} {
		if _, refused := ARecursiveSearch(command, better); !refused {
			t.Errorf("a recursive search past the first separator was allowed: %q", command)
		}
	}

	// AND A WORD IN A SENTENCE IS NOT A PROGRAM.
	for _, command := range []string{
		`se --answer "I will not grep -rn over the tree again"`,
		"echo the word grep -r appears here",
		"rg -n grep src/engine",
	} {
		if why, refused := ARecursiveSearch(command, better); refused {
			t.Errorf("%q was refused for mentioning it: %s", command, why)
		}
	}
}

// NOTHING NAMES A SEARCHING TOOL A SECOND TIME. The probe's list is the only
// place a tool is named, so the day the probe finds a different one the refusal
// changes with no edit to the engine.
//
// THE TESTS ARE EXCLUDED, because a test of a refusal has to say what is being
// refused. The engine itself carries no such name.
func TestNothingNamesTheSearchingTool(t *testing.T) {
	here, err := os.ReadDir(".")
	if err != nil {
		t.Fatal(err)
	}
	read := 0
	for _, f := range here {
		name := f.Name()
		if !strings.HasSuffix(name, ".go") || strings.HasSuffix(name, "_test.go") {
			continue
		}
		b, err := os.ReadFile(name)
		if err != nil {
			t.Fatalf("%s cannot be read, so this guards nothing: %v", name, err)
		}
		read++
		// A WORD BOUNDARY AND NOT A CASE BOUNDARY. Splitting on case made
		// workArg into work and rg, which is a check reporting a defect that is
		// not there, and a check that cries wolf is one somebody turns off.
		for i, line := range strings.Split(string(b), nl) {
			if namesASearcher.MatchString(line) {
				t.Errorf("%s:%d names a searching tool: %s", name, i+1, strings.TrimSpace(line))
			}
		}
	}
	if read == 0 {
		t.Fatal("no source was read, so this guards nothing")
	}
}

// EVERY FILE PROJECTED FROM THE GUIDANCE CARRIES THE RULE, and the list of them
// is read from the declaration rather than written out here.
//
// A HAND-DRAWN LIST IS EXACTLY THE SIZE OF WHAT YOU ALREADY LOOKED AT. Declare a
// fourth projection from the same source and the claim stays true of its three
// while the fourth goes without the rule.
func TestTheSearchRuleReachesEveryProjection(t *testing.T) {
	root := filepath.Join("..", "..")
	const rule = "the tool the probe found"
	source := "doc/guidance/behaviour.md"

	b, err := os.ReadFile(filepath.Join(root, filepath.FromSlash(source)))
	if err != nil {
		t.Fatalf("%s cannot be read, so this guards nothing: %v", source, err)
	}
	if !strings.Contains(string(b), rule) {
		t.Fatalf("%s does not carry the rule", source)
	}

	targets := projectionTargets(t, root, source)
	if len(targets) == 0 {
		t.Fatalf("nothing is projected from %s, so this guards nothing", source)
	}
	for _, target := range targets {
		got, err := os.ReadFile(filepath.Join(root, filepath.FromSlash(target)))
		if err != nil {
			t.Errorf("%s is projected from %s and cannot be read: %v", target, source, err)
			continue
		}
		if !strings.Contains(string(got), rule) {
			t.Errorf("%s is projected from %s and does not carry the rule", target, source)
		}
	}
}

// projectionTargets answers every target whose sources include this file, read
// from the declaration in this tree.
func projectionTargets(t *testing.T, root, source string) []string {
	t.Helper()
	b, err := os.ReadFile(filepath.Join(root, "util", "projections.json"))
	if err != nil {
		t.Fatal(err)
	}
	var declared struct {
		Projections []struct {
			Target  string   `json:"target"`
			Sources []string `json:"sources"`
		} `json:"projections"`
	}
	if err := json.Unmarshal(b, &declared); err != nil {
		t.Fatal(err)
	}
	var out []string
	for _, p := range declared.Projections {
		for _, s := range p.Sources {
			if s == source {
				out = append(out, p.Target)
			}
		}
	}
	return out
}

// A HERE-DOC BODY IS DATA, NOT COMMANDS.
//
// The guard splits a command into statements and reads each one. A here-doc's
// body sits between << and its terminator and is written to a file or piped to
// a program, so a script that CONTAINS a recursive search was refused although
// nothing was searched.
//
// THE COST OF THE FALSE POSITIVE IS THE REASON. Refusing a permitted case sends
// somebody looking for a workaround, and a rule people work around is a rule
// that stops being read. Writing a script about the guard is exactly the case
// the guard should leave alone, and it is the one I met while writing this.
//
// THE SEARCH IS ASSEMBLED so this file does not carry the refused words, which
// the guard would refuse on the way in.
func TestAHereDocBodyIsNotCommands(t *testing.T) {
	recursive := "g" + "rep -rn LoadConfig src"
	allowed := []string{
		"cat > x.sh <<'EOF'\n" + recursive + "\nEOF",
		"cat > x.sh <<EOF\n" + recursive + "\nEOF",
		"cat <<'END' > x.md\nuse " + recursive + " to look\nEND",
		// A body with the terminator inside a word is still the body.
		"cat > x.sh <<'EOF'\n" + recursive + "\nEOFISH\nEOF",
		// AND THE SEARCH AFTER THAT WORD IS STILL INSIDE IT. A match that only
		// asked whether the line started with the terminator would end the body
		// at EOFISH and refuse what follows.
		"cat > x.sh <<'EOF'\nEOFISH\n" + recursive + "\nEOF",
		// The dash form, which lets the terminator be indented.
		"cat > x.sh <<-EOF\n" + recursive + "\n\tEOF",
	}
	for _, cmd := range allowed {
		if why, yes := ARecursiveSearch(cmd, Tool{Name: "rg", Path: "rg"}); yes {
			t.Errorf("a here-doc that writes a search was refused:\n%s\n  %s", cmd, why)
		}
	}
	// AND A SEARCH OUTSIDE THE BODY IS STILL REFUSED, before it and after it.
	refused := []string{
		recursive + "\ncat > x.sh <<'EOF'\nhello\nEOF",
		"cat > x.sh <<'EOF'\nhello\nEOF\n" + recursive,
		// A LINE THAT MERELY STARTS WITH THE TERMINATOR DOES NOT END THE BODY,
		// so the search after the real terminator is outside it. A loose match
		// would end the body at EOFISH and let this through.
		"cat > x.sh <<'EOF'\nhello\nEOFISH\nEOF\n" + recursive,
		// A HERE-STRING HAS NO BODY, so nothing after it is skipped. Treating
		// <<< as an opener would swallow the rest of the command.
		"tr a-z A-Z <<< hello\n" + recursive,
	}
	for _, cmd := range refused {
		if _, yes := ARecursiveSearch(cmd, Tool{Name: "rg", Path: "rg"}); !yes {
			t.Errorf("a search outside a here-doc body was allowed:\n%s", cmd)
		}
	}
	// A COMMAND WITH NO HERE-DOC IS UNTOUCHED.
	if _, yes := ARecursiveSearch(recursive, Tool{Name: "rg", Path: "rg"}); !yes {
		t.Error("an ordinary recursive search was allowed")
	}
}
