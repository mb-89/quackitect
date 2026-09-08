package main

import (
	"os"
	"path/filepath"
	"strings"
	"testing"
)

// THE DOOR IS DRIVEN OVER A TREE THIS TEST BUILDS, and never over the folder the
// repository happens to hold. A rule read off the live tree is green because
// nobody has broken it yet, which is evidence about the tree and no evidence at
// all about the rule. So each case here is planted.
//
// THE CLEAN CASES ARE WHAT MAKE THE REFUSALS EVIDENCE. A door that refuses every
// runner passes a planted case for the wrong reason.
func TestACheckPathTheMethodDoesNotHold(t *testing.T) {
	dir := t.TempDir()
	if err := os.MkdirAll(filepath.Join(dir, "util", "checks"), 0o755); err != nil {
		t.Fatal(err)
	}
	if err := os.WriteFile(filepath.Join(dir, "util", "checks", "present.mjs"), []byte("// a check\n"), 0o644); err != nil {
		t.Fatal(err)
	}
	roots := Roots{Work: dir, Method: dir}

	refused := []struct {
		why  string
		text string
		says []string
	}{
		{
			why: "the runner reads its judge out of the folder a retro drains",
			text: "#!/bin/sh\n" +
				"for c in present; do\n" +
				"  node \"util/checks/../../.se/scratchpad/$c.mjs\" \"$root\"\n" +
				"done\n",
			says: []string{".se", "retro"},
		},
		{
			why: "the path climbs out of the work root",
			text: "#!/bin/sh\n" +
				"for c in present; do\n" +
				"  node \"../judges/$c.mjs\" \"$root\"\n" +
				"done\n",
			says: []string{"present", "out of the work root"},
		},
		{
			why: "a name is listed and the tree holds no file behind it",
			text: "#!/bin/sh\n" +
				"for c in present absent; do\n" +
				"  if [ -f \"util/checks/$c.mjs\" ]; then\n" +
				"    node \"util/checks/$c.mjs\" \"$root\"\n" +
				"  fi\n" +
				"done\n",
			says: []string{"absent", "util/checks/absent.mjs"},
		},
		{
			why: "the list is one indent in, where the check this replaces could not see it",
			text: "#!/bin/sh\n" +
				"run() {\n" +
				"  for name in absent; do\n" +
				"    node \"util/checks/$name.mjs\"\n" +
				"  done\n" +
				"}\n",
			says: []string{"absent", "util/checks/absent.mjs"},
		},
	}
	for _, one := range refused {
		err := aCheckPathTheMethodDoesNotHold(roots, true, "util/checks/battery.sh", one.text)
		if err == nil {
			t.Fatalf("the door passed a runner where %s", one.why)
		}
		for _, word := range one.says {
			if !strings.Contains(err.Error(), word) {
				t.Fatalf("the refusal for the case where %s does not name %q: %s", one.why, word, err)
			}
		}
	}

	clean := []struct{ why, rel, text string }{
		{
			why: "every name the runner walks has a file under the method",
			rel: "util/checks/battery.sh",
			text: "#!/bin/sh\n" +
				"for c in present; do\n" +
				"  if [ -f \"util/checks/$c.mjs\" ]; then\n" +
				"    node \"util/checks/$c.mjs\" \"$root\"\n" +
				"  fi\n" +
				"done\n",
		},
		{
			why: "the braced spelling of the variable resolves the same way",
			rel: "util/checks/battery.sh",
			text: "#!/bin/sh\nfor c in present; do\n  node \"util/checks/${c}.mjs\"\ndone\n",
		},
		{
			why: "a variable in front stands for the work root and is not a folder inside it",
			rel: "util/checks/battery.sh",
			text: "#!/bin/sh\nfor r in present; do\n  node \"$root/util/checks/$r.mjs\"\ndone\n",
		},
		{
			why: "the loop builds a file rather than running one",
			rel: "util/checks/battery.sh",
			text: "#!/bin/sh\nfor c in absent; do\n  echo hello > \"out/$c.mjs\"\ndone\n",
		},
		{
			why: "the loop walks a glob only the shell can resolve",
			rel: "util/checks/battery.sh",
			text: "#!/bin/sh\nfor c in *.mjs; do\n  node \"util/checks/$c.mjs\"\ndone\n",
		},
		{
			why: "the script runs no loop over names at all",
			rel: "util/checks/battery.sh",
			text: "#!/bin/sh\nnode util/checks/present.mjs\n",
		},
		{
			why: "the file is not a script a shell runs",
			rel: "doc/work/a-note.md",
			text: "for c in absent; do\n  node \"util/checks/$c.mjs\"\ndone\n",
		},
	}
	for _, one := range clean {
		if err := aCheckPathTheMethodDoesNotHold(roots, true, one.rel, one.text); err != nil {
			t.Fatalf("the door refused a runner where %s: %s", one.why, err)
		}
	}
}
