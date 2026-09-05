package main

import (
	"bytes"
	"context"
	"os"
	"os/exec"
	"path/filepath"
	"regexp"
	"strings"
	"testing"
)

// THE CATALOG IS HELD TO THE FLAG SETS IT DESCRIBES.
//
// A catalog nothing checks is the retyped list again, one file further in. The
// two halves that came apart were the panel's argument list and the engine's
// flag set, and the only reason a caller found out was a person pressing a
// button, so the join is made here where a rename on either side is red.
//
// EVERY CALL IS PARSED AND NONE IS PERFORMED. The arguments go in with --help
// after them, which every flag set answers by printing its usage: an unknown
// flag is refused before that, and nothing the verb does runs either way.
//
// A HOLE IS FILLED WITH 1, which reads as a word and as a number. What is
// asked is whether the flag exists, not what a value in it means.
func TestEveryCallInTheCatalogIsOneTheVerbTakes(t *testing.T) {
	t.Parallel()
	cat := TheCatalog()
	if len(cat.Calls) == 0 {
		t.Fatal("the catalog carries no call, so this guards nothing")
	}
	root := t.TempDir()
	for name, made := range cat.Calls {
		t.Run(name, func(t *testing.T) {
			args := filled(whole(made, cat.Always))
			verb, rest := "", args
			if len(args) > 0 && !strings.HasPrefix(args[0], "-") {
				verb, rest = args[0], args[1:]
			}
			// A VERB RUNS HERE, because its flag set is this package's own and a
			// verb sent to the binary is sent on to the engine that lives.
			if _, ours := run[verb]; ours {
				var out, said bytes.Buffer
				c := &call{ctx: context.Background(), roots: Roots{Method: root, Work: root},
					args: append(rest, "--help"), out: &out, err: &said}
				if code := run[verb](c); code != 0 {
					t.Fatalf("se %s takes none of %v: it answered %d\n%s",
						verb, args, code, saidOrNothing(said.String()))
				}
				return
			}
			// EVERYTHING ELSE IS THE PROGRAM ITSELF: the flag form, whose flags
			// are registered in main, and the language server, which is its own
			// process. Neither flag set is reachable from a test, so the binary
			// is what answers.
			cmd := exec.Command(theEngine(t), append(args, "--help")...)
			cmd.Dir = root
			said, err := cmd.CombinedOutput()
			if err != nil {
				t.Fatalf("se %v is not a call this program takes: %v\n%s",
					args, err, saidOrNothing(string(said)))
			}
		})
	}
}

// whole is one call as a caller sends it: the arguments, every conditional
// segment, and what every call carries.
func whole(made aCall, always []string) []string {
	args := append([]string{}, made.Argv...)
	for _, when := range made.When {
		args = append(args, when.Argv...)
	}
	return append(args, always...)
}

// saidOrNothing is the first line of what a refusal said, and a sentence where
// it said nothing at all, because an empty failure names nothing to fix.
func saidOrNothing(said string) string {
	if strings.TrimSpace(said) == "" {
		return "it said nothing"
	}
	return firstLineOf(said)
}

var aHole = regexp.MustCompile(`\{[a-zA-Z]+\}`)

func filled(args []string) []string {
	out := make([]string, 0, len(args))
	for _, arg := range args {
		out = append(out, aHole.ReplaceAllString(arg, "1"))
	}
	return out
}

// AND THE CATALOG COVERS WHAT THE ADAPTER ACTUALLY SENDS.
//
// A catalog the engine holds to its own flag sets can still be missing the one
// call a caller needs, and then the caller keeps its own list for that one and
// the whole join is back where it started. So the builders the extension
// exports today are the list, read out of that file rather than copied here.
//
// A BUILDER THAT COMPOSES NAMES NO CALL. viewArgs takes the rest of the
// arguments as a parameter and wraps a view call around them, so the calls it
// makes are the entries that carry the whole call, and it is not one itself.
func TestTheCatalogCoversEveryCallTheAdapterMakes(t *testing.T) {
	t.Parallel()
	at := filepath.Join("..", "extension", "engineargs.ts")
	said, err := os.ReadFile(at)
	if err != nil {
		t.Fatalf("%s cannot be read, so this guards nothing: %v", at, err)
	}
	builders := regexp.MustCompile(`(?m)^export function ([A-Za-z]+)Args\(([^)]*)\)`).
		FindAllStringSubmatch(string(said), -1)
	if len(builders) == 0 {
		t.Fatalf("%s exports no builder, so this guards nothing", at)
	}

	cat := TheCatalog()
	// THE STEM IS THE NAME BEFORE THE DOT, because one builder whose flag varies
	// with a boolean is two entries, and both answer for it.
	stems := map[string][]string{}
	for name := range cat.Calls {
		stem, _, _ := strings.Cut(name, ".")
		stems[stem] = append(stems[stem], name)
	}

	named := map[string]bool{}
	for _, builder := range builders {
		name, takes := builder[1], builder[2]
		if strings.Contains(takes, "string[]") && strings.Contains(takes, "rest") {
			continue // it composes the calls below rather than naming one
		}
		named[name] = true
		if len(stems[name]) == 0 {
			t.Errorf("%sArgs builds a call and the catalog has no %s entry, so the "+
				"adapter keeps that list of its own", name, name)
		}
	}
	// AND NOTHING IN THE CATALOG IS A CALL NOBODY MAKES, apart from the one that
	// fetches the catalog, which the engine answers before any adapter asks.
	for stem := range stems {
		if stem == "calls" || named[stem] {
			continue
		}
		t.Errorf("the catalog carries %v and %sArgs is exported by no adapter, so it "+
			"is a call the catalog describes and nobody makes", stems[stem], stem)
	}
}
