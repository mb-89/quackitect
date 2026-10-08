// The split verb cuts the ranges a caller names into targets, writes them
// through one undo journal entry, and keeps the rest, off the roads
// the JavaScript split cases covered.
// [[spec/design_output/level0#a-verb-cuts-the-file]]
package main // level0: InPackageTest - a main package admits no outside test package

import (
	"encoding/json"
	"path/filepath"
	"strings"
	"testing"
	"time"

	"quackitect/src/modules/edits"
)

const (
	splitText   = "one\ntwo\nthree\nfour\nfive\n"
	splitSource = "src/long.js"
)

// Runs a verb of the group through the registry over the root, and answers its exit code and everything it said. [[spec/tickets/ticket-verbs-port-to-go]]
func runsVerb(t *testing.T, root string, words ...string) (int, string) {
	t.Helper()
	t.Setenv("QUACKITECT_ROOT", root)
	_, one := twinOf(words, registry)
	if one == nil {
		t.Fatalf("the registry holds no Go answer for %s", strings.Join(words, " "))
	}
	var said strings.Builder
	code := one(words, false, &said, &said)
	return code, said.String()
}

// A fake disk holding the source the cases cut under /tree. [[spec/design_output/level0#a-verb-cuts-the-file]]
func splitTree(t *testing.T) diskDoors {
	t.Helper()
	disk := newFakeDisk()
	hq1SeedDisk(t, disk, "/tree", map[string]string{splitSource: splitText})
	return disk
}

// Runs the split verb over the fake disk under /tree, and answers its exit code and everything it said. [[spec/tickets/test-walks-move-onto-fakes]]
func hq3Splits(disk diskDoors, words ...string) (int, string) {
	var said strings.Builder
	split := splitVerb(func() (string, error) { return "/tree", nil }, func() time.Time { return time.Unix(0, 0) }, disk)
	code := split(words, false, &said, &said)
	return code, said.String()
}

// The text a file under /tree holds on the fake disk, and whether it stands. [[spec/tickets/test-walks-move-onto-fakes]]
func hq3ReadsBack(disk diskDoors, path string) (string, bool) {
	text, err := disk.read(filepath.Join("/tree", filepath.FromSlash(path)))
	return string(text), err == nil
}

// Seeds one file under a root on the box's own disk, for a verb reaching the disk past its door. [[spec/design_output/level0#a-verb-cuts-the-file]]
func seedsFile(t *testing.T, root, path, text string) {
	t.Helper()
	hq1SeedDisk(t, realDisk(), root, map[string]string{path: text})
}

// The text a file under a root holds on the box's own disk, and whether it stands. [[spec/design_output/level0#a-verb-cuts-the-file]]
func readsBack(t *testing.T, root, path string) (string, bool) {
	t.Helper()
	text, err := realDisk().read(filepath.Join(root, filepath.FromSlash(path)))
	return string(text), err == nil
}

func TestSplitVerb(t *testing.T) {
	t.Parallel()
	t.Run("the verb writes every target, the rest and one journal entry", func(t *testing.T) {
		disk := splitTree(t)
		code, said := hq3Splits(disk, "split", splitSource, "--to", "src/a.js", "--lines", "1-2", "--to", "src/b.js", "--lines", "4-5")
		if code != 0 {
			t.Fatalf("the split answers %d: %s", code, said)
		}
		for path, want := range map[string]string{"src/a.js": "one\ntwo\n", "src/b.js": "four\nfive\n", splitSource: "three\n"} {
			if got, _ := hq3ReadsBack(disk, path); got != want {
				t.Errorf("%s holds %q, and wants %q", path, got, want)
			}
		}
		for _, line := range []string{"src/a.js takes 2 line(s).", "src/b.js takes 2 line(s).", "src/long.js keeps 1 line(s).", "The cut stands, and mcp__level0__undo takes it back under split:"} {
			if !strings.Contains(said, line) {
				t.Errorf("the split says %q, and wants %q", said, line)
			}
		}
		journal := filepath.Join("/tree", filepath.FromSlash(edits.Journal))
		entries := disk.listed(journal)
		if len(entries) != 1 || !strings.HasSuffix(entries[0].Name(), ".json") {
			t.Fatalf("the journal holds %v, and wants one entry for the whole cut", entries)
		}
		text, _ := disk.read(filepath.Join(journal, entries[0].Name()))
		var entry struct {
			On    string `json:"on"`
			By    string `json:"by"`
			Files []struct {
				File        string `json:"file"`
				Was         string `json:"was"`
				Made        string `json:"made"`
				DidNotExist bool   `json:"did_not_exist"`
			} `json:"files"`
		}
		if err := json.Unmarshal(text, &entry); err != nil {
			t.Fatal(err)
		}
		if entry.By != "split" || !strings.HasPrefix(entry.On, "split:") || len(entry.Files) != 3 {
			t.Fatalf("the entry reads %+v, and wants the split's three files", entry)
		}
		if entry.Files[0].File != "src/a.js" || !entry.Files[0].DidNotExist || entry.Files[2].File != splitSource || entry.Files[2].Was != splitText || entry.Files[2].Made != "three\n" {
			t.Fatalf("the entry reads %+v, and wants each target born and the source's both halves", entry.Files)
		}
	})
	t.Run("the dry flag names the cuts and writes nothing", func(t *testing.T) {
		disk := splitTree(t)
		code, said := hq3Splits(disk, "split", splitSource, "--to", "src/a.js", "--lines", "1-2", "--dry")
		if code != 0 || !strings.Contains(said, "src/a.js takes 2 line(s).") || !strings.Contains(said, "src/long.js keeps 3 line(s).") {
			t.Fatalf("the dry split answers %d, %q", code, said)
		}
		if _, stands := hq3ReadsBack(disk, "src/a.js"); stands {
			t.Fatal("the dry split writes a target")
		}
		if got, _ := hq3ReadsBack(disk, splitSource); got != splitText {
			t.Fatalf("the dry split writes the source: %q", got)
		}
	})
	t.Run("a target under a folder nothing holds makes that folder, and writes", func(t *testing.T) {
		disk := splitTree(t)
		if code, said := hq3Splits(disk, "split", splitSource, "--to", "src/fresh/a.js", "--lines", "1-2"); code != 0 {
			t.Fatalf("the split answers %d: %s", code, said)
		}
		if got, _ := hq3ReadsBack(disk, "src/fresh/a.js"); got != "one\ntwo\n" {
			t.Fatalf("the target holds %q", got)
		}
	})
	t.Run("a source past the dry flag reads as the source", func(t *testing.T) {
		disk := splitTree(t)
		code, said := hq3Splits(disk, "split", "--dry", splitSource, "--to", "src/a.js", "--lines", "1-2")
		if code != 0 || !strings.Contains(said, "src/a.js takes 2 line(s).") {
			t.Fatalf("the dry split answers %d, %q", code, said)
		}
		if _, stands := hq3ReadsBack(disk, "src/a.js"); stands {
			t.Fatal("the dry split writes a target")
		}
	})
	t.Run("a journal the disk refuses answers a line, and no target lands", func(t *testing.T) {
		disk := splitTree(t)
		hq1SeedDisk(t, disk, "/tree", map[string]string{".se": "a file where the folder stands"})
		code, said := hq3Splits(disk, "split", splitSource, "--to", "src/a.js", "--lines", "1-2")
		if code != exitFailed || !strings.Contains(said, "The journal would not write, so nothing did:") || strings.Contains(said, "goroutine") {
			t.Fatalf("the split answers %d, %q", code, said)
		}
		if _, stands := hq3ReadsBack(disk, "src/a.js"); stands {
			t.Fatal("a refused journal lets a target land")
		}
		if got, _ := hq3ReadsBack(disk, splitSource); got != splitText {
			t.Fatalf("a refused journal writes the source: %q", got)
		}
	})
	t.Run("a target the disk refuses answers a line, and names the way back", func(t *testing.T) {
		disk := splitTree(t)
		code, said := hq3Splits(disk, "split", splitSource, "--to", splitSource+"/a.js", "--lines", "1-2")
		if code != exitFailed || !strings.Contains(said, "src/long.js/a.js would not write, and ") || !strings.Contains(said, "holds the way back.") {
			t.Fatalf("the split answers %d, %q", code, said)
		}
		if got, _ := hq3ReadsBack(disk, splitSource); got != splitText {
			t.Fatalf("a refused target writes the source: %q", got)
		}
	})
	t.Run("the help flag prints the usage", func(t *testing.T) {
		code, said := hq3Splits(splitTree(t), "split", "--help")
		if code != 0 || !strings.Contains(said, "Usage: ./RUNME.sh split <file> --to <path> --lines <from>-<to> [...] [--dry]") {
			t.Fatalf("the help answers %d, %q", code, said)
		}
	})
	refusals := []struct {
		name, says string
		code       int
		argv       []string
	}{
		{"a call naming no source", "A split names the file it cuts first, and this call names none.", 2, []string{"--to", "src/a.js", "--lines", "1-2", "--dry"}},
		{"a source standing nowhere", "src/gone.js stands nowhere, so there is nothing to cut.", 2, []string{"src/gone.js", "--to", "src/a.js", "--lines", "1-2"}},
		{"a target with no range", "src/a.js names no range. Add --lines from-to.", 2, []string{splitSource, "--to", "src/a.js"}},
		{"a range with no target", "A range names no target. Add --to path.", 2, []string{splitSource, "--lines", "1-2"}},
		{"no cut at all", "A split names a target: --to path --lines from-to.", 2, []string{splitSource}},
		{"a range reading backwards", "4-2 reads backwards. Write the smaller first.", 2, []string{splitSource, "--to", "src/a.js", "--lines", "4-2"}},
		{"a range from line zero", "A file's first line is 1, so a range starts there.", 2, []string{splitSource, "--to", "src/a.js", "--lines", "0-2"}},
		{"a range in words", "two reads as no range. Write from-to.", 2, []string{splitSource, "--to", "src/a.js", "--lines", "two"}},
		{"the source as a target", "src/long.js is the source and a target, so the cut writes over what it reads.", 2, []string{splitSource, "--to", "src/a.js", "--lines", "1-2", "--to", splitSource, "--lines", "4-5"}},
		{"two cuts into one target", "./src/a.js takes two cuts, and the second writes over the first. Name one --to a target.", 2, []string{splitSource, "--to", "src/a.js", "--lines", "1-2", "--to", "./src/a.js", "--lines", "4-5"}},
		{"two ranges reaching one line", "src/b.js and src/a.js both reach line 3.", 1, []string{splitSource, "--to", "src/a.js", "--lines", "1-3", "--to", "src/b.js", "--lines", "3-5"}},
		{"a range past the last line", "src/a.js reaches line 9, and the file holds 5 line(s).", 1, []string{splitSource, "--to", "src/a.js", "--lines", "4-9"}},
	}
	for _, one := range refusals {
		t.Run(one.name+" comes back refused, and nothing writes", func(t *testing.T) {
			disk := splitTree(t)
			code, said := hq3Splits(disk, append([]string{"split"}, one.argv...)...)
			if code != one.code || !strings.Contains(said, one.says) {
				t.Fatalf("the split answers %d, %q, and wants %d, %q", code, said, one.code, one.says)
			}
			if _, stands := hq3ReadsBack(disk, "src/a.js"); stands {
				t.Fatal("a refused split writes a target")
			}
			if got, _ := hq3ReadsBack(disk, splitSource); got != splitText {
				t.Fatalf("a refused split writes the source: %q", got)
			}
		})
	}
}
